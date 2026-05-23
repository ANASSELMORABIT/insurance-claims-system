import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

// Add these Google Fonts to your index.html or global CSS:
// <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#060612",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  orb1: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,212,255,0.18) 0%, transparent 70%)",
    filter: "blur(80px)",
    top: "-120px",
    left: "-120px",
    animation: "orbFloat1 9s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,255,148,0.12) 0%, transparent 70%)",
    filter: "blur(80px)",
    bottom: "-80px",
    right: "-80px",
    animation: "orbFloat2 11s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb3: {
    position: "absolute",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(120,80,255,0.14) 0%, transparent 70%)",
    filter: "blur(60px)",
    top: "40%",
    left: "55%",
    animation: "orbFloat3 13s ease-in-out infinite",
    pointerEvents: "none",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,212,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.035) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    animation: "gridDrift 20s linear infinite",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "420px",
    margin: "0 24px",
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "24px",
    padding: "44px 40px",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    boxShadow:
      "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.06), inset 0 1px 0 rgba(255,255,255,0.07)",
    animation: "cardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
  },
  topShine: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
  },
  logoBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "22px",
  },
  logoIcon: {
    width: "38px",
    height: "38px",
    background: "linear-gradient(135deg, #00D4FF 0%, #00FF94 100%)",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    boxShadow: "0 0 20px rgba(0,212,255,0.3)",
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: "15px",
    background: "linear-gradient(90deg, #00D4FF, #00FF94)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "0.5px",
  },
  h1: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "26px",
    fontWeight: 800,
    color: "#f0f6ff",
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#4a5568",
    lineHeight: 1.4,
    margin: 0,
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1.2px",
    color: "#718096",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#e8f0fe",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s",
    boxSizing: "border-box" as const,
  },
  errorBox: {
    padding: "11px 14px",
    marginBottom: "18px",
    background: "rgba(255,80,80,0.08)",
    border: "1px solid rgba(255,80,80,0.2)",
    borderRadius: "10px",
    color: "#fc8181",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  divider: {
    width: "100%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
    margin: "24px 0",
  },
  demoHint: {
    padding: "13px 16px",
    background: "rgba(0,212,255,0.04)",
    border: "1px solid rgba(0,212,255,0.1)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  demoDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#00D4FF",
    flexShrink: 0,
    boxShadow: "0 0 6px rgba(0,212,255,0.6)",
  },
  demoText: {
    fontSize: "12px",
    color: "#4a5568",
    lineHeight: 1.4,
    margin: 0,
  },
};

const keyframes = `
@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.05); }
  66% { transform: translate(-25px, 20px) scale(0.96); }
}
@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 25px) scale(1.04); }
  66% { transform: translate(20px, -15px) scale(0.97); }
}
@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-40px, -25px) scale(1.08); }
}
@keyframes gridDrift {
  0% { background-position: 0 0; }
  100% { background-position: 48px 48px; }
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes particleDrift {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(-600px) translateX(40px); opacity: 0; }
}
`;

function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    duration: Math.random() * 12 + 8,
    delay: Math.random() * -18,
    color: Math.random() > 0.5 ? "rgba(0,212,255,0.7)" : "rgba(0,255,148,0.5)",
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: p.color,
            left: `${p.left}%`,
            bottom: "-10px",
            animation: `particleDrift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

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
      ? "rgba(0,212,255,0.25)"
      : "linear-gradient(135deg, #00D4FF 0%, #00c875 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#050c14",
    fontWeight: 700,
    fontSize: "14px",
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.5px",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "opacity 0.2s, transform 0.15s, box-shadow 0.2s",
    boxShadow: loading ? "none" : "0 4px 20px rgba(0,212,255,0.2)",
    marginBottom: "20px",
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.root}>
        {/* Orbs */}
        <div style={styles.orb1} />
        <div style={styles.orb2} />
        <div style={styles.orb3} />

        {/* Grid */}
        <div style={styles.grid} />

        {/* Floating particles */}
        <Particles />

        {/* Card */}
        <div style={styles.card}>
          {/* Top shine line */}
          <div style={styles.topShine} />

          {/* Logo */}
          <div style={{ marginBottom: "36px" }}>
            <div style={styles.logoBadge}>
              <div style={styles.logoIcon}>🛡️</div>
              <span style={styles.logoText}>InsureClaims</span>
            </div>
            <h1 style={styles.h1}>Welcome back</h1>
            <p style={styles.subtitle}>Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@insurance.com"
                required
                style={styles.input}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(0,212,255,0.45)";
                  e.target.style.background = "rgba(0,212,255,0.04)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.08)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.background = "rgba(255,255,255,0.04)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(0,212,255,0.45)";
                  e.target.style.background = "rgba(0,212,255,0.04)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.08)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
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
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,212,255,0.35)";
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.opacity = "1";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,212,255,0.2)";
                }
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={styles.divider} />

          <div style={styles.demoHint}>
            <div style={styles.demoDot} />
            <p style={styles.demoText}>
              <span style={{ color: "#00D4FF", fontWeight: 600 }}>Demo:</span>{" "}
              admin@insurance.com / Admin@1234!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
