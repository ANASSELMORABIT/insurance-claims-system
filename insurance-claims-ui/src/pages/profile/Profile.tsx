import { useAuth } from "../../context/AuthContext";

const roleColors: Record<string, string> = {
  Admin: "#FF6B6B",
  Agent: "#00FF94",
  Client: "#FFB800",
};

export default function Profile() {
  const { user } = useAuth();

  return (
    <div style={{ animation: "fadeIn 0.4s ease", maxWidth: "700px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: "#00D4FF", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>ACCOUNT</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Profile</h1>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px" }}>
        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "16px",
            background: `linear-gradient(135deg, ${roleColors[user?.role || ""] || "#00D4FF"}, #00D4FF)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "28px", fontWeight: 800, color: "#070710",
            fontFamily: "'Syne', sans-serif",
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 6px" }}>
              {user?.firstName} {user?.lastName}
            </h2>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "4px 12px", borderRadius: "20px",
              background: `${roleColors[user?.role || ""]}15`,
              border: `1px solid ${roleColors[user?.role || ""]}30`,
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: roleColors[user?.role || ""] }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: roleColors[user?.role || ""], letterSpacing: "1px" }}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {[
            { label: "First Name", value: user?.firstName },
            { label: "Last Name", value: user?.lastName },
            { label: "Email", value: user?.email },
            { label: "Role", value: user?.role },
          ].map(item => (
            <div key={item.label} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>{item.label}</div>
              <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 500 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24px", padding: "16px", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: "8px" }}>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            <span style={{ color: "#00D4FF", fontWeight: 600 }}>Phase B</span> — Full profile editing and password change coming next.
          </p>
        </div>
      </div>
    </div>
  );
}