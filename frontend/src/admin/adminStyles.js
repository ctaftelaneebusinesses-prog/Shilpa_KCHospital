// Styling for the new /admin area only. Injected separately from the public
// site's styles.js (only when AdminApp mounts) and scoped under .admin-app
// so it can never affect the existing public pages.
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.admin-app {
  --brand: #8b3a62;
  --brand-dark: #732c4f;
  --brand-tint-05: rgba(139, 58, 98, .05);
  --brand-tint-10: rgba(139, 58, 98, .10);
  --brand-tint-15: rgba(139, 58, 98, .16);
  --rose-bg: #fdf4f8;
  --surface: #ffffff;
  --border: #f0dde6;
  --text: #2b2530;
  --text-muted: #857a83;
  --text-faint: #c3b3bc;

  font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: var(--rose-bg); min-height: 100vh; color: var(--text);
}
.admin-app * { box-sizing: border-box; }
.admin-app h2 { font-size: 21px; font-weight: 800; letter-spacing: -.01em; margin-bottom: 18px; }

/* ---- Shell layout ---- */
.admin-shell { display: flex; min-height: 100vh; align-items: stretch; }

.admin-sidebar {
  width: 250px; flex-shrink: 0; background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 22px 16px; position: sticky; top: 0; height: 100vh;
}
.admin-sidebar-brand { display: flex; align-items: center; gap: 12px; padding: 4px 8px 26px; }
.admin-brand-mark {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--brand), var(--brand-dark)); color: #fff;
  display: grid; place-items: center; font-weight: 800; font-size: 13px; letter-spacing: .3px;
}
.admin-sidebar-brand strong { display: block; font-size: 14.5px; color: var(--text); }
.admin-sidebar-brand span { font-size: 11px; color: var(--text-muted); }

.admin-sidenav { display: flex; flex-direction: column; gap: 3px; flex: 1; margin-top: 8px; }
.admin-sidenav-link {
  display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 10px;
  color: var(--text-muted); font-size: 13.5px; font-weight: 600; text-decoration: none;
  transition: background .15s, color .15s;
}
.admin-sidenav-link svg { flex-shrink: 0; }
.admin-sidenav-link:hover { background: var(--rose-bg); color: var(--brand); }
.admin-sidenav-link.active { background: var(--brand-tint-10); color: var(--brand); }
.admin-sidenav-logout {
  display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 10px; border: none;
  background: none; color: var(--text-muted); font-size: 13.5px; font-weight: 600; cursor: pointer;
  margin-top: auto; transition: background .15s, color .15s;
}
.admin-sidenav-logout:hover { background: #fdecec; color: #b23b3b; }

.admin-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

.admin-header {
  display: flex; align-items: center; justify-content: space-between; padding: 16px 30px;
  background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 5;
}
.admin-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); }
.admin-breadcrumb-item { display: flex; align-items: center; gap: 6px; }
.admin-breadcrumb-item svg { color: var(--text-faint); }
.admin-breadcrumb-item .current { color: var(--text); font-weight: 700; }
.admin-header-actions { display: flex; align-items: center; gap: 16px; }
.admin-icon-btn {
  position: relative; width: 38px; height: 38px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--surface); color: var(--text-muted); display: grid; place-items: center; cursor: pointer;
  transition: border-color .15s, color .15s;
}
.admin-icon-btn:hover { border-color: var(--brand); color: var(--brand); }
.admin-notif-dot {
  position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%;
  background: #e0556b; border: 1.5px solid var(--surface);
}
.admin-notif { position: relative; }
.admin-notif-panel {
  position: absolute; top: calc(100% + 10px); right: 0; width: 320px; max-height: 380px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  box-shadow: 0 16px 40px rgba(90, 50, 70, .14); overflow: hidden; z-index: 20;
  display: flex; flex-direction: column;
}
.admin-notif-panel-header {
  padding: 13px 16px; font-size: 12.5px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: var(--text-muted); border-bottom: 1px solid var(--border);
}
.admin-notif-empty { padding: 22px 16px; font-size: 13px; color: var(--text-muted); text-align: center; }
.admin-notif-list { overflow-y: auto; }
.admin-notif-item {
  display: flex; flex-direction: column; gap: 2px; width: 100%; text-align: left;
  padding: 11px 16px; border: none; border-bottom: 1px solid var(--border); background: none;
  cursor: pointer; transition: background .15s;
}
.admin-notif-item:last-child { border-bottom: none; }
.admin-notif-item:hover { background: var(--rose-bg); }
.admin-notif-item-title { font-size: 13.5px; font-weight: 700; color: var(--text); }
.admin-notif-item-meta { font-size: 12px; color: var(--text-muted); }
.admin-notif-item-time { font-size: 11px; color: var(--text-faint); }
.admin-avatar {
  width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 14px; cursor: default;
}

.admin-container { max-width: 1240px; padding: 28px 30px 64px; width: 100%; margin: 0 auto; }

/* ---- Cards ---- */
.admin-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 22px; margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(90, 50, 70, .05);
}

/* ---- Stat grid ---- */
.admin-section-title {
  font-size: 12.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-muted); margin: 26px 0 12px;
}
.admin-section-title:first-child { margin-top: 0; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-tile {
  position: relative; background: var(--surface); border: 1px solid var(--brand-tint-10); border-radius: 12px;
  padding: 18px 18px 16px; box-shadow: 0 4px 16px rgba(90, 50, 70, .06); min-height: 104px;
  display: flex; flex-direction: column; justify-content: center;
  transition: transform .15s ease, box-shadow .15s ease;
}
.stat-tile:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(90, 50, 70, .10); }
.stat-tile-icon {
  position: absolute; top: 14px; right: 14px; width: 34px; height: 34px; border-radius: 9px;
  display: grid; place-items: center;
}
.stat-tile strong { display: block; font-size: 27px; font-weight: 800; color: var(--text); line-height: 1.15; margin-bottom: 4px; letter-spacing: -.02em; overflow-wrap: anywhere; }
.stat-tile span { display: block; font-size: 12.5px; font-weight: 500; color: var(--text-muted); padding-right: 30px; overflow-wrap: anywhere; }

.tint-blue { background: #eaf2fd; color: #3568c4; }
.tint-purple { background: #f2edfb; color: #7b52d6; }
.tint-teal { background: #e6f7f5; color: #149e8a; }
.tint-green { background: #e9f8ef; color: #1f9d5c; }
.tint-red { background: #fdeceb; color: #d6483f; }
.tint-amber { background: #fff5e2; color: #b9791a; }
.tint-brand { background: var(--brand-tint-10); color: var(--brand); }

.stat-tile strong.tone-red { color: #c0392b; }
.stat-tile strong.tone-amber { color: #92660a; }
.stat-tile strong.tone-green { color: #1f7a4f; }

/* ---- Scheduling widget ---- */
.admin-schedule-card { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.admin-schedule-card h3 { font-size: 15px; font-weight: 700; margin: 0 0 2px; flex-basis: 100%; }
.admin-schedule-card p.admin-hint { font-size: 12.5px; color: var(--text-muted); margin: 0 0 6px; flex-basis: 100%; }
.admin-field-group { display: flex; flex-direction: column; gap: 6px; }
.admin-field-group label { font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }

/* ---- Form controls ---- */
.admin-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
.admin-input, .admin-select {
  border: 1px solid var(--border); background: #fffafd; border-radius: 9px; padding: 10px 13px; font-size: 13px;
  outline: none; color: var(--text); font-family: inherit; transition: border-color .15s, box-shadow .15s;
}
.admin-input:focus, .admin-select:focus { border-color: var(--brand); box-shadow: 0 0 0 4px var(--brand-tint-10); }
.admin-btn {
  border: 1px solid #dfcbd5; background: white; color: #624f5a; border-radius: 9px; padding: 9px 16px;
  font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: border-color .15s, color .15s;
}
.admin-btn:hover { border-color: var(--brand); color: var(--brand); }
.admin-btn-primary {
  background: var(--brand); color: white; border: 0; border-radius: 999px; padding: 11px 24px;
  box-shadow: 0 6px 16px rgba(139, 58, 98, .25); transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
}
.admin-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(139, 58, 98, .32); opacity: 1; color: white; }
.admin-btn-danger { background: #fff5f5; color: #c0392b; border: 1px solid #f2c6c6; }

/* ---- Tables ---- */
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.admin-table th { text-align: left; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: .03em; padding: 8px 10px; border-bottom: 1px solid var(--border); }
.admin-table td { padding: 10px; border-bottom: 1px solid #f5ebef; }
.admin-table tr:hover td { background: var(--rose-bg); cursor: pointer; }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
.status-payment_pending { background: #fff4dd; color: #92660a; }
/* Confirmed = scheduled but not yet resolved -> info blue, matching Upcoming's tint.
   Completed = a successful terminal state -> green, matching a successful payment. */
.status-confirmed { background: #e6eefc; color: #2255a4; }
.status-completed { background: #e4f4ec; color: #1f7a4f; }
.status-cancelled { background: #fbe6e6; color: #a83232; }
.status-no_show { background: #ececec; color: #555; }
.status-pending { background: #fff4dd; color: #92660a; }
.status-successful { background: #e4f4ec; color: #1f7a4f; }
.status-failed { background: #fbe6e6; color: #a83232; }
.status-refunded { background: #ececec; color: #555; }

.slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
.slot-pill { border-radius: 10px; padding: 10px; text-align: center; font-size: 13px; font-weight: 700; cursor: default; border: 1px solid var(--border); }
.slot-pill.available { background: #f5fbf7; color: #1f7a4f; }
.slot-pill.booked { background: #fdf3f3; color: #a83232; cursor: pointer; }

/* ---- Calendar ---- */
.calendar-card { padding-bottom: 18px; }
.calendar-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 18px; }
.calendar-nav-group { display: flex; align-items: center; gap: 8px; }
.calendar-arrow { flex-shrink: 0; }
.calendar-arrow-glyph.flip { display: inline-flex; transform: scaleX(-1); }
.calendar-select { min-width: 132px; font-weight: 700; }
.calendar-year-input { width: 88px; font-weight: 700; }

.calendar-weekdays {
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 8px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted);
  text-align: center;
}
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; transition: opacity .15s ease; }
.calendar-grid.calendar-loading { opacity: .45; }
.calendar-cell {
  position: relative; min-height: 78px; border-radius: 12px; border: 1px solid var(--border); background: #fffafd;
  padding: 8px; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; gap: 6px;
  font-family: inherit; cursor: pointer; transition: border-color .15s, box-shadow .15s, transform .15s;
}
.calendar-cell:hover { border-color: var(--brand); box-shadow: 0 6px 16px rgba(139, 58, 98, .1); transform: translateY(-1px); }
.calendar-cell.outside { visibility: hidden; cursor: default; border: none; box-shadow: none; }
.calendar-cell.past:not(.today) { background: #faf6f8; color: var(--text-faint); }
.calendar-cell.past:not(.today) .calendar-cell-day { color: var(--text-faint); }
.calendar-cell.today { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-tint-10); background: white; }
.calendar-cell-day { font-size: 13.5px; font-weight: 700; color: var(--text); }
.calendar-cell.today .calendar-cell-day {
  display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%;
  background: var(--brand); color: white; font-size: 12px;
}
.calendar-cell-badge {
  align-self: flex-start; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px;
  background: #e4f4ec; color: #1f7a4f;
}
.calendar-cell-badge.full { background: #fdeceb; color: #d6483f; }
.calendar-cell-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-faint); }

.calendar-legend { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 16px; font-size: 12px; color: var(--text-muted); }
.calendar-legend span { display: inline-flex; align-items: center; gap: 6px; }
.calendar-legend-swatch { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.calendar-legend-swatch.active { background: #1f7a4f; }
.calendar-legend-swatch.full { background: #d6483f; }
.calendar-legend-swatch.dot { background: var(--text-faint); }

@media (max-width: 640px) {
  .calendar-cell { min-height: 56px; padding: 6px; }
  .calendar-cell-badge { font-size: 10px; padding: 1px 6px; }
  .calendar-select { min-width: 0; flex: 1; }
}

.admin-login-wrap { min-height: 100vh; display: grid; place-items: center; }
.admin-login-card { background: white; border-radius: 18px; padding: 32px; width: 100%; max-width: 360px; box-shadow: 0 25px 70px rgba(90, 50, 70, .1); }
.admin-login-card h2 { color: var(--brand); margin-bottom: 6px; }
.admin-login-card p { color: var(--text-muted); font-size: 13px; margin-bottom: 20px; }
.admin-field { margin-bottom: 14px; }
.admin-field label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 6px; }
.admin-field input { width: 100%; }
.admin-password-field { position: relative; }
.admin-password-field input { padding-right: 40px; }
.admin-password-toggle {
  position: absolute; top: 50%; right: 4px; transform: translateY(-50%);
  width: 32px; height: 32px; border: none; background: none; cursor: pointer;
  display: grid; place-items: center; color: var(--text-muted); border-radius: 8px;
  transition: color .15s, background .15s;
}
.admin-password-toggle:hover { color: var(--brand); background: var(--brand-tint-05); }
.admin-error { color: #c0392b; font-size: 12px; margin-bottom: 12px; }
.admin-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; font-size: 13px; }
.admin-detail-grid dt { color: var(--text-muted); font-size: 11px; text-transform: uppercase; margin-bottom: 2px; }
.admin-detail-grid dd { font-weight: 600; }

@media (max-width: 1100px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .admin-shell { flex-direction: column; }
  .admin-sidebar { width: 100%; height: auto; position: relative; flex-direction: row; align-items: center; padding: 12px 16px; gap: 10px; }
  .admin-sidebar-brand { padding: 0; }
  .admin-sidenav { flex-direction: row; margin-top: 0; overflow-x: auto; }
  .admin-sidenav-link span { display: none; }
  .admin-sidenav-logout { margin-top: 0; }
  .admin-sidenav-logout span { display: none; }
  .admin-container { padding: 20px 16px 48px; }
  .admin-header { padding: 14px 16px; }
}
@media (max-width: 560px) {
  .stat-grid { grid-template-columns: 1fr; }
  .stat-tile strong { font-size: 22px; }
}
`;

export function injectAdminStyles() {
  const existing = document.getElementById("admin-styles");
  if (existing) {
    existing.textContent = css;
    return;
  }
  const styleTag = document.createElement("style");
  styleTag.id = "admin-styles";
  styleTag.textContent = css;
  document.head.appendChild(styleTag);
}
