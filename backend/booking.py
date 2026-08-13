import re
from datetime import date

from flask import Blueprint, current_app, jsonify, request

from slots import TIME_SLOTS, expire_stale_holds, get_availability, hold_expiry_timestamp, slot_label
from supabase_client import get_supabase

booking_bp = Blueprint("booking", __name__)

PHONE_PATTERN = re.compile(r"^[0-9]{10}$")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SLOT_BOOKED_MESSAGE = "This appointment time has already been booked. Please select another time."


def _is_unique_violation(error: Exception) -> bool:
    text = str(error)
    return "23505" in text or "duplicate key" in text.lower()


@booking_bp.get("/availability")
def availability():
    date_str = request.args.get("date", "")
    if not DATE_PATTERN.match(date_str):
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400

    try:
        requested = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400

    if requested < date.today():
        return jsonify({"error": "Cannot check availability for a past date."}), 400

    return jsonify({"date": date_str, "slots": get_availability(date_str)}), 200


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
    time_value = str(payload["time"]).strip()
    reason = str(payload.get("reason", "")).strip() or None
    language = payload.get("language", "en")

    if not PHONE_PATTERN.match(phone):
        return jsonify({"error": "Please enter a valid 10-digit mobile number."}), 400
    if not DATE_PATTERN.match(date_str):
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400
    if not any(slot_value == time_value for slot_value, _ in TIME_SLOTS):
        return jsonify({"error": "Please select a valid appointment time."}), 400

    try:
        requested = date.fromisoformat(date_str)
    except ValueError:
        return jsonify({"error": "A valid date (YYYY-MM-DD) is required."}), 400
    if requested < date.today():
        return jsonify({"error": "Cannot book an appointment in the past."}), 400

    expire_stale_holds()

    supabase = get_supabase()
    try:
        result = (
            supabase.table("appointments")
            .insert(
                {
                    "patient_name": name,
                    "patient_phone": phone,
                    "patient_email": email,
                    "appointment_date": date_str,
                    "appointment_time": time_value,
                    "reason": reason,
                    "language": language,
                    "status": "payment_pending",
                    "hold_expires_at": hold_expiry_timestamp(),
                }
            )
            .execute()
        )
    except Exception as error:  # noqa: BLE001 - postgrest raises a generic APIError
        if _is_unique_violation(error):
            return jsonify({"error": SLOT_BOOKED_MESSAGE}), 409
        current_app.logger.exception("Failed to create appointment hold")
        return jsonify({"error": "Could not hold this appointment slot. Please try again."}), 500

    appointment = result.data[0]
    return (
        jsonify(
            {
                "appointmentId": appointment["id"],
                "holdExpiresAt": appointment["hold_expires_at"],
                "status": appointment["status"],
                "consultationFee": current_app.config["CONSULTATION_FEE_INR"],
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
    appointment["time_label"] = slot_label(appointment["appointment_time"][:5])
    return jsonify(appointment), 200

