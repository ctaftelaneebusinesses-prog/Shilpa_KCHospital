import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAdminPatient, getAdminPatients } from "../api";
import { downloadExcel } from "./exportExcel";
import { formatDate, formatDateTime, formatTime } from "./format";
import { DELIVERY_TYPES } from "./patientOptions";

export default function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({ month: "", delivery_type: "", q: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const isFirstLoad = useRef(true);

  function load() {
    const params = {};
    if (filters.month) params.month = filters.month;
    if (filters.delivery_type) params.delivery_type = filters.delivery_type;
    if (filters.q) params.q = filters.q;

    setError("");
    getAdminPatients(params)
      .then((data) => setPatients(data.patients))
      .catch((err) => setError(err.message || "Failed to load patient records."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // Same as AppointmentsList: only typing/filter changes are debounced,
    // never the initial page load.
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      load();
      return;
    }
    const timer = setTimeout(load, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function handleDelete(patient) {
    if (!window.confirm(`Delete the record for ${patient.mother_name}? It will be removed from the list.`)) return;
    setDeletingId(patient.id);
    setError("");
    try {
      await deleteAdminPatient(patient.id);
      setPatients((prev) => prev.filter((p) => p.id !== patient.id));
    } catch (err) {
      setError(err.message || "Failed to delete patient record.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleDownload() {
    const rows = patients.map((p) => ({
      "Mother Name": p.mother_name,
      "Mother Age": p.mother_age,
      "Mother Occupation": p.mother_occupation,
      "Mother Blood Group": p.mother_blood_group,
      "Father Name": p.father_name,
      "Father Occupation": p.father_occupation,
      "Contact Number": p.contact_phone,
      "Alternate Number": p.alternate_phone || "-",
      Address: p.address,
      District: p.district,
      State: p.state,
      Pincode: p.pincode || "-",
      "Delivery Date": formatDate(p.delivery_date),
      "Delivery Type": p.delivery_type,
      "Gestational Age (weeks)": p.gestational_age_weeks ?? "-",
      "Baby Date of Birth": formatDate(p.baby_birth_date),
      "Baby Time of Birth": p.baby_birth_time ? formatTime(p.baby_birth_time) : "-",
      "Baby Gender": p.baby_gender,
      "Baby Weight (kg)": Number(p.baby_weight_kg),
      "Baby Blood Group": p.baby_blood_group,
      Notes: p.notes || "-",
      "Added On": formatDateTime(p.created_at),
    }));
    downloadExcel(`patient-details-${new Date().toISOString().slice(0, 10)}.xlsx`, "Patient Details", rows);
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Patient Details</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => navigate("/admin/patients/new")}>
          + Add Patient
        </button>
      </div>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-toolbar">
        <input
          type="month"
          className="admin-input"
          title="Delivery month"
          value={filters.month}
          onChange={(event) => setFilters((prev) => ({ ...prev, month: event.target.value }))}
        />
        <select
          className="admin-select"
          value={filters.delivery_type}
          onChange={(event) => setFilters((prev) => ({ ...prev, delivery_type: event.target.value }))}
        >
          <option value="">All delivery types</option>
          {DELIVERY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="admin-input"
          placeholder="Search mother, father or phone"
          value={filters.q}
          onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
        />
        <button
          type="button"
          className="admin-btn"
          style={{ marginLeft: "auto" }}
          disabled={patients.length === 0}
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
                <th>Mother</th>
                <th>Father</th>
                <th>Phone</th>
                <th>Delivery Date</th>
                <th>Delivery Type</th>
                <th>Baby</th>
                <th>Weight</th>
                <th>District</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, index) => (
                <tr key={p.id} onClick={() => navigate(`/admin/patients/${p.id}`)}>
                  <td>{index + 1}</td>
                  <td>
                    {p.mother_name} <span style={{ color: "var(--text-muted)" }}>({p.mother_age})</span>
                  </td>
                  <td>{p.father_name}</td>
                  <td>{p.contact_phone}</td>
                  <td>{formatDate(p.delivery_date)}</td>
                  <td>{p.delivery_type}</td>
                  <td>{p.baby_gender}</td>
                  <td>{Number(p.baby_weight_kg).toFixed(2)} kg</td>
                  <td>{p.district}</td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <div className="admin-toolbar" style={{ margin: 0, flexWrap: "nowrap" }}>
                      <button type="button" className="admin-btn" onClick={() => navigate(`/admin/patients/${p.id}`)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p)}
                      >
                        {deletingId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && patients.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ color: "var(--text-muted)", textAlign: "center", padding: 24, cursor: "default" }}>
                    No patient records yet. Click "+ Add Patient" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
