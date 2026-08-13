import { useLanguage } from "../LanguageContext";

const SERVICES = [
  { icon: "♡", titleKey: "service1Title", textKey: "service1Text" },
  { icon: "✦", titleKey: "service2Title", textKey: "service2Text" },
  { icon: "♥", titleKey: "service3Title", textKey: "service3Text" },
  { icon: "✚", titleKey: "service4Title", textKey: "service4Text" },
  { icon: "◉", titleKey: "service5Title", textKey: "service5Text" },
  { icon: "∞", titleKey: "service6Title", textKey: "service6Text" },
];

export default function Services() {
  const { t } = useLanguage();

  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="section-heading reveal">
          <p className="section-label">{t("servicesLabel")}</p>
          <h2>{t("servicesTitle")}</h2>
          <p className="body-text">{t("servicesDescription")}</p>
        </div>

        <div className="services-grid">
          {SERVICES.map((service) => (
            <div className="service-card reveal" key={service.titleKey}>
              <div className="service-icon">{service.icon}</div>
              <h3>{t(service.titleKey)}</h3>
              <p>{t(service.textKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
