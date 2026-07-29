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
  ShieldCheck
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

function PMDashboard({ userName }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [viewingReport, setViewingReport] = useState(null);
  const [pmNotes, setPmNotes] = useState("");

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

  // PM Accept Analysis Report Handler
  const handleAcceptReport = (report, notesOverride = "") => {
    const updatedStatus = "Accepted by PM";
    const notes = notesOverride || pmNotes || "Accepted by Project Manager. Project approved for onboarding & execution.";
    
    const updatedReports = updateAnalysisReportStatus(report.id, updatedStatus, notes);
    setReports(updatedReports || getSubmittedAnalysisReports());
    setIdeas(getSubmittedIdeas());
    
    alert(`BA Report for "${report.ideaTitle}" has been ACCEPTED by PM (${userName || "PM"})! Project is onboarded.`);
    if (viewingReport && viewingReport.id === report.id) {
      setViewingReport(null);
    }
  };

  // Filter projects ready for Project Execution
  const projectQueue = ideas.filter(
    (i) =>
      i.status.includes("Feasibility Approved") ||
      i.status.includes("Approved by BA") ||
      i.status.includes("Business Analysis") ||
      i.status.includes("Accepted by PM") ||
      i.status.includes("Project") ||
      i.status.includes("Execution")
  );

  const displayedProjects = projectQueue.filter((item) => {
    if (filterMode === "active") return item.status.includes("Execution") || item.status.includes("Project") || item.status.includes("Accepted by PM");
    if (filterMode === "approved") return item.status.includes("Approved by BA") || item.status.includes("Feasibility Approved");
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
          <p>Review BA analysis reports, track project execution roadmaps, milestone deliverables, and benefits realization.</p>
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

        {/* Card 2: BA Reports Received */}
        <div
          className={`kpi-mini-card ${filterMode === "approved" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("approved")}
          style={{ cursor: "pointer", border: filterMode === "approved" ? "2px solid #3b82f6" : "1px solid #e2e8f0" }}
          title="Click to view BA Analysis Reports Received"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">BA Reports Received</span>
            <div className="kpi-icon-pill pill-blue">
              <FileText size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{reports.length}</span>
        </div>

        {/* Card 3: Accepted / Active Execution */}
        <div
          className={`kpi-mini-card ${filterMode === "active" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("active")}
          style={{ cursor: "pointer", border: filterMode === "active" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Active Projects in Execution"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Projects in Execution</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projectQueue.filter((i) => i.status.includes("Execution") || i.status.includes("Project") || i.status.includes("Accepted by PM")).length}
          </span>
        </div>

        {/* Card 4: Quality Assurance */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/quality-assurance")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to view Quality Assurance & Test Sign-off"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Quality Assurance</span>
            <div className="kpi-icon-pill pill-green">
              <ShieldCheck size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ fontSize: "16px", color: "#16a34a", fontWeight: "700" }}>
            QA Sign-offs →
          </span>
        </div>
      </div>

      {/* SECTION 1: BA Analysis Reports Received from Business Analysts */}
      <Card
        title={`BA Analysis Reports Received from Business Analysts (${reports.length})`}
        subtitle="Review feasibility analysis reports, financial ROI models, and attached documents submitted by Business Analysts"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Report Title / Proposal</th>
                <th>Prepared & Approved By</th>
                <th>Cost & ROI Projections</th>
                <th>Current Status</th>
                <th>PM Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No BA Analysis Reports Received Yet</span>
                      <span className="empty-state-sub">When a Business Analyst uploads & sends a report, it will instantly appear here for PM approval.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((rep) => {
                  const isAccepted = rep.status.includes("Accepted by PM") || rep.status.includes("Execution");
                  const isBaApproved = rep.status.includes("Approved by BA");

                  return (
                    <tr key={rep.id}>
                      <td>
                        <div style={{ fontWeight: "700", color: "var(--text-dark)" }}>{rep.reportTitle || rep.ideaTitle}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Proposal: {rep.ideaTitle} • Received: {rep.date}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "#e0e7ff",
                            color: "#4338ca",
                            padding: "4px 10px",
                            borderRadius: "14px",
                            fontSize: "12px",
                            fontWeight: "700"
                          }}
                        >
                          <User size={12} /> Approved by BA: {rep.baName}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>
                          {rep.projectedRoi || "N/A"}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          Est. Cost: {rep.estimatedCost || "N/A"}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`table-badge ${
                            isAccepted
                              ? "badge-approved"
                              : isBaApproved
                              ? "badge-approved"
                              : "badge-review"
                          }`}
                          style={{
                            background: isAccepted ? "#dcfce7" : isBaApproved ? "#e0e7ff" : undefined,
                            color: isAccepted ? "#15803d" : isBaApproved ? "#4338ca" : undefined
                          }}
                        >
                          {rep.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={Eye}
                            onClick={() => {
                              setViewingReport(rep);
                              setPmNotes(rep.pmNotes || "");
                            }}
                          >
                            Review Report
                          </Button>

                          {!isAccepted && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Check}
                              onClick={() => handleAcceptReport(rep)}
                              style={{ color: "#16a34a", borderColor: "#bbf7d0", background: "#f0fdf4" }}
                            >
                              Accept & Onboard
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

      <div style={{ height: "20px" }}></div>

      {/* SECTION 2: Main PM Projects Table */}
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

      {/* MODAL: Review BA Analysis Report & Approval */}
      {viewingReport && (
        <Modal
          isOpen={Boolean(viewingReport)}
          onClose={() => setViewingReport(null)}
          title={`PM Review: ${viewingReport.reportTitle || viewingReport.ideaTitle}`}
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setViewingReport(null)}>
                Close
              </Button>
              {!viewingReport.status.includes("Accepted by PM") && (
                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  onClick={() => handleAcceptReport(viewingReport)}
                >
                  Accept BA Report & Move to Execution
                </Button>
              )}
            </div>
          }
        >
          <div className="modal-details-stack">
            <div className="auth-options-row">
              <span className="category-chip-indigo" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <User size={13} /> Approved & Prepared by BA: {viewingReport.baName}
              </span>
              <span className="table-badge badge-approved" style={{ background: "#e0e7ff", color: "#4338ca" }}>
                Current Status: {viewingReport.status}
              </span>
            </div>

            <div>
              <h4 className="modal-detail-title">Proposal Title</h4>
              <p className="modal-detail-text" style={{ fontWeight: "700", color: "var(--text-dark)" }}>
                {viewingReport.ideaTitle}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>ESTIMATED IMPLEMENTATION COST</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-dark)" }}>{viewingReport.estimatedCost || "N/A"}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>PROJECTED ANNUAL ROI</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#16a34a" }}>{viewingReport.projectedRoi || "N/A"}</div>
              </div>
            </div>

            <div>
              <h4 className="modal-detail-title">Executive Summary & Commercial Analysis</h4>
              <p className="modal-detail-text" style={{ whiteSpace: "pre-wrap" }}>
                {viewingReport.summary || "No detailed summary recorded."}
              </p>
            </div>

            {/* Attached File View */}
            {viewingReport.attachment && (
              <div>
                <h4 className="modal-detail-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Paperclip size={14} /> Attached Analysis Report Document
                </h4>
                <div className="attachment-view-card" style={{ marginTop: "6px" }}>
                  <div className="attachment-view-left">
                    <div className="attachment-pdf-big-icon">
                      <FileText size={24} color="#4f46e5" />
                    </div>
                    <div className="attachment-file-info">
                      <span className="attachment-file-name">{viewingReport.attachment.fileName}</span>
                      <span className="attachment-file-meta">{viewingReport.attachment.fileSize}</span>
                    </div>
                  </div>
                  <a
                    href={viewingReport.attachment.fileData}
                    download={viewingReport.attachment.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-download-btn"
                  >
                    <Download size={14} /> Download File
                  </a>
                </div>
              </div>
            )}

            {/* PM Feedback Input */}
            <div className="input-field-group" style={{ marginTop: "10px" }}>
              <label className="input-label">Project Manager (PM) Remarks / Onboarding Notes</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Enter PM notes, resource allocation details, or target kickoff sprint..."
                value={pmNotes}
                onChange={(e) => setPmNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PMDashboard;
