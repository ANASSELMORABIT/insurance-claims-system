import { useState, useEffect, createContext, useContext, useCallback } from "react";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const toastColors: Record<
  ToastType,
  {
    bg: string;
    border: string;
    icon: any;
    color: string;
  }
> = {
  success: {
    bg: "rgba(0,255,148,0.08)",
    border: "rgba(0,255,148,0.25)",
    icon: CheckCircle2,
    color: "#00FF94",
  },
  error: {
    bg: "rgba(255,107,107,0.08)",
    border: "rgba(255,107,107,0.25)",
    icon: XCircle,
    color: "#FF6B6B",
  },
  warning: {
    bg: "rgba(255,184,0,0.08)",
    border: "rgba(255,184,0,0.25)",
    icon: AlertTriangle,
    color: "#FFB800",
  },
  info: {
    bg: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.25)",
    icon: Info,
    color: "#00D4FF",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      duration = 4000
    ) => {
      const id = `${Date.now()}-${Math.random()}`;

      setToasts(prev => [
        ...prev.slice(-4),
        { id, type, title, message, duration }
      ]);

      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [remove]
  );

  const ctx: ToastContextType = {
    success: (t, m) => add("success", t, m),
    error: (t, m) => add("error", t, m),
    warning: (t, m) => add("warning", t, m),
    info: (t, m) => add("info", t, m),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 9999,
          maxWidth: "360px",
          width: "calc(100% - 48px)",
        }}
      >
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => remove(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  const c = toastColors[toast.type];
  const Icon = c.icon;

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
  }, []);

  return (
    <div
      style={{
        background: "#0d0d1a",
        border: `1px solid ${c.border}`,
        borderLeft: `3px solid ${c.color}`,
        borderRadius: "12px",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        transform: visible
          ? "translateX(0)"
          : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition:
          "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Icono rediseñado */}
      <div
        style={{
          width: "36px",
          height: "36px",
          minWidth: "36px",
          borderRadius: "50%",
          background: `${c.color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 14px ${c.color}33`,
          flexShrink: 0,
        }}
      >
        <Icon
          size={18}
          color={c.color}
          strokeWidth={2.5}
        />
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#f1f5f9",
            marginBottom: toast.message ? "3px" : 0,
          }}
        >
          {toast.title}
        </div>

        {toast.message && (
          <div
            style={{
              fontSize: "12px",
              color: "#64748b",
              lineHeight: "1.5",
            }}
          >
            {toast.message}
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#475569",
          cursor: "pointer",
          fontSize: "16px",
          padding: "0 2px",
          flexShrink: 0,
          lineHeight: 1,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "#94a3b8")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "#475569")
        }
      >
        ✕
      </button>
    </div>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error(
      "useToast must be used within ToastProvider"
    );
  }

  return ctx;
}