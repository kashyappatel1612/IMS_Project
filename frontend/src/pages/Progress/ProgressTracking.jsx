import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FolderKanban,
  Eye,
  Plus,
  BarChart,
  Layers,
  Inbox,
  Send,
  User,
  Zap
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { fetchAllIdeas } from "../../services/api";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function ProgressTracking() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [sprintProgress, setSprintProgress] = useState("75");
  const [healthStatus, setHealthStatus] = useState("On Track");
  const [updateNotes, setUpdateNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apiIdeas = await fetchAllIdeas();
      filterActiveProjects(apiIdeas && apiIdeas.length > 0 ? apiIdeas : getSubmittedIdeas());
    } catch (e) {
      filterActiveProjects(getSubmittedIdeas());
    }
  };

  const filterActiveProjects = (list) => {
    const active = list.filter(
      (i) =>
        i.status.includes("Execution") ||
        i.status.includes("Accepted by PM") ||
        i.status.includes("Completed") ||
        i.status.includes("Estimation Completed") ||
        i.status.includes("Project")
    );
    setProjects(active);
  };

  const filteredList = projects.filter((p) => {
    if (filterMode === "on-track") return !p.status.includes("Blocked") && !p.status.includes("Delayed");
    if (filterMode === "at-risk") return p.status.includes("Blocked") || p.status.includes("Delayed") || p.status.includes("Risk");
    if (filterMode === "completed") return p.status.includes("Completed");
    return true;
  });

  const handleSaveProgressUpdate = (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert("Please select a project to update!");
      return;
    }

    setIsSubmitting(true);
    const targetStatus = healthStatus === "Completed" ? "Completed" : `In Execution (${sprintProgress}% - ${healthStatus})`;
    const logNote = `Progress Update: ${sprintProgress}% complete | Health: ${healthStatus} | Notes: ${updateNotes || "Sprint on schedule."}`;

    updateIdeaStatus(Number(selectedProjectId), targetStatus, logNote);

    setSuccessBanner(`Sprint progress updated for project! Current Status: "${targetStatus}"`);
    setShowUpdateModal(false);
    setIsSubmitting(false);
    setSelectedProjectId("");
    setUpdateNotes("");
    loadData();
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Progress Tracking & Velocity Analytics</h1>
            <span className="mode-badge-green" style={{ background: "#ecfdf5", color: "#059669" }}>
              <TrendingUp size={14} /> Sprint & Milestone Velocity
            </span>
          </div>
          <p>Monitor real-time sprint execution progress, story point burn-down, milestone velocity, and project health indicators.</p>
        </div>

        <div className="quick-actions-flex">
          <Button variant="primary" icon={Plus} onClick={() => setShowUpdateModal(true)}>
            Log Sprint Progress Update
          </Button>
          <Button variant="ghost" icon={FolderKanban} onClick={() => navigate("/projects")}>
            PM Projects Hub
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
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

      {/* 4 KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Active Tracked Projects</span>
            <div className="kpi-icon-pill pill-purple">
              <FolderKanban size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{projects.length}</span>
        </div>

        <div
          className={`kpi-mini-card ${filterMode === "on-track" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("on-track")}
          style={{ cursor: "pointer", border: filterMode === "on-track" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Projects On Schedule</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projects.filter((p) => !p.status.includes("Blocked") && !p.status.includes("Delayed")).length}
          </span>
        </div>

        <div
          className={`kpi-mini-card ${filterMode === "at-risk" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("at-risk")}
          style={{ cursor: "pointer", border: filterMode === "at-risk" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">At Risk / Blocked</span>
            <div className="kpi-icon-pill pill-red">
              <AlertTriangle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projects.filter((p) => p.status.includes("Blocked") || p.status.includes("Delayed") || p.status.includes("Risk")).length}
          </span>
        </div>

        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Sprint Velocity</span>
            <div className="kpi-icon-pill pill-blue">
              <Zap size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#3b82f6" }}>42 Pts/Sprint</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Health Status:</span>
        {[
          { id: "all", label: "All Active Projects" },
          { id: "on-track", label: "On Track" },
          { id: "at-risk", label: "At Risk / Blocked" },
          { id: "completed", label: "Completed" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id)}
            style={{
              background: filterMode === tab.id ? "var(--primary)" : "#f1f5f9",
              color: filterMode === tab.id ? "#ffffff" : "var(--text-dark)",
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

      {/* Progress Matrix Table */}
      <Card title={`Project Sprint Velocity & Milestone Progress (${filteredList.length})`} subtitle="Real-time completion % synced with execution milestones">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Category</th>
                <th>Health Status</th>
                <th>Sprint Milestone</th>
                <th>Completion Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No projects found for "{filterMode}" filter</span>
                      <span className="empty-state-sub">Projects in execution automatically appear here for progress tracking.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((p, idx) => {
                  const isCompleted = p.status.includes("Completed");
                  const progressPct = isCompleted ? 100 : (idx % 2 === 0 ? 80 : 60);

                  return (
                    <tr key={p.id}>
                      <td className="table-idea-title">{p.title}</td>
                      <td>
                        <span className="category-chip">{p.category}</span>
                      </td>
                      <td>
                        <span
                          className={`table-badge ${isCompleted ? "badge-approved" : "badge-review"}`}
                          style={{
                            background: isCompleted ? "#dcfce7" : "#e0e7ff",
                            color: isCompleted ? "#15803d" : "#4338ca"
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>
                          {isCompleted ? "Sprint 4: Final Launch" : `Sprint ${idx + 1}: Core Module QA`}
                        </span>
                      </td>
                      <td style={{ minWidth: "160px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700" }}>
                            <span>Velocity Progress</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div style={{ height: "6px", width: "100%", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progressPct}%`, background: isCompleted ? "#22c55e" : "var(--primary)", borderRadius: "4px" }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={TrendingUp}
                          onClick={() => {
                            setSelectedProjectId(String(p.id));
                            setShowUpdateModal(true);
                          }}
                        >
                          Log Milestone Update
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

      {/* UPDATE SPRINT MODAL */}
      {showUpdateModal && (
        <Modal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          title="Log Sprint Milestone Progress Update"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleSaveProgressUpdate} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Publish Progress Update"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveProgressUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Select Active Project</label>
              <select
                className="custom-input-elem"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ fontSize: "14px", fontWeight: "600" }}
                required
              >
                <option value="">-- Choose Active Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category}) — Status: {p.status}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label="Completion Percentage (%)"
                type="number"
                min="0"
                max="100"
                value={sprintProgress}
                onChange={(e) => setSprintProgress(e.target.value)}
                required
              />

              <div className="input-field-group">
                <label className="input-label">Health Status Indicator</label>
                <select
                  className="custom-input-elem"
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                >
                  <option value="On Track">On Track (Green)</option>
                  <option value="At Risk">At Risk (Amber)</option>
                  <option value="Blocked">Blocked (Red)</option>
                  <option value="Completed">Completed (Final Launch)</option>
                </select>
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label">Sprint Update Notes & Blockers</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Log sprint achievements, blocker items, or QA bug fix notes..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ProgressTracking;
