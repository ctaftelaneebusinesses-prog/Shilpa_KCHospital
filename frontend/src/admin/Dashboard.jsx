import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "../api";
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  IconHourglass,
  IconShieldCheck,
  IconTrendingUp,
  IconWallet,
  IconXCircle,
} from "./icons";

const todayISO = () => new Date().toISOString().split("T")[0];

const APPOINTMENT_TILES = [
  { key: "totalAppointments", label: "Total Appointments", icon: IconCalendar, tint: "tint-blue" },
  { key: "todayAppointments", label: "Today's Appointments", icon: IconClock, tint: "tint-purple" },
  { key: "upcomingAppointments", label: "Upcoming Appointments", icon: IconTrendingUp, tint: "tint-teal" },
  { key: "completedAppointments", label: "Completed", icon: IconCheckCircle, tint: "tint-green" },
  { key: "cancelledAppointments", label: "Cancelled", icon: IconAlertTriangle, tint: "tint-red", pill: "stat-pill-red" },
  { key: "pendingAppointments", label: "Pending Payment", icon: IconHourglass, tint: "tint-amber", pill: "stat-pill-amber" },
];

const PAYMENT_TILES = [
  { key: "successfulPayments", label: "Successful Payments", icon: IconShieldCheck, tint: "tint-green", pill: "stat-pill-green" },
  { key: "pendingPayments", label: "Pending Payments", icon: IconHourglass, tint: "tint-amber", pill: "stat-pill-amber" },
  { key: "failedPayments", label: "Failed Payments", icon: IconXCircle, tint: "tint-red", pill: "stat-pill-red" },
];

function StatTile({ label, value, icon: Icon, tint, pill }) {
  return (
    <div className="stat-tile">
      <div className={`stat-tile-icon ${tint}`}>
        <Icon size={17} />
      </div>
      <strong>{pill ? <span className={`stat-pill ${pill}`}>{value}</span> : value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [date, setDate] = useState(todayISO());

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch((err) => setError(err.message || "Failed to load dashboard."));
  }, []);

  return (
    <>
      <h2>Dashboard</h2>
      {error && <p className="admin-error">{error}</p>}

      {stats && (
        <>
          <div className="admin-section-title">Appointments</div>
          <div className="stat-grid" style={{ marginBottom: 8 }}>
            {APPOINTMENT_TILES.map((tile) => (
              <StatTile key={tile.key} {...tile} value={stats[tile.key]} />
            ))}
          </div>

          <div className="admin-section-title">Payments &amp; Revenue</div>
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            {PAYMENT_TILES.map((tile) => (
              <StatTile key={tile.key} {...tile} value={stats[tile.key]} />
            ))}
            <StatTile label="Total Revenue" value={`₹${stats.totalRevenue}`} icon={IconWallet} tint="tint-brand" />
          </div>
        </>
      )}

      <div className="admin-card admin-schedule-card">
        <h3>View a Date</h3>
        <p className="admin-hint">Jump straight to a day's slot schedule.</p>
        <div className="admin-field-group">
          <label htmlFor="dashboard-date">Date</label>
          <input
            id="dashboard-date"
            type="date"
            className="admin-input"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate(`/admin/dates/${date}`)}>
          View Slots
        </button>
      </div>
    </>
  );
}
