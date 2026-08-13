import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  deleteAdminAppointment,
  getAdminAppointmentDetail,
  getAdminAppointmentsByDate,
  updateAdminAppointmentStatus,
} from "../api";
import { formatDate, formatDateTime, formatINR } from "./format";

// Matches the backend's DELETABLE_STATUSES (admin.py) - only a resolved
// appointment can be archived, never an upcoming/paid or in-progress one.
const DELETABLE_STATUSES = new Set(["completed", "cancelled", "no_show"]);

export default function DateView() {
  const { date } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [capacity, setCapacity] = useState(0);
  const [bookedCount, setBookedCount] = useState(0);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [actionError, setActionError] = useState("");

  function loadAppointments() {
    getAdminAppointmentsByDate(date)
      .then((data) => {
        setAppointments(data.appointments);
        setCapacity(data.capacity);
        setBookedCount(data.bookedCount);
      })
      .catch((err) => setError(err.message || "Failed to load appointments."));
  }

  useEffect(() => {
    loadAppointments();
    setDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function openAppointment(id) {
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
      loadAppointments();
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
      loadAppointments();
    } catch (err) {
      setActionError(err.message || "Failed to delete appointment.");
    }
  }

  return (
    <>
      <h2>
        Bookings for {formatDate(date)}{" "}
        <span className={`status-badge ${bookedCount >= capacity ? "status-cancelled" : "status-confirmed"}`}>
          {bookedCount}/{capacity}
        </span>
      </h2>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-card">
        {appointments.length === 0 ? (
          <p className="admin-hint">No bookings for this date yet.</p>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={appointment.id} onClick={() => openAppointment(appointment.id)}>
                    <td>{index + 1}</td>
                    <td>{appointment.patient_name}</td>
                    <td>{appointment.patient_phone}</td>
                    <td>
                      <span className={`status-badge status-${appointment.status}`}>{appointment.status}</span>
                    </td>
                    <td>{formatDateTime(appointment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              <dt>Booked On</dt>
              <dd>{formatDateTime(detail.created_at)}</dd>
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
