import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Cpu,
  Workflow,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Eye,
  Inbox,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { fetchAllIdeas } from "../../services/api";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

function ReviewerDashboard({ userName }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [filterMode, setFilterMode] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const backendIdeas = await fetchAllIdeas();
        if (backendIdeas && backendIdeas.length > 0) {
          setIdeas(backendIdeas);
          return;
        }
      } catch (err) {
        console.warn("Backend load error:", err);
      }
      setIdeas(getSubmittedIdeas());
    }
    loadData();
  }, []);

  // Filter ideas passed initial screening and in feasibility evaluation queue
  const reviewerQueue = ideas.filter(
    (i) => i.status.includes("Passed Initial Screening") || i.status.includes("Sent") || i.status.includes("Feasibility") || i.status.includes("Not ")
  );

  const displayedQueue = reviewerQueue.filter((item) => {
    if (filterMode === "pending") return !item.status.includes("Feasibility Approved") && !item.status.includes("Not ");
    if (filterMode === "approved") return item.status.includes("Feasibility Approved");
    if (filterMode === "rejected") return item.status.includes("Not ") || item.status.includes("Rejected");
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* Reviewer Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Reviewer Evaluation Portal</h1>
            <span className="mode-badge-green" style={{ background: "#fef3c7", color: "#d97706" }}>
              <ShieldCheck size={14} /> Technical & Functional Reviewer ({userName || "Expert Evaluator"})
            </span>
          </div>
          <p>Perform multi-dimensional Technical, Functional & Business assessments on proposals that passed Initial Screening.</p>
        </div>

        <div className="quick-actions-flex">
          <Button
            variant="primary"
            icon={FileCheck}
            onClick={() => navigate("/feasibility-review")}
          >
            Open Feasibility Workspace
          </Button>
        </div>
      </div>

      {/* 4 Clickable Reviewer Metric KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: Review Queue */}
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view All Assigned Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Passed Initial Screening Queue</span>
            <div className="kpi-icon-pill pill-purple">
              <Layers size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{reviewerQueue.length}</span>
        </div>

        {/* Card 2: Pending Evaluations */}
        <div
          className={`kpi-mini-card ${filterMode === "pending" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("pending")}
          style={{ cursor: "pointer", border: filterMode === "pending" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
          title="Click to view Pending Feasibility Evaluations"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Multi-Review</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {reviewerQueue.filter((i) => !i.status.includes("Feasibility Approved") && !i.status.includes("Not ")).length}
          </span>
        </div>

        {/* Card 3: Feasibility Approved */}
        <div
          className={`kpi-mini-card ${filterMode === "approved" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("approved")}
          style={{ cursor: "pointer", border: filterMode === "approved" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Feasibility Approved Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Feasibility Approved</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {reviewerQueue.filter((i) => i.status.includes("Feasibility Approved")).length}
          </span>
        </div>

        {/* Card 4: Non-Feasible Proposals */}
        <div
          className={`kpi-mini-card ${filterMode === "rejected" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("rejected")}
          style={{ cursor: "pointer", border: filterMode === "rejected" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
          title="Click to view Non-Feasible Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Non-Feasible / Rejected</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {reviewerQueue.filter((i) => i.status.includes("Not ") || i.status.includes("Rejected")).length}
          </span>
        </div>
      </div>

      {/* Main Reviewer Table */}
      <Card
        title={`Multi-Dimensional Feasibility Proposals (${filterMode.toUpperCase()})`}
        subtitle="Evaluate technical stack compatibility, functional adoption, and business risk"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea Title</th>
                <th>Category / Domain</th>
                <th>Author</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No proposals found for "{filterMode}" filter</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedQueue.map((item) => (
                  <tr key={item.id}>
                    <td className="table-idea-title">{item.title}</td>
                    <td>
                      <span className="category-chip">{item.category}</span>
                    </td>
                    <td>{item.author}</td>
                    <td>
                      <span
                        className={`table-badge ${
                          item.status.includes("Approved")
                            ? "badge-approved"
                            : item.status.includes("Not ") || item.status.includes("Rejected")
                            ? "badge-rejected"
                            : "badge-review"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={FileCheck}
                        onClick={() => navigate("/feasibility-review")}
                      >
                        Evaluate Proposal
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ReviewerDashboard;
