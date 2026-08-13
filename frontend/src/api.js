import { supabase } from "./supabaseClient";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

export async function requestAppointment(payload) {
  return request("/appointment", { method: "POST", body: JSON.stringify(payload) });
}

export async function getAvailability(date) {
  return request(`/booking/availability?date=${encodeURIComponent(date)}`);
}

export async function holdSlot(payload) {
  return request("/booking/hold", { method: "POST", body: JSON.stringify(payload) });
}

export async function getAppointment(appointmentId) {
  return request(`/booking/appointments/${appointmentId}`);
}

export async function createPaymentOrder(appointmentId) {
  return request("/payments/orders", {
    method: "POST",
    body: JSON.stringify({ appointment_id: appointmentId }),
  });
}

export async function verifyPayment(payload) {
  return request("/payments/verify", { method: "POST", body: JSON.stringify(payload) });
}

async function adminRequest(path, options = {}) {
  const session = supabase ? (await supabase.auth.getSession()).data?.session : null;
  const token = session?.access_token;

  return request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function getAdminDashboard() {
  return adminRequest("/admin/dashboard");
}

export async function getAdminNotifications() {
  return adminRequest("/admin/notifications");
}

export async function getAdminAppointments(params = {}) {
  const query = new URLSearchParams(params).toString();
  return adminRequest(`/admin/appointments${query ? `?${query}` : ""}`);
}

export async function getAdminAppointmentsByDate(date) {
  return adminRequest(`/admin/appointments/by-date/${date}`);
}

export async function getAdminAppointmentDetail(id) {
  return adminRequest(`/admin/appointments/${id}`);
}

export async function updateAdminAppointmentStatus(id, status) {
  return adminRequest(`/admin/appointments/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminPayments(params = {}) {
  const query = new URLSearchParams(params).toString();
  return adminRequest(`/admin/payments${query ? `?${query}` : ""}`);
}

export async function getAdminSettings() {
  return adminRequest("/admin/settings");
}

export async function updateAdminSettings(consultationFeeInr) {
  return adminRequest("/admin/settings", {
    method: "POST",
    body: JSON.stringify({ consultationFeeInr }),
  });
}
