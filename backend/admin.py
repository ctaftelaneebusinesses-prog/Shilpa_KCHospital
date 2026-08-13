import re
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timezone

from flask import Blueprint, jsonify, request

from auth import require_admin
from settings import get_consultation_fee, set_consultation_fee
from slots import expire_stale_holds, get_availability, slot_label
from supabase_client import get_supabase

admin_bp = Blueprint("admin", __name__)

RESOLVED_STATUSES = ["confirmed", "completed", "cancelled", "no_show"]
ALLOWED_STATUS_TRANSITIONS = {"completed", "cancelled", "no_show"}
# Only appointments that are done and dusted can be archived - never an
# upcoming paid booking (confirmed) or an in-progress hold (payment_pending),
# so a misclick can't wipe a live appointment out of the lists.
DELETABLE_STATUSES = {"completed", "cancelled", "no_show"}


def _count(supabase, statuses=None, appointment_date=None, date_gte=None):
    # Archived (soft-deleted) rows are excluded from every count so a
    # deleted appointment disappears from the dashboard the same way it
    # disappears from the lists.
    query = supabase.table("appointments").select("id", count="exact").is_("deleted_at", "null")
    if statuses:
        query = query.in_("status", statuses)
    if appointment_date:
        query = query.eq("appointment_date", appointment_date)
    if date_gte:
        query = query.gte("appointment_date", date_gte)
    return query.execute().count or 0


def _payments_count(supabase, status):
    return supabase.table("payments").select("id", count="exact").eq("status", status).execute().count or 0


def _total_revenue(supabase):
    rows = supabase.table("payments").select("amount").eq("status", "successful").execute().data
    return sum(float(row["amount"]) for row in rows)


@admin_bp.get("/dashboard")
@require_admin
def dashboard():
    # Expired holds are otherwise only swept when a patient hits the public
    # booking endpoints, so without this the dashboard's pending counts can
    # sit stale (showing holds as "pending" well after they've expired) if
    # nobody has booked recently. This has to finish before the counts below
    # start, since it can change which bucket a row falls into.
    expire_stale_holds()

    supabase = get_supabase()
    today = date.today().isoformat()

    # Each of these is its own network round-trip to Supabase. Run them
    # concurrently instead of one-at-a-time - sequentially this page was
    # paying for ~11 round-trips of latency stacked back to back.
    with ThreadPoolExecutor(max_workers=11) as pool:
        futures = {
            "confirmed": pool.submit(_count, supabase, statuses=["confirmed"]),
            "completed": pool.submit(_count, supabase, statuses=["completed"]),
            "cancelled": pool.submit(_count, supabase, statuses=["cancelled"]),
            "no_show": pool.submit(_count, supabase, statuses=["no_show"]),
            "pending": pool.submit(_count, supabase, statuses=["payment_pending"]),
            "today_appointments": pool.submit(_count, supabase, statuses=RESOLVED_STATUSES, appointment_date=today),
            "upcoming_appointments": pool.submit(_count, supabase, statuses=["confirmed"], date_gte=today),
            "payments_successful": pool.submit(_payments_count, supabase, "successful"),
            "payments_pending": pool.submit(_payments_count, supabase, "pending"),
            "payments_failed": pool.submit(_payments_count, supabase, "failed"),
            "total_revenue": pool.submit(_total_revenue, supabase),
        }
        r = {key: future.result() for key, future in futures.items()}

    return (
        jsonify(
            {
                "totalAppointments": r["confirmed"] + r["completed"] + r["cancelled"] + r["no_show"],
                "todayAppointments": r["today_appointments"],
                "upcomingAppointments": r["upcoming_appointments"],
                "completedAppointments": r["completed"],
                "cancelledAppointments": r["cancelled"],
                "noShowAppointments": r["no_show"],
                "pendingAppointments": r["pending"],
                "successfulPayments": r["payments_successful"],
                "pendingPayments": r["payments_pending"],
                "failedPayments": r["payments_failed"],
                "totalRevenue": r["total_revenue"],
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
    expire_stale_holds()

    supabase = get_supabase()
    query = supabase.table("appointments").select("*").is_("deleted_at", "null")

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


@admin_bp.get("/calendar-summary")
@require_admin
def calendar_summary():
    expire_stale_holds()

    month = request.args.get("month", "")
    if not re.match(r"^\d{4}-\d{2}$", month):
        return jsonify({"error": "A valid month (YYYY-MM) is required."}), 400

    year, mon = (int(part) for part in month.split("-"))
    start = date(year, mon, 1)
    end = date(year + 1, 1, 1) if mon == 12 else date(year, mon + 1, 1)

    supabase = get_supabase()
    rows = (
        supabase.table("appointments")
        .select("appointment_date, status")
        .is_("deleted_at", "null")
        .gte("appointment_date", start.isoformat())
        .lt("appointment_date", end.isoformat())
        .execute()
        .data
    )

    summary = {}
    for row in rows:
        bucket = summary.setdefault(row["appointment_date"], {"active": 0, "cancelled": 0, "noShow": 0})
        if row["status"] in ("payment_pending", "confirmed", "completed"):
            bucket["active"] += 1
        elif row["status"] == "cancelled":
            bucket["cancelled"] += 1
        elif row["status"] == "no_show":
            bucket["noShow"] += 1

    return jsonify({"month": month, "summary": summary}), 200


@admin_bp.get("/appointments/by-date/<date_str>")
@require_admin
def appointments_by_date(date_str):
    supabase = get_supabase()
    slots = get_availability(date_str)

    booked = (
        supabase.table("appointments")
        .select("*")
        .is_("deleted_at", "null")
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
    # An appointment can have more than one payment row (e.g. a failed
    # verification attempt followed by a successful retry). The embed has no
    # guaranteed order, so without this the frontend's payments[0] can show
    # a stale/failed attempt instead of the latest one.
    appointment["payments"] = sorted(
        appointment.get("payments") or [], key=lambda p: p["created_at"], reverse=True
    )
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
        .is_("deleted_at", "null")
        .execute()
    )
    if not result.data:
        return (
            jsonify({"error": "Only a confirmed appointment can be updated, and only once."}),
            409,
        )

    return jsonify(result.data[0]), 200


@admin_bp.delete("/appointments/<appointment_id>")
@require_admin
def delete_appointment(appointment_id):
    """Archives (soft-deletes) a resolved appointment - it disappears from
    the normal lists/counts, but the row and its payment history stay in the
    database untouched, so revenue reporting is never affected."""
    supabase = get_supabase()
    result = (
        supabase.table("appointments")
        .update({"deleted_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", appointment_id)
        .in_("status", list(DELETABLE_STATUSES))
        .is_("deleted_at", "null")
        .execute()
    )
    if not result.data:
        return (
            jsonify({"error": "Only a completed, cancelled, or no-show appointment can be deleted."}),
            409,
        )

    return jsonify({"status": "deleted"}), 200


@admin_bp.get("/payments")
@require_admin
def payment_history():
    expire_stale_holds()

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


@admin_bp.get("/settings")
@require_admin
def get_settings():
    return jsonify({"consultationFeeInr": get_consultation_fee()}), 200


@admin_bp.post("/settings")
@require_admin
def update_settings():
    payload = request.get_json(silent=True) or {}
    if "consultationFeeInr" not in payload:
        return jsonify({"error": "consultationFeeInr is required."}), 400

    try:
        fee = float(payload["consultationFeeInr"])
    except (TypeError, ValueError):
        return jsonify({"error": "consultationFeeInr must be a number."}), 400

    if fee < 0:
        return jsonify({"error": "consultationFeeInr cannot be negative."}), 400

    updated = set_consultation_fee(round(fee, 2))
    return jsonify({"consultationFeeInr": updated}), 200
