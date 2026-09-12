import time

import httpcore
import httpx
from flask import current_app, g
from postgrest._sync import request_builder as _postgrest_request_builder
from supabase import Client, create_client

# Transient failures seen right after a cold container start: the host's
# clock hasn't finished NTP sync yet, so Supabase briefly rejects the
# service JWT ("JWT issued at future", code PGRST303), or the connection to
# Supabase drops mid-request. Both clear up on their own within a second.
#
# Patched at this single choke point - the `send_with_retry()` that every
# postgrest-py query (`.table(...).execute()`, `.rpc(...).execute()`, from
# every route in every file) already funnels through - instead of wrapping
# each of the dozens of `.execute()` call sites individually.
_RETRYABLE_NETWORK_ERRORS = (
    httpx.HTTPError,
    httpcore.RemoteProtocolError,
    httpcore.ConnectError,
    httpcore.ConnectTimeout,
)
_RETRYABLE_POSTGREST_CODES = {"PGRST303"}

_original_send_with_retry = _postgrest_request_builder.send_with_retry


def _send_with_cold_start_retry(req, attempts: int = 3, delay_seconds: float = 0.4):
    for attempt in range(attempts):
        try:
            resp = _original_send_with_retry(req)
        except _RETRYABLE_NETWORK_ERRORS:
            if attempt == attempts - 1:
                raise
            time.sleep(delay_seconds)
            continue

        if resp.is_success or attempt == attempts - 1:
            return resp

        try:
            body_code = resp.json().get("code")
        except ValueError:
            body_code = None
        if body_code not in _RETRYABLE_POSTGREST_CODES:
            return resp

        time.sleep(delay_seconds)

    return resp


_postgrest_request_builder.send_with_retry = _send_with_cold_start_retry


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
