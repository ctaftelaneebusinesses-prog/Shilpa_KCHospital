import { useEffect, useRef, useState } from "react";
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

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "te", label: "తెలుగు" },
  { value: "ta", label: "தமிழ்" },
  { value: "kn", label: "ಕನ್ನಡ" },
];

function LanguageDropdown({ language, setLanguage }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const current = LANGUAGE_OPTIONS.find((option) => option.value === language) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="language-dropdown" ref={wrapperRef}>
      <button
        type="button"
        className="language-select"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.label}`}
      >
        <span>Languages</span>
        <span className={`language-caret${open ? " open" : ""}`}>▾</span>
      </button>

      {open && (
        <ul className="language-menu" role="listbox">
          {LANGUAGE_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === language}
                className={`language-option${option.value === language ? " active" : ""}`}
                onClick={() => {
                  setLanguage(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
          <LanguageDropdown language={language} setLanguage={setLanguage} />

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
