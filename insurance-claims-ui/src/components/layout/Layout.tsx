import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", icon: "▪", label: "Dashboard" },
  { to: "/claims", icon: "▪", label: "Claims" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "#070710", fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? "64px" : "240px",
        minHeight: "100vh",
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s ease",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 100,
        backdropFilter: "blur(20px)",
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? "24px 16px" : "24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px",
                background: "linear-gradient(135deg, #00D4FF, #00FF94)",
                borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", flexShrink: 0,
              }}>🛡️</div>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: "14px",
                background: "linear-gradient(90deg, #00D4FF, #00FF94)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>InsureClaims</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px", color: "#64748b",
              cursor: "pointer", padding: "4px 8px",
              fontSize: "12px", transition: "all 0.2s",
            }}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center",
                gap: "12px", padding: "10px 12px",
                borderRadius: "8px", marginBottom: "4px",
                textDecoration: "none",
                background: isActive ? "rgba(0,212,255,0.1)" : "transparent",
                border: isActive ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
                color: isActive ? "#00D4FF" : "#64748b",
                fontSize: "14px", fontWeight: isActive ? 600 : 400,
                transition: "all 0.2s",
                justifyContent: collapsed ? "center" : "flex-start",
              })}
            >
              <span style={{ fontSize: "16px" }}>
                {item.to === "/dashboard" ? "📊" : "📋"}
              </span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: "16px 12px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          {!collapsed && (
            <div style={{
              padding: "12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px", marginBottom: "8px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{
                fontSize: "11px", marginTop: "2px",
                color: "#00D4FF", letterSpacing: "1px",
                textTransform: "uppercase",
              }}>
                {user?.role}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "9px",
              background: "rgba(255,107,107,0.08)",
              border: "1px solid rgba(255,107,107,0.15)",
              borderRadius: "8px", color: "#FF6B6B",
              cursor: "pointer", fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.2s",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "6px",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,107,0.15)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,107,107,0.08)")}
          >
            {collapsed ? "⏻" : "⏻ Logout"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1,
        marginLeft: collapsed ? "64px" : "240px",
        transition: "margin-left 0.3s ease",
        minHeight: "100vh",
        padding: "32px",
      }}>
        <Outlet />
      </main>
    </div>
  );
}