import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAdminAppointmentDetail,
  getAdminAppointmentsByDate,
  updateAdminAppointmentStatus,
} from "../api";

export default function DateView() {
  const { date } = useParams();
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [actionError, setActionError] = useState("");

  function loadSlots() {
    getAdminAppointmentsByDate(date)
      .then((data) => setSlots(data.slots))
      .catch((err) => setError(err.message || "Failed to load slots."));
  }

  useEffect(() => {
    loadSlots();
    setDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function openSlot(slot) {
    if (!slot.appointment) return;
    setActionError("");
    getAdminAppointmentDetail(slot.appointment.id)
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
      loadSlots();
    } catch (err) {
      setActionError(err.message || "Failed to update appointment.");
    }
  }

  return (
    <>
      <h2>Slots for {date}</h2>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-card">
        <div className="slot-grid">
          {slots.map((slot) => (
            <div
              key={slot.time}
              className={`slot-pill ${slot.status}`}
              onClick={() => openSlot(slot)}
            >
              {slot.label}
              <div style={{ fontWeight: 400, fontSize: 11, marginTop: 4 }}>
                {slot.status === "booked" ? "Booked" : "Available"}
              </div>
            </div>
          ))}
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
              <dt>Time</dt>
              <dd>{detail.time_label}</dd>
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
            <div>
              <dt>Booked On</dt>
              <dd>{new Date(detail.created_at).toLocaleString()}</dd>
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
