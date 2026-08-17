import { useEffect, useState } from "react";
import {
  deleteAdminAppointment,
  getAdminAppointmentDetail,
  getAdminAppointments,
  updateAdminAppointmentStatus,
} from "../api";
import { formatDate, formatDateTime, formatINR, formatTime } from "./format";

const STATUSES = ["payment_pending", "confirmed", "completed", "cancelled", "no_show"];
// Matches the backend's DELETABLE_STATUSES (admin.py) - only a resolved
// appointment can be archived, never an upcoming/paid or in-progress one.
const DELETABLE_STATUSES = new Set(["completed", "cancelled", "no_show"]);

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

  useEffect(() => {
    // Debounced so typing in the search box doesn't fire a full query per
    // keystroke - only once typing pauses.
    const timer = setTimeout(load, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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

  async function handleDelete() {
    if (!detail) return;
    const confirmed = window.confirm(
      `Delete this appointment for ${detail.patient_name}? It will be archived out of the lists, but its payment/revenue record is kept.`
    );
    if (!confirmed) return;

    setActionError("");
    try {
      await deleteAdminAppointment(detail.id);
      setDetail(null);
      load();
    } catch (err) {
      setActionError(err.message || "Failed to delete appointment.");
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
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Booked On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr key={appointment.id} onClick={() => openDetail(appointment.id)}>
                  <td>{index + 1}</td>
                  <td>{appointment.patient_name}</td>
                  <td>{appointment.patient_phone}</td>
                  <td>{formatDate(appointment.appointment_date)}</td>
                  <td>{formatTime(appointment.appointment_time)}</td>
                  <td>{formatDateTime(appointment.created_at)}</td>
                  <td>
                    <span className={`status-badge status-${appointment.status}`}>{appointment.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        </div>
      )}
    </>
  );
}
