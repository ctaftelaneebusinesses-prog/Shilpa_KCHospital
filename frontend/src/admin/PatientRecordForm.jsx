import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createAdminPatient, deleteAdminPatient, getAdminPatient, updateAdminPatient } from "../api";
import { BABY_BLOOD_GROUPS, BABY_GENDERS, BLOOD_GROUPS, DELIVERY_TYPES, INDIAN_STATES } from "./patientOptions";

const EMPTY_FORM = {
  mother_name: "",
  mother_age: "",
  mother_occupation: "",
  mother_blood_group: "",
  father_name: "",
  father_occupation: "",
  contact_phone: "",
  alternate_phone: "",
  address: "",
  district: "",
  state: "",
  pincode: "",
  delivery_date: "",
  delivery_type: "",
  gestational_age_weeks: "",
  baby_birth_date: "",
  baby_birth_time: "",
  baby_gender: "",
  baby_weight_kg: "",
  baby_blood_group: "",
  notes: "",
};

// The API returns nulls/numbers/"HH:MM:SS"; the form's inputs want strings.
function toForm(record) {
  const form = {};
  Object.keys(EMPTY_FORM).forEach((key) => {
    form[key] = record[key] == null ? "" : String(record[key]);
  });
  form.baby_birth_time = form.baby_birth_time.slice(0, 5);
  return form;
}

function Field({ label, required, children, wide }) {
  return (
    <div className={`admin-field${wide ? " admin-form-wide" : ""}`}>
      <label>
        {label}
        {required && <span style={{ color: "#c0392b" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, required }) {
  return (
    <select className="admin-select" value={value} onChange={onChange} required={required}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function PatientRecordForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew) {
      setForm(EMPTY_FORM);
      setLoading(false);
      return;
    }
    setLoading(true);
    getAdminPatient(id)
      .then((record) => setForm(toForm(record)))
      .catch((err) => setError(err.message || "Failed to load patient record."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function bind(key) {
    return {
      value: form[key],
      onChange: (event) => {
        const value = event.target.value;
        setForm((prev) => {
          const next = { ...prev, [key]: value };
          // The baby is almost always born on the delivery date - prefill it
          // (while it's still empty or was tracking the old delivery date).
          if (key === "delivery_date" && (!prev.baby_birth_date || prev.baby_birth_date === prev.delivery_date)) {
            next.baby_birth_date = value;
          }
          return next;
        });
      },
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isNew) {
        await createAdminPatient(form);
      } else {
        await updateAdminPatient(id, form);
      }
      navigate("/admin/patients");
    } catch (err) {
      setError(err.message || "Failed to save patient record.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete the record for ${form.mother_name}? It will be removed from the list.`)) return;
    setError("");
    try {
      await deleteAdminPatient(id);
      navigate("/admin/patients");
    } catch (err) {
      setError(err.message || "Failed to delete patient record.");
    }
  }

  return (
    <>
      <Link to="/admin/patients" className="admin-back-link">
        ← Back to Patient Details
      </Link>
      <h2>{isNew ? "Add Patient" : "Edit Patient"}</h2>
      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <div className="admin-card">Loading...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="admin-card">
            <h3 className="admin-form-heading">Mother &amp; Father</h3>
            <div className="admin-form-grid">
              <Field label="Mother's Name" required>
                <input className="admin-input" {...bind("mother_name")} required />
              </Field>
              <Field label="Mother's Age" required>
                <input className="admin-input" type="number" min="10" max="70" {...bind("mother_age")} required />
              </Field>
              <Field label="Mother's Occupation" required>
                <input className="admin-input" {...bind("mother_occupation")} required />
              </Field>
              <Field label="Mother's Blood Group" required>
                <Select {...bind("mother_blood_group")} options={BLOOD_GROUPS} placeholder="Select" required />
              </Field>
              <Field label="Father's Name" required>
                <input className="admin-input" {...bind("father_name")} required />
              </Field>
              <Field label="Father's Occupation" required>
                <input className="admin-input" {...bind("father_occupation")} required />
              </Field>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="admin-form-heading">Contact &amp; Address</h3>
            <div className="admin-form-grid">
              <Field label="Contact Number" required>
                <input
                  className="admin-input"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="10-digit mobile number"
                  {...bind("contact_phone")}
                  required
                />
              </Field>
              <Field label="Alternate Number">
                <input
                  className="admin-input"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="10-digit mobile number"
                  {...bind("alternate_phone")}
                />
              </Field>
              <Field label="Address" required wide>
                <textarea className="admin-input" rows={2} {...bind("address")} required />
              </Field>
              <Field label="District" required>
                <input className="admin-input" {...bind("district")} required />
              </Field>
              <Field label="State" required>
                <Select {...bind("state")} options={INDIAN_STATES} placeholder="Select state" required />
              </Field>
              <Field label="Pincode">
                <input
                  className="admin-input"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  title="6-digit pincode"
                  {...bind("pincode")}
                />
              </Field>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="admin-form-heading">Delivery</h3>
            <div className="admin-form-grid">
              <Field label="Delivery Date" required>
                <input className="admin-input" type="date" {...bind("delivery_date")} required />
              </Field>
              <Field label="Delivery Type" required>
                <Select {...bind("delivery_type")} options={DELIVERY_TYPES} placeholder="Select type" required />
              </Field>
              <Field label="Gestational Age (weeks)">
                <input className="admin-input" type="number" min="20" max="45" {...bind("gestational_age_weeks")} />
              </Field>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="admin-form-heading">Baby</h3>
            <div className="admin-form-grid">
              <Field label="Baby's Date of Birth" required>
                <input className="admin-input" type="date" {...bind("baby_birth_date")} required />
              </Field>
              <Field label="Time of Birth">
                <input className="admin-input" type="time" {...bind("baby_birth_time")} />
              </Field>
              <Field label="Gender" required>
                <Select {...bind("baby_gender")} options={BABY_GENDERS} placeholder="Select" required />
              </Field>
              <Field label="Weight (kg)" required>
                <input
                  className="admin-input"
                  type="number"
                  min="0.1"
                  max="9.99"
                  step="0.01"
                  placeholder="e.g. 2.85"
                  {...bind("baby_weight_kg")}
                  required
                />
              </Field>
              <Field label="Baby's Blood Group" required>
                <Select {...bind("baby_blood_group")} options={BABY_BLOOD_GROUPS} placeholder="Select" required />
              </Field>
              <Field label="Notes" wide>
                <textarea
                  className="admin-input"
                  rows={3}
                  placeholder="Any complications, NICU stay, follow-up advice..."
                  {...bind("notes")}
                />
              </Field>
            </div>
          </div>

          <div className="admin-toolbar">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : isNew ? "Save Patient" : "Save Changes"}
            </button>
            <button type="button" className="admin-btn" onClick={() => navigate("/admin/patients")}>
              Cancel
            </button>
            {!isNew && (
              <button type="button" className="admin-btn admin-btn-danger" style={{ marginLeft: "auto" }} onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        </form>
      )}
    </>
  );
}
