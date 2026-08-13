import re
from urllib.parse import quote

from flask import Blueprint, current_app, jsonify, request

appointments_bp = Blueprint("appointments", __name__)

PHONE_PATTERN = re.compile(r"^[0-9]{10}$")

LANGUAGE_NAMES = {"en": "English", "te": "Telugu", "ta": "Tamil", "kn": "Kannada"}

REQUIRED_FIELDS = ["name", "phone", "city", "date", "time"]


def build_whatsapp_message(data):
    language_name = LANGUAGE_NAMES.get(data.get("language"), "English")
    message = data.get("message") or "No additional message"

    return (
        "Hello Dr. Shilpa / KC Hospital,\n\n"
        "I would like to request a gynaecology appointment.\n\n"
        f"Patient Name: {data['name']}\n"
        f"Phone Number: {data['phone']}\n"
        f"City: {data['city']}\n"
        f"Preferred Date: {data['date']}\n"
        f"Preferred Time: {data['time']}\n\n"
        f"Language Preference: {language_name}\n\n"
        "Additional Message:\n"
        f"{message}\n\n"
        "Please confirm my appointment.\n\n"
        "Thank you."
    )


@appointments_bp.post("/appointment")
def create_appointment():
    payload = request.get_json(silent=True) or {}

    missing = [field for field in REQUIRED_FIELDS if not str(payload.get(field, "")).strip()]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    phone = str(payload["phone"]).strip()
    if not PHONE_PATTERN.match(phone):
        return jsonify({"error": "Please enter a valid 10-digit mobile number."}), 400

    data = {
        "name": str(payload["name"]).strip(),
        "phone": phone,
        "city": str(payload["city"]).strip(),
        "date": str(payload["date"]).strip(),
        "time": str(payload["time"]).strip(),
        "message": str(payload.get("message", "")).strip(),
        "language": payload.get("language", "en"),
    }

    message = build_whatsapp_message(data)
    whatsapp_number = current_app.config["WHATSAPP_NUMBER"]
    whatsapp_url = f"https://wa.me/{whatsapp_number}?text={quote(message)}"

    return jsonify({"whatsappUrl": whatsapp_url}), 200
