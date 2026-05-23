import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import type { UserResponse } from "../../services/userService";
import { useToast } from "../../components/ui/Toast";
import { useConfirm } from "../../components/ui/ConfirmModal";


const roleColors: Record<string, string> = {
  Admin: "#FF6B6B", Agent: "#00FF94", Client: "#FFB800",
};

export default function UsersList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "Client" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, roleFilter],
    queryFn: () => userService.getAll({ page, pageSize: 10, role: roleFilter || undefined }),
  });

  const handleToggle = async (id: string, isActive: boolean) => {
  const ok = await confirm({
    title: isActive ? "Disable User" : "Enable User",
    message: isActive
      ? "This user will no longer be able to access the system."
      : "This user will regain access to the system.",
    confirmLabel: isActive ? "Disable" : "Enable",
    danger: isActive,
  });
  if (!ok) return;
  try {
    await userService.toggleActive(id);
    queryClient.invalidateQueries({ queryKey: ["users"] });
    toast.success(isActive ? "User disabled" : "User enabled");
  } catch {
    toast.error("Action failed");
  }
};

  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormLoading(true);
  setFormError("");
  try {
    await userService.create(form);
    queryClient.invalidateQueries({ queryKey: ["users"] });
    setShowForm(false);
    setForm({ firstName: "", lastName: "", email: "", password: "", role: "Client" });
    toast.success("User created", `${form.firstName} ${form.lastName} has been added successfully.`);
  } catch {
    setFormError("Failed to create user. Email may already exist.");
    toast.error("Failed to create user");
  } finally {
    setFormLoading(false);
  }
};

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px", color: "#e2e8f0",
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", outline: "none",
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#00D4FF", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>ADMIN</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Users</h1>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "14px" }}>{data?.totalCount ?? 0} total users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "12px 24px",
            background: showForm ? "rgba(255,107,107,0.1)" : "linear-gradient(135deg, #00D4FF, #00FF94)",
            border: showForm ? "1px solid rgba(255,107,107,0.2)" : "none",
            borderRadius: "10px", color: showForm ? "#FF6B6B" : "#070710",
            fontWeight: 700, fontSize: "14px", cursor: "pointer",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {showForm ? "✕ Cancel" : "+ New User"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px" }}>CREATE NEW USER</div>
          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <input placeholder="First Name" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required style={inputStyle} />
              <input placeholder="Last Name" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required style={inputStyle} />
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required style={inputStyle} />
              <input placeholder="Password (min 8 chars)" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required style={inputStyle} />
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, gridColumn: "1 / -1" }}>
                <option value="Client">Client</option>
                <option value="Agent">Agent</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {formError && <div style={{ padding: "10px", marginBottom: "12px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "8px", color: "#FF6B6B", fontSize: "12px" }}>{formError}</div>}
            <button type="submit" disabled={formLoading} style={{ padding: "10px 24px", background: "linear-gradient(135deg, #00D4FF, #00FF94)", border: "none", borderRadius: "8px", color: "#070710", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
              {formLoading ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["", "Admin", "Agent", "Client"].map(r => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setPage(1); }}
            style={{
              padding: "7px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              background: roleFilter === r ? (r ? `${roleColors[r]}15` : "rgba(0,212,255,0.1)") : "rgba(255,255,255,0.03)",
              border: `1px solid ${roleFilter === r ? (r ? `${roleColors[r]}40` : "rgba(0,212,255,0.3)") : "rgba(255,255,255,0.08)"}`,
              color: roleFilter === r ? (r ? roleColors[r] : "#00D4FF") : "#64748b",
            }}
          >
            {r || "All Roles"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", gap: "16px", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          {["User", "Role", "Claims", "Documents", "Status", "Action"].map(h => (
            <div key={h} style={{ fontSize: "11px", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>{h}</div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#475569" }}>Loading...</div>
        ) : data?.items.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#475569" }}>No users found</div>
        ) : (
          data?.items.map((user: UserResponse) => (
            <div key={user.id} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px",
              gap: "16px", padding: "16px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
                  background: `${roleColors[user.role] || "#64748b"}20`,
                  border: `1px solid ${roleColors[user.role] || "#64748b"}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: roleColors[user.role] || "#64748b",
                }}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{user.firstName} {user.lastName}</div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>{user.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600,
                  background: `${roleColors[user.role]}15`, color: roleColors[user.role],
                  border: `1px solid ${roleColors[user.role]}30`,
                }}>{user.role}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#94a3b8" }}>{user.totalClaims}</div>
              <div style={{ display: "flex", alignItems: "center", fontSize: "13px", color: "#94a3b8" }}>{user.totalDocuments}</div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600,
                  background: user.isActive ? "rgba(0,255,148,0.1)" : "rgba(255,107,107,0.1)",
                  color: user.isActive ? "#00FF94" : "#FF6B6B",
                  border: `1px solid ${user.isActive ? "rgba(0,255,148,0.2)" : "rgba(255,107,107,0.2)"}`,
                }}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  onClick={() => handleToggle(user.id, user.isActive)}
                  style={{
                    padding: "6px 12px", fontSize: "11px", fontWeight: 600,
                    background: user.isActive ? "rgba(255,107,107,0.1)" : "rgba(0,255,148,0.1)",
                    border: `1px solid ${user.isActive ? "rgba(255,107,107,0.2)" : "rgba(0,255,148,0.2)"}`,
                    borderRadius: "6px", cursor: "pointer",
                    color: user.isActive ? "#FF6B6B" : "#00FF94",
                  }}
                >
                  {user.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!data.hasPrevious}
            style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: data.hasPrevious ? "#e2e8f0" : "#475569", cursor: data.hasPrevious ? "pointer" : "not-allowed", fontSize: "13px" }}>
            ← Prev
          </button>
          <span style={{ color: "#64748b", fontSize: "13px", display: "flex", alignItems: "center" }}>
            {data.page} / {data.totalPages}
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={!data.hasNext}
            style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: data.hasNext ? "#e2e8f0" : "#475569", cursor: data.hasNext ? "pointer" : "not-allowed", fontSize: "13px" }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}