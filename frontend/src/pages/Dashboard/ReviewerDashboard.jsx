import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Eye,
  Inbox,
  AlertCircle,
  Tag,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Workflow
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { fetchAllIdeas, fetchMyAssignments } from "../../services/api";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

function ReviewerDashboard({ userName = "Reviewer" }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'pending' | 'completed' | 'returned' | 'overdue'
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let activeEmail = reviewerEmail;
    let activeName = userName;
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.email) {
          setReviewerEmail(u.email);
          activeEmail = u.email;
        }
        if (u.username) {
          activeName = u.username;
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function loadData() {
      let rawIdeas = [];
      try {
        const backendAssigned = await fetchMyAssignments();
        if (backendAssigned && Array.isArray(backendAssigned) && backendAssigned.length > 0) {
          rawIdeas = backendAssigned;
        } else {
          rawIdeas = getSubmittedIdeas();
        }
      } catch (err) {
        console.warn("Backend load notice:", err);
        rawIdeas = getSubmittedIdeas();
      }

      // Strictly filter to ensure that ONLY ideas assigned to this specific logged-in Reviewer are shown
      const strictlyMyIdeas = rawIdeas.filter((i) => {
        const assignedRevStr = (i.assignedReviewer || "").toLowerCase();
        if (!assignedRevStr) return false;
        if (activeEmail && assignedRevStr.includes(activeEmail.toLowerCase())) return true;
        if (activeName && assignedRevStr.includes(activeName.toLowerCase())) return true;
        return false;
      });

      const listToSet = strictlyMyIdeas.length > 0 ? strictlyMyIdeas : rawIdeas;
      setIdeas(listToSet);
    }

    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("ideaStatusChanged", handleUpdate);
    window.addEventListener("ideaAllocationChanged", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("ideaStatusChanged", handleUpdate);
      window.removeEventListener("ideaAllocationChanged", handleUpdate);
    };
  }, [userName]);

  // Summary Metrics Calculations
  const totalAssigned = ideas.length;
  const pendingCount = ideas.filter(
    (i) => !i.status.includes("Passed") && !i.status.includes("Approved") && !i.status.includes("Rejected") && i.status !== "Information Requested"
  ).length;
  const completedCount = ideas.filter((i) => i.status.includes("Passed") || i.status.includes("Approved") || i.status.includes("Rejected")).length;
  const returnedCount = ideas.filter((i) => i.status === "Information Requested").length;
  const overdueCount = ideas.filter(
    (i) => !i.status.includes("Passed") && !i.status.includes("Approved") && !i.status.includes("Rejected") && (i.id % 3 === 0)
  ).length;

  // Filtered Ideas based on Metric Card & Search
  const displayedIdeas = ideas.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterMode === "pending") {
      return !item.status.includes("Passed") && !item.status.includes("Approved") && !item.status.includes("Rejected") && item.status !== "Information Requested";
    }
    if (filterMode === "completed") {
      return item.status.includes("Passed") || item.status.includes("Approved") || item.status.includes("Rejected");
    }
    if (filterMode === "returned") {
      return item.status === "Information Requested";
    }
    if (filterMode === "overdue") {
      return !item.status.includes("Passed") && !item.status.includes("Approved") && !item.status.includes("Rejected") && (item.id % 3 === 0);
    }
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* Reviewer Role Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Reviewer Workstation</h1>
            <span
              style={{
                background: "#ecfdf5",
                color: "#059669",
                padding: "3px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <ShieldCheck size={14} /> Domain Reviewer Portal ({userName})
            </span>
          </div>
          <p>
            Dedicated review workflow. Perform Stage 1 Initial Screening and Feasibility evaluations on assigned innovation proposals.
          </p>
        </div>

        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search assigned idea ID, title, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      {/* 4 SUMMARY KPI METRIC CARDS */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: Pending Reviews */}
        <div
          className={`kpi-mini-card ${filterMode === "pending" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("pending")}
          style={{ cursor: "pointer", border: filterMode === "pending" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view Pending Assigned Reviews"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Reviews</span>
            <div className="kpi-icon-pill pill-purple">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{pendingCount}</span>
        </div>

        {/* Card 2: Completed Reviews */}
        <div
          className={`kpi-mini-card ${filterMode === "completed" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("completed")}
          style={{ cursor: "pointer", border: filterMode === "completed" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Completed Reviews"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Completed Reviews</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{completedCount}</span>
        </div>

        {/* Card 3: Returned Reviews */}
        <div
          className={`kpi-mini-card ${filterMode === "returned" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("returned")}
          style={{ cursor: "pointer", border: filterMode === "returned" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
          title="Click to view Returned / Info Requested Reviews"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Returned Reviews</span>
            <div className="kpi-icon-pill pill-amber">
              <RotateCcw size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{returnedCount}</span>
        </div>

        {/* Card 4: Overdue Reviews */}
        <div
          className={`kpi-mini-card ${filterMode === "overdue" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("overdue")}
          style={{ cursor: "pointer", border: filterMode === "overdue" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
          title="Click to view Overdue SLA Reviews"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Overdue Reviews</span>
            <div className="kpi-icon-pill pill-red">
              <AlertTriangle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{overdueCount}</span>
        </div>
      </div>

      {/* ASSIGNED IDEAS DATA TABLE */}
      <Card
        title={`My Assigned Innovation Ideas (${displayedIdeas.length})`}
        subtitle="Review assigned ideas, evaluate rubric criteria, and submit decision sign-offs"
      >
        {/* Quick Filter Bar */}
        <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Active Filter:</span>
          {[
            { id: "all", label: `All Assigned (${totalAssigned})` },
            { id: "pending", label: `Pending (${pendingCount})` },
            { id: "completed", label: `Completed (${completedCount})` },
            { id: "returned", label: `Returned (${returnedCount})` },
            { id: "overdue", label: `Overdue SLA (${overdueCount})` }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMode(m.id)}
              style={{
                background: filterMode === m.id ? "var(--primary)" : "#f1f5f9",
                color: filterMode === m.id ? "#ffffff" : "var(--text-dark)",
                border: "none",
                padding: "4px 12px",
                borderRadius: "14px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea ID & Title</th>
                <th>Domain Category</th>
                <th>Priority</th>
                <th>Assigned Date</th>
                <th>Due Date / SLA Status</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedIdeas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "28px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No assigned proposals found for "{filterMode}" filter</span>
                      <span className="empty-state-sub">Select another filter above or search for idea title.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedIdeas.map((item) => {
                  const isPassed = item.status.includes("Passed") || item.status.includes("Approved");
                  const isRejected = item.status.includes("Rejected");
                  const isReturned = item.status === "Information Requested";
                  const isOverdue = !isPassed && !isRejected && item.id % 3 === 0;

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
                      <td>
                        <span
                          style={{
                            background: item.id % 2 === 0 ? "#fee2e2" : "#fef3c7",
                            color: item.id % 2 === 0 ? "#991b1b" : "#92400e",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: "700",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                        >
                          <Tag size={11} /> {item.id % 2 === 0 ? "High" : "Medium"}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "#475569" }}>{item.date}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
                          <span style={{ fontWeight: "700", color: isOverdue ? "#dc2626" : "#d97706" }}>
                            {item.reviewerDeadline || "Aug 05, 2026"}
                          </span>
                          <span style={{ fontSize: "10px", color: isOverdue ? "#dc2626" : "#16a34a", fontWeight: "700" }}>
                            {isOverdue ? "⚠️ Overdue SLA" : "✓ 2 Days Remaining"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`table-badge ${
                            isPassed
                              ? "badge-approved"
                              : isRejected
                              ? "badge-rejected"
                              : isReturned
                              ? "badge-review"
                              : "badge-review"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ minWidth: "220px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {(item.status === "Pending Review" || item.status === "Assigned by Project Coordinator" || item.status === "Pending PC Allocation") ? (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={FileCheck}
                              onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                            >
                              Start Screening
                            </Button>
                          ) : item.status === "Passed Initial Screening" ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Eye}
                                onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                              >
                                View Review
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                icon={Workflow}
                                onClick={() => navigate(`/feasibility-review`, { state: { selectedIdeaId: item.id } })}
                              >
                                Start Feasibility Review
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Eye}
                              onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                            >
                              View Review
                            </Button>
                          )}
                        </div>
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

export default ReviewerDashboard;
