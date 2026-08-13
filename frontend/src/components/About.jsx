import { useLanguage } from "../LanguageContext";
import doctorPhoto from "../assets/doctor.png";

export default function About() {
  const { t } = useLanguage();

  return (
    <section className="about section" id="about">
      <div className="container about-grid">
        <div className="about-image reveal">
          <div className="about-image-main">
            <img src={doctorPhoto} alt="Dr. Shilpa" />
          </div>

          <div className="about-floating">
            <span>♥</span>
            <div>
              <strong>{t("womenFirst")}</strong>
              <small>{t("careApproach")}</small>
            </div>
          </div>
        </div>

        <div className="about-content reveal">
          <p className="section-label">{t("aboutDoctor")}</p>
          <h2>{t("aboutTitle")}</h2>
          <p className="body-text">{t("aboutText")}</p>

          <div className="about-points">
            <div>
              <span>✓</span>
              <p>{t("pointOne")}</p>
            </div>
            <div>
              <span>✓</span>
              <p>{t("pointTwo")}</p>
            </div>
            <div>
              <span>✓</span>
              <p>{t("pointThree")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
