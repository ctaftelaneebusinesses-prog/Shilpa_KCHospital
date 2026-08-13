import { useEffect, useState } from "react";
import { getAdminSettings, updateAdminSettings } from "../api";

export default function Settings() {
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAdminSettings()
      .then((data) => setFee(String(data.consultationFeeInr)))
      .catch((err) => setError(err.message || "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

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
    </>
  );
}
