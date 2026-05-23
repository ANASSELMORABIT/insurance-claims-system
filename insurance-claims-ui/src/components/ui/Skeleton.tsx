interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = "100%", height = "16px", borderRadius = "6px", style = {} }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background: "linear-gradient(90deg, #111118 25%, #1a1a24 50%, #111118 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      ...style,
    }} />
  );
}

export function ClaimsListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px",
          gap: "16px", padding: "18px 24px",
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Skeleton width="70%" height="13px" />
            <Skeleton width="40%" height="11px" />
          </div>
          <Skeleton width="60%" height="13px" style={{ alignSelf: "center" }} />
          <Skeleton width="80px" height="22px" borderRadius="20px" style={{ alignSelf: "center" }} />
          <Skeleton width="70%" height="13px" style={{ alignSelf: "center" }} />
          <Skeleton width="60%" height="13px" style={{ alignSelf: "center" }} />
          <Skeleton width="20px" height="20px" style={{ alignSelf: "center" }} />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <Skeleton width="120px" height="11px" style={{ marginBottom: "8px" }} />
        <Skeleton width="200px" height="32px" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ background: "#171717", borderRadius: "12px", padding: "16px", borderLeft: "3px solid #2a2a2a" }}>
            <Skeleton width="80%" height="10px" style={{ marginBottom: "12px" }} />
            <Skeleton width="50%" height="28px" style={{ marginBottom: "12px" }} />
            <Skeleton width="100%" height="2px" borderRadius="1px" />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
        <div style={{ background: "#171717", borderRadius: "12px", padding: "20px" }}>
          <Skeleton width="140px" height="13px" style={{ marginBottom: "16px" }} />
          <Skeleton width="100%" height="200px" borderRadius="8px" />
        </div>
        <div style={{ background: "#171717", borderRadius: "12px", padding: "20px" }}>
          <Skeleton width="100px" height="13px" style={{ marginBottom: "16px" }} />
          <Skeleton width="140px" height="140px" borderRadius="50%" style={{ margin: "0 auto 16px" }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <Skeleton width="60%" height="12px" />
              <Skeleton width="20%" height="12px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ background: "#171717", borderRadius: "16px", padding: "32px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
          <Skeleton width="80px" height="80px" borderRadius="20px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="200px" height="24px" style={{ marginBottom: "10px" }} />
            <Skeleton width="80px" height="22px" borderRadius="20px" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: "#1c1c1c", borderRadius: "12px", padding: "20px" }}>
              <Skeleton width="50%" height="28px" style={{ margin: "0 auto 8px" }} />
              <Skeleton width="80%" height="11px" style={{ margin: "0 auto" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "#1c1c1c", borderRadius: "8px", padding: "14px 16px" }}>
              <Skeleton width="60%" height="11px" style={{ marginBottom: "6px" }} />
              <Skeleton width="80%" height="14px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}