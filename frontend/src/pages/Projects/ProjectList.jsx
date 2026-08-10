import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FolderKanban,
  PlayCircle,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Eye,
  FileText,
  Paperclip,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Briefcase,
  Layers,
  Inbox,
  AlertCircle,
  Building2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Send,
  XCircle
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { fetchAllIdeas, fetchAnalysisReports, patchIdeaStatus, patchAnalysisReportStatus } from "../../services/api";
import {
  getSubmittedIdeas,
  getSubmittedAnalysisReports,
  updateIdeaStatus,
  updateAnalysisReportStatus,
  saveAnalysisReport
} from "../../utils/ideaStorage";

function ProjectList() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [pmName, setPmName] = useState("Ayushman Raj");
  const [userRole, setUserRole] = useState("User");
  const [filterTab, setFilterTab] = useState("all");

  // Modals
  const [viewingProject, setViewingProject] = useState(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Onboard Form State
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [budget, setBudget] = useState("");
  const [assignedLead, setAssignedLead] = useState("Ayushman Raj");
  const [deliverables, setDeliverables] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    // Read logged-in user profile
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.username) {
          setPmName(u.username);
          setAssignedLead(u.username);
        }
        if (u.role) {
          setUserRole(u.role);
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadAllData();

    const handleUpdate = () => {
      loadAllData();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("ideaStatusChanged", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("ideaStatusChanged", handleUpdate);
    };
  }, []);

  const loadAllData = async () => {
    try {
      const apiIdeas = await fetchAllIdeas();
      if (apiIdeas && apiIdeas.length > 0) {
        setIdeas(apiIdeas);
      } else {
        setIdeas(getSubmittedIdeas());
      }
    } catch (err) {
      setIdeas(getSubmittedIdeas());
    }

    try {
      const apiReports = await fetchAnalysisReports();
      if (apiReports && apiReports.length > 0) {
        setReports(apiReports);
      } else {
        setReports(getSubmittedAnalysisReports());
      }
    } catch (err) {
      setReports(getSubmittedAnalysisReports());
    }
  };

  // Merge projects from ideas & reports for complete PM portfolio view
  const projectPortfolio = ideas.filter(
    (i) =>
      i.status.includes("Approved by BA") ||
      i.status.includes("Accepted by PM") ||
      i.status.includes("Feasibility Approved") ||
      i.status.includes("Pending PM Approval") ||
      i.status.includes("Execution") ||
      i.status.includes("Need Optimization") ||
      i.status.includes("On Hold") ||
      i.status.includes("Rejected by PM") ||
      i.status.includes("Completed")
  );

  const filteredProjects = projectPortfolio.filter((p) => {
    if (filterTab === "ready") {
      return (
        p.status.includes("Approved by BA") ||
        p.status.includes("Feasibility Approved") ||
        p.status.includes("Pending PM Approval") ||
        p.status.includes("Need Optimization") ||
        p.status.includes("On Hold")
      );
    }
    if (filterTab === "active") return p.status.includes("Execution") || p.status.includes("Accepted by PM");
    if (filterTab === "completed") return p.status.includes("Completed") || p.status.includes("Rejected");
    return true; // 'all'
  });

  const handleSelectProposalForOnboarding = (ideaId) => {
    setSelectedIdeaId(ideaId);
    const found = ideas.find((i) => String(i.id) === String(ideaId));
    if (found) {
      setProjectTitle(`Project Execution - ${found.title}`);
    }
  };

  // Onboard Project & Kick-off Execution
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      toast("Please enter Project Title!", { icon: "⚠️" });
      return;
    }

    setIsSubmitting(true);
    setSuccessBanner("");

    const targetStatus = "In Execution";
    const notes = `PM Kick-off by ${assignedLead.trim()} | Target Date: ${targetDate || "Q3 2026"} | Budget: ${budget || "$50,000"} | Deliverables: ${deliverables || "Sprint 1 Kick-off"}`;

    try {
      if (selectedIdeaId) {
        // 1. Update PostgreSQL Backend Database
        await patchIdeaStatus(Number(selectedIdeaId), targetStatus, notes);
        
        const linkedReport = reports.find((r) => String(r.ideaId) === String(selectedIdeaId));
        if (linkedReport) {
          await patchAnalysisReportStatus(linkedReport.id, targetStatus, notes);
        }

        // 2. Update Local Storage Cache
        updateIdeaStatus(Number(selectedIdeaId), targetStatus, notes);
        if (linkedReport) {
          updateAnalysisReportStatus(linkedReport.id, targetStatus, notes);
        }
      }

      setSuccessBanner(`Project "${projectTitle}" has been successfully ONBOARDED & status updated to "In Execution"!`);
      setShowOnboardModal(false);
      setProjectTitle("");
      setBudget("");
      setTargetDate("");
      setDeliverables("");
      setSelectedIdeaId("");
      
      // Reload fresh state
      loadAllData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to onboard project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Transition for PM (e.g. Move to In Execution or Mark Completed)
  const handleQuickStatusChange = async (projectId, newStatus) => {
    const notes = `Updated to ${newStatus} by PM: ${pmName}`;
    
    try {
      await patchIdeaStatus(projectId, newStatus, notes);
      const linkedReport = reports.find((r) => String(r.ideaId) === String(projectId));
      if (linkedReport) {
        await patchAnalysisReportStatus(linkedReport.id, newStatus, notes);
      }
    } catch (err) {
      console.error("Failed to update status on backend:", err);
    }

    updateIdeaStatus(projectId, newStatus, notes);
    const linkedReport = reports.find((r) => String(r.ideaId) === String(projectId));
    if (linkedReport) {
      updateAnalysisReportStatus(linkedReport.id, newStatus, notes);
    }

    toast.success(`Project status transitioned to "${newStatus}"!`);
    loadAllData();
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Project Manager Portfolio & Control Hub</h1>
            <span className="mode-badge-green" style={{ background: "#ecfdf5", color: "#059669" }}>
              <FolderKanban size={14} /> PM Enterprise Control Center ({pmName})
            </span>
          </div>
          <p>Onboard BA approved proposals, assign project milestones, track real-time execution progress, and manage resources.</p>
        </div>

        <div className="quick-actions-flex">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowOnboardModal(true)}
          >
            Onboard New Project
          </Button>
          <Button
            variant="ghost"
            icon={PlayCircle}
            onClick={() => navigate("/execution")}
          >
            Execution Roadmap
          </Button>
        </div>
      </div>

      {/* Real-time Success Notification Banner */}
      {successBanner && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          <CheckCircle2 size={20} color="#16a34a" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 4 Clickable PM KPI Metric Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: Total Portfolio */}
        <div
          className={`kpi-mini-card ${filterTab === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterTab("all")}
          style={{ cursor: "pointer", border: filterTab === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="View All Projects"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Total PM Portfolio</span>
            <div className="kpi-icon-pill pill-purple">
              <FolderKanban size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{projectPortfolio.length}</span>
        </div>

        {/* Card 2: Ready for PM Review / Kick-off */}
        <div
          className={`kpi-mini-card ${filterTab === "ready" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterTab("ready")}
          style={{ cursor: "pointer", border: filterTab === "ready" ? "2px solid #3b82f6" : "1px solid #e2e8f0" }}
          title="View Proposals Ready for PM Review or Onboarding"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Ready for Review / Kick-off</span>
            <div className="kpi-icon-pill pill-blue">
              <FileText size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projectPortfolio.filter((p) => p.status.includes("Approved by BA") || p.status.includes("Feasibility Approved") || p.status.includes("Pending PM Approval")).length}
          </span>
        </div>

        {/* Card 3: Active in Execution */}
        <div
          className={`kpi-mini-card ${filterTab === "active" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterTab("active")}
          style={{ cursor: "pointer", border: filterTab === "active" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="View Active Projects in Execution"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Active in Execution</span>
            <div className="kpi-icon-pill pill-green">
              <PlayCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projectPortfolio.filter((p) => p.status.includes("Execution") || p.status.includes("Accepted by PM")).length}
          </span>
        </div>

        {/* Card 4: Completed Projects */}
        <div
          className={`kpi-mini-card ${filterTab === "completed" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterTab("completed")}
          style={{ cursor: "pointer", border: filterTab === "completed" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
          title="View Completed Projects"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Completed Projects</span>
            <div className="kpi-icon-pill pill-amber">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projectPortfolio.filter((p) => p.status.includes("Completed")).length}
          </span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Portfolio View:</span>
        {[
          { id: "all", label: "All Projects" },
          { id: "ready", label: "Pending PM Review / Onboard" },
          { id: "active", label: "In Execution / Active" },
          { id: "completed", label: "Completed" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            style={{
              background: filterTab === tab.id ? "var(--primary)" : "#f1f5f9",
              color: filterTab === tab.id ? "#ffffff" : "var(--text-dark)",
              border: "none",
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main PM Projects Table */}
      <Card
        title={`Project Portfolio & Execution Roadmap (${filterTab.toUpperCase()})`}
        subtitle="Manage end-to-end innovation project lifecycle, BA reports, timelines, and execution status"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Project Title & Domain</th>
                <th>BA Approval & Analysis</th>
                <th>PM Owner & Lead</th>
                <th>Current Status</th>
                <th>Execution Progress</th>
                <th>PM Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "28px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No projects found for "{filterTab}" view</span>
                      <span className="empty-state-sub">BA Approved proposals will automatically appear here for PM onboarding.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProjects.map((item, idx) => {
                  const linkedReport = reports.find((r) => String(r.ideaId) === String(item.id));
                  const progressPct = item.status.includes("Execution") ? (idx % 2 === 0 ? 75 : 50) : item.status.includes("Completed") ? 100 : 25;
                  const isBaApproved =
                    item.status.includes("Approved by BA") ||
                    item.status.includes("Feasibility Approved") ||
                    item.status.includes("Need Optimization") ||
                    item.status.includes("On Hold") ||
                    item.status.includes("Rejected by PM");
                  const isInExecution = item.status.includes("Execution") || item.status.includes("Accepted by PM") || item.status.includes("Completed");
                  const isPMOrAdmin = userRole === "Project Manager" || userRole === "Administrator";

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="table-idea-title">{item.title}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Domain: {item.category} • Created: {item.date}
                        </div>
                      </td>
                      <td>
                        {linkedReport ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                background: "#e0e7ff",
                                color: "#4338ca",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "11px",
                                fontWeight: "700"
                              }}
                            >
                              <User size={11} /> Approved by BA: {linkedReport.baName}
                            </span>
                            <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "600" }}>
                              ROI: {linkedReport.projectedRoi || "High Return"}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {isBaApproved ? item.status : "Feasibility Cleared"}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-dark)" }}>
                          {pmName}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`table-badge ${
                            isInExecution
                              ? "badge-approved"
                              : isBaApproved
                              ? "badge-approved"
                              : "badge-review"
                          }`}
                          style={{
                            background: isInExecution ? "#dcfce7" : isBaApproved ? "#e0e7ff" : undefined,
                            color: isInExecution ? "#15803d" : isBaApproved ? "#4338ca" : undefined
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ minWidth: "140px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700" }}>
                            <span>Sprint Progress</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div style={{ height: "6px", width: "100%", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${progressPct}%`,
                                background: progressPct === 100 ? "#22c55e" : "var(--primary)",
                                borderRadius: "4px"
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {/* View Full Project & BA Report Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Eye}
                            onClick={() => setViewingProject({ ...item, linkedReport })}
                          >
                            View Details
                          </Button>

                          {/* Kick-off / Status Change Button */}
                          {/* Kick-off / Status Change Button */}
                          {!isInExecution && isPMOrAdmin ? (
                            (() => {
                              const hasBaReport = reports.some((r) => String(r.ideaId) === String(item.id));
                              if (item.status === "Pending PM Approval" || (!hasBaReport && (item.status === "Need Optimization" || item.status === "On Hold" || item.status === "Rejected by PM"))) {
                                return (
                                  <select
                                    className="custom-input-elem"
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      padding: "4px 8px",
                                      height: "32px",
                                      width: "165px",
                                      border: "1.5px solid var(--primary-light)",
                                      borderRadius: "6px",
                                      background: "#ffffff",
                                      color: "var(--text-dark)",
                                      cursor: "pointer",
                                      outline: "none"
                                    }}
                                    value=""
                                    onChange={(e) => {
                                      const selectedVal = e.target.value;
                                      let mappedStatus = "";
                                      if (selectedVal === "Approved") mappedStatus = "Feasibility Approved";
                                      else if (selectedVal === "Execution") mappedStatus = "In Execution";
                                      else if (selectedVal === "Reject") mappedStatus = "Rejected by PM";
                                      
                                      if (mappedStatus) {
                                        handleQuickStatusChange(item.id, mappedStatus);
                                      }
                                    }}
                                  >
                                    <option value="" disabled>-- PM Approval Action --</option>
                                    <option value="Approved" style={{ fontWeight: "700", color: "#16a34a" }}>✅ Approve & Pass to BA</option>
                                    <option value="Execution" style={{ fontWeight: "700", color: "#4f46e5" }}>🚀 Accept & Onboard Project</option>
                                    <option value="Reject" style={{ fontWeight: "700", color: "#dc2626" }}>❌ Reject Proposal</option>
                                  </select>
                                );
                              } else if (item.status === "Feasibility Approved" || item.status.includes("Business Analysis")) {
                                return (
                                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700" }}>
                                    ⏳ Awaiting BA Analysis
                                  </span>
                                );
                              } else {
                                // BA Approved or (hasBaReport and Optimization/Hold/PM Rejected)
                                return (
                                  <select
                                    className="custom-input-elem"
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      padding: "4px 8px",
                                      height: "32px",
                                      width: "165px",
                                      border: "1.5px solid var(--primary-light)",
                                      borderRadius: "6px",
                                      background: "#ffffff",
                                      color: "var(--text-dark)",
                                      cursor: "pointer",
                                      outline: "none"
                                    }}
                                    value={
                                      item.status === "Need Optimization"
                                        ? "Need Optimization"
                                        : item.status === "Rejected by PM"
                                        ? "Reject"
                                        : item.status === "On Hold"
                                        ? "Hold"
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const selectedVal = e.target.value;
                                      let mappedStatus = "";
                                      if (selectedVal === "Approved") mappedStatus = "In Execution";
                                      else if (selectedVal === "Need Optimization") mappedStatus = "Need Optimization";
                                      else if (selectedVal === "Reject") mappedStatus = "Rejected by PM";
                                      else if (selectedVal === "Hold") mappedStatus = "On Hold";
                                      
                                      if (mappedStatus) {
                                        handleQuickStatusChange(item.id, mappedStatus);
                                      }
                                    }}
                                  >
                                    <option value="" disabled>-- BA Report Review --</option>
                                    <option value="Approved" style={{ fontWeight: "700", color: "#16a34a" }}>✅ Approved (Kick-off)</option>
                                    <option value="Need Optimization" style={{ fontWeight: "700", color: "#d97706" }}>⚠️ Need Optimization</option>
                                    <option value="Reject" style={{ fontWeight: "700", color: "#dc2626" }}>❌ Reject</option>
                                    <option value="Hold" style={{ fontWeight: "700", color: "#2563eb" }}>⏸️ Hold</option>
                                  </select>
                                );
                              }
                            })()
                          ) : !isInExecution ? (
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700" }}>
                              Awaiting PM Action
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={CheckCircle2}
                              onClick={() => handleQuickStatusChange(item.id, "Completed")}
                              style={{ color: "#16a34a", borderColor: "#bbf7d0", background: "#f0fdf4" }}
                            >
                              Mark Completed
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

      {/* MODAL 1: Onboard New Project */}
      {showOnboardModal && (
        <Modal
          isOpen={showOnboardModal}
          onClose={() => setShowOnboardModal(false)}
          title="Onboard New Project & Start Execution"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowOnboardModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleOnboardSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Onboarding..." : "Kick-off Project Execution"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleOnboardSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Select BA Approved Proposal</label>
              <select
                className="custom-input-elem"
                value={selectedIdeaId}
                onChange={(e) => handleSelectProposalForOnboarding(e.target.value)}
                style={{ fontSize: "14px", fontWeight: "600" }}
              >
                <option value="">-- Select Proposal from BA Approved Queue --</option>
                {ideas.filter((i) => i.status.includes("Approved by BA")).map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title} ({i.category}) — Status: {i.status}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Project Title"
              placeholder="e.g. AI-Powered Inventory Optimization System"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <Input
                label="Assigned PM Lead"
                value={assignedLead}
                onChange={(e) => setAssignedLead(e.target.value)}
                required
              />
              <Input
                label="Budget Allocation"
                placeholder="e.g. $50,000 / INR 6,00,000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <Input
              label="Target Completion Date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />

            <div className="input-field-group">
              <label className="input-label">Key Deliverables & Sprint Plan</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Specify key milestones, sprint deliverables, tech stack, or resources..."
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: View Project Details & BA Report */}
      {viewingProject && (
        <Modal
          isOpen={Boolean(viewingProject)}
          onClose={() => setViewingProject(null)}
          title={`Project Details: ${viewingProject.title}`}
          footer={
            <Button variant="primary" onClick={() => setViewingProject(null)}>
              Close
            </Button>
          }
        >
          <div className="modal-details-stack">
            <div className="auth-options-row">
              <span className="category-chip-indigo">Domain: {viewingProject.category}</span>
              <span className="table-badge badge-approved">{viewingProject.status}</span>
            </div>

            <div>
              <h4 className="modal-detail-title">Problem Statement</h4>
              <p className="modal-detail-text">{viewingProject.problemStatement || "N/A"}</p>
            </div>

            <div>
              <h4 className="modal-detail-title">Proposed Solution</h4>
              <p className="modal-detail-text">{viewingProject.description || "N/A"}</p>
            </div>

            {/* BA Analysis Report Information */}
            {viewingProject.linkedReport && (
              <div style={{ background: "#f0f5ff", border: "1px solid #c7d2fe", padding: "14px", borderRadius: "10px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#3730a3", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={16} /> BA Analysis Report (Approved by BA: {viewingProject.linkedReport.baName})
                </div>
                <div style={{ fontSize: "13px", color: "#1e1b4b", marginBottom: "8px", fontWeight: "600" }}>
                  {viewingProject.linkedReport.reportTitle}
                </div>
                <p style={{ fontSize: "12px", color: "#312e81", whiteSpace: "pre-wrap", margin: "0 0 10px 0" }}>
                  {viewingProject.linkedReport.summary}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", background: "#ffffff", padding: "8px", borderRadius: "6px" }}>
                  <div><strong>Estimated Cost:</strong> {viewingProject.linkedReport.estimatedCost || "N/A"}</div>
                  <div><strong>Projected ROI:</strong> <span style={{ color: "#16a34a", fontWeight: "700" }}>{viewingProject.linkedReport.projectedRoi || "N/A"}</span></div>
                </div>

                {viewingProject.linkedReport.attachment && (
                  <div style={{ marginTop: "10px" }}>
                    <a
                      href={viewingProject.linkedReport.attachment.fileData}
                      download={viewingProject.linkedReport.attachment.fileName}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "#4f46e5",
                        color: "#ffffff",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        textDecoration: "none"
                      }}
                    >
                      <Download size={14} /> Download BA Report Document ({viewingProject.linkedReport.attachment.fileName})
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ProjectList;
