import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { claimsService } from "../../services/claimsService";
import { useQuery } from "@tanstack/react-query";
import { policyService } from "../../services/policyService";
import { useToast } from "../../components/ui/Toast";

export default function ClaimForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "1",
    incidentDate: "",
    estimatedAmount: "",
    policyId: "",
    clientId: "admin-user-id-001",
  });

  const { data: policies } = useQuery({
    queryKey: ["policies-all"],
    queryFn: () => policyService.getAll({ pageSize: 100, activeOnly: true }),
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const claim = await claimsService.create({
        ...form,
        type: Number(form.type),
        policyId: Number(form.policyId),
        estimatedAmount: form.estimatedAmount ? Number(form.estimatedAmount) : null,
      });
      navigate(`/claims/${claim.id}`);
    } catch {
      toast.error("Failed to create claim", "Please check all fields and try again.");
      setError("Failed to create claim. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px", color: "#e2e8f0",
    fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
    outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block", fontSize: "11px",
    color: "#64748b", letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    fontWeight: 600, marginBottom: "8px",
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease", maxWidth: "700px" }}>

      {/* Back button */}
      <button
        onClick={() => navigate("/claims")}
        style={{
          background: "none", border: "none",
          color: "#64748b", cursor: "pointer",
          fontSize: "13px", marginBottom: "24px",
          display: "flex", alignItems: "center", gap: "6px", padding: 0,
        }}
      >
        <i className="bi bi-arrow-left" style={{ fontSize: "14px" }} />
        Back to Claims
      </button>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: "#00D4FF", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>
          NEW
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
          Create Claim
        </h1>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px", padding: "32px",
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

            {/* Title */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Title</label>
              <input
                name="title" value={form.title} onChange={handleChange}
                required placeholder="Brief description of the claim"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {/* Type */}
            <div>
              <label style={labelStyle}>Type</label>
              <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                <option value="1">Auto</option>
                <option value="2">Home</option>
                <option value="3">Health</option>
                <option value="4">Life</option>
                <option value="5">Travel</option>
              </select>
            </div>

            {/* Incident Date */}
            <div>
              <label style={labelStyle}>Incident Date</label>
              <input
                name="incidentDate" type="date" value={form.incidentDate}
                onChange={handleChange} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {/* Estimated Amount */}
            <div>
              <label style={labelStyle}>Estimated Amount ($)</label>
              <input
                name="estimatedAmount" type="number" value={form.estimatedAmount}
                onChange={handleChange} placeholder="0.00" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {/* Policy */}
            <div>
              <label style={labelStyle}>Policy</label>
              <select name="policyId" value={form.policyId} onChange={handleChange} required style={inputStyle}>
                <option value="">Select a policy...</option>
                {policies?.items.map(p => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.policyNumber} — {p.holderName}
                  </option>
                ))}
              </select>
              {policies?.items.length === 0 && (
                <div style={{ fontSize: "11px", color: "#FF6B6B", marginTop: "4px" }}>
                  No active policies found. Create one in Policies first.
                </div>
              )}
            </div>

            {/* Client ID */}
            <div>
              <label style={labelStyle}>Client ID</label>
              <input
                name="clientId" value={form.clientId} onChange={handleChange}
                required placeholder="User ID of the client" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                Use the user's ID (not email)
              </div>
            </div>

            {/* Description */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                required rows={4} placeholder="Detailed description of the incident..."
                style={{ ...inputStyle, resize: "vertical" }}
                onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "12px 16px", marginBottom: "20px",
              background: "rgba(255,107,107,0.1)",
              border: "1px solid rgba(255,107,107,0.2)",
              borderRadius: "8px", color: "#FF6B6B", fontSize: "13px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <i className="bi bi-exclamation-circle" style={{ fontSize: "14px" }} />
              {error}
            </div>
          )}

          {/* Auto-assign banner */}
          <div style={{
            padding: "12px 16px", marginBottom: "16px",
            background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.1)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "8px",
              background: "rgba(0,212,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <i className="bi bi-robot" style={{ fontSize: "16px", color: "#00D4FF" }} />
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#00D4FF" }}>
                Auto-assign enabled
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                The system will automatically assign the least loaded agent to this claim.
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button" onClick={() => navigate("/claims")}
              style={{
                flex: 1, padding: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px", color: "#94a3b8",
                cursor: "pointer", fontSize: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              <i className="bi bi-x-lg" style={{ fontSize: "13px" }} />
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                flex: 2, padding: "12px",
                background: loading ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg, #00D4FF, #00FF94)",
                border: "none", borderRadius: "10px",
                color: "#070710", fontWeight: 700,
                fontSize: "14px", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Syne', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {loading
                ? <><i className="bi bi-arrow-repeat" style={{ fontSize: "14px" }} /> Creating...</>
                : <><i className="bi bi-shield-plus" style={{ fontSize: "14px" }} /> Create Claim</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
