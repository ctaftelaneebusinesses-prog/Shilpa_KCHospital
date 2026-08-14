import re
from datetime import date

from flask import Blueprint, current_app, jsonify, request

from notifications import notify_free_booking
from settings import get_consultation_fee
from slots import (
    TIME_SLOT_VALUES,
    appointment_time_label,
    expire_stale_holds,
    get_available_slots,
    get_daily_status,
    hold_expiry_timestamp,
    today_ist,
)
from supabase_client import get_supabase

booking_bp = Blueprint("booking", __name__)

PHONE_PATTERN = re.compile(r"^[0-9]{10}$")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DATE_FULL_MESSAGE = "This date is already fully booked. Please choose another date."
SLOT_TAKEN_MESSAGE = "This time slot is no longer available. Please choose another."


def _is_date_full(error: Exception) -> bool:
    return "DATE_FULL" in str(error)


def _is_slot_taken(error: Exception) -> bool:
    return "SLOT_TAKEN" in str(error)


@booking_bp.get("/availability")
def availability():
    date_str = request.args.get("date", "")
    if not DATE_PATTERN.match(date_str):
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400

    try:
        requested = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400

    if requested < today_ist():
        return jsonify({"error": "Cannot check availability for a past date."}), 400

    return jsonify(get_daily_status(date_str)), 200


@booking_bp.get("/slots")
def slots():
    date_str = request.args.get("date", "")
    if not DATE_PATTERN.match(date_str):
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400

    try:
        requested = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400

    if requested < today_ist():
        return jsonify({"error": "Cannot check availability for a past date."}), 400

    return jsonify({"date": date_str, "slots": get_available_slots(date_str)}), 200


@booking_bp.get("/fee")
def consultation_fee():
    return jsonify({"consultationFeeInr": get_consultation_fee()}), 200


@booking_bp.get("/reasons")
def reason_options():
    # Translated columns can be null (translation failed, or the row
    # predates migration 0007) - always fall back to the English label.
    language_column = {"te": "label_te", "ta": "label_ta", "kn": "label_kn"}.get(
        request.args.get("language", "en")
    )

    supabase = get_supabase()
    result = (
        supabase.table("reason_options")
        .select("id, label, label_te, label_ta, label_kn")
        .order("sort_order")
        .execute()
    )
    reasons = [
        {
            "id": row["id"],
            "label": (row.get(language_column) if language_column else None) or row["label"],
            "labelEn": row["label"],
        }
        for row in result.data
    ]
    return jsonify({"reasons": reasons}), 200


@booking_bp.post("/hold")
def hold_slot():
    payload = request.get_json(silent=True) or {}

    required = ["name", "phone", "date", "time"]
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

    if not PHONE_PATTERN.match(phone):
        return jsonify({"error": "Please enter a valid 10-digit mobile number."}), 400
    if not DATE_PATTERN.match(date_str):
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400
    if time_str not in TIME_SLOT_VALUES:
        return jsonify({"error": "Please choose a valid time slot."}), 400

    try:
        requested = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400
    if requested < today_ist():
        return jsonify({"error": "Cannot book an appointment in the past."}), 400

    expire_stale_holds()

    fee = get_consultation_fee()
    is_free = fee <= 0
    status = "confirmed" if is_free else "payment_pending"
    hold_expires_at = None if is_free else hold_expiry_timestamp()

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
                "p_status": status,
                "p_hold_expires_at": hold_expires_at,
            },
        ).execute()
    except Exception as error:  # noqa: BLE001 - postgrest raises a generic APIError
        if _is_slot_taken(error):
            return jsonify({"error": SLOT_TAKEN_MESSAGE}), 409
        if _is_date_full(error):
            return jsonify({"error": DATE_FULL_MESSAGE}), 409
        current_app.logger.exception("Failed to create appointment hold")
        return jsonify({"error": "Could not hold this appointment. Please try again."}), 500

    appointment = result.data

    if is_free:
        try:
            notify_free_booking(appointment)
        except Exception:  # noqa: BLE001 - notification failures must never break booking
            current_app.logger.exception(
                "Failed to send free-booking confirmation notifications for appointment %s",
                appointment["id"],
            )

    return (
        jsonify(
            {
                "appointmentId": appointment["id"],
                "holdExpiresAt": appointment["hold_expires_at"],
                "status": appointment["status"],
                "consultationFee": fee,
            }
        ),
        201,
    )


@booking_bp.get("/appointments/<appointment_id>")
def get_appointment(appointment_id):
    supabase = get_supabase()
    result = (
        supabase.table("appointments")
        .select(
            "id, patient_name, appointment_date, appointment_time, reason, status, hold_expires_at, created_at"
        )
        .eq("id", appointment_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        return jsonify({"error": "Appointment not found."}), 404

    appointment = result.data[0]
    appointment["time_label"] = appointment_time_label(appointment)
    return jsonify(appointment), 200

