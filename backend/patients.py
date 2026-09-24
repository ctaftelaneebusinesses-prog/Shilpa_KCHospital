import calendar
import re
from datetime import datetime, timezone

from flask import Blueprint, current_app, jsonify, request

from auth import require_admin
from booking import DATE_PATTERN, PHONE_PATTERN
from supabase_client import get_supabase

patients_bp = Blueprint("patients", __name__)

# Kept in sync with the dropdowns in frontend/src/admin/patientOptions.js.
DELIVERY_TYPES = {
    "Normal (Vaginal)",
    "C-Section (Planned)",
    "C-Section (Emergency)",
    "Assisted - Vacuum",
    "Assisted - Forceps",
    "VBAC (Normal after C-Section)",
}
BABY_GENDERS = {"Boy", "Girl", "Ambiguous"}
BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
# A newborn's blood group isn't always tested at birth.
BABY_BLOOD_GROUPS = BLOOD_GROUPS | {"Not tested"}

TIME_PATTERN = re.compile(r"^\d{2}:\d{2}$")
PINCODE_PATTERN = re.compile(r"^[0-9]{6}$")

REQUIRED_TEXT_FIELDS = {
    "mother_name": "Mother's name",
    "mother_occupation": "Mother's occupation",
    "father_name": "Father's name",
    "father_occupation": "Father's occupation",
    "address": "Address",
    "district": "District",
    "state": "State",
}
OPTIONAL_TEXT_FIELDS = ("notes",)


def _clean_record(payload):
    """Validates a full create/update payload. Returns (fields, error)."""
    fields = {}

    for key, label in REQUIRED_TEXT_FIELDS.items():
        value = str(payload.get(key) or "").strip()
        if not value:
            return None, f"{label} is required."
        fields[key] = value

    for key in OPTIONAL_TEXT_FIELDS:
        fields[key] = str(payload.get(key) or "").strip() or None

    try:
        age = int(payload.get("mother_age"))
    except (TypeError, ValueError):
        return None, "Mother's age is required."
    if not 10 <= age <= 70:
        return None, "Mother's age must be between 10 and 70."
    fields["mother_age"] = age

    phone = str(payload.get("contact_phone") or "").strip()
    if not PHONE_PATTERN.match(phone):
        return None, "Please enter a valid 10-digit contact number."
    fields["contact_phone"] = phone

    alternate = str(payload.get("alternate_phone") or "").strip()
    if alternate and not PHONE_PATTERN.match(alternate):
        return None, "Alternate number must be a valid 10-digit number."
    fields["alternate_phone"] = alternate or None

    pincode = str(payload.get("pincode") or "").strip()
    if pincode and not PINCODE_PATTERN.match(pincode):
        return None, "Pincode must be 6 digits."
    fields["pincode"] = pincode or None

    for key, label in (("delivery_date", "Delivery date"), ("baby_birth_date", "Baby's date of birth")):
        value = str(payload.get(key) or "").strip()
        if not DATE_PATTERN.match(value):
            return None, f"{label} is required."
        fields[key] = value

    birth_time = str(payload.get("baby_birth_time") or "").strip()[:5]
    if birth_time and not TIME_PATTERN.match(birth_time):
        return None, "Time of birth must be HH:MM."
    fields["baby_birth_time"] = birth_time or None

    for key, allowed, label in (
        ("delivery_type", DELIVERY_TYPES, "delivery type"),
        ("baby_gender", BABY_GENDERS, "baby's gender"),
        ("mother_blood_group", BLOOD_GROUPS, "mother's blood group"),
        ("baby_blood_group", BABY_BLOOD_GROUPS, "baby's blood group"),
    ):
        value = str(payload.get(key) or "").strip()
        if value not in allowed:
            return None, f"Please select the {label}."
        fields[key] = value

    try:
        weight = round(float(payload.get("baby_weight_kg")), 2)
    except (TypeError, ValueError):
        return None, "Baby's weight is required."
    if not 0 < weight < 10:
        return None, "Baby's weight must be between 0 and 10 kg."
    fields["baby_weight_kg"] = weight

    gestation = payload.get("gestational_age_weeks")
    if gestation in (None, ""):
        fields["gestational_age_weeks"] = None
    else:
        try:
            gestation = int(gestation)
        except (TypeError, ValueError):
            return None, "Gestational age must be a number of weeks."
        if not 20 <= gestation <= 45:
            return None, "Gestational age must be between 20 and 45 weeks."
        fields["gestational_age_weeks"] = gestation

    return fields, None


@patients_bp.get("")
@require_admin
def list_patients():
    supabase = get_supabase()
    query = supabase.table("patient_records").select("*").is_("deleted_at", "null")

    search = request.args.get("q", "").strip()
    if search:
        # Commas/parens would break PostgREST's or=() filter syntax.
        search = re.sub(r"[,()]", " ", search)
        query = query.or_(
            f"mother_name.ilike.%{search}%,father_name.ilike.%{search}%,contact_phone.ilike.%{search}%"
        )

    delivery_type = request.args.get("delivery_type")
    if delivery_type:
        query = query.eq("delivery_type", delivery_type)

    month = request.args.get("month", "")
    if re.match(r"^\d{4}-\d{2}$", month):
        year, mon = (int(part) for part in month.split("-"))
        last_day = calendar.monthrange(year, mon)[1]
        query = query.gte("delivery_date", f"{month}-01").lte("delivery_date", f"{month}-{last_day:02d}")

    result = query.order("delivery_date", desc=True).order("created_at", desc=True).execute()
    return jsonify({"patients": result.data}), 200


@patients_bp.get("/<record_id>")
@require_admin
def get_patient(record_id):
    supabase = get_supabase()
    result = (
        supabase.table("patient_records").select("*").eq("id", record_id).is_("deleted_at", "null").limit(1).execute()
    )
    if not result.data:
        return jsonify({"error": "Patient record not found."}), 404
    return jsonify(result.data[0]), 200


@patients_bp.post("")
@require_admin
def create_patient():
    fields, error = _clean_record(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400

    supabase = get_supabase()
    try:
        result = supabase.table("patient_records").insert(fields).execute()
    except Exception:  # noqa: BLE001 - postgrest raises a generic APIError
        current_app.logger.exception("Failed to create patient record")
        return jsonify({"error": "Could not save this record. Please try again."}), 500
    return jsonify(result.data[0]), 201


@patients_bp.put("/<record_id>")
@require_admin
def update_patient(record_id):
    fields, error = _clean_record(request.get_json(silent=True) or {})
    if error:
        return jsonify({"error": error}), 400

    supabase = get_supabase()
    result = (
        supabase.table("patient_records").update(fields).eq("id", record_id).is_("deleted_at", "null").execute()
    )
    if not result.data:
        return jsonify({"error": "Patient record not found."}), 404
    return jsonify(result.data[0]), 200


@patients_bp.delete("/<record_id>")
@require_admin
def delete_patient(record_id):
    supabase = get_supabase()
    result = (
        supabase.table("patient_records")
        .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", record_id)
        .is_("deleted_at", "null")
        .execute()
    )
    if not result.data:
        return jsonify({"error": "Patient record not found."}), 404
    return jsonify({"status": "deleted"}), 200
