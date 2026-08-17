import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "../LanguageContext";
import { useVoiceInput } from "../hooks/useVoiceInput";
import {
  bookWithManualPayment,
  getAppointment,
  getConsultationFee,
  getReasonOptions,
  getSlots,
  holdSlot,
} from "../api";
import SuccessModal from "./SuccessModal";

const todayISO = () => new Date().toISOString().split("T")[0];

const initialForm = {
  name: "",
  phone: "",
  email: "",
  city: "",
  date: "",
  time: "",
  reasons: [],
  notSure: false,
  message: "",
};

// Builds a standard UPI deep link (what every UPI QR encodes) so any UPI
// app can scan/pay with the exact amount pre-filled - no payment gateway
// involved, so no gateway fee either.
function buildUpiLink({ upiId, upiPayeeName, amount, note }) {
  if (!upiId) return "";
  const params = [
    `pa=${encodeURIComponent(upiId)}`,
    `pn=${encodeURIComponent(upiPayeeName || "Clinic")}`,
    `am=${encodeURIComponent(amount)}`,
    "cu=INR",
    `tn=${encodeURIComponent(note || "Appointment Payment")}`,
  ];
  return `upi://pay?${params.join("&")}`;
}

export default function Appointment() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [slots, setSlots] = useState([]); // [{ value, label, available }]
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [reasonOptions, setReasonOptions] = useState([]);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const [reasonDropdownOpen, setReasonDropdownOpen] = useState(false);
  const reasonDropdownRef = useRef(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // step: "form" (select + patient details) -> "payment" (scan QR + submit
  // UPI reference - nothing is saved to the database yet at this point) ->
  // "submitted" (booking + payment just created, awaiting manual admin
  // verification) / "confirmed" (free booking, confirmed instantly)
  const [step, setStep] = useState("form");
  // Holds the validated form details in memory only - no appointment row
  // exists until handleSubmitPaymentProof succeeds, so an abandoned/unpaid
  // booking never touches the database.
  const [pendingBooking, setPendingBooking] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [isFreeBooking, setIsFreeBooking] = useState(false);
  const [currentFee, setCurrentFee] = useState(null); // null while unknown, then a number
  const [upiInfo, setUpiInfo] = useState({ upiId: "", upiPayeeName: "" });
  const [upiReference, setUpiReference] = useState("");

  const { supported: voiceSupported, listening, statusText, startListening } =
    useVoiceInput(language);

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  function updateDate(event) {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, date: value, time: "" }));
  }

  function selectTime(value) {
    setForm((prev) => ({ ...prev, time: value }));
  }

  function updatePhone(event) {
    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digitsOnly }));
  }

  // form.reasons stores the stable English label (never the translated
  // display text) - it's what gets sent to the backend and read by the
  // (English-only) admin dashboard, and it stays valid across a language
  // switch without needing to be remapped.
  function toggleReason(labelEn) {
    setForm((prev) => ({
      ...prev,
      reasons: prev.reasons.includes(labelEn)
        ? prev.reasons.filter((item) => item !== labelEn)
        : [...prev.reasons, labelEn],
    }));
  }

  function toggleNotSure() {
    setForm((prev) => ({ ...prev, notSure: !prev.notSure }));
    setReasonDropdownOpen(false);
  }

  function handleVoiceClick() {
    startListening((transcript) => {
      setForm((prev) => ({
        ...prev,
        message: prev.message ? `${prev.message} ${transcript}` : transcript,
      }));
    });
  }

  useEffect(() => {
    getConsultationFee()
      .then((data) => {
        setCurrentFee(data.consultationFeeInr);
        setUpiInfo({ upiId: data.upiId || "", upiPayeeName: data.upiPayeeName || "" });
      })
      .catch(() => setCurrentFee(null));
  }, []);

  useEffect(() => {
    setReasonsLoading(true);
    getReasonOptions(language)
      .then((data) => setReasonOptions(data.reasons))
      .catch(() => setReasonOptions([]))
      .finally(() => setReasonsLoading(false));
  }, [language]);

  useEffect(() => {
    if (!reasonDropdownOpen) return;
    function handleClickOutside(event) {
      if (reasonDropdownRef.current && !reasonDropdownRef.current.contains(event.target)) {
        setReasonDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [reasonDropdownOpen]);

  useEffect(() => {
    if (!form.date) {
      setSlots([]);
      setSlotsError(false);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(false);
    getSlots(form.date)
      .then((data) => {
        if (!cancelled) setSlots(data.slots || []);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.date]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const { name, phone, email, city, date, time } = form;
    if (!name.trim() || !phone.trim() || !city.trim() || !date || !time) {
      setError(t("errorRequired"));
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError(t("errorPhone"));
      return;
    }

    setSubmitting(true);

    try {
      const reasonParts = [`City: ${city.trim()}`];
      if (form.reasons.length) reasonParts.push(form.reasons.join(", "));
      if (form.notSure && form.message.trim()) reasonParts.push(`Other: ${form.message.trim()}`);
      const reason = reasonParts.join("\n");

      if (currentFee === 0) {
        // Free consultation - nothing to pay, so it's fine to save the
        // booking immediately and confirm it.
        const data = await holdSlot({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          date,
          time,
          reason,
          language,
        });
        const appointment = await getAppointment(data.appointmentId);
        setConfirmation(appointment);
        setIsFreeBooking(true);
        setStep("confirmed");
        setModalOpen(true);
        setForm(initialForm);
      } else {
        // Paid booking - nothing is written to the database yet. We only
        // hold these details in memory until payment is actually made and
        // the transaction reference is submitted (see handleSubmitPaymentProof).
        setPendingBooking({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          date,
          time,
          reason,
          language,
          consultationFee: currentFee,
        });
        setStep("payment");
      }
    } catch (err) {
      setError(err.message || t("errorServer"));
      setForm((prev) => ({ ...prev, time: "" }));
      if (form.date) {
        getSlots(form.date)
          .then((data) => setSlots(data.slots || []))
          .catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitPaymentProof(event) {
    event.preventDefault();
    if (!pendingBooking) return;
    if (!upiReference.trim()) {
      setError(t("errorUpiRef"));
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      await bookWithManualPayment({
        ...pendingBooking,
        upi_reference: upiReference.trim(),
      });
      setStep("submitted");
      setUpiReference("");
    } catch (err) {
      // Most likely someone else booked this slot while we were on the
      // payment screen (nothing reserves it until this point) - send the
      // patient back to pick another slot rather than leaving them stuck.
      setError(err.message || t("errorServer"));
      setStep("form");
      setPendingBooking(null);
      if (form.date) {
        getSlots(form.date)
          .then((data) => setSlots(data.slots || []))
          .catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  }

  function resetToForm() {
    setStep("form");
    setPendingBooking(null);
    setConfirmation(null);
    setIsFreeBooking(false);
    setUpiReference("");
    setError("");
  }

  // form.reasons holds stable English labels; look each back up against the
  // currently-loaded (language-appropriate) options for display so the
  // summary text always matches whatever language the checklist itself is
  // showing, even though the underlying selection never changes on a
  // language switch.
  const selectedReasonDisplay = form.reasons.map(
    (labelEn) => reasonOptions.find((option) => option.labelEn === labelEn)?.label || labelEn
  );
  const selectedReasonLabels = form.notSure ? [...selectedReasonDisplay, t("notSureOption")] : selectedReasonDisplay;
  const dayFull = !slotsLoading && slots.length > 0 && slots.every((slot) => !slot.available);

  return (
    <section className="appointment section" id="appointment">
      <div className="container appointment-grid">
        <div className="appointment-info reveal">
          <p className="section-label">{t("appointmentLabel")}</p>
          <h2>{t("appointmentTitle")}</h2>
          <p className="body-text">{t("appointmentText")}</p>

          <div className="appointment-benefits">
            <div>
              <span>✓</span>
              <p>{t("benefit1")}</p>
            </div>
            <div>
              <span>✓</span>
              <p>{t("benefit2")}</p>
            </div>
            <div>
              <span>✓</span>
              <p>{t("benefit3")}</p>
            </div>
            <div>
              <span>✓</span>
              <p>{t("benefit4")}</p>
            </div>
          </div>
        </div>

        <div className="appointment-form-card reveal">
          {step === "form" && (
            <form onSubmit={handleSubmit}>
              <div className="form-header">
                <span className="form-icon">♡</span>
                <div>
                  <h3>{t("formTitle")}</h3>
                  <p>{t("formSubtitle")}</p>
                </div>
              </div>

              <div className="form-group">
                <label>{t("nameLabel")}</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={updateField("name")}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t("phoneLabel")}</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={form.phone}
                    onChange={updatePhone}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("emailLabel")}</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={updateField("email")}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{t("cityLabel")}</label>
                <input
                  type="text"
                  placeholder="Kuppam"
                  value={form.city}
                  onChange={updateField("city")}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t("dateLabel")}</label>
                <input
                  type="date"
                  min={todayISO()}
                  value={form.date}
                  onChange={updateDate}
                  required
                />
                {form.date && dayFull && (
                  <p className="date-availability-note full">{t("dateFullMessage")}</p>
                )}
              </div>

              {form.date && (
                <div className="form-group">
                  <label>{t("timeLabel")}</label>
                  {slotsLoading ? (
                    <p className="date-availability-note">{t("checkingAvailability")}</p>
                  ) : slotsError ? (
                    <p className="date-availability-note full">{t("errorServer")}</p>
                  ) : dayFull ? null : (
                    <div className="time-slot-grid">
                      {slots.map((slot) => (
                        <button
                          type="button"
                          key={slot.value}
                          className={`time-slot-btn${form.time === slot.value ? " selected" : ""}`}
                          disabled={!slot.available}
                          onClick={() => selectTime(slot.value)}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group" ref={reasonDropdownRef}>
                <label>{t("reasonLabel")}</label>
                <div className="reason-dropdown">
                  <button
                    type="button"
                    className="reason-dropdown-toggle"
                    onClick={() => setReasonDropdownOpen((open) => !open)}
                    aria-expanded={reasonDropdownOpen}
                  >
                    <span className={selectedReasonLabels.length ? "" : "placeholder"}>
                      {selectedReasonLabels.length ? selectedReasonLabels.join(", ") : t("reasonPlaceholder")}
                    </span>
                    <span className={`reason-dropdown-arrow${reasonDropdownOpen ? " open" : ""}`}>▾</span>
                  </button>

                  {reasonDropdownOpen && (
                    <div className="reason-dropdown-panel">
                      {reasonsLoading ? (
                        <p className="reason-loading">{t("loadingOptions")}</p>
                      ) : (
                        <>
                          {reasonOptions.map((option) => {
                            const checked = form.reasons.includes(option.labelEn);
                            return (
                              <label key={option.id} className="reason-checkbox">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleReason(option.labelEn)}
                                />
                                <span>{option.label}</span>
                              </label>
                            );
                          })}
                          <label className="reason-checkbox not-sure">
                            <input type="checkbox" checked={form.notSure} onChange={toggleNotSure} />
                            <span>{t("notSureOption")}</span>
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {form.notSure && (
                <div className="voice-box">
                  <div className="voice-header">
                    <div>
                      <strong>{t("voiceTitle")}</strong>
                      <small>{t("voiceSubtitle")}</small>
                    </div>

                    <button
                      type="button"
                      className={`voice-btn${listening ? " listening" : ""}`}
                      onClick={handleVoiceClick}
                      disabled={!voiceSupported}
                    >
                      🎙️
                    </button>
                  </div>

                  <textarea
                    rows="3"
                    placeholder="You can speak any additional information..."
                    value={form.message}
                    onChange={updateField("message")}
                  />

                  <span className="voice-status">
                    {voiceSupported
                      ? statusText
                      : "Voice input is not supported in this browser."}
                  </span>
                </div>
              )}

              {currentFee === 0 && (
                <p className="body-text" style={{ color: "#2f8a4e", fontWeight: 600 }}>
                  {t("freeServiceBanner")}
                </p>
              )}

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="whatsapp-submit" disabled={submitting || dayFull || !form.time}>
                <span className="whatsapp-symbol">{currentFee === 0 ? "✓" : "💳"}</span>
                <span>
                  {submitting ? "..." : currentFee === 0 ? t("bookFreeAppointment") : t("continueToPayment")}
                </span>
                <span>→</span>
              </button>

              <p className="privacy-text">{t("privacyText")}</p>
            </form>
          )}

          {step === "payment" && pendingBooking && (
            <div>
              <div className="form-header">
                <span className="form-icon">💳</span>
                <div>
                  <h3>{t("payTitle")}</h3>
                  <p>{t("paySubtitle")}</p>
                </div>
              </div>

              {upiInfo.upiId ? (
                <div className="upi-payment-box">
                  <div className="upi-qr-wrap">
                    <QRCodeSVG
                      value={buildUpiLink({
                        upiId: upiInfo.upiId,
                        upiPayeeName: upiInfo.upiPayeeName,
                        amount: pendingBooking.consultationFee,
                        note: `Appointment ${pendingBooking.date} ${pendingBooking.time}`,
                      })}
                      size={200}
                    />
                  </div>
                  <p className="body-text upi-amount">
                    {t("payNow")} <strong>₹{pendingBooking.consultationFee}</strong> {t("upiIdLabel")}{" "}
                    <strong>{upiInfo.upiId}</strong>
                  </p>
                  <p className="body-text upi-instructions">{t("qrInstructions")}</p>

                  <form onSubmit={handleSubmitPaymentProof}>
                    <div className="form-group">
                      <label>{t("upiRefLabel")}</label>
                      <input
                        type="text"
                        placeholder={t("upiRefPlaceholder")}
                        value={upiReference}
                        onChange={(event) => setUpiReference(event.target.value)}
                        required
                      />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button type="submit" className="whatsapp-submit" disabled={submitting}>
                      <span className="whatsapp-symbol">✓</span>
                      <span>{submitting ? "..." : t("submitPaymentProof")}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <p className="form-error">{t("paymentUnavailable")}</p>
              )}

              <p className="privacy-text">
                <button type="button" onClick={resetToForm} className="link-btn">
                  {t("cancelAndPickAnother")}
                </button>
              </p>
            </div>
          )}

          {step === "submitted" && (
            <div>
              <div className="form-header">
                <span className="form-icon">⏳</span>
                <div>
                  <h3>{t("paymentSubmittedTitle")}</h3>
                  <p>{t("paymentSubmittedText")}</p>
                </div>
              </div>

              <button type="button" className="whatsapp-submit" onClick={resetToForm}>
                <span>{t("bookAnother")}</span>
              </button>
            </div>
          )}

          {step === "confirmed" && confirmation && (
            <div>
              <div className="form-header">
                <span className="form-icon">✓</span>
                <div>
                  <h3>{t("confirmedTitle")}</h3>
                  <p>{isFreeBooking ? t("freeConfirmedSubtitle") : t("confirmedSubtitle")}</p>
                </div>
              </div>

              <p className="body-text">
                {t("appointmentDateLabel")}: <strong>{confirmation.appointment_date}</strong>
                {confirmation.time_label && (
                  <>
                    {" "}
                    <strong>{confirmation.time_label}</strong>
                  </>
                )}
              </p>

              <button type="button" className="whatsapp-submit" onClick={resetToForm}>
                <span>{t("bookAnother")}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <SuccessModal open={modalOpen} onClose={() => setModalOpen(false)} free={isFreeBooking} />
    </section>
  );
}
