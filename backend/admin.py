from datetime import date

from flask import Blueprint, jsonify, request

from auth import require_admin
from slots import get_availability, slot_label
from supabase_client import get_supabase

admin_bp = Blueprint("admin", __name__)

RESOLVED_STATUSES = ["confirmed", "completed", "cancelled", "no_show"]
ALLOWED_STATUS_TRANSITIONS = {"completed", "cancelled", "no_show"}


def _count(supabase, statuses=None, appointment_date=None, date_gte=None):
    query = supabase.table("appointments").select("id", count="exact")
    if statuses:
        query = query.in_("status", statuses)
    if appointment_date:
        query = query.eq("appointment_date", appointment_date)
    if date_gte:
        query = query.gte("appointment_date", date_gte)
    return query.execute().count or 0


@admin_bp.get("/dashboard")
@require_admin
def dashboard():
    supabase = get_supabase()
    today = date.today().isoformat()

    confirmed = _count(supabase, statuses=["confirmed"])
    completed = _count(supabase, statuses=["completed"])
    cancelled = _count(supabase, statuses=["cancelled"])
    no_show = _count(supabase, statuses=["no_show"])
    pending = _count(supabase, statuses=["payment_pending"])

    today_appointments = _count(supabase, statuses=RESOLVED_STATUSES, appointment_date=today)
    upcoming_appointments = _count(supabase, statuses=["confirmed"], date_gte=today)

    payments_successful = (
        supabase.table("payments").select("id", count="exact").eq("status", "successful").execute().count
        or 0
    )
    payments_pending = (
        supabase.table("payments").select("id", count="exact").eq("status", "pending").execute().count
        or 0
    )
    payments_failed = (
        supabase.table("payments").select("id", count="exact").eq("status", "failed").execute().count or 0
    )
    revenue_rows = supabase.table("payments").select("amount").eq("status", "successful").execute().data
    total_revenue = sum(float(row["amount"]) for row in revenue_rows)

    return (
        jsonify(
            {
                "totalAppointments": confirmed + completed + cancelled + no_show,
                "todayAppointments": today_appointments,
                "upcomingAppointments": upcoming_appointments,
                "completedAppointments": completed,
                "cancelledAppointments": cancelled,
                "pendingAppointments": pending,
                "successfulPayments": payments_successful,
                "pendingPayments": payments_pending,
                "failedPayments": payments_failed,
                "totalRevenue": total_revenue,
            }
        ),
        200,
    )


@admin_bp.get("/notifications")
@require_admin
def notifications():
    supabase = get_supabase()
    limit = min(int(request.args.get("limit", 20)), 50)

    result = (
        supabase.table("appointments")
        .select("id, patient_name, patient_phone, appointment_date, appointment_time, updated_at")
        .eq("status", "confirmed")
        .order("updated_at", desc=True)
        .limit(limit)
        .execute()
    )
    items = result.data
    for row in items:
        row["time_label"] = slot_label(row["appointment_time"][:5])

    return jsonify({"notifications": items}), 200


@admin_bp.get("/appointments")
@require_admin
def list_appointments():
    supabase = get_supabase()
    query = supabase.table("appointments").select("*")

    status = request.args.get("status")
    if status:
        query = query.eq("status", status)

    appointment_date = request.args.get("date")
    if appointment_date:
        query = query.eq("appointment_date", appointment_date)

    search = request.args.get("q", "").strip()
    if search:
        query = query.or_(f"patient_name.ilike.%{search}%,patient_phone.ilike.%{search}%")

    result = query.order("appointment_date", desc=True).order("appointment_time").execute()
    return jsonify({"appointments": result.data}), 200


@admin_bp.get("/appointments/by-date/<date_str>")
@require_admin
def appointments_by_date(date_str):
    supabase = get_supabase()
    slots = get_availability(date_str)

    booked = (
        supabase.table("appointments")
        .select("*")
        .eq("appointment_date", date_str)
        .in_("status", ["payment_pending", "confirmed", "completed", "no_show"])
        .execute()
        .data
    )
    booked_by_time = {row["appointment_time"][:5]: row for row in booked}

    for slot in slots:
        appointment = booked_by_time.get(slot["time"])
        slot["appointment"] = appointment

    return jsonify({"date": date_str, "slots": slots}), 200


@admin_bp.get("/appointments/<appointment_id>")
@require_admin
def appointment_detail(appointment_id):
    supabase = get_supabase()
    result = (
        supabase.table("appointments")
        .select("*, payments(*)")
        .eq("id", appointment_id)
        .limit(1)
        .execute()
    )
    if not result.data:
        return jsonify({"error": "Appointment not found."}), 404

    appointment = result.data[0]
    appointment["time_label"] = slot_label(appointment["appointment_time"][:5])
    return jsonify(appointment), 200


@admin_bp.post("/appointments/<appointment_id>/status")
@require_admin
def update_appointment_status(appointment_id):
    payload = request.get_json(silent=True) or {}
    new_status = str(payload.get("status", "")).strip()

    if new_status not in ALLOWED_STATUS_TRANSITIONS:
        return jsonify({"error": "status must be one of completed, cancelled, no_show."}), 400

    supabase = get_supabase()
    update_fields = {"status": new_status}
    if new_status == "cancelled":
        update_fields["cancelled_reason"] = "cancelled_by_admin"

    # Only a confirmed (paid) appointment can transition, so an admin action
    # can never mark an unpaid hold as completed/no-show, and can never
    # re-confirm something already resolved.
    result = (
        supabase.table("appointments")
        .update(update_fields)
        .eq("id", appointment_id)
        .eq("status", "confirmed")
        .execute()
    )
    if not result.data:
        return (
            jsonify({"error": "Only a confirmed appointment can be updated, and only once."}),
            409,
        )

    return jsonify(result.data[0]), 200


@admin_bp.get("/payments")
@require_admin
def payment_history():
    supabase = get_supabase()

    search = request.args.get("q", "").strip()
    appointment_ids = None
    if search:
        matches = (
            supabase.table("appointments")
            .select("id")
            .or_(f"patient_name.ilike.%{search}%,patient_phone.ilike.%{search}%")
            .execute()
            .data
        )
        appointment_ids = [row["id"] for row in matches]
        if not appointment_ids:
            return jsonify({"payments": []}), 200

    query = supabase.table("payments").select("*, appointments(patient_name, patient_phone, appointment_date, appointment_time)")

    status = request.args.get("status")
    if status:
        query = query.eq("status", status)

    payment_date = request.args.get("date")
    if payment_date:
        query = query.gte("created_at", f"{payment_date}T00:00:00").lte("created_at", f"{payment_date}T23:59:59")

    if appointment_ids is not None:
        query = query.in_("appointment_id", appointment_ids)

    result = query.order("created_at", desc=True).execute()
    return jsonify({"payments": result.data}), 200
