// Minimal inline SVG icon set for the admin dashboard. Kept dependency-free
// (no icon package) — every icon is a small stroke-based line drawing sized
// via the `size` prop so it inherits `currentColor` for easy tinting.
const base = (size) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export function IconDashboard({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="3" width="7.5" height="9" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.6" />
      <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.6" />
      <rect x="3" y="15" width="7.5" height="6" rx="1.6" />
    </svg>
  );
}

export function IconAppointments({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.2" />
      <path d="M3 9.5h18" />
      <path d="M8 2.5v4M16 2.5v4" />
      <path d="M7.5 13.5h3M7.5 17h6" />
    </svg>
  );
}

export function IconPayments({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
      <path d="M2.5 9.5h19" />
      <path d="M6 14.5h4" />
    </svg>
  );
}

export function IconSettings({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.6a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H2.4a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.04 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H8.5a1.7 1.7 0 0 0 1.04-1.56V2.4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04z" />
    </svg>
  );
}

export function IconBell({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function IconLogout({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function IconChevronRight({ size = 14 }) {
  return (
    <svg {...base(size)}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function IconCalendar({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <rect x="3" y="4.5" width="18" height="16" rx="2.2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </svg>
  );
}

export function IconClock({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
}

export function IconTrendingUp({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M3 16l6-6 4 4 8-9" />
      <path d="M15 5h6v6" />
    </svg>
  );
}

export function IconCheckCircle({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5.4" />
    </svg>
  );
}

export function IconAlertTriangle({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 9.5v4.2" />
      <path d="M12 17.2h.01" />
    </svg>
  );
}

export function IconHourglass({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 4.2 2.8 6.3 5 8.5 2.2 2.2 5 4.3 5 8.5M17 3c0 4.2-2.8 6.3-5 8.5-2.2 2.2-5 4.3-5 8.5" />
    </svg>
  );
}

export function IconShieldCheck({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6l7-3Z" />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.6" />
    </svg>
  );
}

export function IconXCircle({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

export function IconWallet({ size = 18 }) {
  return (
    <svg {...base(size)}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h11A2.5 2.5 0 0 1 19 7.5" />
      <rect x="3" y="7.5" width="18" height="12" rx="2.3" />
      <path d="M15.5 13.5h2.5" />
    </svg>
  );
}
