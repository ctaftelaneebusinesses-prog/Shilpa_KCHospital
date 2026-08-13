import { useEffect, useState } from "react";
import { getAdminAppointmentDetail, getAdminAppointments, updateAdminAppointmentStatus } from "../api";

const STATUSES = ["payment_pending", "confirmed", "completed", "cancelled", "no_show"];

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ date: "", status: "", q: "" });
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [actionError, setActionError] = useState("");

  function load() {
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;
    if (filters.q) params.q = filters.q;

    getAdminAppointments(params)
      .then((data) => setAppointments(data.appointments))
      .catch((err) => setError(err.message || "Failed to load appointments."));
  }

  useEffect(load, [filters]);

  function openDetail(id) {
    setActionError("");
    getAdminAppointmentDetail(id)
      .then(setDetail)
      .catch((err) => setActionError(err.message || "Failed to load details."));
  }

  async function updateStatus(status) {
    if (!detail) return;
    setActionError("");
    try {
      await updateAdminAppointmentStatus(detail.id, status);
      const refreshed = await getAdminAppointmentDetail(detail.id);
      setDetail(refreshed);
      load();
    } catch (err) {
      setActionError(err.message || "Failed to update appointment.");
    }
  }

  return (
    <>
      <h2>Appointments</h2>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-toolbar">
        <input
          type="date"
          className="admin-input"
          value={filters.date}
          onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
        />
        <select
          className="admin-select"
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
        >
          <option value="">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="admin-input"
          placeholder="Search name or phone"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} onClick={() => openDetail(appointment.id)}>
                <td>{appointment.patient_name}</td>
                <td>{appointment.patient_phone}</td>
                <td>{appointment.appointment_date}</td>
                <td>{appointment.appointment_time?.slice(0, 5)}</td>
                <td>
                  <span className={`status-badge status-${appointment.status}`}>{appointment.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="admin-card">
          <h3 style={{ marginBottom: 14 }}>Appointment Detail</h3>
          {actionError && <p className="admin-error">{actionError}</p>}
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
              <dt>Date / Time</dt>
              <dd>
                {detail.appointment_date} · {detail.time_label}
              </dd>
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
              <dd>{detail.payments?.[0]?.amount ? `₹${detail.payments[0].amount}` : "-"}</dd>
            </div>
            <div>
              <dt>Transaction ID</dt>
              <dd>{detail.payments?.[0]?.razorpay_payment_id || "-"}</dd>
            </div>
          </dl>

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
        </div>
      )}
    </>
  );
}
