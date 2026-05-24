import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        width: "48px", height: "26px",
        background: isDark ? "rgba(0,212,255,0.2)" : "rgba(255,184,0,0.2)",
        border: `1px solid ${isDark ? "rgba(0,212,255,0.3)" : "rgba(255,184,0,0.4)"}`,
        borderRadius: "13px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        flexShrink: 0,
      }}
    >
      {/* Track icons */}
      <span style={{
        position: "absolute", left: "5px", top: "50%",
        transform: "translateY(-50%)",
        fontSize: "11px", opacity: isDark ? 0.4 : 0,
        transition: "opacity 0.3s",
      }}>🌙</span>
      <span style={{
        position: "absolute", right: "5px", top: "50%",
        transform: "translateY(-50%)",
        fontSize: "11px", opacity: isDark ? 0 : 0.8,
        transition: "opacity 0.3s",
      }}>☀️</span>

      {/* Thumb */}
      <div style={{
        position: "absolute",
        top: "3px",
        left: isDark ? "3px" : "23px",
        width: "18px", height: "18px",
        borderRadius: "50%",
        background: isDark ? "#00D4FF" : "#FFB800",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: isDark ? "0 0 8px rgba(0,212,255,0.5)" : "0 0 8px rgba(255,184,0,0.5)",
      }} />
    </button>
  );
}