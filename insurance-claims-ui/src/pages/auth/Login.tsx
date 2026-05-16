import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070710",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background effects */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.06) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(0,255,148,0.04) 0%, transparent 60%),
          radial-gradient(ellipse at 60% 80%, rgba(255,184,0,0.03) 0%, transparent 60%)
        `,
      }} />

      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Card */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "440px",
        margin: "0 24px",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "48px 40px",
        boxShadow: "0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,255,0.05)",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "24px",
          }}>
            <div style={{
              width: "36px", height: "36px",
              background: "linear-gradient(135deg, #00D4FF, #00FF94)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px",
            }}>🛡️</div>
            <span style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: "16px",
              background: "linear-gradient(90deg, #00D4FF, #00FF94)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.5px",
            }}>InsureClaims</span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "28px", fontWeight: 800,
            color: "#f1f5f9", margin: "0 0 8px",
            letterSpacing: "-0.5px",
          }}>Welcome back</h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block", fontSize: "12px",
              fontWeight: 600, letterSpacing: "1px",
              color: "#94a3b8", textTransform: "uppercase",
              marginBottom: "8px",
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@insurance.com"
              required
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", color: "#f1f5f9",
                fontSize: "14px", outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(0,212,255,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block", fontSize: "12px",
              fontWeight: 600, letterSpacing: "1px",
              color: "#94a3b8", textTransform: "uppercase",
              marginBottom: "8px",
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", color: "#f1f5f9",
                fontSize: "14px", outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(0,212,255,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {error && (
            <div style={{
              padding: "12px 16px", marginBottom: "20px",
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.2)",
              borderRadius: "8px", color: "#FF6B6B",
              fontSize: "13px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px",
              background: loading
                ? "rgba(0,212,255,0.3)"
                : "linear-gradient(135deg, #00D4FF, #00FF94)",
              border: "none", borderRadius: "10px",
              color: "#070710", fontWeight: 700,
              fontSize: "14px", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "0.5px",
              transition: "opacity 0.2s, transform 0.1s",
            }}
            onMouseEnter={e => !loading && ((e.target as HTMLElement).style.opacity = "0.9")}
            onMouseLeave={e => !loading && ((e.target as HTMLElement).style.opacity = "1")}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        {/* Hint */}
        <div style={{
          marginTop: "24px", padding: "16px",
          background: "rgba(0,212,255,0.05)",
          border: "1px solid rgba(0,212,255,0.1)",
          borderRadius: "8px",
        }}>
          <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
            <span style={{ color: "#00D4FF", fontWeight: 600 }}>Demo:</span>{" "}
            admin@insurance.com / Admin@1234!
          </p>
        </div>
      </div>
    </div>
  );
}