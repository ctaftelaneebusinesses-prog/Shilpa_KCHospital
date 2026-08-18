import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminAppointmentsByDate } from "../api";
import { formatDate, formatDateTime, formatTime } from "./format";

export default function DateView() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [capacity, setCapacity] = useState(0);
  const [bookedCount, setBookedCount] = useState(0);
  const [error, setError] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

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
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={appointment.id} onClick={() => navigate(`/admin/appointments/${appointment.id}`)}>
                    <td>{index + 1}</td>
                    <td>{formatTime(appointment.appointment_time)}</td>
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
    </>
  );
}
