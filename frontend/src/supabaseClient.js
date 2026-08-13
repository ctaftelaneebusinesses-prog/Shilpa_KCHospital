import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Public anon key only — used exclusively for the admin login handshake.
// No appointment/payment data is ever read or written directly through
// this client; that all goes through the Flask backend, which holds the
// service-role key. See backend/supabase/migrations/0001_booking.sql.
//
// This module is imported by api.js, which the public booking page also
// uses, so it must never throw when Supabase env vars aren't set yet -
// that would take down the whole public site, not just /admin. `supabase`
// is null until both vars are configured; only the admin login path reads it.
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
