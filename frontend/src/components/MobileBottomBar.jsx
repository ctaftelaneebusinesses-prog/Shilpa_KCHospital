import { useLanguage } from "../LanguageContext";
import { EMERGENCY_NUMBER } from "../config";

export default function MobileBottomBar() {
  const { t } = useLanguage();

  return (
    <div className="mobile-bottom-bar">
      <a href="tel:+917207910548">
        <span>☎</span>
        <small>{t("call")}</small>
      </a>

      <a href="#appointment" className="mobile-book">
        <span>＋</span>
        <small>{t("book")}</small>
      </a>

      <a href={`tel:${EMERGENCY_NUMBER}`} className="mobile-emergency">
        <span>🚨</span>
        <small>{t("emergency")}</small>
      </a>

      <a href="https://wa.me/917207910548" target="_blank" rel="noreferrer">
        <span>☘</span>
        <small>WhatsApp</small>
      </a>
    </div>
  );
}
