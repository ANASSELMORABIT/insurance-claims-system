import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { claimsService } from "../../services/claimsService";
import type { Claim } from "../../types";

const statusColor: Record<string, string> = {
  Pending: "#FFB800",
  UnderReview: "#00D4FF",
  Approved: "#00FF94",
  Rejected: "#FF6B6B",
  Closed: "#64748b",
};

const typeIcon: Record<string, string> = {
  Auto: "🚗", Home: "🏠", Health: "❤️", Life: "🌿", Travel: "✈️",
};

export default function ClaimsList() {
  const { isAdmin, isAgent, isClient } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["claims", page, statusFilter, typeFilter],
    queryFn: () => {
      const params: Record<string, unknown> = { page, pageSize: 10 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      return isClient
        ? claimsService.getMyClaims(params)
        : claimsService.getAll(params);
    },
  });

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#00D4FF", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>MANAGEMENT</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: "#f1f5f9", margin: 0, letterSpacing: "-0.5px" }}>
            Claims
          </h1>
          <p style={{ color: "#64748b", marginTop: "6px", fontSize: "14px" }}>
            {data?.totalCount ?? 0} total claims
          </p>
        </div>
        {(isAdmin || isAgent) && (
          <button
            onClick={() => navigate("/claims/new")}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #00D4FF, #00FF94)",
              border: "none", borderRadius: "10px",
              color: "#070710", fontWeight: 700,
              fontSize: "14px", cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "0.5px",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            + New Claim
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px", padding: "16px",
      }}>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Status</label>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              width: "100%", padding: "8px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px", color: "#e2e8f0",
              fontSize: "13px", cursor: "pointer",
            }}
          >
            <option value="">All statuses</option>
            <option value="1">Pending</option>
            <option value="2">Under Review</option>
            <option value="3">Approved</option>
            <option value="4">Rejected</option>
            <option value="5">Closed</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: "160px" }}>
          <label style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Type</label>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            style={{
              width: "100%", padding: "8px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px", color: "#e2e8f0",
              fontSize: "13px", cursor: "pointer",
            }}
          >
            <option value="">All types</option>
            <option value="1">Auto</option>
            <option value="2">Home</option>
            <option value="3">Health</option>
            <option value="4">Life</option>
            <option value="5">Travel</option>
          </select>
        </div>
        {(statusFilter || typeFilter) && (
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={() => { setStatusFilter(""); setTypeFilter(""); setPage(1); }}
              style={{
                padding: "8px 16px", background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.2)", borderRadius: "8px",
                color: "#FF6B6B", cursor: "pointer", fontSize: "13px",
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px", overflow: "hidden",
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
          gap: "16px", padding: "14px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}>
          {["Claim", "Type", "Status", "Client", "Amount", ""].map(h => (
            <div key={h} style={{ fontSize: "11px", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#475569" }}>Loading...</div>
        ) : data?.items.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>📋</div>
            <div style={{ color: "#64748b", fontSize: "15px" }}>No claims found</div>
            {(isAdmin || isAgent) && (
              <button
                onClick={() => navigate("/claims/new")}
                style={{
                  marginTop: "16px", padding: "10px 20px",
                  background: "rgba(0,212,255,0.1)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: "8px", color: "#00D4FF",
                  cursor: "pointer", fontSize: "13px",
                }}
              >
                Create first claim
              </button>
            )}
          </div>
        ) : (
          data?.items.map((claim: Claim) => (
            <div
              key={claim.id}
              onClick={() => navigate(`/claims/${claim.id}`)}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
                gap: "16px", padding: "16px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                  #{claim.id} {claim.title}
                </div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "3px" }}>
                  {new Date(claim.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#94a3b8" }}>
                <span>{typeIcon[claim.type] || "📋"}</span>
                {claim.type}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 600,
                  background: `${statusColor[claim.status] || "#64748b"}15`,
                  color: statusColor[claim.status] || "#64748b",
                  border: `1px solid ${statusColor[claim.status] || "#64748b"}30`,
                }}>
                  {claim.status}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center" }}>
                {claim.clientName}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#00FF94", display: "flex", alignItems: "center" }}>
                {claim.estimatedAmount ? `$${claim.estimatedAmount.toLocaleString()}` : "—"}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ color: "#475569", fontSize: "18px" }}>›</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!data.hasPrevious}
            style={{
              padding: "8px 16px", borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: data.hasPrevious ? "#e2e8f0" : "#475569",
              cursor: data.hasPrevious ? "pointer" : "not-allowed",
              fontSize: "13px",
            }}
          >
            ← Prev
          </button>
          <span style={{ color: "#64748b", fontSize: "13px" }}>
            Page {data.page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!data.hasNext}
            style={{
              padding: "8px 16px", borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: data.hasNext ? "#e2e8f0" : "#475569",
              cursor: data.hasNext ? "pointer" : "not-allowed",
              fontSize: "13px",
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}