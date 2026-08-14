import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  UserCheck,
  Inbox,
  Paperclip,
  FileText,
  Download
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import AdminDashboard from "./AdminDashboard";
import BADashboard from "./BADashboard";
import ReviewerDashboard from "./ReviewerDashboard";
import PMDashboard from "./PMDashboard";
import PCDashboard from "./PCDashboard";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

function Dashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("User");
  const [userName, setUserName] = useState("Ayushman");
  const [userEmail, setUserEmail] = useState("");
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [filterMode, setFilterMode] = useState("all");

  const [allIdeas, setAllIdeas] = useState([]);

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.role) {
          setUserRole(savedUser.role);
        }
        if (savedUser.username) {
          setUserName(savedUser.username);
        }
        if (savedUser.email) {
          setUserEmail(savedUser.email);
        }
      } catch (err) {
        console.error(err);
      }
    }

    setAllIdeas(getSubmittedIdeas());
  }, []);

  // 0. Project Coordinator Dashboard
  if (userRole === "Project Coordinator") {
    return <PCDashboard userName={userName} />;
  }

  // 1. Administrator Dashboard
  if (userRole === "Administrator") {
    return <AdminDashboard userName={userName} />;
  }

  // 2. Business Analyst Dashboard
  if (userRole === "Business Analyst") {
    return <BADashboard userName={userName} />;
  }

  // 3. Reviewer Dashboard
  if (userRole === "Reviewer") {
    return <ReviewerDashboard userName={userName} />;
  }

  // 4. Project Manager Dashboard
  if (userRole === "Project Manager") {
    return <PMDashboard userName={userName} />;
  }

  // 5. Innovator (User Role): Filter ideas to ONLY show submissions by this specific logged-in user
  const mySubmissions = allIdeas.filter(
    (item) =>
      (userEmail && item.authorEmail && item.authorEmail.toLowerCase() === userEmail.toLowerCase()) ||
      (userName && item.author && item.author.toLowerCase() === userName.toLowerCase())
  );

  const displayedSubmissions = mySubmissions.filter((item) => {
    if (filterMode === "Pending Review") return item.status === "Pending Review";
    if (filterMode === "Approved") return (item.status.includes("Approved") || item.status.includes("Screening") || item.status.includes("Passed") || item.status.includes("Sent")) && !item.status.includes("Not ");
    if (filterMode === "Rejected") return item.status.includes("Rejected") || item.status.includes("Not ");
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* Employee Welcome Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Welcome back, {userName}</h1>
            <span className="mode-badge-green">
              <UserCheck size={14} /> Innovator Mode ({userRole})
            </span>
          </div>
        </div>

        <div className="quick-actions-flex">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate("/submit-idea")}
          >
            Submit New Idea
          </Button>
        </div>
      </div>

      {/* 4 Clickable Personal Metrics Stat Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {/* Card 1: All Submissions */}
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view All My Submissions"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">My Submitted Ideas</span>
            <div className="kpi-icon-pill pill-purple">
              <Lightbulb size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{mySubmissions.length}</span>
        </div>

        {/* Card 2: Pending Review */}
        <div
          className={`kpi-mini-card ${filterMode === "Pending Review" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Pending Review")}
          style={{ cursor: "pointer", border: filterMode === "Pending Review" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
          title="Click to view Pending Review Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Review</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {mySubmissions.filter((i) => i.status === "Pending Review").length}
          </span>
        </div>

        {/* Card 3: Approved / Screening */}
        <div
          className={`kpi-mini-card ${filterMode === "Approved" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Approved")}
          style={{ cursor: "pointer", border: filterMode === "Approved" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Approved / In Screening Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Approved / Screening</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {mySubmissions.filter((i) => (i.status.includes("Approved") || i.status.includes("Screening") || i.status.includes("Passed") || i.status.includes("Sent")) && !i.status.includes("Not ")).length}
          </span>
        </div>

        {/* Card 4: Rejected Ideas */}
        <div
          className={`kpi-mini-card ${filterMode === "Rejected" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Rejected")}
          style={{ cursor: "pointer", border: filterMode === "Rejected" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
          title="Click to view Rejected Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected Ideas</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {mySubmissions.filter((i) => i.status.includes("Rejected") || i.status.includes("Not ")).length}
          </span>
        </div>
      </div>

      {/* My Submissions Status Table */}
      <Card title={`My Submitted Ideas (${displayedSubmissions.length})`}>
        {/* Quick Filter Pill Buttons */}
        <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Active Filter:</span>
          {[
            { id: "all", label: "All Submissions" },
            { id: "Pending Review", label: "Pending Review" },
            { id: "Approved", label: "Approved / Screening" },
            { id: "Rejected", label: "Rejected" }
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
                <th>Idea Title</th>
                <th>Category</th>
                <th>Submission Date</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    <div className="empty-state-flex">
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No submissions found for "{filterMode}" filter</span>
                      <span className="empty-state-sub">Select another filter card above to view your ideas.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedSubmissions.map((item) => {
                  const isApproved = (item.status.includes("Approved") || item.status.includes("Screening") || item.status.includes("Passed") || item.status.includes("Sent")) && !item.status.includes("Not ");
                  const isRejected = item.status.includes("Rejected") || item.status.includes("Not ");

                  return (
                    <tr key={item.id}>
                      <td className="table-idea-title">{item.title}</td>
                      <td>
                        <span className="category-chip">
                          {item.category}
                        </span>
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <span
                          className={`table-badge ${
                            isApproved
                              ? "badge-approved"
                              : isRejected
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
                          variant="ghost"
                          icon={Eye}
                          onClick={() => setViewingSubmission(item)}
                        >
                          View Submission
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

      {/* MODAL: View Submission Details */}
      {viewingSubmission && (
        <Modal
          isOpen={Boolean(viewingSubmission)}
          onClose={() => setViewingSubmission(null)}
          title={`My Submission Details: ${viewingSubmission.title}`}
          footer={
            <Button variant="primary" onClick={() => setViewingSubmission(null)}>
              Close
            </Button>
          }
        >
          <div className="modal-details-stack">
            <div className="auth-options-row">
              <span className="category-chip-indigo">
                Domain: {viewingSubmission.category}
              </span>
              <span className={`table-badge ${viewingSubmission.status.includes("Approved") || viewingSubmission.status.includes("Passed") ? "badge-approved" : viewingSubmission.status.includes("Rejected") || viewingSubmission.status.includes("Not ") ? "badge-rejected" : "badge-review"}`}>
                {viewingSubmission.status}
              </span>
            </div>

            <div>
              <h4 className="modal-detail-title">Problem Statement</h4>
              <p className="modal-detail-text">
                {viewingSubmission.problemStatement || "No detailed problem statement recorded."}
              </p>
            </div>

            <div>
              <h4 className="modal-detail-title">Idea Description</h4>
              <p className="modal-detail-text">
                {viewingSubmission.description || "No solution description recorded."}
              </p>
            </div>

            {viewingSubmission.proposedSolution && (
              <div>
                <h4 className="modal-detail-title">Proposed Solution</h4>
                <p className="modal-detail-text">
                  {viewingSubmission.proposedSolution}
                </p>
              </div>
            )}

            {(viewingSubmission.expectedBenefits || viewingSubmission.expectedOutcome) && (
              <div>
                <h4 className="modal-detail-title">Expected Benefits</h4>
                <p className="modal-detail-text">
                  {viewingSubmission.expectedBenefits || viewingSubmission.expectedOutcome}
                </p>
              </div>
            )}

            {/* Attached File View */}
            {viewingSubmission.attachment && (
              <div>
                <h4 className="modal-detail-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Paperclip size={14} /> Attached Document
                </h4>
                <div className="attachment-view-card" style={{ marginTop: "6px" }}>
                  <div className="attachment-view-left">
                    {viewingSubmission.attachment.fileType?.includes("image") ? (
                      <div className="attachment-img-preview-box">
                        <img src={viewingSubmission.attachment.fileData} alt="Attached File" />
                      </div>
                    ) : (
                      <div className="attachment-pdf-big-icon">
                        <FileText size={24} color="#4f46e5" />
                      </div>
                    )}
                    <div className="attachment-file-info">
                      <span className="attachment-file-name">{viewingSubmission.attachment.fileName}</span>
                      <span className="attachment-file-meta">{viewingSubmission.attachment.fileSize}</span>
                    </div>
                  </div>
                  <a
                    href={viewingSubmission.attachment.fileData}
                    download={viewingSubmission.attachment.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-download-btn"
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;