from flask import current_app, g
from supabase import Client, create_client


def get_supabase() -> Client:
    """Service-role Supabase client. Only the backend ever holds this key,
    so it is the sole writer/reader of appointment and payment data and RLS
    is bypassed intentionally (see migrations/0001_booking.sql)."""
    if "supabase" not in g:
        g.supabase = create_client(
            current_app.config["SUPABASE_URL"],
            current_app.config["SUPABASE_SERVICE_ROLE_KEY"],
        )
    return g.supabase
