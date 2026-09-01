import { useLanguage } from "../LanguageContext";
import { EMERGENCY_NUMBER } from "../config";
import doctorPhoto from "../assets/doctor-hero.jpg";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero" id="home">
      <div className="hero-bg-shape shape-one" />
      <div className="hero-bg-shape shape-two" />

      <div className="floating-icon icon-one">♡</div>
      <div className="floating-icon icon-two">✚</div>
      <div className="floating-icon icon-three">✿</div>

      <div className="container hero-grid">
        <div className="hero-content reveal">
          <div className="availability">
            <span className="pulse" />
            <span>{t("available")}</span>
          </div>

          <p className="eyebrow">{t("specialist")}</p>

          <h1>
            Caring for women,
            <span>through every stage.</span>
          </h1>

          <p className="hero-description">{t("heroDescription")}</p>

          <div className="hero-buttons">
            <a href="#appointment" className="primary-btn">
              <span>{t("bookAppointment")}</span>
              <span>→</span>
            </a>

            <a href="tel:+917207910548" className="secondary-btn">
              ☎ <span>{t("callNow")}</span>
            </a>

            <a href={`tel:${EMERGENCY_NUMBER}`} className="secondary-btn emergency-btn">
              🚨 <span>{t("emergency")}</span>
            </a>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <strong>4</strong>
              <span>{t("languages")}</span>
            </div>

            <div className="trust-line" />

            <div className="trust-item">
              <strong>24/7</strong>
              <span>{t("support")}</span>
            </div>

            <div className="trust-line" />

            <div className="trust-item">
              <strong>♥</strong>
              <span>{t("care")}</span>
            </div>
          </div>
        </div>

        <div className="doctor-area reveal">
          <div className="doctor-glow" />

          <div className="doctor-card">
            <div className="doctor-photo-frame">
              <img src={doctorPhoto} alt="Dr. Shilpa Gynaecologist" />

              <div className="photo-badge">
                <span>✓</span>
                <div>
                  <strong>{t("specialistBadge")}</strong>
                  <small>{t("specialistCare")}</small>
                </div>
              </div>
            </div>

            <div className="doctor-info">
              <p>{t("doctor")}</p>
              <h2>{t("gynaecologist")}</h2>
              <div className="hospital-name">
                <span>✚</span>
                KC Hospital, Kuppam
              </div>
            </div>
          </div>

          <div className="experience-card">
            <span>✦</span>
            <div>
              <strong>{t("personalized")}</strong>
              <small>{t("attention")}</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
