import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

// Add these Google Fonts to your index.html or global CSS:
// <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">

const keyframes = `
@keyframes drift {
  0%   { transform: translateX(0) translateY(0) rotate(0deg); }
  25%  { transform: translateX(60px) translateY(-40px) rotate(15deg); }
  50%  { transform: translateX(30px) translateY(50px) rotate(-10deg); }
  75%  { transform: translateX(-40px) translateY(20px) rotate(20deg); }
  100% { transform: translateX(0) translateY(0) rotate(0deg); }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(32px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
@keyframes btnSheen {
  from { left: -100%; }
  to   { left: 160%; }
}
`;

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#06060f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Figtree', sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  // Aurora bands
  aurora1: {
    position: "absolute",
    width: "600px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(60,80,220,0.22) 0%, transparent 70%)",
    filter: "blur(90px)",
    top: "-80px",
    left: "-100px",
    animation: "drift 18s linear infinite",
    pointerEvents: "none",
  },
  aurora2: {
    position: "absolute",
    width: "500px",
    height: "250px",
    borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(80,60,200,0.18) 0%, transparent 70%)",
    filter: "blur(90px)",
    top: "30%",
    left: "40%",
    animation: "drift 24s linear -8s infinite",
    pointerEvents: "none",
  },
  aurora3: {
    position: "absolute",
    width: "400px",
    height: "200px",
    borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(100,140,255,0.14) 0%, transparent 70%)",
    filter: "blur(90px)",
    bottom: "-60px",
    right: "-80px",
    animation: "drift 20s linear -14s infinite",
    pointerEvents: "none",
  },
  aurora4: {
    position: "absolute",
    width: "350px",
    height: "180px",
    borderRadius: "50%",
    background: "radial-gradient(ellipse, rgba(40,20,120,0.25) 0%, transparent 70%)",
    filter: "blur(90px)",
    top: "50%",
    left: "-80px",
    animation: "drift 16s linear -5s infinite",
    pointerEvents: "none",
  },

  noiseOverlay: {
    position: "absolute",
    inset: 0,
    opacity: 0.035,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    pointerEvents: "none",
  },

  scanLines: {
    position: "absolute",
    inset: 0,
    background:
      "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
    pointerEvents: "none",
  },

  card: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    margin: "0 24px",
    background: "rgba(255,255,255,0.028)",
    border: "1px solid rgba(80,120,255,0.15)",
    borderRadius: "20px",
    padding: "44px 40px 40px",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    boxShadow:
      "0 60px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.3)",
    animation: "cardIn 0.8s cubic-bezier(0.16,1,0.3,1) both",
  },

  topLine: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "55%",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(100,140,255,0.55), transparent)",
  },

  cornerTL: {
    position: "absolute",
    top: "16px",
    left: "16px",
    borderTop: "1px solid rgba(80,120,255,0.3)",
    borderLeft: "1px solid rgba(80,120,255,0.3)",
    width: "20px",
    height: "20px",
    pointerEvents: "none",
  },

  cornerBR: {
    position: "absolute",
    bottom: "16px",
    right: "16px",
    borderBottom: "1px solid rgba(80,120,255,0.3)",
    borderRight: "1px solid rgba(80,120,255,0.3)",
    width: "20px",
    height: "20px",
    pointerEvents: "none",
  },

  brandWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    marginBottom: "32px",
  },

  brandIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #3a5cec 0%, #6080ff 50%, #2540c8 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    boxShadow:
      "0 0 28px rgba(80,120,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
  },

  brandName: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "20px",
    fontWeight: 600,
    color: "#7090ff",
    letterSpacing: "0.5px",
  } as React.CSSProperties,

  brandTag: {
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "2px",
    color: "rgba(100,130,255,0.45)",
    textTransform: "uppercase" as const,
    lineHeight: 1,
  },

  heading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "32px",
    fontWeight: 700,
    color: "#e8eeff",
    margin: "0 0 5px",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },

  subheading: {
    fontSize: "13px",
    color: "rgba(160,180,255,0.4)",
    margin: "0 0 34px",
  },

  label: {
    display: "block",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "1.8px",
    color: "rgba(120,150,255,0.55)",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(80,120,255,0.12)",
    borderRadius: "10px",
    color: "#d0d8ff",
    fontSize: "14px",
    fontFamily: "'Figtree', sans-serif",
    outline: "none",
    transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s",
  },

  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 14px",
    background: "rgba(200,60,60,0.08)",
    border: "1px solid rgba(200,60,60,0.2)",
    borderRadius: "9px",
    color: "#fc8181",
    fontSize: "13px",
    marginBottom: "18px",
  },

  divider: {
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(80,120,255,0.1), transparent)",
    margin: "22px 0",
  },

  demoBadge: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    padding: "12px 14px",
    background: "rgba(80,120,255,0.05)",
    border: "1px solid rgba(80,120,255,0.1)",
    borderRadius: "10px",
  },

  demoDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#5070ee",
    flexShrink: 0,
    marginTop: "4px",
    boxShadow: "0 0 8px rgba(80,120,255,0.7)",
    animation: "pulse 2.5s ease-in-out infinite",
  },

  demoText: {
    fontSize: "12px",
    color: "rgba(160,180,255,0.5)",
    lineHeight: 1.5,
    margin: 0,
  },
};

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authService.login({ email, password });
      login(data);
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px",
    background: loading
      ? "rgba(80,120,255,0.25)"
      : "linear-gradient(135deg, #3a5cec 0%, #5a7aff 50%, #2a42cc 100%)",
    border: "none",
    borderRadius: "10px",
    color: loading ? "rgba(200,210,255,0.5)" : "#e8eeff",
    fontWeight: 600,
    fontSize: "14px",
    fontFamily: "'Figtree', sans-serif",
    letterSpacing: "0.5px",
    cursor: loading ? "not-allowed" : "pointer",
    position: "relative",
    overflow: "hidden",
    transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
    boxShadow: loading
      ? "none"
      : "0 4px 24px rgba(80,120,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
    marginBottom: "20px",
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.root}>
        {/* Aurora bands */}
        <div style={styles.aurora1} />
        <div style={styles.aurora2} />
        <div style={styles.aurora3} />
        <div style={styles.aurora4} />

        {/* Texture overlays */}
        <div style={styles.noiseOverlay} />
        <div style={styles.scanLines} />

        {/* Card */}
        <div style={styles.card}>
          <div style={styles.topLine} />
          <div style={styles.cornerTL} />
          <div style={styles.cornerBR} />

          {/* Brand */}
          <div style={styles.brandWrapper}>
            <div style={styles.brandIcon}>🛡️</div>
            <div>
              <div style={styles.brandName}>InsureClaims</div>
              <div style={styles.brandTag}>Enterprise Platform</div>
            </div>
          </div>

          <h1 style={styles.heading}>Welcome back.</h1>
          <p style={styles.subheading}>Sign in to your account to continue</p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@insurance.com"
                required
                style={styles.input}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(80,120,255,0.5)";
                  e.target.style.background = "rgba(80,120,255,0.06)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(80,120,255,0.1)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(80,120,255,0.12)";
                  e.target.style.background = "rgba(255,255,255,0.04)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "26px" }}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(80,120,255,0.5)";
                  e.target.style.background = "rgba(80,120,255,0.06)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(80,120,255,0.1)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(80,120,255,0.12)";
                  e.target.style.background = "rgba(255,255,255,0.04)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {error && (
              <div style={styles.errorBox}>
                <span>⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={btnStyle}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.opacity = "0.9";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 8px 32px rgba(80,120,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15)";
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "0 4px 24px rgba(80,120,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)";
                }
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={styles.divider} />

          <div style={styles.demoBadge}>
            <div style={styles.demoDot} />
            <p style={styles.demoText}>
              <span style={{ color: "rgba(120,150,255,0.85)", fontWeight: 600 }}>
                Demo credentials:
              </span>
              <br />
              admin@insurance.com &nbsp;/&nbsp; Admin@1234!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
