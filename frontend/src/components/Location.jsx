import { useLanguage } from "../LanguageContext";

export default function Location() {
  const { t } = useLanguage();

  return (
    <section className="location section" id="contact">
      <div className="container">
        <div className="location-card reveal">
          <div className="location-content">
            <p className="section-label">{t("locationLabel")}</p>
            <h2>{t("locationTitle")}</h2>

            <div className="address">
              <span className="address-icon">⌖</span>
              <div>
                <strong>KC Hospital</strong>
                <p>
                  {t("addressLine1")}
                  <br />
                  {t("addressLine2")}
                </p>
              </div>
            </div>

            <div className="contact-actions">
              <a href="tel:+917207910548" className="contact-btn">
                ☎ <span>{t("callHospital")}</span>
              </a>

              <a
                href="https://wa.me/917207910548"
                target="_blank"
                rel="noreferrer"
                className="contact-btn whatsapp"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="map-box">
            <div className="map-placeholder">
              <div className="map-pin">♥</div>
              <strong>KC Hospital</strong>
              <span>Kuppam, Andhra Pradesh</span>

              <a
                href="https://www.google.com/maps/search/?api=1&query=KC+Hospital+Kuppam+Andhra+Pradesh"
                target="_blank"
                rel="noreferrer"
              >
                <span>{t("openMaps")}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
