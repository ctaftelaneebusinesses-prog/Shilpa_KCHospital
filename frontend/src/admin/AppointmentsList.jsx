import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminAppointments } from "../api";
import { formatDate, formatDateTime, formatTime } from "./format";

const STATUSES = ["payment_pending", "confirmed", "completed", "cancelled", "no_show"];

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ date: "", status: "", q: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);

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
    // The initial page load should never wait on the debounce - only typing
    // in the search box (or changing a filter afterwards) should be delayed.
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      load();
      return;
    }
    const timer = setTimeout(load, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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
                <tr key={appointment.id} onClick={() => navigate(`/admin/appointments/${appointment.id}`)}>
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
    </>
  );
}
