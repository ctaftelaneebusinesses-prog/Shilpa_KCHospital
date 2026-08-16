import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminCalendarSummary } from "../api";
import { IconChevronRight } from "./icons";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAILY_CAPACITY = 10; // keep in sync with backend DAILY_CAPACITY (slots.py: 1:00 PM-2:40 PM, every 10 min)

const pad2 = (n) => String(n).padStart(2, "0");
const toDateKey = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

function buildGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export default function Calendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  useEffect(() => {
    const monthParam = `${viewYear}-${pad2(viewMonth + 1)}`;
    setLoading(true);
    setError("");
    getAdminCalendarSummary(monthParam)
      .then((data) => setSummary(data.summary || {}))
      .catch((err) => setError(err.message || "Failed to load calendar."))
      .finally(() => setLoading(false));
  }, [viewYear, viewMonth]);

  function goToMonth(deltaMonths) {
    let nextMonth = viewMonth + deltaMonths;
    let nextYear = viewYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setViewMonth(nextMonth);
    setViewYear(nextYear);
  }

  function goToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  function openDate(day) {
    if (!day) return;
    navigate(`/admin/dates/${toDateKey(viewYear, viewMonth, day)}`);
  }

  const cells = buildGrid(viewYear, viewMonth);

  return (
    <>
      <h2>Calendar</h2>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-card calendar-card">
        <div className="calendar-header">
          <div className="calendar-nav-group">
            <button
              type="button"
              className="admin-icon-btn calendar-arrow"
              onClick={() => goToMonth(-1)}
              aria-label="Previous month"
            >
              <span className="calendar-arrow-glyph flip">
                <IconChevronRight size={15} />
              </span>
            </button>

            <select
              className="admin-select calendar-select"
              value={viewMonth}
              onChange={(event) => setViewMonth(Number(event.target.value))}
              aria-label="Month"
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="admin-input calendar-year-input"
              value={viewYear}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isNaN(value)) setViewYear(value);
              }}
              aria-label="Year"
            />

            <button
              type="button"
              className="admin-icon-btn calendar-arrow"
              onClick={() => goToMonth(1)}
              aria-label="Next month"
            >
              <IconChevronRight size={15} />
            </button>
          </div>

          <button type="button" className="admin-btn" onClick={goToToday}>
            Today
          </button>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className={`calendar-grid${loading ? " calendar-loading" : ""}`}>
          {cells.map((day, index) => {
            if (!day) return <div key={`blank-${index}`} className="calendar-cell outside" />;

            const dateKey = toDateKey(viewYear, viewMonth, day);
            const stats = summary[dateKey];
            const isToday = dateKey === todayKey;
            const isPast = dateKey < todayKey;

            return (
              <button
                type="button"
                key={dateKey}
                className={`calendar-cell${isToday ? " today" : ""}${isPast ? " past" : ""}`}
                onClick={() => openDate(day)}
              >
                <span className="calendar-cell-day">{day}</span>
                {stats?.active > 0 && (
                  <span className={`calendar-cell-badge${stats.active >= DAILY_CAPACITY ? " full" : ""}`}>
                    {stats.active}/{DAILY_CAPACITY}
                  </span>
                )}
                {!stats?.active && (stats?.cancelled > 0 || stats?.noShow > 0) && (
                  <span className="calendar-cell-dot" title="Has cancelled / no-show appointments" />
                )}
              </button>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span><i className="calendar-legend-swatch active" /> Bookings</span>
          <span><i className="calendar-legend-swatch full" /> Fully booked</span>
          <span><i className="calendar-legend-swatch dot" /> Cancelled / no-show only</span>
        </div>
      </div>
    </>
  );
}
