import json
from datetime import date as date_cls
from datetime import datetime, timezone

import razorpay
from flask import Blueprint, current_app, jsonify, request

from booking import (
    DATE_FULL_MESSAGE,
    DATE_PATTERN,
    PHONE_PATTERN,
    SLOT_TAKEN_MESSAGE,
    _is_date_full,
    _is_slot_taken,
)
from notifications import notify_payment_success
from settings import get_consultation_fee
from slots import TIME_SLOT_VALUES, appointment_time_label, expire_stale_holds, today_ist
from supabase_client import get_supabase

payments_bp = Blueprint("payments", __name__)


def _razorpay_client():
    return razorpay.Client(
        auth=(current_app.config["RAZORPAY_KEY_ID"], current_app.config["RAZORPAY_KEY_SECRET"])
    )


def _confirm_appointment(supabase, appointment_id):
    result = (
        supabase.table("appointments")
        .update({"status": "confirmed", "hold_expires_at": None})
        .eq("id", appointment_id)
        .eq("status", "payment_pending")
        .execute()
    )
    return bool(result.data)


def _notify_if_confirmed(supabase, appointment_id, confirmed):
    """Only fires notifications on the actual pending -> confirmed
    transition, so retried webhooks/verify calls never re-send them."""
    if not confirmed:
        return
    summary = _appointment_payment_summary(supabase, appointment_id)
    if summary["appointment"]:
        try:
            notify_payment_success(summary["appointment"], summary["payment"])
        except Exception:  # noqa: BLE001 - notification failures must never break payment flow
            current_app.logger.exception(
                "Failed to send payment confirmation notifications for appointment %s", appointment_id
            )


def _appointment_payment_summary(supabase, appointment_id):
    appointment = (
        supabase.table("appointments").select("*").eq("id", appointment_id).limit(1).execute()
    )
    payment = (
        supabase.table("payments")
        .select("*")
        .eq("appointment_id", appointment_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    appointment_row = appointment.data[0] if appointment.data else None
    if appointment_row:
        appointment_row["time_label"] = appointment_time_label(appointment_row)
    return {
        "appointment": appointment_row,
        "payment": payment.data[0] if payment.data else None,
    }


@payments_bp.post("/orders")
def create_order():
    payload = request.get_json(silent=True) or {}
    appointment_id = str(payload.get("appointment_id", "")).strip()
    if not appointment_id:
        return jsonify({"error": "appointment_id is required."}), 400

    supabase = get_supabase()
    result = (
        supabase.table("appointments").select("*").eq("id", appointment_id).limit(1).execute()
    )
    if not result.data:
        return jsonify({"error": "Appointment not found."}), 404

    appointment = result.data[0]
    if appointment["status"] != "payment_pending":
        return jsonify({"error": "This booking is no longer awaiting payment."}), 400

    hold_expires_at = appointment.get("hold_expires_at")
    if hold_expires_at and datetime.fromisoformat(hold_expires_at) < datetime.now(timezone.utc):
        return (
            jsonify({"error": "This hold has expired. Please select a slot again."}),
            409,
        )

    existing = (
        supabase.table("payments")
        .select("*")
        .eq("appointment_id", appointment_id)
        .eq("status", "pending")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    fee = get_consultation_fee()
    if fee <= 0:
        return jsonify({"error": "This appointment does not require payment."}), 400
    amount_paise = int(round(fee * 100))

    if existing.data:
        payment = existing.data[0]
    else:
        client = _razorpay_client()
        order = client.order.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": 1,
                "notes": {"appointment_id": appointment_id},
            }
        )
        inserted = (
            supabase.table("payments")
            .insert(
                {
                    "appointment_id": appointment_id,
                    "razorpay_order_id": order["id"],
                    "amount": fee,
                    "currency": "INR",
                    "status": "pending",
                }
            )
            .execute()
        )
        payment = inserted.data[0]

    return (
        jsonify(
            {
                "orderId": payment["razorpay_order_id"],
                "amount": amount_paise,
                "currency": "INR",
                "keyId": current_app.config["RAZORPAY_KEY_ID"],
                "appointmentId": appointment_id,
            }
        ),
        200,
    )


@payments_bp.post("/manual/book")
def book_with_manual_payment():
    """Creates the appointment and records the UPI transaction reference in
    one atomic step, only after the patient has already paid via the
    clinic's own (gateway-free) UPI QR. No appointment/patient row is written
    until this point - unlike /booking/hold, nothing reserves the slot ahead
    of payment, so this never confirms the appointment itself either; an
    admin must verify the reference against the bank statement and confirm
    it from Admin -> Payment History."""
    payload = request.get_json(silent=True) or {}

    required = ["name", "phone", "date", "time", "upi_reference"]
    missing = [field for field in required if not str(payload.get(field, "")).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    name = str(payload["name"]).strip()
    phone = str(payload["phone"]).strip()
    email = str(payload.get("email", "")).strip() or None
    date_str = str(payload["date"]).strip()
    time_str = str(payload["time"]).strip()
    reason = str(payload.get("reason", "")).strip() or None
    language = payload.get("language", "en")
    upi_reference = str(payload["upi_reference"]).strip()

    if not PHONE_PATTERN.match(phone):
        return jsonify({"error": "Please enter a valid 10-digit mobile number."}), 400
    if not DATE_PATTERN.match(date_str):
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400
    if time_str not in TIME_SLOT_VALUES:
        return jsonify({"error": "Please choose a valid time slot."}), 400

    try:
        requested = date_cls.fromisoformat(date_str)
    except ValueError:
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400
    if requested < today_ist():
        return jsonify({"error": "Cannot book an appointment in the past."}), 400

    fee = get_consultation_fee()
    if fee <= 0:
        return jsonify({"error": "This appointment does not require payment."}), 400

    expire_stale_holds()

    supabase = get_supabase()
    try:
        result = supabase.rpc(
            "book_appointment",
            {
                "p_name": name,
                "p_phone": phone,
                "p_email": email,
                "p_date": date_str,
                "p_time": time_str,
                "p_reason": reason,
                "p_language": language,
                "p_status": "payment_pending",
                "p_hold_expires_at": None,
            },
        ).execute()
    except Exception as error:  # noqa: BLE001 - postgrest raises a generic APIError
        if _is_slot_taken(error):
            return jsonify({"error": SLOT_TAKEN_MESSAGE}), 409
        if _is_date_full(error):
            return jsonify({"error": DATE_FULL_MESSAGE}), 409
        current_app.logger.exception("Failed to create appointment for manual UPI payment")
        return jsonify({"error": "Could not create this booking. Please try again."}), 500

    appointment = result.data

    inserted = (
        supabase.table("payments")
        .insert(
            {
                "appointment_id": appointment["id"],
                "payment_method": "manual_upi",
                "upi_reference": upi_reference,
                "amount": fee,
                "currency": "INR",
                "status": "pending_verification",
            }
        )
        .execute()
    )
    payment = inserted.data[0]

    return jsonify({"status": payment["status"], "appointmentId": appointment["id"]}), 201


@payments_bp.post("/verify")
def verify_payment():
    payload = request.get_json(silent=True) or {}
    order_id = str(payload.get("razorpay_order_id", "")).strip()
    payment_id = str(payload.get("razorpay_payment_id", "")).strip()
    signature = str(payload.get("razorpay_signature", "")).strip()

    if not order_id or not payment_id or not signature:
        return jsonify({"error": "Missing payment verification fields."}), 400

    supabase = get_supabase()
    existing = (
        supabase.table("payments").select("*").eq("razorpay_order_id", order_id).limit(1).execute()
    )
    if not existing.data:
        return jsonify({"error": "Payment record not found."}), 404
    payment = existing.data[0]

    if payment["status"] == "successful":
        return jsonify(_appointment_payment_summary(supabase, payment["appointment_id"])), 200

    client = _razorpay_client()
    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            }
        )
    except razorpay.errors.SignatureVerificationError:
        supabase.table("payments").update({"status": "failed"}).eq("id", payment["id"]).eq(
            "status", "pending"
        ).execute()
        return jsonify({"error": "Payment verification failed."}), 400

    updated = (
        supabase.table("payments")
        .update({"status": "successful", "razorpay_payment_id": payment_id, "razorpay_signature": signature})
        .eq("id", payment["id"])
        .eq("status", "pending")
        .execute()
    )
    confirmed = False
    if updated.data:
        confirmed = _confirm_appointment(supabase, payment["appointment_id"])
    _notify_if_confirmed(supabase, payment["appointment_id"], confirmed)

    return jsonify(_appointment_payment_summary(supabase, payment["appointment_id"])), 200


@payments_bp.post("/webhook")
def razorpay_webhook():
    raw_body = request.get_data(as_text=True)
    signature = request.headers.get("X-Razorpay-Signature", "")

    client = _razorpay_client()
    try:
        client.utility.verify_webhook_signature(
            raw_body, signature, current_app.config["RAZORPAY_WEBHOOK_SECRET"]
        )
    except razorpay.errors.SignatureVerificationError:
        return jsonify({"error": "Invalid webhook signature."}), 400

    event = json.loads(raw_body)
    event_type = event.get("event", "")
    entity = event.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = entity.get("order_id")
    payment_id = entity.get("id")

    if not order_id:
        return jsonify({"status": "ignored"}), 200

    supabase = get_supabase()
    existing = (
        supabase.table("payments").select("*").eq("razorpay_order_id", order_id).limit(1).execute()
    )
    if not existing.data:
        return jsonify({"status": "ignored"}), 200
    payment = existing.data[0]

    if event_type == "payment.captured" and payment["status"] != "successful":
        updated = (
            supabase.table("payments")
            .update({"status": "successful", "razorpay_payment_id": payment_id})
            .eq("id", payment["id"])
            .eq("status", "pending")
            .execute()
        )
        confirmed = False
        if updated.data:
            confirmed = _confirm_appointment(supabase, payment["appointment_id"])
        _notify_if_confirmed(supabase, payment["appointment_id"], confirmed)
    elif event_type == "payment.failed" and payment["status"] == "pending":
        supabase.table("payments").update({"status": "failed", "razorpay_payment_id": payment_id}).eq(
            "id", payment["id"]
        ).eq("status", "pending").execute()
        # Free the slot immediately rather than waiting for the hold to expire.
        supabase.table("appointments").update(
            {"status": "cancelled", "cancelled_reason": "payment_failed"}
        ).eq("id", payment["appointment_id"]).eq("status", "payment_pending").execute()

    return jsonify({"status": "ok"}), 200
