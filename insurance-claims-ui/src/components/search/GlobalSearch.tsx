import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  url: string;
  badge: string;
  badgeColor: string;
}

interface SearchResult {
  results: SearchItem[];
  totalCount: number;
  query: string;
}

const typeIcon: Record<string, string> = {
  claim: "📋",
  policy: "📜",
  user: "👤",
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Ctrl+K para abrir
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce search
  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get<SearchResult>(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results);
        setSelected(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) {
      navigate(results[selected].url);
      setOpen(false);
      setQuery("");
    }
  };

  const handleSelect = (item: SearchItem) => {
    navigate(item.url);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "8px 14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px", color: "#64748b",
          cursor: "pointer", fontSize: "13px",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      >
        <span>🔍</span>
        <span style={{ fontSize: "12px" }}>Search</span>
        <span style={{
          padding: "2px 6px", background: "rgba(255,255,255,0.06)",
          borderRadius: "4px", fontSize: "10px", letterSpacing: "0.5px",
        }}>Ctrl K</span>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          zIndex: 2000,
          display: "flex", alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "120px",
        }}>
          <div
            ref={ref}
            style={{
              width: "100%", maxWidth: "560px",
              background: "#0d0d1a",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: "16px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.05)",
              overflow: "hidden",
              margin: "0 16px",
            }}
          >
            {/* Input */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "16px 20px",
              borderBottom: results.length > 0 || loading ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <span style={{ fontSize: "18px", opacity: 0.5 }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search claims, policies, users..."
                style={{
                  flex: 1, background: "none", border: "none",
                  color: "#f1f5f9", fontSize: "16px", outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              {query && (
                <button onClick={() => { setQuery(""); setResults([]); }}
                  style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "16px" }}>
                  ✕
                </button>
              )}
              <kbd style={{
                padding: "3px 8px", background: "rgba(255,255,255,0.06)",
                borderRadius: "6px", fontSize: "11px", color: "#475569",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>ESC</kbd>
            </div>

            {/* Results */}
            {loading && (
              <div style={{ padding: "24px", textAlign: "center", color: "#475569", fontSize: "13px" }}>
                Searching...
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
                <div style={{ color: "#475569", fontSize: "13px" }}>No results for "{query}"</div>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                {/* Group by type */}
                {["claim", "policy", "user"].map(type => {
                  const group = results.filter(r => r.type === type);
                  if (group.length === 0) return null;
                  return (
                    <div key={type}>
                      <div style={{
                        padding: "8px 20px 4px",
                        fontSize: "10px", color: "#475569",
                        letterSpacing: "1.5px", textTransform: "uppercase",
                      }}>
                        {type === "claim" ? "Claims" : type === "policy" ? "Policies" : "Users"}
                      </div>
                      {group.map((item, i) => {
                        const globalIndex = results.indexOf(item);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            style={{
                              display: "flex", alignItems: "center", gap: "12px",
                              padding: "12px 20px", cursor: "pointer",
                              background: selected === globalIndex ? "rgba(0,212,255,0.08)" : "transparent",
                              borderLeft: selected === globalIndex ? "2px solid #00D4FF" : "2px solid transparent",
                              transition: "all 0.1s",
                            }}
                            onMouseEnter={() => setSelected(globalIndex)}
                          >
                            <span style={{ fontSize: "20px", flexShrink: 0 }}>{typeIcon[item.type]}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "1px" }}>
                                {item.subtitle}
                              </div>
                            </div>
                            <span style={{
                              fontSize: "10px", padding: "2px 8px", borderRadius: "20px",
                              background: `${item.badgeColor}15`,
                              color: item.badgeColor,
                              border: `1px solid ${item.badgeColor}30`,
                              flexShrink: 0,
                            }}>
                              {item.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            {!query && (
              <div style={{ padding: "20px", display: "flex", gap: "16px", justifyContent: "center" }}>
                {[
                  { key: "↑↓", label: "navigate" },
                  { key: "↵", label: "select" },
                  { key: "ESC", label: "close" },
                ].map(k => (
                  <div key={k.key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <kbd style={{ padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", fontSize: "11px", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }}>{k.key}</kbd>
                    <span style={{ fontSize: "11px", color: "#475569" }}>{k.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}