import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../services/notificationService";
import type { NotificationResponse } from "../../services/notificationService";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Polling cada 30s
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const c = await notificationService.getUnreadCount();
        setCount(c);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open) {
      setLoading(true);
      try {
        const data = await notificationService.getAll();
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setCount(0);
  };

  const handleClick = async (n: NotificationResponse) => {
    if (!n.isRead) {
      await notificationService.markAsRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setCount(prev => Math.max(0, prev - 1));
    }
    if (n.relatedUrl) {
      navigate(n.relatedUrl);
      setOpen(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await notificationService.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        style={{
          position: "relative", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "10px", padding: "8px 10px",
          cursor: "pointer", color: "#94a3b8",
          fontSize: "18px", transition: "all 0.2s",
          display: "flex", alignItems: "center",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
      >
        🔔
        {count > 0 && (
          <div style={{
            position: "absolute", top: "-6px", right: "-6px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: "#FF6B6B", color: "#fff",
            fontSize: "10px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #070710",
          }}>
            {count > 9 ? "9+" : count}
          </div>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "absolute", top: "48px", right: 0,
          width: "360px", maxHeight: "480px",
          background: "#0d0d1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px", zIndex: 1000,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne', sans-serif" }}>
              Notifications {count > 0 && <span style={{ color: "#FF6B6B", fontSize: "12px" }}>({count} new)</span>}
            </div>
            {count > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ fontSize: "11px", color: "#00D4FF", background: "none", border: "none", cursor: "pointer" }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#475569", fontSize: "13px" }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔔</div>
                <div style={{ color: "#475569", fontSize: "13px" }}>No notifications yet</div>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    background: n.isRead ? "transparent" : "rgba(0,212,255,0.04)",
                    transition: "background 0.2s",
                    display: "flex", gap: "12px", alignItems: "flex-start",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(0,212,255,0.04)")}
                >
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                    background: n.isRead ? "#1e293b" : "#00D4FF", marginTop: "5px",
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: n.isRead ? 400 : 600, color: "#e2e8f0", marginBottom: "3px" }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>{n.message}</div>
                    <div style={{ fontSize: "10px", color: "#334155", marginTop: "4px" }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  <button
                    onClick={e => handleDelete(e, n.id)}
                    style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: "14px", padding: "0 4px", flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#FF6B6B")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#334155")}
                  >✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}