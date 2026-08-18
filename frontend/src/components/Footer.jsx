import craftlaneeLogo from "../assets/craftlanee-logo.png";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer>
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo-icon">
            <img src={logo} alt="KC Hospital" />
          </div>
          <div>
            <strong>KC Hospital</strong>
            <span>Women's Care</span>
          </div>
        </div>

        <p>© 2026 KC Hospital. All rights reserved.</p>
        <p>Dr. Shilpa · Gynaecologist · Kuppam</p>

        <div className="footer-contact">
          <a href="tel:+917207910548">☎ +91 72079 10548</a>
          <a
            href="https://www.instagram.com/dr.shilpa.kchospital?igsh=M2dzOGdzd3g3bjBt"
            target="_blank"
            rel="noreferrer"
            className="footer-instagram"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            <span>Contact us on Instagram</span>
          </a>
        </div>

        <div className="footer-powered-by">
          <span>Powered by</span>
          <img src={craftlaneeLogo} alt="Craftlanee" />
        </div>
      </div>
    </footer>
  );
}
