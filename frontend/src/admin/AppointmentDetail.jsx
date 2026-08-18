import { useEffect, useState } from "react";
import {
  deleteAdminAppointment,
  getAdminAppointmentDetail,
  updateAdminAppointmentDetails,
  updateAdminAppointmentStatus,
} from "../api";
import { formatDate, formatDateTime, formatINR, formatTime } from "./format";

// Matches the backend's DELETABLE_STATUSES (admin.py) - only a resolved
// appointment can be archived, never an upcoming/paid or in-progress one.
const DELETABLE_STATUSES = new Set(["completed", "cancelled", "no_show"]);

// Mirrors slots.py's TIME_SLOTS (13:00-14:30, every 10 minutes) so the edit
// form's dropdown always matches what the backend will accept.
function buildTimeSlots() {
  const slots = [];
  for (let minutes = 13 * 60; minutes < 14 * 60 + 40; minutes += 10) {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    slots.push({ value, label: `${hour12}:${String(minute).padStart(2, "0")} ${period}` });
  }
  return slots;
}
const TIME_SLOTS = buildTimeSlots();

export default function AppointmentDetail({ appointmentId, onClose, onChanged }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  function load() {
    setError("");
    getAdminAppointmentDetail(appointmentId)
      .then(setDetail)
      .catch((err) => setError(err.message || "Failed to load details."));
  }

  useEffect(() => {
    setDetail(null);
    setEditing(false);
    if (appointmentId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  function startEditing() {
    setForm({
      patient_name: detail.patient_name || "",
      patient_phone: detail.patient_phone || "",
      patient_email: detail.patient_email || "",
      appointment_date: detail.appointment_date,
      appointment_time: (detail.appointment_time || "").slice(0, 5),
    });
    setError("");
    setEditing(true);
  }

  async function saveEdit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateAdminAppointmentDetails(detail.id, form);
      const refreshed = await getAdminAppointmentDetail(detail.id);
      setDetail(refreshed);
      setEditing(false);
      onChanged?.();
    } catch (err) {
      setError(err.message || "Failed to update appointment.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status) {
    setError("");
    try {
      await updateAdminAppointmentStatus(detail.id, status);
      const refreshed = await getAdminAppointmentDetail(detail.id);
      setDetail(refreshed);
      onChanged?.();
    } catch (err) {
      setError(err.message || "Failed to update appointment.");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete this appointment for ${detail.patient_name}? It will be archived out of the lists, but its payment/revenue record is kept.`
    );
    if (!confirmed) return;

    setError("");
    try {
      await deleteAdminAppointment(detail.id);
      onChanged?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to delete appointment.");
    }
  }

  if (!detail) {
    return (
      <div className="admin-card">
        {error && <p className="admin-error">{error}</p>}
        <p style={{ color: "#8a7d85", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <h3 style={{ margin: 0 }}>Appointment Detail</h3>
        <div className="admin-toolbar" style={{ margin: 0, flexWrap: "nowrap" }}>
          {!editing && (
            <button className="admin-btn" onClick={startEditing}>
              Edit Details
            </button>
          )}
          {onClose && (
            <button className="admin-btn" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      {editing ? (
        <form onSubmit={saveEdit}>
          <div className="admin-field">
            <label>Patient Name</label>
            <input
              className="admin-input"
              value={form.patient_name}
              onChange={(event) => setForm((prev) => ({ ...prev, patient_name: event.target.value }))}
              required
            />
          </div>
          <div className="admin-field">
            <label>Phone</label>
            <input
              className="admin-input"
              inputMode="numeric"
              maxLength={10}
              value={form.patient_phone}
              onChange={(event) => setForm((prev) => ({ ...prev, patient_phone: event.target.value }))}
              required
            />
          </div>
          <div className="admin-field">
            <label>Email</label>
            <input
              className="admin-input"
              type="email"
              value={form.patient_email}
              onChange={(event) => setForm((prev) => ({ ...prev, patient_email: event.target.value }))}
            />
          </div>
          <div className="admin-field">
            <label>Date</label>
            <input
              className="admin-input"
              type="date"
              value={form.appointment_date}
              onChange={(event) => setForm((prev) => ({ ...prev, appointment_date: event.target.value }))}
              required
            />
          </div>
          <div className="admin-field">
            <label>Time</label>
            <select
              className="admin-select"
              value={form.appointment_time}
              onChange={(event) => setForm((prev) => ({ ...prev, appointment_time: event.target.value }))}
              required
            >
              <option value="">Select a time</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-toolbar" style={{ marginTop: 4 }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" className="admin-btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="admin-detail-grid">
            <div>
              <dt>Patient</dt>
              <dd>{detail.patient_name}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{detail.patient_phone}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{detail.patient_email || "-"}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatDate(detail.appointment_date)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{formatTime(detail.appointment_time)}</dd>
            </div>
            <div>
              <dt>Booked On</dt>
              <dd>{formatDateTime(detail.created_at)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`status-badge status-${detail.status}`}>{detail.status}</span>
              </dd>
            </div>
            <div>
              <dt>Reason / Comments</dt>
              <dd>{detail.reason || "-"}</dd>
            </div>
            <div>
              <dt>Payment Status</dt>
              <dd>{detail.payments?.[0]?.status || "-"}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>
                {detail.payments?.[0]?.amount != null ? formatINR(detail.payments[0].amount) : "-"}
              </dd>
            </div>
            <div>
              <dt>Transaction ID</dt>
              <dd>{detail.payments?.[0]?.razorpay_payment_id || "-"}</dd>
            </div>
            <div>
              <dt>UPI Reference</dt>
              <dd>{detail.payments?.[0]?.upi_reference || "-"}</dd>
            </div>
          </dl>

          {detail.payments?.[0]?.status === "pending_verification" && (
            <p className="body-text" style={{ marginTop: 12 }}>
              This payment is awaiting manual verification — confirm or reject it from{" "}
              <strong>Payment History</strong> after checking the UPI reference against your bank/UPI app.
            </p>
          )}

          {detail.status === "confirmed" && (
            <div className="admin-toolbar" style={{ marginTop: 18 }}>
              <button className="admin-btn admin-btn-primary" onClick={() => updateStatus("completed")}>
                Mark Completed
              </button>
              <button className="admin-btn" onClick={() => updateStatus("no_show")}>
                Mark No-Show
              </button>
              <button className="admin-btn admin-btn-danger" onClick={() => updateStatus("cancelled")}>
                Cancel Appointment
              </button>
            </div>
          )}

          {detail.status === "no_show" && (
            <div className="admin-toolbar" style={{ marginTop: 18 }}>
              <button className="admin-btn admin-btn-primary" onClick={() => updateStatus("completed")}>
                Mark Completed
              </button>
            </div>
          )}

          {DELETABLE_STATUSES.has(detail.status) && (
            <div className="admin-toolbar" style={{ marginTop: 18 }}>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}>
                Delete Appointment
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
