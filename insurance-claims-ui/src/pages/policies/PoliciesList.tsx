import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { policyService } from "../../services/policyService";
import type { PolicyResponse } from "../../services/policyService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { useConfirm } from "../../components/ui/ConfirmModal";


export default function PoliciesList() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const toast = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState({
    policyNumber: "", holderName: "", holderEmail: "",
    startDate: "", endDate: "", coverageAmount: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["policies", page],
    queryFn: () => policyService.getAll({ page, pageSize: 10 }),
  });

  const resetForm = () => {
    setForm({ policyNumber: "", holderName: "", holderEmail: "", startDate: "", endDate: "", coverageAmount: "" });
    setEditingId(null);
    setShowForm(false);
    setFormError("");
  };

  const handleEdit = (policy: PolicyResponse) => {
    setForm({
      policyNumber: policy.policyNumber,
      holderName: policy.holderName,
      holderEmail: policy.holderEmail,
      startDate: policy.startDate.split("T")[0],
      endDate: policy.endDate.split("T")[0],
      coverageAmount: policy.coverageAmount.toString(),
    });
    setEditingId(policy.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormLoading(true);
  setFormError("");
  try {
    const payload = { ...form, coverageAmount: Number(form.coverageAmount) };
    if (editingId) {
      await policyService.update(editingId, payload);
      toast.success("Policy updated");
    } else {
      await policyService.create(payload);
      toast.success("Policy created", `Policy ${form.policyNumber} has been created.`);
    }
    queryClient.invalidateQueries({ queryKey: ["policies"] });
    resetForm();
  } catch {
    setFormError("Failed to save policy.");
    toast.error("Failed to save policy");
  } finally {
    setFormLoading(false);
  }
};

  const handleToggle = async (id: number) => {
    await policyService.toggle(id);
    queryClient.invalidateQueries({ queryKey: ["policies"] });
  };

  const handleDelete = async (id: number) => {
  const ok = await confirm({
    title: "Delete Policy",
    message: "This will permanently delete the policy. Claims linked to it may be affected.",
    confirmLabel: "Delete Policy",
    danger: true,
  });
  if (!ok) return;
  try {
    await policyService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["policies"] });
    toast.success("Policy deleted");
  } catch {
    toast.error("Failed to delete policy");
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#00D4FF", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>MANAGEMENT</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>Policies</h1>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "14px" }}>{data?.totalCount ?? 0} total policies</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormError(""); }}
            style={{
              padding: "12px 24px",
              background: showForm ? "rgba(255,107,107,0.1)" : "linear-gradient(135deg, #00D4FF, #00FF94)",
              border: showForm ? "1px solid rgba(255,107,107,0.2)" : "none",
              borderRadius: "10px", color: showForm ? "#FF6B6B" : "#070710",
              fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "'Syne', sans-serif",
            }}
          >
            {showForm ? "✕ Cancel" : "+ New Policy"}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && isAdmin && (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px" }}>
            {editingId ? "EDIT POLICY" : "CREATE NEW POLICY"}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <input placeholder="Policy Number (e.g. POL-002)" value={form.policyNumber} onChange={e => setForm(p => ({ ...p, policyNumber: e.target.value }))} required style={inputStyle} />
              <input placeholder="Coverage Amount ($)" type="number" value={form.coverageAmount} onChange={e => setForm(p => ({ ...p, coverageAmount: e.target.value }))} required style={inputStyle} />
              <input placeholder="Holder Name" value={form.holderName} onChange={e => setForm(p => ({ ...p, holderName: e.target.value }))} required style={inputStyle} />
              <input placeholder="Holder Email" type="email" value={form.holderEmail} onChange={e => setForm(p => ({ ...p, holderEmail: e.target.value }))} required style={inputStyle} />
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>START DATE</label>
                <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>END DATE</label>
                <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} required style={inputStyle} />
              </div>
            </div>
            {formError && <div style={{ padding: "10px", marginBottom: "12px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "8px", color: "#FF6B6B", fontSize: "12px" }}>{formError}</div>}
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={resetForm} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#94a3b8", cursor: "pointer", fontSize: "13px" }}>Cancel</button>
              <button type="submit" disabled={formLoading} style={{ padding: "10px 24px", background: "linear-gradient(135deg, #00D4FF, #00FF94)", border: "none", borderRadius: "8px", color: "#070710", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                {formLoading ? "Saving..." : editingId ? "Update Policy" : "Create Policy"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 140px", gap: "16px", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          {["Policy #", "Holder", "Coverage", "Period", "Status", "Actions"].map(h => (
            <div key={h} style={{ fontSize: "11px", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>{h}</div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#475569" }}>Loading...</div>
        ) : data?.items.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#475569" }}>No policies found</div>
        ) : (
          data?.items.map((policy: PolicyResponse) => (
            <div key={policy.id} style={{
              display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 140px",
              gap: "16px", padding: "16px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#00D4FF" }}>{policy.policyNumber}</div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{policy.totalClaims} claims</div>
              </div>
              <div>
                <div style={{ fontSize: "13px", color: "#e2e8f0" }}>{policy.holderName}</div>
                <div style={{ fontSize: "11px", color: "#475569" }}>{policy.holderEmail}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", fontSize: "13px", fontWeight: 600, color: "#00FF94" }}>
                ${policy.coverageAmount.toLocaleString()}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>{new Date(policy.startDate).toLocaleDateString()}</div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>→ {new Date(policy.endDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  fontSize: "11px", padding: "3px 8px", borderRadius: "20px", fontWeight: 600,
                  background: policy.isExpired ? "rgba(255,107,107,0.1)" : policy.isActive ? "rgba(0,255,148,0.1)" : "rgba(100,116,139,0.1)",
                  color: policy.isExpired ? "#FF6B6B" : policy.isActive ? "#00FF94" : "#64748b",
                  border: `1px solid ${policy.isExpired ? "rgba(255,107,107,0.2)" : policy.isActive ? "rgba(0,255,148,0.2)" : "rgba(100,116,139,0.2)"}`,
                }}>
                  {policy.isExpired ? "Expired" : policy.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {isAdmin && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button onClick={() => handleEdit(policy)} style={{ padding: "5px 10px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "6px", color: "#00D4FF", cursor: "pointer", fontSize: "11px" }}>Edit</button>
                  <button onClick={() => handleToggle(policy.id)} style={{ padding: "5px 10px", background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "6px", color: "#FFB800", cursor: "pointer", fontSize: "11px" }}>
                    {policy.isActive ? "Off" : "On"}
                  </button>
                  <button onClick={() => handleDelete(policy.id)} style={{ padding: "5px 10px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "6px", color: "#FF6B6B", cursor: "pointer", fontSize: "11px" }}>Del</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!data.hasPrevious}
            style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: data.hasPrevious ? "#e2e8f0" : "#475569", cursor: data.hasPrevious ? "pointer" : "not-allowed", fontSize: "13px" }}>
            ← Prev
          </button>
          <span style={{ color: "#64748b", fontSize: "13px", display: "flex", alignItems: "center" }}>{data.page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!data.hasNext}
            style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: data.hasNext ? "#e2e8f0" : "#475569", cursor: data.hasNext ? "pointer" : "not-allowed", fontSize: "13px" }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}