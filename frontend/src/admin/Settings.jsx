import { useEffect, useState } from "react";
import {
  addAdminReasonOption,
  deleteAdminReasonOption,
  getAdminReasonOptions,
  getAdminSettings,
  updateAdminSettings,
} from "../api";

export default function Settings() {
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [reasons, setReasons] = useState([]);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const [newReason, setNewReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [addingReason, setAddingReason] = useState(false);

  function loadReasons() {
    getAdminReasonOptions()
      .then((data) => setReasons(data.reasons))
      .catch((err) => setReasonError(err.message || "Failed to load reason checklist."))
      .finally(() => setReasonsLoading(false));
  }

  useEffect(() => {
    getAdminSettings()
      .then((data) => setFee(String(data.consultationFeeInr)))
      .catch((err) => setError(err.message || "Failed to load settings."))
      .finally(() => setLoading(false));
    loadReasons();
  }, []);

  async function handleAddReason(event) {
    event.preventDefault();
    const label = newReason.trim();
    if (!label) return;

    setReasonError("");
    setAddingReason(true);
    try {
      await addAdminReasonOption(label);
      setNewReason("");
      loadReasons();
    } catch (err) {
      setReasonError(err.message || "Failed to add option.");
    } finally {
      setAddingReason(false);
    }
  }

  async function handleDeleteReason(id) {
    setReasonError("");
    try {
      await deleteAdminReasonOption(id);
      loadReasons();
    } catch (err) {
      setReasonError(err.message || "Failed to remove option.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);

    const amount = Number(fee);
    if (Number.isNaN(amount) || amount < 0) {
      setError("Enter a valid amount (0 or greater).");
      return;
    }

    setSaving(true);
    try {
      const data = await updateAdminSettings(amount);
      setFee(String(data.consultationFeeInr));
      setSaved(true);
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  const isFree = Number(fee) === 0;

  return (
    <>
      <h2>Settings</h2>
      <div className="admin-card">
        <h3 style={{ marginBottom: 4 }}>Consultation Fee</h3>
        <p style={{ color: "#8a7d85", fontSize: 14, marginBottom: 18 }}>
          This is the amount patients pay to confirm an appointment. Set it to 0 to make
          bookings free — patients will confirm their slot instantly with no payment step.
        </p>

        {loading ? (
          <p style={{ color: "#8a7d85", fontSize: 14 }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
            <div className="admin-field">
              <label>Amount (INR)</label>
              <input
                className="admin-input"
                type="number"
                min="0"
                step="1"
                value={fee}
                onChange={(event) => {
                  setFee(event.target.value);
                  setSaved(false);
                }}
                required
              />
            </div>

            <p style={{ color: isFree ? "#2f8a4e" : "#8a7d85", fontSize: 13, marginBottom: 14 }}>
              {isFree
                ? "Appointments are currently FREE. Patients will not see a payment option."
                : `Patients will pay ₹${fee || 0} to confirm an appointment.`}
            </p>

            {error && <p className="admin-error">{error}</p>}
            {saved && !error && (
              <p style={{ color: "#2f8a4e", fontSize: 13, marginBottom: 14 }}>Saved.</p>
            )}

            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>

      <div className="admin-card">
        <h3 style={{ marginBottom: 4 }}>Reason Checklist</h3>
        <p style={{ color: "#8a7d85", fontSize: 14, marginBottom: 18 }}>
          Patients pick from these as checkboxes when booking, instead of typing a reason.
          New options are added to the end of the list. A fixed "Not listed / Not sure"
          checkbox always stays last on the booking page and isn't managed here.
        </p>

        {reasonsLoading ? (
          <p style={{ color: "#8a7d85", fontSize: 14 }}>Loading...</p>
        ) : (
          <>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px" }}>
              {reasons.map((reason) => (
                <li
                  key={reason.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 13.5,
                  }}
                >
                  {reason.label}
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    style={{ padding: "4px 12px", fontSize: 12 }}
                    onClick={() => handleDeleteReason(reason.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
              {reasons.length === 0 && (
                <li style={{ color: "#8a7d85", fontSize: 13.5, padding: "9px 12px" }}>
                  No options yet.
                </li>
              )}
            </ul>

            <form onSubmit={handleAddReason} style={{ display: "flex", gap: 10, maxWidth: 420 }}>
              <input
                className="admin-input"
                type="text"
                placeholder="e.g. Painful periods"
                value={newReason}
                onChange={(event) => setNewReason(event.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="admin-btn admin-btn-primary" disabled={addingReason}>
                {addingReason ? "Adding..." : "Add"}
              </button>
            </form>

            {reasonError && <p className="admin-error" style={{ marginTop: 10 }}>{reasonError}</p>}
          </>
        )}
      </div>
    </>
  );
}
