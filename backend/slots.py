from datetime import datetime, timedelta, timezone

from supabase_client import get_supabase

# Single source of truth for the clinic's daily slot list (value = 24h time
# stored in Postgres, label = what the existing UI showed before).
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

ACTIVE_STATUSES = ("payment_pending", "confirmed")


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


def get_availability(date_str: str):
    expire_stale_holds()

    supabase = get_supabase()
    result = (
        supabase.table("appointments")
        .select("appointment_time")
        .eq("appointment_date", date_str)
        .in_("status", ACTIVE_STATUSES)
        .execute()
    )
    booked_times = {row["appointment_time"][:5] for row in result.data}

    return [
        {"time": value, "label": label, "status": "booked" if value in booked_times else "available"}
        for value, label in TIME_SLOTS
    ]


def hold_expiry_timestamp():
    from flask import current_app

    minutes = current_app.config["APPOINTMENT_HOLD_MINUTES"]
    return (datetime.now(timezone.utc) + timedelta(minutes=minutes)).isoformat()


def slot_label(value: str) -> str:
    for slot_value, label in TIME_SLOTS:
        if slot_value == value:
            return label
    return value
