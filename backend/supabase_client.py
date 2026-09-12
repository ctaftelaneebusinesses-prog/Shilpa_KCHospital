import time

import httpcore
import httpx
from flask import current_app, g
from postgrest.exceptions import APIError
from supabase import Client, create_client

# Transient failures seen right after a cold container start: the host's
# clock hasn't finished NTP sync yet (Supabase rejects the service JWT as
# "issued in the future") or the connection to Supabase drops mid-request.
# Both clear up on their own within a second, so a couple of quick retries
# avoid surfacing a 500 to the patient for something that isn't a real error.
_RETRYABLE_NETWORK_ERRORS = (
    httpx.HTTPError,
    httpcore.RemoteProtocolError,
    httpcore.ConnectError,
    httpcore.ConnectTimeout,
)


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


def execute_with_retry(query_builder, attempts: int = 3, delay_seconds: float = 0.4):
    """Runs `query_builder.execute()`, retrying transient cold-start failures
    (see module docstring above) up to `attempts` times before giving up."""
    for attempt in range(attempts):
        try:
            return query_builder.execute()
        except APIError as error:
            if error.code != "PGRST303" or attempt == attempts - 1:
                raise
        except _RETRYABLE_NETWORK_ERRORS:
            if attempt == attempts - 1:
                raise
        time.sleep(delay_seconds)
