// Consistent ₹ formatting across the admin dashboard (2 decimals, en-IN
// thousands grouping) so amounts never render as "₹500" next to "₹1250.5".
export function formatINR(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function to12Hour(hours, minutes) {
  const period = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${period}`;
}

// One date style everywhere in the admin UI: "28 Aug 2026". Avoids both the
// appointments table's raw "2026-08-28" and the locale-dependent, region-
// ambiguous "8/13/2026" the Paid On column used to show.
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// One time style everywhere: 12-hour with AM/PM, e.g. "16:00" -> "4:00 PM".
export function formatTime(timeStr) {
  if (!timeStr) return "-";
  const [h, m] = timeStr.split(":").map(Number);
  if (Number.isNaN(h)) return timeStr;
  return to12Hour(h, m || 0);
}

// For timestamp columns (created_at etc.) - same date + time style as above,
// instead of the browser-locale-dependent toLocaleString().
export function formatDateTime(isoString) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${to12Hour(d.getHours(), d.getMinutes())}`;
}
