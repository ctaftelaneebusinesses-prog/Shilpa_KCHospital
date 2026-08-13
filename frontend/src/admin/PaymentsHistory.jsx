import { useEffect, useState } from "react";
import { getAdminPayments } from "../api";
import { formatDate, formatDateTime, formatINR, formatTime } from "./format";

const STATUSES = ["pending", "successful", "failed", "refunded"];

export default function PaymentsHistory() {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({ date: "", status: "", q: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    // Debounced so typing in the search box doesn't fire a full query per
    // keystroke - only once typing pauses.
    const timer = setTimeout(() => {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      if (filters.q) params.q = filters.q;

      getAdminPayments(params)
        .then((data) => setPayments(data.payments))
        .catch((err) => setError(err.message || "Failed to load payments."));
    }, 350);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <>
      <h2>Payment History</h2>
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
          placeholder="Search patient"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Appointment</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Transaction ID</th>
              <th>Paid On</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.appointments?.patient_name}</td>
                <td>
                  {formatDate(payment.appointments?.appointment_date)} · {formatTime(payment.appointments?.appointment_time)}
                </td>
                <td>{formatINR(payment.amount)}</td>
                <td>
                  <span className={`status-badge status-${payment.status}`}>{payment.status}</span>
                </td>
                <td>{payment.razorpay_payment_id || "-"}</td>
                <td>{formatDateTime(payment.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
