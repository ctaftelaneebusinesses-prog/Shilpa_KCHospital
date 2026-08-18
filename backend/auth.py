import hashlib
import time
from functools import wraps

from flask import g, jsonify, request

from supabase_client import get_supabase

# Every admin page load fires several /api/admin/* requests in parallel
# (the page's own data, the notification bell, etc.), and each one used to
# pay for two sequential network round-trips to Supabase (auth.get_user(),
# then a separate admin_users lookup) before doing any real work - that's
# what made the admin pages feel slow next to the public site, which has no
# auth check at all. Caching a validated token's result for a short window
# means only the first request in a burst pays that cost; the rest are
# served from memory. Keyed by a hash (not the raw token) so a bearer token
# never sits in memory as plaintext.
_ADMIN_AUTH_CACHE = {}
_ADMIN_AUTH_CACHE_TTL_SECONDS = 60


def _token_cache_key(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def require_admin(view):
    """Validates the caller's Supabase Auth session token and checks
    membership in admin_users before allowing access to any /api/admin/*
    route. Patients never receive a token that would pass this check."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing authorization token."}), 401
        token = auth_header.split(" ", 1)[1].strip()

        cache_key = _token_cache_key(token)
        now = time.monotonic()
        cached = _ADMIN_AUTH_CACHE.get(cache_key)
        if cached and cached["expires_at"] > now:
            g.admin_user_id = cached["user_id"]
            return view(*args, **kwargs)

        supabase = get_supabase()
        try:
            user_response = supabase.auth.get_user(token)
        except Exception:  # noqa: BLE001
            return jsonify({"error": "Invalid or expired session."}), 401

        user = getattr(user_response, "user", None)
        if not user:
            return jsonify({"error": "Invalid or expired session."}), 401

        admin_row = (
            supabase.table("admin_users").select("id").eq("id", user.id).limit(1).execute()
        )
        if not admin_row.data:
            return jsonify({"error": "Not authorized as admin."}), 403

        _ADMIN_AUTH_CACHE[cache_key] = {
            "user_id": user.id,
            "expires_at": now + _ADMIN_AUTH_CACHE_TTL_SECONDS,
        }
        g.admin_user_id = user.id
        return view(*args, **kwargs)

    return wrapped
