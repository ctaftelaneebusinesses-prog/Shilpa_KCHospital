import { useLanguage } from "../LanguageContext";

export default function SuccessModal({ open, onClose }) {
  const { t } = useLanguage();

  return (
    <div
      className={`modal${open ? " show" : ""}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <div className="success-icon">✓</div>
        <h3>{t("successTitle")}</h3>
        <p>{t("successText")}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
