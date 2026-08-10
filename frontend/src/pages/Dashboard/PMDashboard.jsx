import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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
  DollarSign,
  ThumbsUp,
  XCircle
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { fetchAllIdeas, fetchAnalysisReports, patchIdeaStatus, fetchMyAssignments } from "../../services/api";
import {
  getSubmittedIdeas,
  fetchIdeasFromApi,
  getSubmittedAnalysisReports,
  updateIdeaStatus,
  updateAnalysisReportStatus,
  SAMPLE_INITIAL_IDEAS
} from "../../utils/ideaStorage";

function PMDashboard({ userName = "Project Manager" }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingProposal, setViewingProposal] = useState(null);

  useEffect(() => {
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
  }, []);

  const loadData = async () => {
    let activeEmail = "";
    let activeName = userName;
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.email) activeEmail = u.email;
        if (u.username) activeName = u.username;
      } catch (e) {}
    }

    let rawIdeas = [];
    try {
      const assigned = await fetchMyAssignments();
      if (assigned && Array.isArray(assigned) && assigned.length > 0) {
        rawIdeas = assigned;
      } else {
        rawIdeas = getSubmittedIdeas();
      }
    } catch (err) {
      rawIdeas = getSubmittedIdeas();
    }

    // Strictly filter to ensure that ONLY ideas assigned to this specific logged-in Project Manager are shown
    const strictlyMyIdeas = rawIdeas.filter((i) => {
      const assignedPMStr = (i.assignedPM || "").toLowerCase();
      if (!assignedPMStr) return false;
      if (activeEmail && assignedPMStr.includes(activeEmail.toLowerCase())) return true;
      if (activeName && assignedPMStr.includes(activeName.toLowerCase())) return true;
      return false;
    });

    setIdeas(strictlyMyIdeas);

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

  const pendingPMApprovalList = ideas.filter((i) => {
    const s = i.status || "";
    return (
      s.includes("Pending PM Approval") ||
      s.includes("Feasibility Approved") ||
      s.includes("Approved by BA") ||
      s.includes("Approved by PM") ||
      s.includes("Accepted by PM") ||
      s.includes("Execution") ||
      s.includes("In Execution")
    ) && !s.includes("Rejected");
  });

  const handlePMAction = async (ideaId, newStatus) => {
    const notes = `PM Approval Action by ${userName}: Status updated to ${newStatus}`;
    try {
      await patchIdeaStatus(Number(ideaId), newStatus, notes);
    } catch (err) {
      console.warn("Backend status update error:", err);
    }
    updateIdeaStatus(Number(ideaId), newStatus, notes);
    toast.success(`Proposal IDEA-${ideaId} status updated to "${newStatus}"!`);
    loadData();
  };

  // Projects in PM Portfolio: ONLY after BA completes analysis & sends to PM or Project Onboarded
  const pmProjectQueue = ideas.filter(
    (i) =>
      i.status.includes("Approved by BA") ||
      i.status.includes("BA Analysis Completed") ||
      i.status.includes("Accepted by PM") ||
      i.status.includes("Execution") ||
      i.status.includes("In Execution")
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

    if (filterMode === "active") return item.status.includes("Execution") || item.status.includes("Accepted by PM");
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

      {/* PROPOSALS AWAITING PM APPROVAL & ACTION CARD */}
      <Card
        title={`🎯 Proposals Awaiting PM Approval & Action (${pendingPMApprovalList.length})`}
        subtitle="Proposals passed from Stage 2 Feasibility Review requiring Project Manager approval to proceed"
        style={{ marginBottom: "24px", border: "1.5px solid #6366f1" }}
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Proposal Title & ID</th>
                <th>Category</th>
                <th>Author & Date</th>
                <th>Stage Status</th>
                <th>Assigned PM</th>
                <th>PM Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPMApprovalList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                      <Inbox size={28} color="var(--text-light)" />
                      <span className="empty-state-title">No proposals currently awaiting PM approval</span>
                      <span className="empty-state-sub">Proposals approved by Reviewers in Feasibility Review will appear here automatically.</span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={async () => {
                          let list = getSubmittedIdeas();
                          if (!list || list.length === 0) {
                            list = SAMPLE_INITIAL_IDEAS;
                          }
                          list[0].status = "Pending PM Approval";
                          localStorage.setItem("idea360SubmittedIdeas", JSON.stringify(list));
                          try {
                            await patchIdeaStatus(Number(list[0].id), "Pending PM Approval", "Sample loaded for PM approval");
                          } catch (e) {}
                          setIdeas([...list]);
                        }}
                        style={{ marginTop: "12px", background: "#4f46e5", height: "34px", fontSize: "12px", fontWeight: "700" }}
                      >
                        ⚡ Load Sample Proposal Awaiting PM Approval
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingPMApprovalList.map((item) => (
                  <tr key={item.id} style={{ background: "#f8fafc" }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "800", background: "#6366f1", color: "#ffffff", padding: "1px 6px", borderRadius: "4px" }}>
                          IDEA-{item.id}
                        </span>
                        <span className="table-idea-title">{item.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-chip">{item.category}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", color: "var(--text-dark)", fontWeight: "600" }}>
                        {item.author}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{item.date}</div>
                    </td>
                    <td>
                      {item.status.includes("Approved") || item.status.includes("Accepted") || item.status.includes("Execution") ? (
                        <span className="table-badge" style={{ background: "#dcfce7", color: "#15803d", fontWeight: "700" }}>
                          ✅ Approved by PM
                        </span>
                      ) : (
                        <span className="table-badge" style={{ background: "#fef3c7", color: "#d97706", fontWeight: "700" }}>
                          ⏳ Pending PM Approval
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#4f46e5" }}>
                        {item.assignedPM || userName}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => setViewingProposal(item)}
                        >
                          Details
                        </Button>
                        {item.status.includes("Approved") || item.status.includes("Accepted") || item.status.includes("Execution") ? (
                          <span style={{ fontSize: "11px", fontWeight: "800", background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "6px", border: "1px solid #bbf7d0", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle2 size={13} color="#166534" /> Approved
                          </span>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Check}
                              onClick={() => handlePMAction(item.id, "Approved by PM")}
                              style={{ background: "#16a34a", borderColor: "#16a34a" }}
                            >
                              Approve & Pass to BA
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              icon={Rocket}
                              onClick={() => handlePMAction(item.id, "Accepted & Onboarded by PM")}
                              style={{ borderColor: "#4f46e5", color: "#4f46e5" }}
                            >
                              Onboard Project
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* PROPOSAL DETAIL MODAL */}
      {viewingProposal && (
        <Modal
          isOpen={!!viewingProposal}
          onClose={() => setViewingProposal(null)}
          title={`Proposal Feasibility Overview: ${viewingProposal.title}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Problem Statement</h4>
              <p style={{ fontSize: "13px", color: "#1e293b", background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                {viewingProposal.problemStatement || viewingProposal.description || "N/A"}
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Proposed Solution</h4>
              <p style={{ fontSize: "13px", color: "#1e293b", background: "#f8fafc", padding: "10px", borderRadius: "6px" }}>
                {viewingProposal.proposedSolution || "N/A"}
              </p>
            </div>
            {viewingProposal.evaluatorNotes && (
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>Feasibility Review Notes</h4>
                <div style={{ fontSize: "12px", background: "#eff6ff", color: "#1e40af", padding: "10px", borderRadius: "6px", fontFamily: "monospace" }}>
                  {viewingProposal.evaluatorNotes}
                </div>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
              <Button variant="ghost" onClick={() => setViewingProposal(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={Check}
                onClick={() => {
                  handlePMAction(viewingProposal.id, "Feasibility Approved");
                  setViewingProposal(null);
                }}
                style={{ background: "#16a34a", borderColor: "#16a34a" }}
              >
                Approve & Pass to BA
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
