from datetime import datetime, timedelta, timezone

from supabase_client import get_supabase

# The clinic is in Kuppam, India - always IST, no DST. The server (Railway)
# runs in UTC, so date.today() drifts a calendar day behind IST for the
# 5.5 hours after midnight IST (UTC is still "yesterday" then). Every
# "today"/"past date" comparison must use this instead of date.today().
IST = timezone(timedelta(hours=5, minutes=30))


def today_ist():
    return datetime.now(IST).date()


def now_ist():
    return datetime.now(IST)

# Labels for the old hourly slots (booked before the brief date-only,
# capacity-based era introduced in migration 0005). Kept only so those
# historical appointments still display a readable time - slot_label() falls
# back to this list for any value not in the current TIME_SLOTS.
LEGACY_TIME_SLOTS = [
    ("09:00", "09:00 AM"),
    ("10:00", "10:00 AM"),
    ("11:00", "11:00 AM"),
    ("12:00", "12:00 PM"),
    ("14:00", "02:00 PM"),
    ("15:00", "03:00 PM"),
    ("16:00", "04:00 PM"),
    ("17:00", "05:00 PM"),
]

# Patients pick a specific time slot again (migration 0008): every 10
# minutes from 1:00 PM up to (not including) 2:40 PM - 10 slots/day, one
# patient per slot.
SLOT_START_MINUTES = 13 * 60
SLOT_END_MINUTES = 14 * 60 + 40
SLOT_INTERVAL_MINUTES = 10


def _build_time_slots():
    slots = []
    for minutes in range(SLOT_START_MINUTES, SLOT_END_MINUTES, SLOT_INTERVAL_MINUTES):
        hour, minute = divmod(minutes, 60)
        value = f"{hour:02d}:{minute:02d}"
        label = datetime(2000, 1, 1, hour, minute).strftime("%I:%M %p").lstrip("0")
        slots.append((value, label))
    return slots


TIME_SLOTS = _build_time_slots()
TIME_SLOT_VALUES = {value for value, _label in TIME_SLOTS}

# Exactly one patient per time slot. Kept in sync with the book_appointment()
# Postgres function (migrations/0008).
SLOT_CAPACITY = 1
# The day is "full" once every slot is taken. Kept in sync with the
# frontend's Calendar.jsx DAILY_CAPACITY constant.
DAILY_CAPACITY = len(TIME_SLOTS)
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
    """Returns how many of the day's slots are used up, for the date
    picker's availability note (capacity is now just "number of slots")."""
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


def get_available_slots(date_str: str):
    """Returns every slot for the day with an `available` flag, for the
    patient-facing time picker: taken slots (an active booking already
    holds them) and, for today, slots whose start time has already passed
    are unavailable."""
    expire_stale_holds()

    supabase = get_supabase()
    taken_rows = (
        supabase.table("appointments")
        .select("appointment_time")
        .eq("appointment_date", date_str)
        .in_("status", CAPACITY_STATUSES)
        .is_("deleted_at", "null")
        .execute()
        .data
    )
    taken = {row["appointment_time"][:5] for row in taken_rows if row.get("appointment_time")}

    is_today = date_str == today_ist().isoformat()
    current_hhmm = now_ist().strftime("%H:%M")

    slots = []
    for value, label in TIME_SLOTS:
        available = value not in taken and not (is_today and value <= current_hhmm)
        slots.append({"value": value, "label": label, "available": available})

    return slots


def hold_expiry_timestamp():
    from flask import current_app

    minutes = current_app.config["APPOINTMENT_HOLD_MINUTES"]
    return (datetime.now(timezone.utc) + timedelta(minutes=minutes)).isoformat()


def slot_label(value):
    """value is HH:MM, or None for the brief window (migration 0005-0008)
    where bookings didn't carry a time at all."""
    if not value:
        return None
    for slot_value, label in TIME_SLOTS + LEGACY_TIME_SLOTS:
        if slot_value == value:
            return label
    return value


def appointment_time_label(appointment: dict):
    value = appointment.get("appointment_time")
    return slot_label(value[:5] if value else None)
