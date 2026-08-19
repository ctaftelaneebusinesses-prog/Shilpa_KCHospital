import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmAdminPayment, getAdminPayments, rejectAdminPayment } from "../api";
import { downloadExcel } from "./exportExcel";
import { formatDate, formatDateTime, formatINR } from "./format";

const STATUSES = ["pending", "pending_verification", "successful", "failed", "refunded"];

export default function PaymentsHistory() {
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({ date: "", status: "", q: "" });
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);

  function load() {
    const params = {};
    if (filters.date) params.date = filters.date;
    if (filters.status) params.status = filters.status;
    if (filters.q) params.q = filters.q;

    getAdminPayments(params)
      .then((data) => setPayments(data.payments))
      .catch((err) => setError(err.message || "Failed to load payments."));
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

  async function handleConfirm(paymentId) {
    setActionError("");
    setActioningId(paymentId);
    try {
      await confirmAdminPayment(paymentId);
      load();
    } catch (err) {
      setActionError(err.message || "Failed to confirm payment.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(paymentId) {
    const confirmed = window.confirm(
      "Reject this payment? The appointment slot will be freed for other patients."
    );
    if (!confirmed) return;

    setActionError("");
    setActioningId(paymentId);
    try {
      await rejectAdminPayment(paymentId);
      load();
    } catch (err) {
      setActionError(err.message || "Failed to reject payment.");
    } finally {
      setActioningId(null);
    }
  }

  function handleDownload() {
    const rows = payments.map((payment) => ({
      "Patient Name": payment.appointments?.patient_name || "-",
      "Patient Phone": payment.appointments?.patient_phone || "-",
      "Appointment Date": formatDate(payment.appointments?.appointment_date),
      "Amount (INR)": payment.amount,
      Method: payment.payment_method === "manual_upi" ? "Manual UPI" : "Razorpay",
      Status: payment.status,
      "Transaction / UPI Ref": payment.razorpay_payment_id || payment.upi_reference || "-",
      "Order ID": payment.razorpay_order_id || "-",
      "Paid On": formatDateTime(payment.created_at),
    }));
    downloadExcel(`payments-${new Date().toISOString().slice(0, 10)}.xlsx`, "Payments", rows);
  }

  return (
    <>
      <h2>Payment History</h2>
      {error && <p className="admin-error">{error}</p>}
      {actionError && <p className="admin-error">{actionError}</p>}

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
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          style={{ marginLeft: "auto" }}
          disabled={payments.length === 0}
          onClick={handleDownload}
        >
          Download Excel
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Appointment</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Transaction / UPI Ref</th>
                <th>Paid On</th>
                <th>Verify</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id} onClick={() => navigate(`/admin/appointments/${payment.appointment_id}`)}>
                  <td>{index + 1}</td>
                  <td>{payment.appointments?.patient_name}</td>
                  <td>{formatDate(payment.appointments?.appointment_date)}</td>
                  <td>{formatINR(payment.amount)}</td>
                  <td>{payment.payment_method === "manual_upi" ? "Manual UPI" : "Razorpay"}</td>
                  <td>
                    <span className={`status-badge status-${payment.status}`}>{payment.status}</span>
                  </td>
                  <td>{payment.razorpay_payment_id || payment.upi_reference || "-"}</td>
                  <td>{formatDateTime(payment.created_at)}</td>
                  <td onClick={(event) => event.stopPropagation()}>
                    {payment.status === "pending_verification" && (
                      <div className="admin-toolbar" style={{ margin: 0, flexWrap: "nowrap" }}>
                        <button
                          className="admin-btn admin-btn-primary"
                          disabled={actioningId === payment.id}
                          onClick={() => handleConfirm(payment.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="admin-btn admin-btn-danger"
                          disabled={actioningId === payment.id}
                          onClick={() => handleReject(payment.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
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
