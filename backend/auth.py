from functools import wraps

from flask import g, jsonify, request

from supabase_client import get_supabase


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

        g.admin_user_id = user.id
        return view(*args, **kwargs)

    return wrapped
