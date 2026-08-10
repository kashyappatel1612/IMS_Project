import { getCandidateWorkload } from "../utils/workloadUtils";

function WorkloadBalancingBox({ roleName, candidates = [], selectedCandidateValue = "", ideasList = [] }) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "10px 12px",
        marginTop: "6px",
        fontSize: "12px"
      }}
    >
      <div style={{ fontWeight: "700", color: "#334155", marginBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>⚖️ {roleName} Workload Summary</span>
        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal" }}>Assign work fairly</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {candidates.map((c) => {
          const name = c.name || c.username;
          const email = c.email || "";
          const valStr = `${name} (${email})`;
          const isSelected = selectedCandidateValue === valStr || selectedCandidateValue.includes(email);
          const workload = getCandidateWorkload(email || name, ideasList);

          return (
            <div
              key={c.id || email}
              style={{
                background: isSelected ? "#eff6ff" : "#ffffff",
                border: `1px solid ${isSelected ? "#3b82f6" : "#cbd5e1"}`,
                borderRadius: "6px",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: isSelected ? "700" : "500"
              }}
            >
              <span>{workload.statusIcon}</span>
              <span style={{ color: "#0f172a" }}>{name}</span>
              <span
                style={{
                  background: workload.badgeBg,
                  color: workload.badgeColor,
                  padding: "1px 6px",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "700"
                }}
              >
                {workload.activeCount} Active {workload.activeCount === 1 ? "Idea" : "Ideas"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WorkloadBalancingBox;
