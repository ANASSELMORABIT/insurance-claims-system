import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import type { ProfileStats } from "../../services/authService";

const roleColors: Record<string, string> = {
  Admin: "#FF6B6B",
  Agent: "#00FF94",
  Client: "#FFB800",
};

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div style={{
    padding: "20px", borderRadius: "12px",
    background: `${color}08`,
    border: `1px solid ${color}20`,
    textAlign: "center",
  }}>
    <div style={{ fontSize: "28px", fontWeight: 800, color, fontFamily: "'Syne', sans-serif" }}>{value}</div>
    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", letterSpacing: "1px", textTransform: "uppercase" }}>{label}</div>
  </div>
);

export default function Profile() {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();
  const roleColor = roleColors[user?.role || ""] || "#00D4FF";

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [changingPwd, setChangingPwd] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const { data: stats, isLoading } = useQuery<ProfileStats>({
    queryKey: ["profile-stats"],
    queryFn: authService.getProfileStats,
  });

  useEffect(() => {
    if (stats) {
      setFirstName(stats.firstName);
      setLastName(stats.lastName);
      setPhoneNumber(stats.phoneNumber || "");
    }
  }, [stats]);

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await authService.updateProfile({ firstName, lastName, phoneNumber });
      queryClient.invalidateQueries({ queryKey: ["profile-stats"] });
      if (user) login({ ...user, firstName, lastName });
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { setPwdError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setPwdError("Password must be at least 8 characters."); return; }
    setPwdLoading(true);
    setPwdError("");
    setPwdSuccess(false);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPwdSuccess(true);
      setChangingPwd(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch {
      setPwdError("Current password is incorrect.");
    } finally {
      setPwdLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
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
    fontWeight: 600, marginBottom: "6px",
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease", maxWidth: "800px" }}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: "#00D4FF", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>ACCOUNT</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, color: "#f1f5f9", margin: 0 }}>My Profile</h1>
      </div>

      {saveSuccess && (
        <div style={{ padding: "12px 16px", marginBottom: "16px", background: "rgba(0,255,148,0.1)", border: "1px solid rgba(0,255,148,0.2)", borderRadius: "8px", color: "#00FF94", fontSize: "13px" }}>
          ✅ Profile updated successfully.
        </div>
      )}
      {pwdSuccess && (
        <div style={{ padding: "12px 16px", marginBottom: "16px", background: "rgba(0,255,148,0.1)", border: "1px solid rgba(0,255,148,0.2)", borderRadius: "8px", color: "#00FF94", fontSize: "13px" }}>
          ✅ Password changed successfully.
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px", flexWrap: "wrap" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "20px",
            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "30px", fontWeight: 800, color: "#070710",
            fontFamily: "'Syne', sans-serif", flexShrink: 0,
            boxShadow: `0 8px 24px ${roleColor}30`,
          }}>
            {firstName?.[0]}{lastName?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" }}>
              {firstName} {lastName}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "4px 12px", borderRadius: "20px",
                background: `${roleColor}15`, border: `1px solid ${roleColor}30`,
              }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: roleColor }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: roleColor, letterSpacing: "1px" }}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              {stats && stats.isActive && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "4px 12px", borderRadius: "20px",
                  background: "rgba(0,255,148,0.08)", border: "1px solid rgba(0,255,148,0.2)",
                }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FF94" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#00FF94", letterSpacing: "1px" }}>ACTIVE</span>
                </div>
              )}
            </div>
            {stats && stats.createdAt && (
              <div style={{ fontSize: "12px", color: "#475569", marginTop: "8px" }}>
                Member since {new Date(stats.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            )}
          </div>
          <button
            onClick={() => { setEditing(!editing); setSaveError(""); }}
            style={{
              padding: "10px 20px",
              background: editing ? "rgba(255,107,107,0.1)" : "rgba(0,212,255,0.1)",
              border: `1px solid ${editing ? "rgba(255,107,107,0.2)" : "rgba(0,212,255,0.2)"}`,
              borderRadius: "8px", color: editing ? "#FF6B6B" : "#00D4FF",
              cursor: "pointer", fontSize: "13px", fontWeight: 600,
            }}
          >
            {editing ? "✕ Cancel" : "✎ Edit"}
          </button>
        </div>

        {!isLoading && stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
            <StatCard label="Total Claims" value={stats.totalClaims} color="#00D4FF" />
            <StatCard label="Pending" value={stats.pendingClaims} color="#FFB800" />
            <StatCard label="Approved" value={stats.approvedClaims} color="#00FF94" />
            <StatCard label="Documents" value={stats.totalDocuments} color="#B388FF" />
          </div>
        )}

        {editing ? (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px", letterSpacing: "0.5px" }}>EDIT PROFILE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Phone Number</label>
                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+34 600 000 000" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            </div>
            {saveError && (
              <div style={{ padding: "10px 14px", marginBottom: "16px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "8px", color: "#FF6B6B", fontSize: "13px" }}>
                {saveError}
              </div>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: "11px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#94a3b8", cursor: "pointer", fontSize: "13px" }}>
                Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={saveLoading} style={{ flex: 2, padding: "11px", background: saveLoading ? "rgba(0,212,255,0.3)" : "linear-gradient(135deg, #00D4FF, #00FF94)", border: "none", borderRadius: "8px", color: "#070710", fontWeight: 700, fontSize: "13px", cursor: saveLoading ? "not-allowed" : "pointer", fontFamily: "'Syne', sans-serif" }}>
                {saveLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "20px", letterSpacing: "0.5px" }}>ACCOUNT INFORMATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "First Name", value: stats?.firstName || user?.firstName },
                { label: "Last Name", value: stats?.lastName || user?.lastName },
                { label: "Email", value: stats?.email || user?.email },
                { label: "Phone", value: stats?.phoneNumber || "Not set" },
                { label: "Role", value: user?.role },
                { label: "Status", value: stats?.isActive ? "Active" : "Inactive" },
              ].map(item => (
                <div key={item.label} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 500 }}>{item.value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: changingPwd ? "24px" : "0" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0" }}>Password</div>
            <div style={{ fontSize: "13px", color: "#475569", marginTop: "2px" }}>Change your account password</div>
          </div>
          <button
            onClick={() => { setChangingPwd(!changingPwd); setPwdError(""); }}
            style={{
              padding: "10px 20px",
              background: changingPwd ? "rgba(255,107,107,0.1)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${changingPwd ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "8px", color: changingPwd ? "#FF6B6B" : "#94a3b8",
              cursor: "pointer", fontSize: "13px", fontWeight: 600,
            }}
          >
            {changingPwd ? "✕ Cancel" : "Change Password"}
          </button>
        </div>

        {changingPwd && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
              <div>
                <label style={labelStyle}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            </div>
            {pwdError && (
              <div style={{ padding: "10px 14px", marginBottom: "16px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "8px", color: "#FF6B6B", fontSize: "13px" }}>
                {pwdError}
              </div>
            )}
            <button
              onClick={handleChangePassword}
              disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}
              style={{
                width: "100%", padding: "12px",
                background: (!currentPassword || !newPassword || !confirmPassword) ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #FF6B6B, #FFB800)",
                border: "none", borderRadius: "8px",
                color: (!currentPassword || !newPassword || !confirmPassword) ? "#475569" : "#070710",
                fontWeight: 700, fontSize: "14px",
                cursor: (!currentPassword || !newPassword || !confirmPassword) ? "not-allowed" : "pointer",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              {pwdLoading ? "Changing..." : "Change Password →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}