import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import NotificationBell from "../notifications/NotificationBell";
import GlobalSearch from "../search/GlobalSearch";
import { useWindowSize } from "../../hooks/useWindowSize";
import ThemeToggle from "../ui/ThemeToggle";

interface NavItem {
  to: string;
  icon: string;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { to: "/dashboard", icon: "bi bi-grid-1x2",         label: "Dashboard", roles: ["Admin", "Agent", "Client"] },
  { to: "/claims",    icon: "bi bi-shield-check",      label: "Claims",    roles: ["Admin", "Agent", "Client"] },
  { to: "/users",     icon: "bi bi-people",            label: "Users",     roles: ["Admin"] },
  { to: "/policies",  icon: "bi bi-file-earmark-text", label: "Policies",  roles: ["Admin", "Agent"] },
  { to: "/reports",   icon: "bi bi-bar-chart-line",    label: "Reports",   roles: ["Admin", "Agent"] },
  { to: "/profile",   icon: "bi bi-person-circle",     label: "Profile",   roles: ["Admin", "Agent", "Client"] },
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: collapsed && !isMobile ? "center" : "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px",
            background: "linear-gradient(135deg, #00D4FF, #00FF94)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <i className="bi bi-shield-fill" style={{ fontSize: "16px", color: "#070710" }} />
          </div>
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
              background: "var(--input-bg)",
              border: "1px solid var(--border-mid)",
              borderRadius: "6px", color: "var(--text-low)",
              cursor: "pointer", padding: "4px 8px",
              fontSize: "12px", transition: "all 0.2s",
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
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "4px 10px", borderRadius: "20px",
            background: roleBg[user.role] || "var(--bg-glass)",
            border: `1px solid ${roleColors[user.role] || "var(--border-mid)"}30`,
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: roleColors[user.role] || "var(--text-low)" }} />
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
              color: roleColors[user.role] || "var(--text-low)", textTransform: "uppercase",
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
              color: isActive ? "var(--accent)" : "var(--text-low)",
              fontSize: "14px", fontWeight: isActive ? 600 : 400,
              transition: "all 0.2s",
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",
            })}
          >
            <i className={item.icon} style={{ fontSize: "18px", flexShrink: 0 }} />
            {(!collapsed || isMobile) && item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
        {(!collapsed || isMobile) && (
          <div
            onClick={() => navigate("/profile")}
            style={{
              padding: "12px",
              background: "var(--bg-glass)",
              borderRadius: "8px", marginBottom: "8px",
              border: "1px solid var(--border)",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
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
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-hi)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-low)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
            justifyContent: "center", gap: "8px",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,107,0.15)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,107,107,0.08)")}
        >
          <i className="bi bi-box-arrow-right" style={{ fontSize: "15px" }} />
          {(!collapsed || isMobile) && "Logout"}
        </button>
      </div>
    </>
  );

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "var(--bg-base)",
      fontFamily: "'DM Sans', sans-serif",
      transition: "background 0.3s ease",
    }}>

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
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          transition: "width 0.3s ease, background 0.3s ease",
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
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          position: "fixed", top: 0, left: 0,
          zIndex: 200,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: mobileOpen ? "8px 0 32px rgba(0,0,0,0.3)" : "none",
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
        background: "var(--bg-base)",
      }}>
        {/* Top Header */}
        <div style={{
          height: "60px",
          padding: isMobile ? "0 16px" : "0 32px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-glass)",
          backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 50,
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}>
          {isMobile ? (
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--border-mid)",
                borderRadius: "8px", color: "var(--text-mid)",
                cursor: "pointer", padding: "8px 10px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <i className="bi bi-list" style={{ fontSize: "20px" }} />
            </button>
          ) : (
            <div />
          )}

          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px",
                background: "linear-gradient(135deg, #00D4FF, #00FF94)",
                borderRadius: "6px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className="bi bi-shield-fill" style={{ fontSize: "13px", color: "#070710" }} />
              </div>
              <span style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "13px",
                background: "linear-gradient(90deg, #00D4FF, #00FF94)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>InsureClaims</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!isMobile && <GlobalSearch />}
            <ThemeToggle />
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
            background: "var(--sidebar-bg)",
            borderTop: "1px solid var(--border)",
            display: "flex", alignItems: "center",
            justifyContent: "space-around",
            zIndex: 50, backdropFilter: "blur(20px)",
            paddingBottom: "env(safe-area-inset-bottom)",
            transition: "background 0.3s ease",
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
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  transition: "color 0.2s",
                  minWidth: "60px",
                })}
              >
                <i className={item.icon} style={{ fontSize: "20px" }} />
                <span style={{ fontSize: "10px", letterSpacing: "0.5px" }}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}