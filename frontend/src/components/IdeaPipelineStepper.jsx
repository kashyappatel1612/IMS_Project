import { CheckCircle2, Clock, XCircle, ChevronRight, UserCheck, ShieldCheck, BarChart, Calculator, FolderKanban, PlayCircle, Award } from "lucide-react";
import { getIdeaPipelineStatus } from "../utils/ideaPipeline";

const STAGE_ICONS = {
  1: UserCheck,
  2: UserCheck,
  3: ShieldCheck,
  4: BarChart,
  5: Calculator,
  6: FolderKanban,
  7: PlayCircle,
  8: Award
};

function IdeaPipelineStepper({ idea, compact = false }) {
  const pipeline = getIdeaPipelineStatus(idea);

  if (compact) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "170px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700" }}>
          <span style={{ color: pipeline.isRejected ? "#dc2626" : pipeline.percent === 100 ? "#16a34a" : "#4f46e5" }}>
            Stage {pipeline.currentStageIndex}/8: {pipeline.currentStageName}
          </span>
          <span style={{ color: "#64748b" }}>{pipeline.percent}%</span>
        </div>
        <div style={{ height: "6px", width: "100%", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pipeline.percent}%`,
              background: pipeline.isRejected ? "#ef4444" : pipeline.percent === 100 ? "#22c55e" : "linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)",
              borderRadius: "4px",
              transition: "width 0.4s ease"
            }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 0", width: "100%" }}>
      {/* Top Stage Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <span style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
            End-to-End Pipeline Progress
          </span>
          <h4 style={{ margin: "2px 0 0 0", fontSize: "16px", fontWeight: "800", color: pipeline.isRejected ? "#dc2626" : "#0f172a" }}>
            {pipeline.isRejected ? "Proposal Rejected" : pipeline.currentStageLabel}
          </h4>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              background: pipeline.isRejected ? "#fee2e2" : pipeline.percent === 100 ? "#dcfce7" : "#e0e7ff",
              color: pipeline.isRejected ? "#dc2626" : pipeline.percent === 100 ? "#15803d" : "#4338ca",
              padding: "4px 12px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: "700"
            }}
          >
            {pipeline.percent}% Completed
          </span>
        </div>
      </div>

      {/* Visual Stepper Track */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "6px", position: "relative" }}>
        {pipeline.stages.map((stg) => {
          const IconComp = STAGE_ICONS[stg.id] || CheckCircle2;
          const isDone = stg.status === "completed";
          const isCurrent = stg.status === "current";
          const isRejected = stg.status === "rejected";

          let circleBg = "#f1f5f9";
          let circleColor = "#94a3b8";
          let circleBorder = "1px solid #cbd5e1";

          if (isDone) {
            circleBg = "#22c55e";
            circleColor = "#ffffff";
            circleBorder = "none";
          } else if (isCurrent) {
            circleBg = "#4f46e5";
            circleColor = "#ffffff";
            circleBorder = "2px solid #818cf8";
          } else if (isRejected) {
            circleBg = "#ef4444";
            circleColor = "#ffffff";
            circleBorder = "none";
          }

          return (
            <div
              key={stg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative"
              }}
              title={`${stg.label}: ${stg.description}`}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: circleBg,
                  color: circleColor,
                  border: circleBorder,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "800",
                  fontSize: "13px",
                  boxShadow: isCurrent ? "0 0 0 4px rgba(79, 70, 229, 0.2)" : "none",
                  transition: "all 0.3s ease",
                  marginBottom: "8px"
                }}
              >
                {isDone ? <CheckCircle2 size={20} /> : isRejected ? <XCircle size={20} /> : <IconComp size={18} />}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: isCurrent ? "800" : "600",
                  color: isCurrent ? "#4f46e5" : isDone ? "#1e293b" : "#64748b",
                  lineHeight: "1.2"
                }}
              >
                {stg.name}
              </span>
              <span style={{ fontSize: "9px", color: "#94a3b8", marginTop: "2px" }}>
                S{stg.id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default IdeaPipelineStepper;
