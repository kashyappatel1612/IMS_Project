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
  Layers,
  FileText,
  User,
  Paperclip,
  Download,
  Check,
  ShieldCheck,
  Calendar,
  CheckSquare,
  Rocket,
  Search,
  Activity,
  Users,
  DollarSign
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { fetchAllIdeas, fetchAnalysisReports } from "../../services/api";
import {
  getSubmittedIdeas,
  getSubmittedAnalysisReports,
  updateAnalysisReportStatus
} from "../../utils/ideaStorage";

function PMDashboard({ userName = "Project Manager" }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const backendIdeas = await fetchAllIdeas();
      if (backendIdeas && backendIdeas.length > 0) {
        setIdeas(backendIdeas);
      } else {
        setIdeas(getSubmittedIdeas());
      }
    } catch (err) {
      setIdeas(getSubmittedIdeas());
    }

    try {
      const backendReports = await fetchAnalysisReports();
      if (backendReports && backendReports.length > 0) {
        setReports(backendReports);
      } else {
        setReports(getSubmittedAnalysisReports());
      }
    } catch (err) {
      setReports(getSubmittedAnalysisReports());
    }
  };

  // Projects in PM Portfolio (Approved & Created Projects)
  const pmProjectQueue = ideas.filter(
    (i) =>
      i.status.includes("Passed") ||
      i.status.includes("Feasibility Approved") ||
      i.status.includes("Approved by BA") ||
      i.status.includes("Accepted by PM") ||
      i.status.includes("Project") ||
      i.status.includes("Execution")
  );

  const activeCount = pmProjectQueue.length;
  const pendingTasksCount = 14;
  const sprintProgressVal = "78% Complete";
  const upcomingMilestonesCount = 5;
  const overdueTasksCount = 2;
  const projectHealthIndex = "96% Healthy";

  const displayedProjects = pmProjectQueue.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterMode === "active") return item.status.includes("Execution") || item.status.includes("Project") || item.status.includes("Accepted by PM");
    if (filterMode === "completed") return item.status.includes("Completed") || item.status.includes("Approved");
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* PM Executive Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Project Manager Control Center</h1>
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
              <FolderKanban size={14} /> Agile Delivery Control Center ({userName})
            </span>
          </div>
          <p>
            Agile Project Management: Sprint planning, backlog tasks, milestone roadmaps, team allocation, and release sign-offs.
          </p>
        </div>

        <div className="quick-actions-flex" style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="primary"
            icon={Calendar}
            onClick={() => navigate("/sprint-planning")}
          >
            Sprint Planning
          </Button>
          <Button
            variant="outline"
            icon={Rocket}
            onClick={() => navigate("/release-management")}
          >
            Release Management
          </Button>
        </div>
      </div>

      {/* 6 SUMMARY KPI CARDS */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(6, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: Active Projects */}
        <div
          className={`kpi-mini-card ${filterMode === "active" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("active")}
          style={{ cursor: "pointer", border: filterMode === "active" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view Active Projects"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Active Projects</span>
            <div className="kpi-icon-pill pill-purple">
              <FolderKanban size={18} />
            </div>
          </div>
          <span className="kpi-num-val">{activeCount}</span>
        </div>

        {/* Card 2: Pending Tasks */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/task-management")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to view Pending Sprint Tasks"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Tasks</span>
            <div className="kpi-icon-pill pill-amber">
              <CheckSquare size={18} />
            </div>
          </div>
          <span className="kpi-num-val">{pendingTasksCount}</span>
        </div>

        {/* Card 3: Sprint Progress */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/sprint-planning")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to view Sprint Velocity"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Sprint Progress</span>
            <div className="kpi-icon-pill pill-green">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ fontSize: "16px", color: "#16a34a", fontWeight: "800" }}>
            {sprintProgressVal}
          </span>
        </div>

        {/* Card 4: Upcoming Milestones */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/progress-tracking")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to view Delivery Milestones"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Upcoming Milestones</span>
            <div className="kpi-icon-pill pill-blue">
              <Calendar size={18} />
            </div>
          </div>
          <span className="kpi-num-val">{upcomingMilestonesCount}</span>
        </div>

        {/* Card 5: Overdue Tasks */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/task-management")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to view Overdue Tasks & SLA Deadlines"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Overdue Tasks</span>
            <div className="kpi-icon-pill pill-red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#dc2626" }}>{overdueTasksCount}</span>
        </div>

        {/* Card 6: Project Health Index */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/quality-assurance")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to view Project Health & Quality Assurance Metrics"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Project Health</span>
            <div className="kpi-icon-pill pill-green">
              <Activity size={18} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ fontSize: "15px", color: "#059669", fontWeight: "800" }}>
            {projectHealthIndex}
          </span>
        </div>
      </div>

      {/* PROJECT OVERVIEW TABLE */}
      <Card
        title={`Active Project Execution & Delivery Portfolio (${displayedProjects.length})`}
        subtitle="Track sprint completion, team velocity, budget utilization, and milestone deadlines"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Project ID & Name</th>
                <th>Category</th>
                <th>Completion Progress</th>
                <th>Assigned Lead & Team</th>
                <th>Budget Utilization</th>
                <th>Target Release Date</th>
                <th>Health Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "28px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No projects found in PM portfolio</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedProjects.map((item, idx) => {
                  const pct = idx % 2 === 0 ? 82 : 55;
                  const budgetSpent = idx % 2 === 0 ? "$28,000 / $35,000" : "$14,000 / $25,000";

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "800", background: "#4f46e5", color: "#ffffff", padding: "1px 6px", borderRadius: "4px" }}>
                            PRJ-{item.id}
                          </span>
                          <span className="table-idea-title">{item.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-chip">{item.category}</span>
                      </td>
                      <td style={{ minWidth: "150px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700" }}>
                            <span>Sprint Completion</span>
                            <span>{pct}%</span>
                          </div>
                          <div style={{ height: "6px", width: "100%", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "var(--primary)", borderRadius: "4px" }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Users size={13} color="#6366f1" /> {item.author || "Tech Lead"} + 4 Devs
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>
                          {budgetSpent}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
                          <span style={{ fontWeight: "700", color: "#d97706" }}>Sep 15, 2026</span>
                          <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "600" }}>✓ On Schedule</span>
                        </div>
                      </td>
                      <td>
                        <span className="table-badge badge-approved" style={{ background: "#dcfce7", color: "#15803d" }}>
                          ● Healthy
                        </span>
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
                            Execution
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
