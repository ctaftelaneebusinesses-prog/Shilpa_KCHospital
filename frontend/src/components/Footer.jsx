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
        </div>

        <div className="footer-powered-by">
          <span>Powered by</span>
          <img src={craftlaneeLogo} alt="Craftlanee" />
        </div>
      </div>
    </footer>
  );
}
