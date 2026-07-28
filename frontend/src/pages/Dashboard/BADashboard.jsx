import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  TrendingUp,
  FileText,
  DollarSign,
  Calculator,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Eye,
  Inbox,
  Sparkles,
  PieChart,
  Briefcase
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { fetchAllIdeas } from "../../services/api";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

function BADashboard({ userName }) {
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

  // Filter ideas relevant to Business Analysis (Feasibility Approved or in BA/Estimation stage)
  const baQueue = ideas.filter(
    (i) => i.status.includes("Feasibility Approved") || i.status.includes("Business Analysis") || i.status.includes("Estimation")
  );

  const displayedQueue = baQueue.filter((item) => {
    if (filterMode === "pending") return item.status.includes("Feasibility Approved");
    if (filterMode === "completed") return item.status.includes("Business Analysis") || item.status.includes("Estimation");
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* BA Executive Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Business Analyst Portal</h1>
            <span className="mode-badge-green" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
              <Briefcase size={14} /> Business Analyst Mode ({userName || "BA Leader"})
            </span>
          </div>
          <p>Assess financial viability, market impact, strategic ROI, and cost estimates for feasible proposals.</p>
        </div>

        <div className="quick-actions-flex">
          <Button
            variant="primary"
            icon={BarChart}
            onClick={() => navigate("/business-analysis")}
          >
            Open Business Analysis Workspace
          </Button>
        </div>
      </div>

      {/* 4 Clickable BA Metric KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: BA Queue */}
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view All Proposals in BA Queue"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">BA Queue (Feasible Proposals)</span>
            <div className="kpi-icon-pill pill-purple">
              <BarChart size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{baQueue.length}</span>
        </div>

        {/* Card 2: Pending Case Studies */}
        <div
          className={`kpi-mini-card ${filterMode === "pending" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("pending")}
          style={{ cursor: "pointer", border: filterMode === "pending" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
          title="Click to view Pending Business Cases"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Business Case</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {baQueue.filter((i) => i.status.includes("Feasibility Approved")).length}
          </span>
        </div>

        {/* Card 3: High ROI Projections */}
        <div
          className={`kpi-mini-card ${filterMode === "completed" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("completed")}
          style={{ cursor: "pointer", border: filterMode === "completed" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Analyzed Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Assessed & Forwarded</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {baQueue.filter((i) => i.status.includes("Business Analysis") || i.status.includes("Estimation")).length}
          </span>
        </div>

        {/* Card 4: Estimation Required */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/estimation")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to open Cost Estimation module"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Cost & Effort Estimation</span>
            <div className="kpi-icon-pill pill-blue">
              <Calculator size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ fontSize: "16px", color: "var(--primary)", fontWeight: "700" }}>
            Open Estimator →
          </span>
        </div>
      </div>

      {/* Main BA Table */}
      <Card
        title={`Business Analysis & Commercial Viability Proposals (${filterMode.toUpperCase()})`}
        subtitle="Manage business case development, ROI modeling, and cost estimation"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea Title</th>
                <th>Category / Domain</th>
                <th>Submitted By</th>
                <th>Feasibility Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No proposals in Business Analysis Queue</span>
                      <span className="empty-state-sub">Proposals approved in Feasibility Review will automatically appear here.</span>
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
                      <span className="table-badge badge-approved">{item.status}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={BarChart}
                          onClick={() => navigate("/business-analysis")}
                        >
                          Analyze ROI
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Calculator}
                          onClick={() => navigate("/estimation")}
                        >
                          Estimate Cost
                        </Button>
                      </div>
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

export default BADashboard;
