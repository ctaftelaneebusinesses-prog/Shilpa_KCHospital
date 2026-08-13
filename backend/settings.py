from flask import current_app

from supabase_client import get_supabase

SETTINGS_ROW_ID = 1


def get_consultation_fee() -> float:
    """Admin-configurable consultation fee, in INR. 0 means booking is free
    and the payment step is skipped entirely."""
    supabase = get_supabase()
    result = (
        supabase.table("clinic_settings")
        .select("consultation_fee_inr")
        .eq("id", SETTINGS_ROW_ID)
        .limit(1)
        .execute()
    )
    if result.data:
        return float(result.data[0]["consultation_fee_inr"])
    return float(current_app.config["CONSULTATION_FEE_INR"])


def set_consultation_fee(amount: float) -> float:
    supabase = get_supabase()
    updated = (
        supabase.table("clinic_settings")
        .update({"consultation_fee_inr": amount})
        .eq("id", SETTINGS_ROW_ID)
        .execute()
    )
    if updated.data:
        return float(updated.data[0]["consultation_fee_inr"])

    inserted = (
        supabase.table("clinic_settings")
        .insert({"id": SETTINGS_ROW_ID, "consultation_fee_inr": amount})
        .execute()
    )
    return float(inserted.data[0]["consultation_fee_inr"])
