from datetime import datetime, timedelta, timezone

from supabase_client import get_supabase

# Historical slot labels, kept only so old appointments (booked before the
# switch to date-only, capacity-based booking) still display a readable
# time. New bookings no longer carry a time at all.
TIME_SLOTS = [
    ("09:00", "09:00 AM"),
    ("10:00", "10:00 AM"),
    ("11:00", "11:00 AM"),
    ("12:00", "12:00 PM"),
    ("14:00", "02:00 PM"),
    ("15:00", "03:00 PM"),
    ("16:00", "04:00 PM"),
    ("17:00", "05:00 PM"),
]

# Dr. Shilpa can't commit to specific appointment times (she's frequently
# pulled into emergencies), so patients no longer pick a time - just a date,
# capped at this many patients per day. Keep in sync with the
# book_appointment() Postgres function (migrations/0005) and the frontend's
# Calendar.jsx DAILY_CAPACITY constant.
DAILY_CAPACITY = 10
# completed counts too: a patient already seen today still used up one of
# the day's spots, even though their status has since moved on from confirmed.
CAPACITY_STATUSES = ("payment_pending", "confirmed", "completed")


def expire_stale_holds():
    """Frees any payment_pending row whose hold has expired. Called before
    every availability check and booking attempt so expired holds never
    block another patient, without needing a background worker."""
    supabase = get_supabase()
    now_iso = datetime.now(timezone.utc).isoformat()
    expired = (
        supabase.table("appointments")
        .update({"status": "cancelled", "cancelled_reason": "hold_expired"})
        .eq("status", "payment_pending")
        .lt("hold_expires_at", now_iso)
        .execute()
    )
    # Keep the payments table in sync so the admin dashboard's "pending
    # payments" count doesn't drift from actual payment_pending appointments.
    expired_ids = [row["id"] for row in (expired.data or [])]
    if expired_ids:
        supabase.table("payments").update({"status": "failed"}).in_(
            "appointment_id", expired_ids
        ).eq("status", "pending").execute()


def get_daily_status(date_str: str):
    """Returns how many of the day's capacity is used up, for the
    date-picker's availability check (patients no longer see time slots)."""
    expire_stale_holds()

    supabase = get_supabase()
    booked_count = (
        supabase.table("appointments")
        .select("id", count="exact")
        .eq("appointment_date", date_str)
        .in_("status", CAPACITY_STATUSES)
        .is_("deleted_at", "null")
        .execute()
        .count
        or 0
    )

    return {
        "date": date_str,
        "capacity": DAILY_CAPACITY,
        "bookedCount": booked_count,
        "full": booked_count >= DAILY_CAPACITY,
    }


def hold_expiry_timestamp():
    from flask import current_app

    minutes = current_app.config["APPOINTMENT_HOLD_MINUTES"]
    return (datetime.now(timezone.utc) + timedelta(minutes=minutes)).isoformat()


def slot_label(value):
    """value is HH:MM (legacy rows) or None (bookings made after the switch
    to date-only booking, which never had a specific time)."""
    if not value:
        return None
    for slot_value, label in TIME_SLOTS:
        if slot_value == value:
            return label
    return value


def appointment_time_label(appointment: dict):
    value = appointment.get("appointment_time")
    return slot_label(value[:5] if value else None)
