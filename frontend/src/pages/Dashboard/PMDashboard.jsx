import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  PlayCircle,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Eye,
  Inbox,
  Sparkles,
  Layers
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { fetchAllIdeas } from "../../services/api";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

function PMDashboard({ userName }) {
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

  // Filter projects ready for Project Execution (Approved proposals forwarded to Projects / Execution)
  const projectQueue = ideas.filter(
    (i) =>
      i.status.includes("Feasibility Approved") ||
      i.status.includes("Business Analysis") ||
      i.status.includes("Project") ||
      i.status.includes("Execution")
  );

  const displayedProjects = projectQueue.filter((item) => {
    if (filterMode === "active") return item.status.includes("Execution") || item.status.includes("Project");
    if (filterMode === "approved") return item.status.includes("Feasibility Approved");
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* PM Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Project Manager Control Center</h1>
            <span className="mode-badge-green" style={{ background: "#ecfdf5", color: "#059669" }}>
              <FolderKanban size={14} /> Project Manager Mode ({userName || "PM Lead"})
            </span>
          </div>
          <p>Track project execution roadmaps, sprint deliverables, milestone completion, and benefits realization.</p>
        </div>

        <div className="quick-actions-flex">
          <Button
            variant="primary"
            icon={FolderKanban}
            onClick={() => navigate("/projects")}
          >
            Open Projects Hub
          </Button>
          <Button
            variant="ghost"
            icon={PlayCircle}
            onClick={() => navigate("/execution")}
          >
            Execution Tracking
          </Button>
        </div>
      </div>

      {/* 4 Clickable PM Metric KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: Total Approved Projects */}
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view All Projects in PM Portfolio"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">PM Project Portfolio</span>
            <div className="kpi-icon-pill pill-purple">
              <FolderKanban size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{projectQueue.length}</span>
        </div>

        {/* Card 2: Active Execution */}
        <div
          className={`kpi-mini-card ${filterMode === "active" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("active")}
          style={{ cursor: "pointer", border: filterMode === "active" ? "2px solid #3b82f6" : "1px solid #e2e8f0" }}
          title="Click to view Active Projects in Execution"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Projects in Execution</span>
            <div className="kpi-icon-pill pill-blue">
              <PlayCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projectQueue.filter((i) => i.status.includes("Execution") || i.status.includes("Project")).length}
          </span>
        </div>

        {/* Card 3: Ready for Implementation */}
        <div
          className={`kpi-mini-card ${filterMode === "approved" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("approved")}
          style={{ cursor: "pointer", border: filterMode === "approved" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Approved Ideas ready for Onboarding"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Ready for Project Kick-off</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projectQueue.filter((i) => i.status.includes("Feasibility Approved")).length}
          </span>
        </div>

        {/* Card 4: Benefits Tracking */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/benefits-tracking")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to view Benefits Realization"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Benefits Realization</span>
            <div className="kpi-icon-pill pill-amber">
              <Award size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ fontSize: "16px", color: "#d97706", fontWeight: "700" }}>
            Track Benefits →
          </span>
        </div>
      </div>

      {/* Main PM Table */}
      <Card
        title={`Project Execution & Milestone Roadmap (${filterMode.toUpperCase()})`}
        subtitle="Monitor deliverables, target timelines, sprint progress, and risk management"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Domain / Category</th>
                <th>Project Lead / Author</th>
                <th>Current Status</th>
                <th>Execution Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No active projects found for "{filterMode}" filter</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedProjects.map((item, idx) => {
                  const progressPct = idx % 2 === 0 ? 80 : 45;
                  return (
                    <tr key={item.id}>
                      <td className="table-idea-title">{item.title}</td>
                      <td>
                        <span className="category-chip">{item.category}</span>
                      </td>
                      <td>{item.author}</td>
                      <td>
                        <span className="table-badge badge-approved">{item.status}</span>
                      </td>
                      <td style={{ minWidth: "150px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700" }}>
                            <span>Progress</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div style={{ height: "6px", width: "100%", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--primary)", borderRadius: "4px" }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={FolderKanban}
                            onClick={() => navigate("/projects")}
                          >
                            Manage Project
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={PlayCircle}
                            onClick={() => navigate("/execution")}
                          >
                            Track Execution
                          </Button>
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

export default PMDashboard;
