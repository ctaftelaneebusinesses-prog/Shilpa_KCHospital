import { useEffect, useMemo, useRef, useState } from "react";
import { getAdminAnalytics } from "../api";
import { formatDate, formatINR } from "./format";

// This admin console is light-mode only (no theme toggle exists anywhere
// else in adminStyles.js), so these two accent hues only need to be picked
// for the light chart surface (#ffffff) - both verified >=3:1 mark contrast
// against it before use (brand wine 7.29:1, green 4.95:1).
const APPOINTMENTS_COLOR = "#8b3a62"; // this app's own brand color
const REVENUE_COLOR = "#008300"; // money/growth green

const RANGE_OPTIONS = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

const CHART_WIDTH = 760;
const CHART_HEIGHT = 260;
const MARGIN = { top: 16, right: 12, bottom: 30, left: 48 };
const PLOT_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

function niceNumber(value) {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  let niceFraction;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
}

function niceTicks(maxValue, tickCount = 4) {
  if (maxValue <= 0) return [0, 1];
  // Round the step first, then snap the ceiling to a clean multiple of it -
  // rounding the max and the step independently can overshoot badly (a
  // ₹21,500 max was producing a ₹60,000 ceiling, leaving bars filling only
  // ~36% of the chart).
  const step = niceNumber(maxValue / (tickCount - 1));
  const top = Math.ceil(maxValue / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

function formatCompact(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toLocaleString("en-IN");
}

function deltaBadge(current, previous) {
  if (!previous) {
    return current > 0 ? { text: "New", tone: "up" } : null;
  }
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { text: "No change", tone: "flat" };
  return {
    text: `${pct > 0 ? "▲" : "▼"} ${Math.abs(pct).toFixed(0)}% vs previous period`,
    tone: pct > 0 ? "up" : "down",
  };
}

function labelStep(count) {
  return Math.max(1, Math.ceil(count / 7));
}

function TrendChart({ title, series, type, color, formatValue, formatTick, valueKey, totals, totalsKey }) {
  const svgRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const values = series.map((row) => row[valueKey]);
  const maxValue = Math.max(0, ...values);
  const ticks = niceTicks(maxValue);
  const axisMax = ticks[ticks.length - 1] || 1;
  const n = series.length;
  const step = labelStep(n);

  const yFor = (value) => MARGIN.top + PLOT_HEIGHT - (value / axisMax) * PLOT_HEIGHT;
  const xForIndex = (index) =>
    n <= 1 ? MARGIN.left + PLOT_WIDTH / 2 : MARGIN.left + (index / (n - 1)) * PLOT_WIDTH;
  const bandWidth = PLOT_WIDTH / n;
  const barWidth = Math.min(24, bandWidth * 0.6);

  const linePoints = useMemo(
    () => series.map((row, i) => [xForIndex(i), yFor(row[valueKey])]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, axisMax]
  );
  const areaPath = useMemo(() => {
    if (type !== "area" || linePoints.length === 0) return "";
    const baseline = yFor(0);
    const top = linePoints.map(([x, y]) => `${x},${y}`).join(" L ");
    const first = linePoints[0][0];
    const last = linePoints[linePoints.length - 1][0];
    return `M ${first},${baseline} L ${top} L ${last},${baseline} Z`;
  }, [linePoints, type]); // eslint-disable-line react-hooks/exhaustive-deps
  const linePath = useMemo(
    () => (type === "area" ? linePoints.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x},${y}`).join(" ") : ""),
    [linePoints, type]
  );

  function handlePointerMove(event) {
    if (!svgRef.current || n === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const index = Math.round(((relativeX - MARGIN.left) / PLOT_WIDTH) * (n - 1));
    setHoverIndex(Math.min(n - 1, Math.max(0, index)));
  }

  const hovered = hoverIndex != null ? series[hoverIndex] : null;
  const lastRow = series[series.length - 1];
  const delta = totals ? deltaBadge(totals[totalsKey.current], totals[totalsKey.previous]) : null;

  return (
    <div className="admin-card analytics-card">
      <div className="analytics-card-header">
        <div>
          <h3>{title}</h3>
          <div className="analytics-total">
            {formatValue(totals ? totals[totalsKey.current] : 0)}
            {delta && <span className={`analytics-delta analytics-delta-${delta.tone}`}>{delta.text}</span>}
          </div>
        </div>
        <button type="button" className="admin-btn analytics-table-toggle" onClick={() => setShowTable((v) => !v)}>
          {showTable ? "View chart" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <div className="analytics-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>{title}</th>
              </tr>
            </thead>
            <tbody>
              {[...series].reverse().map((row) => (
                <tr key={row.date}>
                  <td>{formatDate(row.date)}</td>
                  <td>{formatValue(row[valueKey])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="analytics-chart-wrap">
          <svg
            ref={svgRef}
            className="analytics-svg"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIndex(null)}
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={CHART_WIDTH - MARGIN.right}
                  y1={yFor(tick)}
                  y2={yFor(tick)}
                  className="analytics-gridline"
                />
                <text x={MARGIN.left - 8} y={yFor(tick)} className="analytics-axis-label" textAnchor="end" dy="0.32em">
                  {formatTick(tick)}
                </text>
              </g>
            ))}

            <line
              x1={MARGIN.left}
              x2={CHART_WIDTH - MARGIN.right}
              y1={yFor(0)}
              y2={yFor(0)}
              className="analytics-baseline"
            />

            {series.map((row, i) =>
              i % step === 0 ? (
                <text
                  key={row.date}
                  x={xForIndex(i)}
                  y={CHART_HEIGHT - MARGIN.bottom + 18}
                  className="analytics-axis-label"
                  textAnchor="middle"
                >
                  {formatDate(row.date).replace(/ \d{4}$/, "")}
                </text>
              ) : null
            )}

            {type === "bar" &&
              series.map((row, i) => {
                const x = xForIndex(i) - barWidth / 2;
                const y = yFor(row[valueKey]);
                const height = Math.max(0, yFor(0) - y);
                const radius = height > 4 ? 4 : height / 2;
                return (
                  <path
                    key={row.date}
                    d={`M ${x} ${y + radius}
                        Q ${x} ${y} ${x + radius} ${y}
                        L ${x + barWidth - radius} ${y}
                        Q ${x + barWidth} ${y} ${x + barWidth} ${y + radius}
                        L ${x + barWidth} ${y + height}
                        L ${x} ${y + height} Z`}
                    fill={color}
                    opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.55}
                  />
                );
              })}

            {type === "area" && (
              <>
                <path d={areaPath} fill={color} opacity={0.1} />
                <path d={linePath} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
              </>
            )}

            {type === "area" && lastRow && (
              <>
                <circle
                  cx={linePoints[linePoints.length - 1][0]}
                  cy={linePoints[linePoints.length - 1][1]}
                  r={4}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                <text
                  x={linePoints[linePoints.length - 1][0]}
                  y={linePoints[linePoints.length - 1][1] - 10}
                  textAnchor="end"
                  className="analytics-end-label"
                  fill={color}
                >
                  {formatValue(lastRow[valueKey])}
                </text>
              </>
            )}

            {hovered && (
              <>
                <line
                  x1={xForIndex(hoverIndex)}
                  x2={xForIndex(hoverIndex)}
                  y1={MARGIN.top}
                  y2={CHART_HEIGHT - MARGIN.bottom}
                  className="analytics-crosshair"
                />
                <circle
                  cx={xForIndex(hoverIndex)}
                  cy={yFor(hovered[valueKey])}
                  r={4}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </>
            )}
          </svg>

          {hovered && (
            <div
              className="analytics-tooltip"
              style={{
                left: `${(xForIndex(hoverIndex) / CHART_WIDTH) * 100}%`,
                top: `${(yFor(hovered[valueKey]) / CHART_HEIGHT) * 100}%`,
              }}
            >
              <strong>{formatValue(hovered[valueKey])}</strong>
              <span>{formatDate(hovered.date)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsSection() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getAdminAnalytics(days)
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <>
      <div className="admin-section-title">Trends</div>

      <div className="analytics-range-row">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.days}
            type="button"
            className={`admin-btn analytics-range-btn${days === option.days ? " active" : ""}`}
            onClick={() => setDays(option.days)}
          >
            Last {option.label}
          </button>
        ))}
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="analytics-grid" style={{ opacity: loading ? 0.55 : 1 }}>
        {data && (
          <>
            <TrendChart
              title="Appointments"
              series={data.series}
              type="bar"
              color={APPOINTMENTS_COLOR}
              valueKey="appointments"
              formatValue={(v) => Math.round(v).toLocaleString("en-IN")}
              formatTick={formatCompact}
              totals={data.totals}
              totalsKey={{ current: "appointments", previous: "previousAppointments" }}
            />
            <TrendChart
              title="Revenue"
              series={data.series}
              type="area"
              color={REVENUE_COLOR}
              valueKey="revenue"
              formatValue={formatINR}
              formatTick={(v) => `₹${formatCompact(v)}`}
              totals={data.totals}
              totalsKey={{ current: "revenue", previous: "previousRevenue" }}
            />
          </>
        )}
      </div>
    </>
  );
}
