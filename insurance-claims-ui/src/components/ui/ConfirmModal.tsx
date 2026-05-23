import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ open: true, options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state?.open && (
        <>
          {/* Overlay */}
          <div
            onClick={() => handleClose(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 8000,
            }}
          />
          {/* Modal */}
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 8001,
            width: "100%", maxWidth: "420px",
            margin: "0 16px",
          }}>
            <div style={{
              background: "#0d0d1a",
              border: `1px solid ${state.options.danger ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              fontFamily: "'DM Sans', sans-serif",
              animation: "slideUp 0.2s ease",
            }}>
              {/* Icon */}
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: state.options.danger ? "rgba(255,107,107,0.1)" : "rgba(0,212,255,0.1)",
                border: `1px solid ${state.options.danger ? "rgba(255,107,107,0.2)" : "rgba(0,212,255,0.2)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", marginBottom: "20px",
              }}>
                {state.options.danger ? "🗑️" : "❓"}
              </div>

              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "18px", fontWeight: 800,
                color: "#f1f5f9", margin: "0 0 10px",
              }}>
                {state.options.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 24px", lineHeight: "1.6" }}>
                {state.options.message}
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => handleClose(false)}
                  style={{
                    flex: 1, padding: "11px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px", color: "#94a3b8",
                    cursor: "pointer", fontSize: "14px",
                    fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  {state.options.cancelLabel || "Cancel"}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  style={{
                    flex: 1, padding: "11px",
                    background: state.options.danger
                      ? "linear-gradient(135deg, #FF6B6B, #ff4444)"
                      : "linear-gradient(135deg, #00D4FF, #00FF94)",
                    border: "none", borderRadius: "8px",
                    color: "#070710", fontWeight: 700,
                    cursor: "pointer", fontSize: "14px",
                    fontFamily: "'Syne', sans-serif",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  {state.options.confirmLabel || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}