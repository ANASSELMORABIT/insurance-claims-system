import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboardService";
import type { DashboardStats } from "../../types";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

/* ─── Design tokens (matching the dark sidebar example) ─── */
const C = {
  bg:       "#1e1e1e",
  card:     "#171717",
  cardAlt:  "#1a1a1a",
  border:   "#2e2e2e",
  text:     "#676767",
  textMid:  "#a0a0a0",
  textHi:   "#f0f0f0",
  cyan:     "#00D4FF",
  green:    "#00FF94",
  amber:    "#FFB800",
  red:      "#FF6B6B",
  purple:   "#B388FF",
  teal:     "#26D0CE",
  blue:     "#2f49d1",
};

const COLORS = [C.cyan, C.green, C.amber, C.red, C.purple];

const statusColor: Record<string, string> = {
  Pending:     C.amber,
  UnderReview: C.cyan,
  Approved:    C.green,
  Rejected:    C.red,
  Closed:      "#64748b",
};

/* ─── Shared card wrapper (matches .bg-card) ─── */
const Card = ({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      background: C.card,
      borderRadius: "12px",
      padding: "20px",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ─── Card title + subtitle row ─── */
const CardHeader = ({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: sub ? 4 : 16 }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.textHi, letterSpacing: 0.3 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: C.text, marginBottom: 16, marginTop: 2 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

/* ─── KPI stat card (sidebar-example style: left accent bar + progress line) ─── */
const StatCard = ({
  label,
  value,
  color,
  icon,
  fillPct = 60,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: string;
  fillPct?: number;
}) => (
  <div
    style={{
      background: C.card,
      borderRadius: 12,
      padding: "16px",
      borderLeft: `3px solid ${color}`,
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s",
      cursor: "default",
    }}
    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.text, marginBottom: 8 }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: C.textHi, lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ fontSize: 22, opacity: 0.25 }}>{icon}</div>
    </div>
    {/* progress bar */}
    <div style={{ marginTop: 10, height: 2, background: "#2a2a2a", borderRadius: 1 }}>
      <div style={{ height: "100%", width: `${fillPct}%`, background: color, borderRadius: 1 }} />
    </div>
  </div>
);

/* ─── Amount card (gradient or plain) ─── */
const AmountCard = ({
  label,
  children,
  gradient = false,
}: {
  label: string;
  children: React.ReactNode;
  gradient?: boolean;
}) => (
  <div
    style={{
      background: gradient
        ? "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,255,148,0.04))"
        : C.card,
      border: gradient ? `1px solid rgba(0,212,255,0.15)` : `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "20px",
    }}
  >
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: C.text, marginBottom: 8 }}>
      {label}
    </div>
    {children}
  </div>
);

/* ─── Status pill ─── */
const StatusPill = ({ status }: { status: string }) => {
  const color = statusColor[status] || "#64748b";
  return (
    <span
      style={{
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 20,
        fontWeight: 700,
        background: `${color}18`,
        color,
        border: `1px solid ${color}33`,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

/* ─── Dots menu icon ─── */
const DotsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
  </svg>
);

/* ─── Custom tooltip for charts ─── */
const ChartTooltip = () => (
  <div
    style={{
      background: "#1d1d1d",
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      color: C.textHi,
    }}
  />
);

/* ════════════════════════════════════════════
   Main Dashboard component
   ════════════════════════════════════════════ */
export default function Dashboard() {
  const { isAdmin, isAgent, isClient } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = isAdmin
          ? await dashboardService.getStats()
          : isAgent
          ? await dashboardService.getAgentStats()
          : await dashboardService.getClientStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin, isAgent, isClient]);

  if (loading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: C.cyan, fontFamily: "'Nunito', sans-serif", fontSize: 18, fontWeight: 700 }}>
          Loading...
        </div>
      </div>
    );

  if (!stats) return null;

  /* derive fill percentages for KPI bars */
  const total = stats.totalClaims || 1;
  const pct = (n: number) => Math.round((n / total) * 100);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", color: C.text, animation: "fadeIn 0.4s ease" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: C.cyan, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 6 }}>
              OVERVIEW
            </div>
            <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 900, color: C.textHi, margin: 0, letterSpacing: "-0.5px" }}>
              Dashboard
            </h1>
          </div>
          {/* PREMIUM badge (matching example) */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: C.card, borderRadius: 10, padding: "4px 10px",
            border: `1px solid ${C.border}`, marginTop: 16,
          }}>
            <span style={{ fontSize: 14 }}>⭐</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#f7b91c", letterSpacing: 1 }}>PREMIUM</span>
          </div>
        </div>
        <p style={{ color: C.text, marginTop: 4, fontSize: 13 }}>Real-time insurance claims analytics</p>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Claims"  value={stats.totalClaims}       color={C.cyan}   icon="📋" fillPct={80} />
        <StatCard label="Pending"       value={stats.pendingClaims}      color={C.amber}  icon="⏳" fillPct={pct(stats.pendingClaims)} />
        <StatCard label="Under Review"  value={stats.underReviewClaims}  color={C.purple} icon="🔍" fillPct={pct(stats.underReviewClaims)} />
        <StatCard label="Approved"      value={stats.approvedClaims}     color={C.green}  icon="✅" fillPct={pct(stats.approvedClaims)} />
        <StatCard label="Rejected"      value={stats.rejectedClaims}     color={C.red}    icon="❌" fillPct={pct(stats.rejectedClaims)} />
        {isAdmin && (
          <StatCard label="Total Clients" value={stats.totalClients} color={C.teal} icon="👥" fillPct={60} />
        )}
      </div>

      {/* ── Amount cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
        <AmountCard label="Total Estimated" gradient>
          <div style={{
            fontSize: 26, fontWeight: 900,
            background: `linear-gradient(90deg, ${C.cyan}, ${C.green})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            ${stats.totalEstimatedAmount.toLocaleString()}
          </div>
        </AmountCard>
        <AmountCard label="Avg per Claim">
          <div style={{ fontSize: 26, fontWeight: 900, color: C.amber }}>
            ${Math.round(stats.averageEstimatedAmount).toLocaleString()}
          </div>
        </AmountCard>
        <AmountCard label="Documents">
          <div style={{ fontSize: 26, fontWeight: 900, color: C.purple }}>
            {stats.totalDocuments}
          </div>
        </AmountCard>
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 20 }}>

        {/* Bar / Line chart — matches "Your Work Summary" panel */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textHi }}>Claims by Month</div>
              <div style={{ fontSize: 11, color: C.text, marginBottom: 12 }}>
                {stats.claimsByMonth[0]?.month ?? ""} – {stats.claimsByMonth[stats.claimsByMonth.length - 1]?.month ?? ""}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: C.blue, display: "inline-block" }} />
                Actual
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, marginLeft: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: "#333", border: "1px dashed #555", display: "inline-block" }} />
                Trend
              </div>
            </div>
          </div>

          {stats.claimsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.claimsByMonth}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.blue} />
                    <stop offset="100%" stopColor="#6c3fc9" />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal={false} strokeWidth={4} stroke="#252525" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text }} tickMargin={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text }} tickMargin={8} />
                <Tooltip
                  contentStyle={{ background: "#1d1d1d", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textHi, fontSize: 12 }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }}>
              No data yet
            </div>
          )}
        </Card>

        {/* Pie chart — matches "Top Countries" style panel */}
        <Card>
          <CardHeader title="Claims by Type" sub="By volume" action={<DotsIcon />} />

          {stats.claimsByType.length > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <PieChart width={140} height={140}>
                  <Pie
                    data={stats.claimsByType}
                    cx={65} cy={65}
                    innerRadius={38} outerRadius={65}
                    dataKey="count"
                    paddingAngle={3}
                  >
                    {stats.claimsByType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1d1d1d", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textHi, fontSize: 12 }} />
                </PieChart>
              </div>
              <div>
                {stats.claimsByType.map((item, i) => (
                  <div key={item.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: 12, color: C.textMid }}>{item.type}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.textHi }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: 13 }}>
              No data yet
            </div>
          )}
        </Card>
      </div>

      {/* ── Recent Claims table ── */}
      <Card>
        <CardHeader title="Recent Claims" sub="Latest insurance submissions" action={<DotsIcon />} />

        {stats.recentClaims.length === 0 ? (
          <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: 32 }}>No claims yet</div>
        ) : (
          <div>
            {/* table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
              gap: 16,
              padding: "0 0 10px",
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 4,
            }}>
              {["Title", "Type", "Status", "Client", "Amount"].map(h => (
                <div key={h} style={{ fontSize: 10, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {/* rows */}
            {stats.recentClaims.map(claim => (
              <div
                key={claim.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                  gap: 16,
                  padding: "12px 0",
                  borderBottom: `1px solid #1e1e1e`,
                  transition: "background 0.15s",
                  cursor: "pointer",
                  borderRadius: 6,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#1c1c1c")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontSize: 13, color: C.textHi, fontWeight: 600 }}>
                  #{claim.id} {claim.title}
                </div>
                <div style={{ fontSize: 12, color: C.text }}>{claim.type}</div>
                <div><StatusPill status={claim.status} /></div>
                <div style={{ fontSize: 12, color: C.text }}>{claim.clientName}</div>
                <div style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>
                  {claim.estimatedAmount ? `$${claim.estimatedAmount.toLocaleString()}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
