import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import NotificationBell from "../notifications/NotificationBell";
import GlobalSearch from "../search/GlobalSearch";
import { useWindowSize } from "../../hooks/useWindowSize";

interface NavItem {
  to: string;
  icon: string;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: "/dashboard", icon: "📊", label: "Dashboard", roles: ["Admin", "Agent", "Client"] },
  { to: "/claims",    icon: "📋", label: "Claims",    roles: ["Admin", "Agent", "Client"] },
  { to: "/users",     icon: "👥", label: "Users",     roles: ["Admin"] },
  { to: "/policies",  icon: "📜", label: "Policies",  roles: ["Admin", "Agent"] },
  { to: "/reports",   icon: "📈", label: "Reports",   roles: ["Admin", "Agent"] },
  { to: "/profile",   icon: "👤", label: "Profile",   roles: ["Admin", "Agent", "Client"] },
];

const roleColors: Record<string, string> = {
  Admin: "#FF6B6B",
  Agent: "#00FF94",
  Client: "#FFB800",
};

const roleBg: Record<string, string> = {
  Admin: "rgba(255,107,107,0.1)",
  Agent: "rgba(0,255,148,0.1)",
  Client: "rgba(255,184,0,0.1)",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useWindowSize();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar sidebar mobile al cambiar de página
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Colapsar automáticamente en tablet
  useEffect(() => {
    if (isTablet) setCollapsed(true);
    if (!isTablet && !isMobile) setCollapsed(false);
  }, [isTablet, isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleNav = navItems.filter(item =>
    user?.role && item.roles.includes(user.role)
  );

  const sidebarWidth = isMobile ? "280px" : collapsed ? "64px" : "240px";

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{
        padding: collapsed && !isMobile ? "24px 16px" : "20px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center",
        justifyContent: collapsed && !isMobile ? "center" : "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, #00D4FF, #00FF94)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px", flexShrink: 0,
          }}>🛡️</div>
          {(!collapsed || isMobile) && (
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: "14px",
              background: "linear-gradient(90deg, #00D4FF, #00FF94)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>InsureClaims</span>
          )}
        </div>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px", color: "#64748b",
              cursor: "pointer", padding: "4px 8px",
              fontSize: "12px",
            }}
          >{collapsed ? "›" : "‹"}</button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.2)",
              borderRadius: "6px", color: "#FF6B6B",
              cursor: "pointer", padding: "4px 10px",
              fontSize: "14px",
            }}
          >✕</button>
        )}
      </div>

      {/* Role Badge */}
      {(!collapsed || isMobile) && user && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "4px 10px", borderRadius: "20px",
            background: roleBg[user.role] || "rgba(255,255,255,0.05)",
            border: `1px solid ${roleColors[user.role] || "#64748b"}30`,
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: roleColors[user.role] || "#64748b" }} />
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
              color: roleColors[user.role] || "#64748b", textTransform: "uppercase",
            }}>{user.role}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {visibleNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center",
              gap: "12px", padding: "11px 12px",
              borderRadius: "8px", marginBottom: "4px",
              textDecoration: "none",
              background: isActive ? "rgba(0,212,255,0.1)" : "transparent",
              border: isActive ? "1px solid rgba(0,212,255,0.2)" : "1px solid transparent",
              color: isActive ? "#00D4FF" : "#64748b",
              fontSize: "14px", fontWeight: isActive ? 600 : 400,
              transition: "all 0.2s",
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
            })}
          >
            <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
            {(!collapsed || isMobile) && item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {(!collapsed || isMobile) && (
          <div
            onClick={() => navigate("/profile")}
            style={{
              padding: "12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "8px", marginBottom: "8px",
              border: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.2)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                background: `linear-gradient(135deg, ${roleColors[user?.role || ""] || "#00D4FF"}, #00D4FF)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", fontWeight: 700, color: "#070710",
              }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: "11px", color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email}
                </div>
              </div>
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
          ⏻ {(!collapsed || isMobile) && "Logout"}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#070710", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar — Desktop */}
      {!isMobile && (
        <aside style={{
          width: sidebarWidth,
          minHeight: "100vh",
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
          transition: "width 0.3s ease",
          position: "fixed", top: 0, left: 0, bottom: 0,
          zIndex: 100, backdropFilter: "blur(20px)",
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* Sidebar — Mobile Drawer */}
      {isMobile && (
        <aside style={{
          width: "280px",
          height: "100vh",
          background: "#0d0d1a",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0,
          zIndex: 200,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: mobileOpen ? "8px 0 32px rgba(0,0,0,0.5)" : "none",
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* Main */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: "margin-left 0.3s ease",
        minHeight: "100vh",
      }}>
        {/* Top Header */}
        <div style={{
          height: "60px",
          padding: isMobile ? "0 16px" : "0 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,0.01)",
          backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          {/* Mobile hamburger */}
          {isMobile ? (
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", color: "#94a3b8",
                cursor: "pointer", padding: "8px 10px",
                fontSize: "18px",
              }}
            >☰</button>
          ) : (
            <div />
          )}

          {/* Mobile Logo */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px",
                background: "linear-gradient(135deg, #00D4FF, #00FF94)",
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px",
              }}>🛡️</div>
              <span style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "13px",
                background: "linear-gradient(90deg, #00D4FF, #00FF94)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>InsureClaims</span>
            </div>
          )}

          {/* Right side actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!isMobile && <GlobalSearch />}
            <NotificationBell />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? "16px" : "32px" }}>
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            height: "64px",
            background: "#0d0d1a",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center",
            justifyContent: "space-around",
            zIndex: 50, backdropFilter: "blur(20px)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}>
            {visibleNav.slice(0, 4).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "2px",
                  padding: "8px 16px", borderRadius: "8px",
                  textDecoration: "none",
                  color: isActive ? "#00D4FF" : "#475569",
                  transition: "color 0.2s",
                  minWidth: "60px",
                })}
              >
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                <span style={{ fontSize: "10px", letterSpacing: "0.5px" }}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}