import { useQuery } from "@tanstack/react-query";
import api from "../../utils/axiosInstance";

interface AgentWorkload {
  agentId: string;
  agentName: string;
  activeClaims: number;
  totalClaims: number;
  status: string;
}

const statusColors: Record<string, string> = {
  Available: "#00FF94",
  Low: "#00D4FF",
  Medium: "#FFB800",
  High: "#FF6B6B",
};

export default function AgentWorkload() {
  const { data, isLoading } = useQuery<AgentWorkload[]>({
    queryKey: ["agent-workloads"],
    queryFn: async () => {
      const res = await api.get("/claims/agent-workloads");
      return res.data;
    },
    refetchInterval: 60000,
  });

  if (isLoading) return null;
  if (!data || data.length === 0) return (
    <div style={{
      background: "var(--bg-card)", borderRadius: "12px", padding: "20px",
      border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-mid)", marginBottom: "12px" }}>
        AGENT WORKLOAD
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-low)", textAlign: "center", padding: "16px" }}>
        No agents found. Create agents in Users management.
      </div>
    </div>
  );

  const maxLoad = Math.max(...data.map(a => a.activeClaims), 1);

  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: "12px", padding: "20px",
      border: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-mid)", letterSpacing: "0.5px" }}>
          AGENT WORKLOAD
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-low)" }}>Auto-assigned</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data.map((agent, i) => {
          const color = statusColors[agent.status] || "#64748b";
          const pct = maxLoad > 0 ? (agent.activeClaims / maxLoad) * 100 : 0;

          return (
            <div key={agent.agentId}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "6px", flexShrink: 0,
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: 800, color,
                  }}>
                    {agent.agentName.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-hi)" }}>{agent.agentName}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-low)" }}>{agent.totalClaims} total</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "20px", fontWeight: 700,
                    background: `${color}15`, color, border: `1px solid ${color}30`,
                  }}>
                    {agent.status}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color }}>
                    {agent.activeClaims}
                  </span>
                </div>
              </div>
              <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: color, borderRadius: "2px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "16px", padding: "10px 12px", background: "var(--bg-glass)", borderRadius: "8px", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "11px", color: "var(--text-low)" }}>
          🤖 New claims are automatically assigned to the agent with the least active workload.
        </div>
      </div>
    </div>
  );
}