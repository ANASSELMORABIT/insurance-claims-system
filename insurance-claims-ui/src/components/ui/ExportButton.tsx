import { useState, useRef, useEffect } from "react";
import api from "../../utils/axiosInstance";

export default function ExportButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = async (type: "excel" | "pdf") => {
    setLoading(type);
    setOpen(false);
    try {
      const res = await api.get(`/export/claims/${type}`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `claims-export.${type === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={!!loading}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "10px 18px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px", color: "#94a3b8",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "13px", fontWeight: 600,
          transition: "all 0.2s",
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      >
        {loading ? "⏳" : "↓"} {loading ? `Exporting ${loading}...` : "Export"}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "48px", right: 0,
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px", zIndex: 100,
          boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
          overflow: "hidden", minWidth: "160px",
        }}>
          <button
            onClick={() => handleExport("excel")}
            style={{
              width: "100%", padding: "12px 16px",
              background: "transparent", border: "none",
              color: "#e2e8f0", cursor: "pointer",
              fontSize: "13px", textAlign: "left",
              display: "flex", alignItems: "center", gap: "10px",
              transition: "background 0.15s",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,255,148,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span>📊</span>
            <div>
              <div style={{ fontWeight: 600 }}>Excel (.xlsx)</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Full data export</div>
            </div>
          </button>
          <button
            onClick={() => handleExport("pdf")}
            style={{
              width: "100%", padding: "12px 16px",
              background: "transparent", border: "none",
              color: "#e2e8f0", cursor: "pointer",
              fontSize: "13px", textAlign: "left",
              display: "flex", alignItems: "center", gap: "10px",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,107,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span>📄</span>
            <div>
              <div style={{ fontWeight: 600 }}>PDF Report</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Formatted report</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}