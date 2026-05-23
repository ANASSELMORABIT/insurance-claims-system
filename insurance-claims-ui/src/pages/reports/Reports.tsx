import { useQuery } from "@tanstack/react-query";
import { reportsService } from "../../services/reportsService";
import { useWindowSize } from "../../hooks/useWindowSize";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const C = {
  card: "#171717", border: "#2e2e2e",
  text: "#676767", textMid: "#a0a0a0", textHi: "#f0f0f0",
  cyan: "#00D4FF", green: "#00FF94", amber: "#FFB800",
  red: "#FF6B6B", purple: "#B388FF", teal: "#26D0CE",
};

const COLORS = [C.cyan, C.green, C.amber, C.red, C.purple, C.teal];

const tooltipStyle = {
  contentStyle: { background: "#1d1d1d", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textHi, fontSize: 12 },
  cursor: { fill: "rgba(255,255,255,0.03)" },
};

// KPI card with growth indicator
const KpiCard = ({ label, value, growth, prefix = "", suffix = "", icon, color }: {
  label: string; value: number; growth: number;
  prefix?: string; suffix?: string; icon: string; color: string;
}) => (
  <div style={{
    background: C.card, borderRadius: 12, padding: "20px",
    borderTop: `3px solid ${color}`,
    display: "flex", flexDirection: "column", gap: "8px",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: C.text, letterSpacing: "1px", textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 20, opacity: 0.3 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 900, color: C.textHi }}>
      {prefix}{typeof value === "number" && value > 999 ? value.toLocaleString() : value}{suffix}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{
        fontSize: 11, fontWeight: 700,
        color: growth >= 0 ? C.green : C.red,
        display: "flex", alignItems: "center", gap: "2px",
      }}>
        {growth >= 0 ? "↑" : "↓"} {Math.abs(growth)}%
      </span>
      <span style={{ fontSize: 11, color: C.text }}>vs last month</span>
    </div>
  </div>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ fontSize: 15, fontWeight: 800, color: C.textHi, margin: 0, letterSpacing: "-0.3px" }}>{title}</h2>
    {subtitle && <p style={{ fontSize: 12, color: C.text, margin: "4px 0 0" }}>{subtitle}</p>}
  </div>
);

const statusColors: Record<string, string> = {
  Pending: C.amber, UnderReview: C.cyan,
  Approved: C.green, Rejected: C.red, Closed: "#64748b",
};

export default function Reports() {
  const { isMobile } = useWindowSize();

  const { data, isLoading } = useQuery({
    queryKey: ["reports-overview"],
    queryFn: reportsService.getOverview,
  });

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ color: C.cyan, fontSize: 18, fontWeight: 700 }}>Loading reports...</div>
    </div>
  );

  if (!data) return null;

  // Prepare status distribution data for pie
  const statusData = [
    { name: "Pending", value: data.statusDistribution.pending },
    { name: "Under Review", value: data.statusDistribution.underReview },
    { name: "Approved", value: data.statusDistribution.approved },
    { name: "Rejected", value: data.statusDistribution.rejected },
    { name: "Closed", value: data.statusDistribution.closed },
  ].filter(d => d.value > 0);

  // Radar data for agent performance
  const radarData = data.agentPerformance.slice(0, 5).map(a => ({
    agent: a.agentName.split(" ")[0],
    assigned: a.totalAssigned,
    resolved: a.resolved,
    rate: a.resolutionRate,
  }));

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: C.cyan, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 6 }}>ADMIN ONLY</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? 24 : 32, fontWeight: 900, color: C.textHi, margin: 0 }}>
          Analytics & Reports
        </h1>
        <p style={{ color: C.text, marginTop: 4, fontSize: 13 }}>
          Full visibility into claims performance, costs and agent workload
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        <KpiCard label="Claims This Month" value={data.totalClaimsThisMonth} growth={data.claimsGrowthPct} icon="📋" color={C.cyan} />
        <KpiCard label="Revenue This Month" value={data.totalAmountThisMonth} growth={data.amountGrowthPct} prefix="$" icon="💰" color={C.green} />
        <KpiCard label="Avg Resolution" value={data.avgResolutionDays} growth={-data.resolutionDaysChange} suffix=" days" icon="⏱️" color={C.amber} />
        <KpiCard label="Open Claims" value={data.openClaims} growth={0} icon="🔓" color={C.purple} />
      </div>

      {/* Monthly Trend + Daily Activity */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 16, marginBottom: 28 }}>

        {/* Area chart — Monthly Trend */}
        <div style={{ background: C.card, borderRadius: 12, padding: "20px" }}>
          <SectionTitle title="Monthly Trend" subtitle="Claims created vs resolved over 6 months" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthlyTrend}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.cyan} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text }} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="created" stroke={C.cyan} fill="url(#gradCreated)" strokeWidth={2} name="Created" />
              <Area type="monotone" dataKey="resolved" stroke={C.green} fill="url(#gradResolved)" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {[{ color: C.cyan, label: "Created" }, { color: C.green, label: "Resolved" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 11, color: C.text }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart — Daily Activity */}
        <div style={{ background: C.card, borderRadius: 12, padding: "20px" }}>
          <SectionTitle title="Daily Activity" subtitle="Claims created last 7 days" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.dailyActivity} barSize={24}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill={C.purple} radius={[4, 4, 0, 0]} name="Claims" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance */}
      <div style={{ background: C.card, borderRadius: 12, padding: "20px", marginBottom: 28 }}>
        <SectionTitle title="Agent Workload & Performance" subtitle="Claims assigned, resolved and resolution rate per agent" />

        {data.agentPerformance.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: C.text, fontSize: 13 }}>
            No agents assigned yet. Create agents in Users management.
          </div>
        ) : (
          <div>
            {/* Desktop table */}
            {!isMobile ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 120px", gap: 16, padding: "10px 0", borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
                  {["Agent", "Assigned", "Resolved", "Pending", "Avg Days", "Amount", "Rate"].map(h => (
                    <div key={h} style={{ fontSize: 10, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>{h}</div>
                  ))}
                </div>
                {data.agentPerformance.map((agent, i) => (
                  <div key={agent.agentId} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 120px",
                    gap: 16, padding: "14px 0",
                    borderBottom: `1px solid #1e1e1e`,
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#1c1c1c")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${COLORS[i % COLORS.length]}20`,
                        border: `1px solid ${COLORS[i % COLORS.length]}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length],
                        flexShrink: 0,
                      }}>
                        {agent.agentName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.textHi }}>{agent.agentName}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: C.textHi, fontWeight: 600 }}>{agent.totalAssigned}</div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: C.green }}>{agent.resolved}</div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{
                        fontSize: 12, padding: "2px 8px", borderRadius: 20,
                        background: agent.pending > 5 ? "rgba(255,107,107,0.1)" : "rgba(255,184,0,0.1)",
                        color: agent.pending > 5 ? C.red : C.amber,
                        border: `1px solid ${agent.pending > 5 ? "rgba(255,107,107,0.2)" : "rgba(255,184,0,0.2)"}`,
                        fontWeight: 600,
                      }}>{agent.pending}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: C.textMid }}>{agent.avgResolutionDays}d</div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: C.cyan, fontWeight: 600 }}>
                      ${agent.totalAmountHandled.toLocaleString()}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#2a2a2a", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${agent.resolutionRate}%`, background: agent.resolutionRate > 70 ? C.green : agent.resolutionRate > 40 ? C.amber : C.red, borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.textMid, minWidth: 30 }}>{agent.resolutionRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Mobile cards */
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.agentPerformance.map((agent, i) => (
                  <div key={agent.agentId} style={{ padding: "14px", background: "#1c1c1c", borderRadius: 8, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.textHi }}>{agent.agentName}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{agent.resolutionRate}% rate</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[
                        { label: "Assigned", value: agent.totalAssigned, color: C.cyan },
                        { label: "Resolved", value: agent.resolved, color: C.green },
                        { label: "Pending", value: agent.pending, color: C.amber },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: 10, color: C.text }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, height: 4, background: "#2a2a2a", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${agent.resolutionRate}%`, background: C.green, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cost by Type + Status Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 28 }}>

        {/* Cost by type — horizontal bar */}
        <div style={{ background: C.card, borderRadius: 12, padding: "20px" }}>
          <SectionTitle title="Cost by Claim Type" subtitle="Total estimated amount per type" />
          {data.costByType.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: C.text, fontSize: 13 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.costByType} layout="vertical" barSize={16}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: C.text }}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.textMid }} width={50} />
               <Tooltip
                    contentStyle={{ background: "#1d1d1d", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textHi, fontSize: 12 }}
                    formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, "Total"]}
                    />
                <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]} name="Total Amount">
                  {data.costByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {/* Avg per type */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.costByType.map((t, i) => (
              <div key={t.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                  <span style={{ fontSize: 12, color: C.textMid }}>{t.type}</span>
                  <span style={{ fontSize: 11, color: "#444" }}>({t.count} claims)</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textHi }}>
                  avg ${Math.round(t.avgAmount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution pie */}
        <div style={{ background: C.card, borderRadius: 12, padding: "20px" }}>
          <SectionTitle title="Status Distribution" subtitle="Current state of all claims" />
          {statusData.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: C.text, fontSize: 13 }}>No data yet</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <PieChart width={200} height={200}>
                  <Pie data={statusData} cx={95} cy={95} innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={statusColors[entry.name.replace(" ", "")] || C.cyan} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {statusData.map(s => {
                  const color = statusColors[s.name.replace(" ", "")] || C.cyan;
                  const total = statusData.reduce((a, b) => a + b.value, 0);
                  const pct = total > 0 ? Math.round(s.value / total * 100) : 0;
                  return (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: C.textMid, flex: 1 }}>{s.name}</span>
                      <div style={{ width: 80, height: 4, background: "#2a2a2a", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.textHi, minWidth: 24, textAlign: "right" }}>{s.value}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top 5 Most Costly Claims */}
      <div style={{ background: C.card, borderRadius: 12, padding: "20px", marginBottom: 28 }}>
        <SectionTitle title="Top 5 Most Costly Claims" subtitle="Highest estimated amounts across all claims" />
        {data.topCostlyClaims.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: C.text, fontSize: 13 }}>No claims with amounts yet</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.topCostlyClaims.map((claim, i) => (
              <div key={claim.id} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "12px 16px", background: "#1c1c1c",
                borderRadius: 8, border: `1px solid ${C.border}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: `${COLORS[i]}20`, border: `1px solid ${COLORS[i]}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 900, color: COLORS[i], flexShrink: 0,
                }}>#{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textHi, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    #{claim.id} {claim.title}
                  </div>
                  <div style={{ fontSize: 11, color: C.text, marginTop: 2 }}>
                    {claim.type} · {claim.clientName}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: C.green }}>${claim.amount.toLocaleString()}</span>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700,
                    background: `${statusColors[claim.status] || "#64748b"}18`,
                    color: statusColors[claim.status] || "#64748b",
                    border: `1px solid ${statusColors[claim.status] || "#64748b"}33`,
                  }}>{claim.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Revenue Line Chart */}
      <div style={{ background: C.card, borderRadius: 12, padding: "20px" }}>
        <SectionTitle title="Monthly Revenue Trend" subtitle="Total estimated claim amounts per month" />
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.monthlyTrend}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.cyan} />
                <stop offset="100%" stopColor={C.green} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.text }}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
                contentStyle={{ background: "#1d1d1d", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textHi, fontSize: 12 }}
                formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                />
            <Line type="monotone" dataKey="totalAmount" stroke="url(#revenueGrad)" strokeWidth={3} dot={{ fill: C.cyan, r: 4 }} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}