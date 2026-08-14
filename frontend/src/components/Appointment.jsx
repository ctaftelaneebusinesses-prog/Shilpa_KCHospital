import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../LanguageContext";
import { useVoiceInput } from "../hooks/useVoiceInput";
import {
  createPaymentOrder,
  getAppointment,
  getAvailability,
  getConsultationFee,
  getReasonOptions,
  holdSlot,
  verifyPayment,
} from "../api";
import SuccessModal from "./SuccessModal";

const todayISO = () => new Date().toISOString().split("T")[0];

const initialForm = {
  name: "",
  phone: "",
  email: "",
  city: "",
  date: "",
  reasons: [],
  notSure: false,
  message: "",
};

let razorpayScriptPromise = null;
function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

export default function Appointment() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [availability, setAvailability] = useState(null); // { capacity, bookedCount, full }
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [reasonOptions, setReasonOptions] = useState([]);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const [reasonDropdownOpen, setReasonDropdownOpen] = useState(false);
  const reasonDropdownRef = useRef(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // step: "form" (select + patient details) -> "payment" (active hold,
  // awaiting Razorpay) -> "confirmed" (payment verified)
  const [step, setStep] = useState("form");
  const [hold, setHold] = useState(null); // { appointmentId, holdExpiresAt, consultationFee }
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [confirmation, setConfirmation] = useState(null);
  const [isFreeBooking, setIsFreeBooking] = useState(false);
  const [currentFee, setCurrentFee] = useState(null); // null while unknown, then a number

  const { supported: voiceSupported, listening, statusText, startListening } =
    useVoiceInput(language);

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
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
      .then((data) => setCurrentFee(data.consultationFeeInr))
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
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setAvailabilityLoading(true);
    getAvailability(form.date)
      .then((data) => {
        if (!cancelled) setAvailability(data);
      })
      .catch(() => {
        if (!cancelled) setAvailability(null);
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.date]);

  useEffect(() => {
    if (step !== "payment" || !hold) return;
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.round((new Date(hold.holdExpiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setError(t("holdExpired"));
        setStep("form");
        setHold(null);
        if (form.date) {
          getAvailability(form.date).then(setAvailability);
        }
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [step, hold, form.date, t]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const { name, phone, email, city, date } = form;
    if (!name.trim() || !phone.trim() || !city.trim() || !date) {
      setError(t("errorRequired"));
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setError(t("errorPhone"));
      return;
    }

    if (availability?.full) {
      setError(t("dateFullMessage"));
      return;
    }

    setSubmitting(true);

    try {
      const reasonParts = [`City: ${city.trim()}`];
      if (form.reasons.length) reasonParts.push(form.reasons.join(", "));
      if (form.notSure && form.message.trim()) reasonParts.push(`Other: ${form.message.trim()}`);
      const reason = reasonParts.join("\n");
      const data = await holdSlot({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        date,
        reason,
        language,
      });

      if (data.status === "confirmed") {
        // Consultation fee is 0 - the backend confirms instantly, no payment needed.
        const appointment = await getAppointment(data.appointmentId);
        setConfirmation(appointment);
        setIsFreeBooking(true);
        setStep("confirmed");
        setModalOpen(true);
        setForm(initialForm);
      } else {
        setHold({
          appointmentId: data.appointmentId,
          holdExpiresAt: data.holdExpiresAt,
          consultationFee: data.consultationFee,
        });
        setStep("payment");
      }
    } catch (err) {
      setError(err.message || t("errorServer"));
      if (form.date) {
        getAvailability(form.date).then(setAvailability).catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePay() {
    if (!hold) return;
    setError("");
    setSubmitting(true);

    try {
      const order = await createPaymentOrder(hold.appointmentId);
      const scriptLoaded = await loadRazorpayCheckout();
      if (!scriptLoaded) {
        setError(t("errorServer"));
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Dr. Shilpa | KC Hospital",
        description: t("appointmentTitle"),
        prefill: { name: form.name.trim(), contact: form.phone.trim(), email: form.email.trim() },
        theme: { color: "#9f5276" },
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setConfirmation(result.appointment);
            setIsFreeBooking(false);
            setStep("confirmed");
            setModalOpen(true);
            setForm(initialForm);
          } catch (err) {
            setError(err.message || t("errorServer"));
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      razorpay.open();
    } catch (err) {
      setError(err.message || t("errorServer"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetToForm() {
    setStep("form");
    setHold(null);
    setConfirmation(null);
    setIsFreeBooking(false);
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
                  onChange={updateField("date")}
                  required
                />
                {form.date && (
                  <p className={`date-availability-note${availability?.full ? " full" : ""}`}>
                    {availabilityLoading
                      ? t("checkingAvailability")
                      : availability?.full
                      ? t("dateFullMessage")
                      : t("dateAvailableMessage")}
                  </p>
                )}
              </div>

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

              <button type="submit" className="whatsapp-submit" disabled={submitting || availability?.full}>
                <span className="whatsapp-symbol">{currentFee === 0 ? "✓" : "💳"}</span>
                <span>
                  {submitting ? "..." : currentFee === 0 ? t("bookFreeAppointment") : t("continueToPayment")}
                </span>
                <span>→</span>
              </button>

              <p className="privacy-text">{t("privacyText")}</p>
            </form>
          )}

          {step === "payment" && hold && (
            <div>
              <div className="form-header">
                <span className="form-icon">💳</span>
                <div>
                  <h3>{t("payTitle")}</h3>
                  <p>{t("paySubtitle")}</p>
                </div>
              </div>

              <p className="body-text">
                {t("holdCountdown")}: <strong>{Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</strong>
              </p>

              {error && <p className="form-error">{error}</p>}

              <button type="button" className="whatsapp-submit" onClick={handlePay} disabled={submitting}>
                <span className="whatsapp-symbol">₹</span>
                <span>{submitting ? "..." : `${t("payNow")} ₹${hold.consultationFee}`}</span>
                <span>→</span>
              </button>

              <p className="privacy-text">
                <button type="button" onClick={resetToForm} className="link-btn">
                  {t("cancelAndPickAnother")}
                </button>
              </p>
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
