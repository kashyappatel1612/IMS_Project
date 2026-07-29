import { ShieldCheck, Clock } from "lucide-react";

function QualityAssurance() {
  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Quality Assurance & Compliance Hub</h1>
            <span className="mode-badge-green" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
              <ShieldCheck size={14} /> Stage 6 Quality Gate
            </span>
          </div>
          <p>
            Quality Assurance, Automated Testing, and Deployment Sign-Off Module.
          </p>
        </div>
      </div>

      {/* Clean Empty Placeholder State */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "60px 20px",
          textAlign: "center",
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px"
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#e0e7ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ShieldCheck size={32} color="#4f46e5" />
        </div>

        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
            Quality Assurance Hub (Coming Soon)
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "500px", margin: "8px auto 0" }}>
            This space is reserved for enterprise quality gate sign-offs, automated test suite execution, and defect tracking.
          </p>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#f1f5f9",
            color: "#475569",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "700"
          }}
        >
          <Clock size={14} color="#6366f1" /> Status: Under Planned Module Roadmap
        </div>
      </div>
    </div>
  );
}

export default QualityAssurance;
