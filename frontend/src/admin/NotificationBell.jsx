import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminNotifications } from "../api";
import { IconBell } from "./icons";

const LAST_SEEN_KEY = "admin_notifications_last_seen";
const POLL_MS = 30000;

function timeAgo(isoString) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const lastSeenRef = useRef(localStorage.getItem(LAST_SEEN_KEY) || "1970-01-01T00:00:00.000Z");
  const containerRef = useRef(null);
  const navigate = useNavigate();

  async function refresh() {
    try {
      const data = await getAdminNotifications();
      const notifications = data?.notifications || [];
      setItems(notifications);
      setUnreadCount(notifications.filter((item) => item.updated_at > lastSeenRef.current).length);
    } catch {
      // Silent: the bell is a convenience surface, not the source of truth.
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = new Date().toISOString();
      lastSeenRef.current = now;
      localStorage.setItem(LAST_SEEN_KEY, now);
      setUnreadCount(0);
    }
  }

  function goToAppointment(item) {
    setOpen(false);
    navigate(`/admin/dates/${item.appointment_date}`);
  }

  return (
    <div className="admin-notif" ref={containerRef}>
      <button className="admin-icon-btn" aria-label="Notifications" onClick={toggleOpen}>
        <IconBell size={19} />
        {unreadCount > 0 && <span className="admin-notif-dot" />}
      </button>

      {open && (
        <div className="admin-notif-panel">
          <div className="admin-notif-panel-header">Recent bookings</div>
          {items.length === 0 && <div className="admin-notif-empty">No confirmed bookings yet.</div>}
          <div className="admin-notif-list">
            {items.map((item) => (
              <button key={item.id} className="admin-notif-item" onClick={() => goToAppointment(item)}>
                <span className="admin-notif-item-title">{item.patient_name}</span>
                <span className="admin-notif-item-meta">{item.appointment_date}</span>
                <span className="admin-notif-item-time">{timeAgo(item.updated_at)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
