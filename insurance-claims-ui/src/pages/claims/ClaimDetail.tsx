import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { claimsService } from "../../services/claimsService";
import { documentService } from "../../services/documentService";

const statusColor: Record<string, string> = {
  Pending: "#FFB800", UnderReview: "#00D4FF",
  Approved: "#00FF94", Rejected: "#FF6B6B", Closed: "#64748b",
};

const typeIcon: Record<string, string> = {
  Auto: "🚗", Home: "🏠", Health: "❤️", Life: "🌿", Travel: "✈️",
};

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isAgent } = useAuth();
  const queryClient = useQueryClient();

  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const { data: claim, isLoading } = useQuery({
    queryKey: ["claim", id],
    queryFn: () => claimsService.getById(Number(id)),
  });

  const { data: documents, refetch: refetchDocs } = useQuery({
    queryKey: ["documents", id],
    queryFn: () => documentService.getByClaimId(Number(id)),
  });

  const handleStatusUpdate = async () => {
    if (!newStatus || !comment) return;
    setStatusLoading(true);
    try {
      await claimsService.updateStatus(Number(id), {
        status: Number(newStatus),
        comment,
      });
      queryClient.invalidateQueries({ queryKey: ["claim", id] });
      setNewStatus("");
      setComment("");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      await documentService.upload(Number(id), file);
      refetchDocs();
    } finally {
      setUploadLoading(false);
      e.target.value = "";
    }
  };

  const handleDownload = async (docId: number, fileName: string) => {
    const blob = await documentService.download(docId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (docId: number) => {
    await documentService.delete(docId);
    refetchDocs();
  };

  if (isLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ color: "#00D4FF", fontFamily: "'Syne', sans-serif", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  if (!claim) return null;

  return (
    <div style={{ animation: "fadeIn 0.4s ease", maxWidth: "1100px" }}>
      {/* Back */}
      <button
        onClick={() => navigate("/claims")}
        style={{
          background: "none", border: "none", color: "#64748b",
          cursor: "pointer", fontSize: "13px", marginBottom: "24px",
          display: "flex", alignItems: "center", gap: "6px", padding: 0,
        }}
      >
        ← Back to Claims
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px" }}>{typeIcon[claim.type] || "📋"}</span>
            <span style={{ fontSize: "11px", color: "#64748b", letterSpacing: "2px", textTransform: "uppercase" }}>
              Claim #{claim.id}
            </span>
            <span style={{
              fontSize: "11px", padding: "3px 10px", borderRadius: "20px", fontWeight: 700,
              background: `${statusColor[claim.status]}20`,
              color: statusColor[claim.status],
              border: `1px solid ${statusColor[claim.status]}40`,
            }}>
              {claim.status}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
            {claim.title}
          </h1>
        </div>
        {claim.estimatedAmount && (
          <div style={{
            padding: "16px 24px",
            background: "linear-gradient(135deg, rgba(0,255,148,0.1), rgba(0,212,255,0.05))",
            border: "1px solid rgba(0,255,148,0.2)", borderRadius: "12px", textAlign: "right",
          }}>
            <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", marginBottom: "4px" }}>ESTIMATED</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#00FF94", fontFamily: "'Syne', sans-serif" }}>
              ${claim.estimatedAmount.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Details */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px", letterSpacing: "0.5px" }}>CLAIM DETAILS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              {[
                { label: "Type", value: `${typeIcon[claim.type]} ${claim.type}` },
                { label: "Policy", value: claim.policyNumber },
                { label: "Client", value: claim.clientName },
                { label: "Agent", value: claim.agentName || "Not assigned" },
                { label: "Incident Date", value: new Date(claim.incidentDate).toLocaleDateString() },
                { label: "Created", value: new Date(claim.createdAt).toLocaleDateString() },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>Description</div>
              <div style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.7" }}>{claim.description}</div>
            </div>
          </div>

          {/* Documents */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.5px" }}>DOCUMENTS ({documents?.length ?? 0})</div>
              <label style={{
                padding: "8px 16px", background: "rgba(0,212,255,0.1)",
                border: "1px solid rgba(0,212,255,0.2)", borderRadius: "8px",
                color: "#00D4FF", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              }}>
                {uploadLoading ? "Uploading..." : "+ Upload"}
                <input type="file" onChange={handleFileUpload} style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              </label>
            </div>
            {documents?.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: "#475569", fontSize: "13px" }}>No documents uploaded</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {documents?.map(doc => (
                  <div key={doc.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: "rgba(255,255,255,0.02)",
                    borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>
                        {doc.fileType === ".pdf" ? "📄" : doc.fileType.includes("image") ? "🖼️" : "📎"}
                      </span>
                      <div>
                        <div style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>{doc.fileName}</div>
                        <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{doc.fileSizeFormatted}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleDownload(doc.id, doc.fileName)}
                        style={{ padding: "6px 12px", background: "rgba(0,255,148,0.1)", border: "1px solid rgba(0,255,148,0.2)", borderRadius: "6px", color: "#00FF94", cursor: "pointer", fontSize: "12px" }}
                      >↓</button>
                      {(isAdmin || isAgent) && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          style={{ padding: "6px 12px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "6px", color: "#FF6B6B", cursor: "pointer", fontSize: "12px" }}
                        >✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Update Status */}
          {(isAdmin || isAgent) && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px", letterSpacing: "0.5px" }}>UPDATE STATUS</div>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>New Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px" }}
                >
                  <option value="">Select status...</option>
                  <option value="1">Pending</option>
                  <option value="2">Under Review</option>
                  <option value="3">Approved</option>
                  <option value="4">Rejected</option>
                  <option value="5">Closed</option>
                </select>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Comment</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Add a comment..."
                  style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e2e8f0", fontSize: "13px", resize: "vertical", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || !comment || statusLoading}
                style={{
                  width: "100%", padding: "11px",
                  background: (!newStatus || !comment) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #00D4FF, #00FF94)",
                  border: "none", borderRadius: "8px",
                  color: (!newStatus || !comment) ? "#475569" : "#070710",
                  fontWeight: 700, fontSize: "13px",
                  cursor: (!newStatus || !comment) ? "not-allowed" : "pointer",
                  fontFamily: "'Syne', sans-serif",
                  transition: "opacity 0.2s",
                }}
              >
                {statusLoading ? "Updating..." : "Update Status"}
              </button>
            </div>
          )}

          {/* Status History */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px", letterSpacing: "0.5px" }}>STATUS HISTORY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {claim.statusHistory.map((h, i) => (
                <div key={h.id} style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
                      background: i === 0 ? statusColor[h.status] || "#64748b" : "#1e293b",
                      border: `2px solid ${statusColor[h.status] || "#64748b"}`,
                      marginTop: "3px",
                    }} />
                    {i < claim.statusHistory.length - 1 && (
                      <div style={{ width: "1px", flex: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 700,
                        color: statusColor[h.status] || "#64748b",
                        letterSpacing: "0.5px",
                      }}>{h.status}</span>
                      <span style={{ fontSize: "10px", color: "#475569" }}>
                        {new Date(h.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>{h.comment}</div>
                    <div style={{ fontSize: "11px", color: "#334155" }}>by {h.changedBy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}