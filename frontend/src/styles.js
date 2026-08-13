// All site styling lives here as a JS string and is injected into a <style>
// tag at runtime (see main.jsx). There are no .css files in this project —
// this keeps hover states, @keyframes and @media rules (which plain inline
// style objects cannot express) while still authoring everything in JS.
const css = `
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: "DM Sans", sans-serif;
  background: #fffafc;
  color: #332b35;
  overflow-x: hidden;
}
a { text-decoration: none; color: inherit; }
button, input, select, textarea { font-family: inherit; }

.container { width: min(1160px, calc(100% - 40px)); margin: auto; }
.section { padding: 110px 0; }

/* HEADER */
.header {
  position: fixed; top: 0; width: 100%; z-index: 1000;
  background: rgba(255, 250, 252, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(150, 100, 130, 0.1);
  transition: 0.3s;
}
.nav { height: 78px; display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit; height: 60px; }
.hospital-logo { width: 52px; height: 52px; object-fit: contain; display: block; flex-shrink: 0; }
.logo-text { display: flex; flex-direction: column; justify-content: center; line-height: 1.1; }
.logo-text strong { font-size: 20px; font-weight: 700; color: #222; }
.logo-text span { font-size: 12px; margin-top: 4px; color: #c56a8d; font-weight: 500; letter-spacing: 0.5px; }

@media (max-width: 768px) {
  .logo { gap: 8px; height: 50px; }
  .hospital-logo { width: 42px; height: 42px; }
  .logo-text strong { font-size: 16px; }
  .logo-text span { font-size: 10px; }
}

.desktop-nav { display: flex; gap: 30px; margin-left: auto; margin-right: 30px; }
.desktop-nav a { font-size: 14px; font-weight: 600; color: #665d66; transition: 0.3s; }
.desktop-nav a:hover { color: #9f5276; }

.nav-right { display: flex; align-items: center; gap: 12px; }
.language-select { border: 1px solid #ead8e0; background: white; padding: 10px 12px; border-radius: 10px; color: #5d4c57; outline: none; }
.nav-btn { padding: 11px 18px; border-radius: 10px; background: #9f5276; color: white; font-size: 13px; font-weight: 700; }
.menu-btn { display: none; background: none; border: 0; font-size: 25px; cursor: pointer; }
.mobile-menu { display: none; }

/* HERO */
.hero {
  min-height: 100vh; padding-top: 130px; padding-bottom: 70px;
  position: relative; overflow: hidden;
  background:
    radial-gradient(circle at 10% 20%, rgba(224, 163, 190, 0.18), transparent 28%),
    radial-gradient(circle at 90% 80%, rgba(183, 220, 211, 0.25), transparent 30%),
    #fffafc;
}
.hero-grid { min-height: 720px; display: grid; grid-template-columns: 1fr 0.9fr; align-items: center; gap: 60px; }
.hero-content { position: relative; z-index: 2; }
.availability {
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 13px;
  background: #f7e9ef; color: #91496b; border-radius: 50px; font-size: 12px; font-weight: 700; margin-bottom: 25px;
}
.pulse { width: 8px; height: 8px; background: #4eaf86; border-radius: 50%; animation: pulse 1.8s infinite; }
.eyebrow, .section-label { color: #a15578; letter-spacing: 2.5px; font-size: 11px; font-weight: 800; margin-bottom: 14px; }
.hero h1 {
  font-family: "Playfair Display", serif; font-size: clamp(50px, 6vw, 78px);
  line-height: 1.03; letter-spacing: -2px; max-width: 650px; margin-bottom: 25px;
}
.hero h1 span { color: #a15578; display: block; }
.hero-description { max-width: 520px; color: #746974; font-size: 17px; line-height: 1.8; margin-bottom: 35px; }
.hero-buttons { display: flex; gap: 12px; margin-bottom: 45px; }
.primary-btn, .secondary-btn {
  display: inline-flex; align-items: center; gap: 14px; padding: 15px 22px;
  border-radius: 12px; font-size: 14px; font-weight: 700; transition: 0.3s; cursor: pointer; border: none;
}
.primary-btn { background: #9f5276; color: white; box-shadow: 0 15px 30px rgba(159, 82, 118, 0.22); }
.primary-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 35px rgba(159, 82, 118, 0.28); }
.secondary-btn { border: 1px solid #dfcbd5; background: white; color: #624f5a; }
.secondary-btn:hover { border-color: #9f5276; }
.emergency-btn { border: 1px solid #f2c6c6; background: #fff5f5; color: #c0392b; }
.emergency-btn:hover { border-color: #c0392b; }
.hero-trust { display: flex; align-items: center; gap: 20px; }
.trust-item strong { display: block; color: #9f5276; font-family: "Playfair Display", serif; font-size: 25px; }
.trust-item span { font-size: 11px; color: #8a7d85; }
.trust-line { width: 1px; height: 35px; background: #e4d6dc; }

/* DOCTOR IMAGE */
.doctor-area { position: relative; display: flex; justify-content: center; align-items: center; }
.doctor-glow { position: absolute; width: 440px; height: 440px; border-radius: 50%; background: rgba(221, 164, 190, 0.28); filter: blur(20px); }
.doctor-card { position: relative; z-index: 2; width: min(430px, 100%); }
.doctor-photo-frame {
  height: 570px; border-radius: 220px 220px 35px 35px; overflow: hidden; position: relative;
  background: #e9d9df; box-shadow: 0 35px 80px rgba(93, 50, 72, 0.17); border: 10px solid rgba(255,255,255,0.8);
}
.doctor-photo-frame img { width: 100%; height: 100%; object-fit: cover; object-position: center top; transition: 0.5s; }
.doctor-photo-frame:hover img { transform: scale(1.04); }
.photo-badge {
  position: absolute; bottom: 20px; left: 20px; right: 20px; padding: 13px;
  background: rgba(255,255,255,0.92); backdrop-filter: blur(15px); border-radius: 15px;
  display: flex; align-items: center; gap: 12px;
}
.photo-badge > span { width: 35px; height: 35px; border-radius: 50%; background: #a15578; color: white; display: grid; place-items: center; }
.photo-badge strong { display: block; font-size: 12px; }
.photo-badge small { display: block; color: #887983; margin-top: 3px; }
.doctor-info { text-align: center; margin-top: 18px; }
.doctor-info p { color: #9f5276; font-size: 13px; font-weight: 700; }
.doctor-info h2 { font-family: "Playfair Display", serif; font-size: 27px; margin: 3px 0 7px; }
.hospital-name { color: #82747c; font-size: 12px; }
.hospital-name span { color: #9f5276; margin-right: 4px; }
.experience-card {
  position: absolute; z-index: 5; left: -20px; bottom: 130px; background: white; padding: 15px 18px;
  border-radius: 15px; box-shadow: 0 20px 50px rgba(80, 45, 60, 0.13); display: flex; gap: 10px;
  align-items: center; animation: floating 4s ease-in-out infinite;
}
.experience-card > span { color: #a15578; font-size: 22px; }
.experience-card strong { display: block; font-size: 12px; }
.experience-card small { color: #887983; }

/* FLOATING BACKGROUND */
.hero-bg-shape { position: absolute; border-radius: 50%; pointer-events: none; }
.shape-one { width: 120px; height: 120px; border: 1px solid rgba(159,82,118,.15); top: 180px; left: 5%; animation: floating 6s infinite; }
.shape-two { width: 220px; height: 220px; border: 1px solid rgba(159,82,118,.1); right: -60px; top: 25%; animation: floating 8s infinite reverse; }
.floating-icon { position: absolute; color: rgba(159,82,118,.18); font-size: 35px; }
.icon-one { left: 45%; top: 20%; animation: floating 5s infinite; }
.icon-two { right: 7%; bottom: 15%; animation: floating 7s infinite; }
.icon-three { left: 12%; bottom: 15%; animation: floating 6s infinite reverse; }

/* ABOUT */
.about { background: white; }
.about-grid { display: grid; grid-template-columns: 0.9fr 1fr; gap: 90px; align-items: center; }
.about-image { position: relative; }
.about-image-main { width: 100%; height: 480px; border-radius: 30px; overflow: hidden; }
.about-image-main img { width: 100%; height: 100%; object-fit: cover; }
.about-floating {
  position: absolute; bottom: -25px; right: -20px; background: white; padding: 17px; border-radius: 17px;
  box-shadow: 0 20px 50px rgba(60,40,50,.12); display: flex; align-items: center; gap: 10px;
}
.about-floating > span { width: 40px; height: 40px; background: #f4e5eb; color: #a15578; border-radius: 50%; display: grid; place-items: center; }
.about-floating strong { display: block; font-size: 13px; }
.about-floating small { color: #897b83; }
.about-content h2, .section-heading h2, .appointment-info h2, .location-content h2 {
  font-family: "Playfair Display", serif; font-size: clamp(38px, 4vw, 54px); line-height: 1.1; margin-bottom: 20px;
}
.about-content > p.body-text { color: #746974; line-height: 1.9; font-size: 16px; margin-bottom: 25px; }
.about-points { display: grid; gap: 15px; }
.about-points div, .appointment-benefits div { display: flex; align-items: center; gap: 12px; }
.about-points span, .appointment-benefits span {
  flex-shrink: 0; width: 25px; height: 25px; background: #f5e5eb; color: #9f5276; border-radius: 50%;
  display: grid; place-items: center; font-size: 11px; font-weight: bold;
}
.about-points p, .appointment-benefits p { color: #665d66; font-size: 14px; }

/* SERVICES */
.services { background: #fff8fb; }
.section-heading { text-align: center; max-width: 650px; margin: auto auto 55px; }
.section-heading > p.body-text { color: #81747c; line-height: 1.7; }
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.service-card { background: white; padding: 30px; border: 1px solid #f0e3e8; border-radius: 20px; transition: 0.4s; }
.service-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(70, 40, 55, 0.09); border-color: #e0b9ca; }
.service-icon {
  width: 50px; height: 50px; background: #f8eaf0; color: #9f5276; display: grid; place-items: center;
  border-radius: 14px; font-size: 22px; margin-bottom: 20px;
}
.service-card h3 { font-family: "Playfair Display", serif; font-size: 22px; margin-bottom: 10px; }
.service-card p { color: #81747c; line-height: 1.7; font-size: 14px; }

/* APPOINTMENT */
.appointment { background: radial-gradient(circle at 10% 20%, rgba(220, 165, 191, .16), transparent 25%), #fff; }
.appointment-grid { display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 70px; align-items: center; }
.appointment-info > p.body-text { color: #766a72; line-height: 1.8; margin-bottom: 30px; }
.appointment-benefits { display: grid; gap: 15px; }
.appointment-form-card {
  background: white; border: 1px solid #eedfe6; border-radius: 25px; padding: 32px; box-shadow: 0 25px 70px rgba(90, 50, 70, .08);
}
.form-header { display: flex; gap: 15px; align-items: center; margin-bottom: 25px; }
.form-icon {
  width: 45px; height: 45px; border-radius: 14px; background: #f6e7ed; color: #9f5276;
  display: grid; place-items: center; font-size: 22px;
}
.form-header h3 { font-family: "Playfair Display", serif; font-size: 23px; }
.form-header p { color: #897b83; font-size: 12px; margin-top: 3px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 7px; color: #5d5058; }
.form-group input, .form-group select, .voice-box textarea {
  width: 100%; border: 1px solid #eadce2; background: #fffafd; border-radius: 10px; padding: 13px;
  outline: none; color: #453b42; transition: 0.3s;
}
.form-group input:focus, .form-group select:focus, .voice-box textarea:focus {
  border-color: #b36a8b; box-shadow: 0 0 0 3px rgba(179,106,139,.08);
}

/* VOICE */
.voice-box { background: #fcf3f7; border: 1px solid #f0dfe7; padding: 15px; border-radius: 15px; margin: 10px 0 18px; }
.voice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.voice-header strong { display: block; font-size: 13px; }
.voice-header small { display: block; color: #8b7d84; font-size: 11px; margin-top: 3px; }
.voice-btn {
  width: 42px; height: 42px; border-radius: 50%; border: 0; background: #9f5276; color: white;
  cursor: pointer; font-size: 18px; transition: .3s;
}
.voice-btn:hover { transform: scale(1.08); }
.voice-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.voice-btn.listening { animation: voicePulse 1s infinite; }
.voice-box textarea { resize: vertical; min-height: 70px; }
.voice-status { display: block; margin-top: 7px; font-size: 11px; color: #9f5276; }

/* WHATSAPP */
.whatsapp-submit {
  width: 100%; border: 0; border-radius: 12px; padding: 15px; background: #2caa6f; color: white;
  font-weight: 800; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 12px; transition: .3s;
}
.whatsapp-submit:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(44,170,111,.25); }
.whatsapp-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.whatsapp-symbol { font-size: 18px; }
.privacy-text { text-align: center; color: #998c93; font-size: 10px; margin-top: 12px; }
.form-error { color: #c0392b; font-size: 12px; margin: -8px 0 14px; }
.date-availability-note { font-size: 12px; font-weight: 600; margin-top: 7px; color: #2f8a4e; }
.date-availability-note.full { color: #c0392b; }
.reason-checklist { display: flex; flex-wrap: wrap; gap: 8px; }
.reason-checkbox {
  display: flex; align-items: center; gap: 7px; padding: 8px 12px; border: 1px solid #e8dbe1;
  border-radius: 9px; font-size: 12.5px; color: #5d5058; cursor: pointer; background: #fffafd;
  transition: border-color .15s, background .15s;
}
.reason-checkbox.checked { border-color: #9f5276; background: #fdf1f6; color: #9f5276; font-weight: 600; }
.reason-checkbox input { margin: 0; accent-color: #9f5276; }
.reason-loading { font-size: 12.5px; color: #998c93; margin: 0; }
.link-btn {
  background: none; border: 0; padding: 0; color: #9f5276; font-size: 11px;
  text-decoration: underline; cursor: pointer;
}

/* LOCATION */
.location { background: #fff8fb; }
.location-card { display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; border-radius: 28px; background: white; border: 1px solid #f0e0e7; }
.location-content { padding: 55px; }
.location-content h2 { font-size: 43px; }
.address { display: flex; gap: 15px; margin: 30px 0; }
.address-icon { width: 45px; height: 45px; background: #f7e8ef; color: #9f5276; display: grid; place-items: center; border-radius: 14px; }
.address strong { font-size: 14px; }
.address p { color: #7c7077; line-height: 1.7; font-size: 13px; margin-top: 4px; }
.contact-actions { display: flex; gap: 10px; }
.contact-btn { padding: 12px 18px; border: 1px solid #e6d5dd; border-radius: 10px; font-size: 13px; font-weight: 700; }
.contact-btn.whatsapp { background: #2caa6f; border-color: #2caa6f; color: white; }
.map-box {
  min-height: 420px;
  background: linear-gradient(rgba(159,82,118,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(159,82,118,.08) 1px, transparent 1px), #f8eef2;
  background-size: 35px 35px; display: grid; place-items: center;
}
.map-placeholder { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 15px 40px rgba(60,40,50,.1); text-align: center; }
.map-pin {
  width: 55px; height: 55px; background: #9f5276; color: white; border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg); display: grid; place-items: center; margin: 0 auto 20px;
}
.map-placeholder strong, .map-placeholder span { display: block; }
.map-placeholder span { color: #8a7c84; font-size: 12px; margin-top: 5px; }
.map-placeholder a { display: inline-block; margin-top: 15px; color: #9f5276; font-size: 12px; font-weight: 700; }

/* FOOTER */
footer { background: #2f2630; color: white; padding: 35px 0; }
.footer-content { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.footer-brand { display: flex; align-items: center; gap: 10px; }
.footer-brand .logo-icon { background: #9f5276; width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; font-size: 20px; color: white; }
.footer-brand strong { display: block; font-family: "Playfair Display", serif; }
.footer-brand span { color: #c7a7b6; font-size: 10px; }
footer p { color: #b7aab1; font-size: 11px; }

/* FLOATING WHATSAPP */
.floating-whatsapp {
  position: fixed; right: 25px; bottom: 25px; width: 60px; height: 60px; background: #2caa6f; color: white;
  border-radius: 50%; display: grid; place-items: center; font-size: 25px; z-index: 900;
  box-shadow: 0 12px 35px rgba(44,170,111,.35); animation: whatsappPulse 2.5s infinite;
}
.mobile-bottom-bar { display: none; }

/* MODAL */
.modal {
  position: fixed; inset: 0; background: rgba(30,20,28,.5); backdrop-filter: blur(8px);
  display: none; place-items: center; z-index: 3000; padding: 20px;
}
.modal.show { display: grid; }
.modal-box { background: white; border-radius: 22px; padding: 35px; text-align: center; max-width: 400px; width: 100%; animation: modalIn .35s ease; }
.success-icon {
  width: 60px; height: 60px; margin: auto auto 15px; background: #e1f5eb; color: #2caa6f; border-radius: 50%;
  display: grid; place-items: center; font-size: 25px; font-weight: bold;
}
.modal-box h3 { font-family: "Playfair Display", serif; font-size: 25px; }
.modal-box p { color: #80737a; font-size: 13px; line-height: 1.7; margin: 10px 0 20px; }
.modal-box button { background: #9f5276; color: white; border: 0; padding: 11px 25px; border-radius: 10px; cursor: pointer; }

/* ANIMATIONS */
.reveal { opacity: 0; transform: translateY(30px); transition: opacity .8s ease, transform .8s ease; }
.reveal.active { opacity: 1; transform: translateY(0); }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(78,175,134,.5); }
  70% { box-shadow: 0 0 0 10px rgba(78,175,134,0); }
  100% { box-shadow: 0 0 0 0 rgba(78,175,134,0); }
}
@keyframes floating {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes voicePulse {
  0% { box-shadow: 0 0 0 0 rgba(159,82,118,.6); }
  70% { box-shadow: 0 0 0 18px rgba(159,82,118,0); }
  100% { box-shadow: 0 0 0 0 rgba(159,82,118,0); }
}
@keyframes whatsappPulse {
  0% { box-shadow: 0 0 0 0 rgba(44,170,111,.45); }
  70% { box-shadow: 0 0 0 15px rgba(44,170,111,0); }
  100% { box-shadow: 0 0 0 0 rgba(44,170,111,0); }
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(.9); }
  to { opacity: 1; transform: scale(1); }
}

/* RESPONSIVE TABLET */
@media (max-width: 1000px) {
  .desktop-nav { display: none; }
  .menu-btn { display: block; }
  .nav-btn { display: none; }
  .mobile-menu { background: white; padding: 15px 20px 25px; border-bottom: 1px solid #eee; }
  .mobile-menu.show { display: grid; }
  .mobile-menu a { padding: 12px 0; color: #655963; font-size: 14px; font-weight: 600; }
  .hero-grid { grid-template-columns: 1fr; text-align: center; }
  .hero-content { max-width: 700px; margin: auto; }
  .hero-description { margin-left: auto; margin-right: auto; }
  .hero-buttons, .hero-trust { justify-content: center; }
  .doctor-area { max-width: 500px; margin: auto; }
  .about-grid, .appointment-grid { grid-template-columns: 1fr; gap: 50px; }
  .about-image { max-width: 600px; margin: auto; }
  .services-grid { grid-template-columns: 1fr 1fr; }
}

/* MOBILE */
@media (max-width: 650px) {
  body { padding-bottom: 65px; }
  .container { width: min(100% - 28px, 1160px); }
  .section { padding: 75px 0; }
  .nav { height: 68px; }
  .language-select { padding: 8px; font-size: 11px; }
  .logo-text strong { font-size: 15px; }
  .logo-text span { font-size: 8px; }
  .hero { padding-top: 105px; padding-bottom: 60px; }
  .hero-grid { min-height: auto; gap: 55px; }
  .hero h1 { font-size: 46px; letter-spacing: -1px; }
  .hero-description { font-size: 14px; }
  .hero-buttons { flex-direction: column; }
  .primary-btn, .secondary-btn { justify-content: center; }
  .hero-trust { gap: 12px; }
  .trust-item strong { font-size: 20px; }
  .trust-item span { font-size: 9px; }
  .doctor-photo-frame { height: 470px; border-radius: 180px 180px 25px 25px; }
  .experience-card { left: -5px; bottom: 120px; padding: 11px; }
  .experience-card strong, .experience-card small { font-size: 10px; }
  .services-grid { grid-template-columns: 1fr; }
  .about-image-main { height: 380px; }
  .about-floating { right: 5px; }
  .appointment-form-card { padding: 20px; }
  .form-row { grid-template-columns: 1fr; gap: 0; }
  .location-card { grid-template-columns: 1fr; }
  .location-content { padding: 35px 25px; }
  .location-content h2 { font-size: 35px; }
  .map-box { min-height: 300px; }
  .floating-whatsapp { display: none; }
  footer { padding-bottom: 90px; }
  .footer-content { flex-direction: column; text-align: center; }
  .mobile-bottom-bar {
    position: fixed; bottom: 0; left: 0; right: 0; height: 65px; background: white;
    border-top: 1px solid #eadde3; z-index: 2000; display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  .mobile-bottom-bar a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: #665a63; font-size: 19px; }
  .mobile-bottom-bar small { font-size: 9px; font-weight: 700; }
  .mobile-bottom-bar .mobile-book { color: #9f5276; border-left: 1px solid #eee; }
  .mobile-bottom-bar .mobile-emergency { color: #c0392b; border-right: 1px solid #eee; }
  .mobile-bottom-bar a:last-child { color: #2caa6f; }
}
`;

export function injectStyles() {
  if (document.getElementById("app-styles")) return;
  const styleTag = document.createElement("style");
  styleTag.id = "app-styles";
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  const preconnect1 = document.createElement("link");
  preconnect1.rel = "preconnect";
  preconnect1.href = "https://fonts.googleapis.com";
  const preconnect2 = document.createElement("link");
  preconnect2.rel = "preconnect";
  preconnect2.href = "https://fonts.gstatic.com";
  preconnect2.crossOrigin = "anonymous";
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap";
  document.head.append(preconnect1, preconnect2, fontLink);
}
