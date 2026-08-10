import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Inbox,
  Filter,
  ShieldCheck,
  Search,
  Award
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

function ReviewHistory() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const updateList = () => {
      const list = getSubmittedIdeas();
      setIdeas(list);
    };

    updateList();

    window.addEventListener("storage", updateList);
    window.addEventListener("ideaStatusChanged", updateList);

    return () => {
      window.removeEventListener("storage", updateList);
      window.removeEventListener("ideaStatusChanged", updateList);
    };
  }, []);

  // Filter completed or processed reviews
  const historyList = ideas.filter(
    (i) => i.status.includes("Passed") || i.status.includes("Approved") || i.status.includes("Rejected") || i.status.includes("Pending PM Approval") || i.status.includes("Accepted") || i.status === "Information Requested"
  );

  const displayedHistory = historyList.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery)
    );
  });

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Reviewer Decision History</h1>
            <span className="category-chip-indigo">
              <History size={14} /> Completed & Processed Reviews Audit
            </span>
          </div>
          <p>Historical audit trail of all completed screening and feasibility evaluations submitted by the Reviewer.</p>
        </div>

        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search title, category, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      <Card title={`Review History Logs (${displayedHistory.length})`} subtitle="Full record of evaluation decisions, rubric scores, and recommendations">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea ID & Title</th>
                <th>Category</th>
                <th>Submitted By</th>
                <th>Review Date</th>
                <th>Decision Outcome</th>
                <th>Evaluator Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "28px" }}>
                    <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No completed review history found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedHistory.map((item) => {
                  const isPassed = item.status.includes("Passed") || item.status.includes("Approved");
                  const isRejected = item.status.includes("Rejected");

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="table-idea-title">{item.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-chip">{item.category}</span>
                      </td>
                      <td>{item.author || "User"}</td>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>{item.date}</td>
                      <td>
                        <span
                          className={`table-badge ${
                            isPassed ? "badge-approved" : isRejected ? "badge-rejected" : "badge-review"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#334155", maxWidth: "250px" }}>
                        {item.evaluatorNotes || "Screening score 100/100 recorded."}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ReviewHistory;
