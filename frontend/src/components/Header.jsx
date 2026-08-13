import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { useScrollHeader } from "../hooks/useScrollHeader";
import logo from "../assets/logo.png";

const NAV_LINKS = [
  { href: "#home", key: "navHome" },
  { href: "#about", key: "navAbout" },
  { href: "#services", key: "navServices" },
  { href: "#appointment", key: "navAppointment" },
  { href: "#contact", key: "navContact" },
];

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const scrolled = useScrollHeader();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="header"
      style={{ boxShadow: scrolled ? "0 8px 30px rgba(60,40,50,.07)" : "none" }}
    >
      <div className="container nav">
        <a href="#home" className="logo">
          <img src={logo} alt="KC Hospital Women's Care Logo" className="hospital-logo" />
          <div className="logo-text">
            <strong>KC Hospital</strong>
            <span>Women's Care</span>
          </div>
        </a>

        <nav className="desktop-nav">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <select
            className="language-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
            <option value="ta">தமிழ்</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          <a href="#appointment" className="nav-btn">
            <span>{t("bookNow")}</span>
          </a>

          <button className="menu-btn" onClick={() => setMenuOpen((open) => !open)}>
            ☰
          </button>
        </div>
      </div>

      <div className={`mobile-menu${menuOpen ? " show" : ""}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {t(link.key)}
          </a>
        ))}
      </div>
    </header>
  );
}
