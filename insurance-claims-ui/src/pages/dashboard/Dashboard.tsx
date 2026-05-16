import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { dashboardService } from "../../services/dashboardService";
import type { DashboardStats } from "../../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const StatCard = ({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: `1px solid rgba(255,255,255,0.06)`,
    borderLeft: `3px solid ${color}`,
    borderRadius: "12px", padding: "24px",
    transition: "all 0.2s",
  }}
    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, marginBottom: "12px" }}>{label}</div>
        <div style={{ fontSize: "36px", fontWeight: 800, color: "#f1f5f9", fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ fontSize: "28px", opacity: 0.6 }}>{icon}</div>
    </div>
    <div style={{ marginTop: "12px", height: "2px", background: `${color}20`, borderRadius: "1px" }}>
      <div style={{ height: "100%", width: "60%", background: color, borderRadius: "1px" }} />
    </div>
  </div>
);

const COLORS = ["#00D4FF", "#00FF94", "#FFB800", "#FF6B6B", "#B388FF"];

const statusColor: Record<string, string> = {
  Pending: "#FFB800",
  UnderReview: "#00D4FF",
  Approved: "#00FF94",
  Rejected: "#FF6B6B",
  Closed: "#64748b",
};

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

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ color: "#00D4FF", fontFamily: "'Syne', sans-serif", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  if (!stats) return null;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: "#00D4FF", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>
          OVERVIEW
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.5px" }}>
          Dashboard
        </h1>
        <p style={{ color: "#64748b", marginTop: "6px", fontSize: "14px" }}>
          Real-time insurance claims analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <StatCard label="Total Claims" value={stats.totalClaims} color="#00D4FF" icon="📋" />
        <StatCard label="Pending" value={stats.pendingClaims} color="#FFB800" icon="⏳" />
        <StatCard label="Under Review" value={stats.underReviewClaims} color="#B388FF" icon="🔍" />
        <StatCard label="Approved" value={stats.approvedClaims} color="#00FF94" icon="✅" />
        <StatCard label="Rejected" value={stats.rejectedClaims} color="#FF6B6B" icon="❌" />
        {isAdmin && <StatCard label="Total Clients" value={stats.totalClients} color="#26D0CE" icon="👥" />}
      </div>

      {/* Amount Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,148,0.05))",
          border: "1px solid rgba(0,212,255,0.2)", borderRadius: "12px", padding: "24px",
        }}>
          <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>Total Estimated</div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Syne', sans-serif", background: "linear-gradient(90deg, #00D4FF, #00FF94)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ${stats.totalEstimatedAmount.toLocaleString()}
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", padding: "24px",
        }}>
          <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>Avg per Claim</div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#FFB800" }}>
            ${Math.round(stats.averageEstimatedAmount).toLocaleString()}
          </div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", padding: "24px",
        }}>
          <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>Documents</div>
          <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#B388FF" }}>
            {stats.totalDocuments}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>

        {/* Bar Chart */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", padding: "24px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px", letterSpacing: "0.5px" }}>
            Claims by Month
          </div>
          {stats.claimsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.claimsByMonth}>
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ background: "#0d0d1a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0" }}
                />
                <Bar dataKey="count" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "13px" }}>
              No data yet
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", padding: "24px",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px", letterSpacing: "0.5px" }}>
            Claims by Type
          </div>
          {stats.claimsByType.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <PieChart width={160} height={160}>
                <Pie data={stats.claimsByType} cx={75} cy={75} innerRadius={45} outerRadius={75} dataKey="count" paddingAngle={3}>
                  {stats.claimsByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0d0d1a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0" }} />
              </PieChart>
              <div style={{ flex: 1 }}>
                {stats.claimsByType.map((item, i) => (
                  <div key={item.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>{item.type}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", fontSize: "13px" }}>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Claims */}
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px", padding: "24px",
      }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px", letterSpacing: "0.5px" }}>
          Recent Claims
        </div>
        {stats.recentClaims.length === 0 ? (
          <div style={{ color: "#475569", fontSize: "13px", textAlign: "center", padding: "32px" }}>No claims yet</div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "0 0 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "4px" }}>
              {["Title", "Type", "Status", "Client", "Amount"].map(h => (
                <div key={h} style={{ fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>{h}</div>
              ))}
            </div>
            {stats.recentClaims.map(claim => (
              <div key={claim.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: "16px", padding: "14px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                transition: "background 0.2s", cursor: "pointer",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>
                  #{claim.id} {claim.title}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{claim.type}</div>
                <div>
                  <span style={{
                    fontSize: "11px", padding: "3px 8px", borderRadius: "20px", fontWeight: 600,
                    background: `${statusColor[claim.status] || "#64748b"}15`,
                    color: statusColor[claim.status] || "#64748b",
                    border: `1px solid ${statusColor[claim.status] || "#64748b"}30`,
                  }}>
                    {claim.status}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>{claim.clientName}</div>
                <div style={{ fontSize: "13px", color: "#00FF94", fontWeight: 600 }}>
                  {claim.estimatedAmount ? `$${claim.estimatedAmount.toLocaleString()}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}