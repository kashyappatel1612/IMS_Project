import { useState, useEffect } from "react";
import { Clock, UserCheck, CheckCircle2, AlertCircle, ShieldCheck, User } from "lucide-react";
import { fetchIdeaAssignmentHistory } from "../services/api";

function IdeaAssignmentHistory({ ideaId }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ideaId) {
      loadHistory();
    }
  }, [ideaId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchIdeaAssignmentHistory(ideaId);
      setHistory(data || []);
    } catch (err) {
      console.warn("Failed to load history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ fontSize: "12px", color: "#64748b", padding: "10px 0" }}>
        Loading assignment history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic", padding: "8px 0" }}>
        No formal assignments recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      <h5 style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a", textTransform: "uppercase" }}>
        Role Assignment Audit Log ({history.length})
      </h5>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {history.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "4px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "800", color: "#4f46e5" }}>
                Role: {item.assignedRole}
              </span>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                {item.assignedAt || "Aug 2026"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", color: "#334155" }}>
              <div>
                <strong>Assigned To:</strong> {item.assignedUserName} ({item.assignedUserEmail || "N/A"})
              </div>
              <div>
                <strong>Assigned By:</strong> {item.assignedByName || "Project Coordinator"}
              </div>
              <div>
                <strong>Status:</strong> <span style={{ fontWeight: "700", color: "#16a34a" }}>{item.status || "Pending"}</span>
              </div>
            </div>

            {item.remarks && (
              <div style={{ fontSize: "11px", color: "#475569", background: "#f8fafc", padding: "6px 8px", borderRadius: "4px", marginTop: "2px" }}>
                <strong>Remarks:</strong> {item.remarks}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IdeaAssignmentHistory;
