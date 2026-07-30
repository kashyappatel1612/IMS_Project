import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Paperclip,
  Check,
  X,
  HelpCircle,
  ArrowRight,
  User,
  Calendar,
  Building2,
  Download,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Send,
  Copy,
  MessageSquare,
  History,
  Sparkles,
  Award,
  Eye,
  ChevronRight,
  Tag,
  Info,
  Layers
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { getIdeaById, updateIdeaStatus } from "../../utils/ideaStorage";

// 9-Stage Lifecycle Timeline Definition
const LIFECYCLE_STAGES = [
  { id: 1, name: "Idea Submission", status: "completed" },
  { id: 2, name: "Initial Screening", status: "current" },
  { id: 3, name: "Feasibility Review", status: "upcoming" },
  { id: 4, name: "Business Review", status: "upcoming" },
  { id: 5, name: "Functional Review", status: "upcoming" },
  { id: 6, name: "Technical Review", status: "upcoming" },
  { id: 7, name: "Business Analysis", status: "upcoming" },
  { id: 8, name: "Estimation", status: "upcoming" },
  { id: 9, name: "Project Creation", status: "upcoming" }
];

function ScreeningEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idea, setIdea] = useState(null);

  // 5 Checklist Criteria States (Validation without numerical points)
  const [duplicateCheckPassed, setDuplicateCheckPassed] = useState(true);
  const [enoughInfo, setEnoughInfo] = useState(true);
  const [strategicFit, setStrategicFit] = useState(true);
  const [scopeClarity, setScopeClarity] = useState(true);
  const [sponsorAvailable, setSponsorAvailable] = useState(true);
  const [evaluatorNotes, setEvaluatorNotes] = useState("");

  // Internal Comments Feed State
  const [commentsList, setCommentsList] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");

  // Attachment Live Preview Modal State
  const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);

  // Decision Modal State
  const [decisionModalType, setDecisionModalType] = useState(null); // 'reject' | 'request_info' | 'duplicate'
  const [modalReason, setModalReason] = useState("Insufficient Information Provided");
  const [modalComments, setModalComments] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [modalDueDate, setModalDueDate] = useState("");

  const [userRole, setUserRole] = useState("User");

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.role) setUserRole(u.role);
      } catch (err) {
        console.error(err);
      }
    }

    if (id) {
      const found = getIdeaById(id);
      if (found) {
        setIdea(found);
        if (found.evaluatorNotes) {
          setEvaluatorNotes(found.evaluatorNotes);
        }

        setCommentsList([
          {
            id: 1,
            author: "Project Coordinator (PC)",
            role: "Project Coordinator",
            date: "Jul 30, 2026 10:15 AM",
            text: `Assigned proposal #${found.id} to domain evaluator for Stage 1 screening.`
          },
          {
            id: 2,
            author: found.assignedReviewer ? found.assignedReviewer.split("(")[0] : "Expert Reviewer",
            role: "Assigned Reviewer",
            date: "Jul 30, 2026 11:30 AM",
            text: "Initial proposal criteria verification started."
          }
        ]);
      }
    }

    const d = new Date();
    d.setDate(d.getDate() + 5);
    setModalDueDate(d.toISOString().split("T")[0]);
  }, [id]);

  const isReviewer = userRole === "Reviewer" || userRole === "Administrator";

  if (!idea) {
    return (
      <div className="dashboard-wrapper">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Idea Proposal Not Found</h2>
          <p>The requested idea submission could not be located in the database.</p>
          <div style={{ marginTop: "20px" }}>
            <Button variant="primary" onClick={() => navigate("/initial-screening")}>
              Back to Initial Screening Queue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isPassed = idea.status.includes("Passed") || idea.status.includes("Approved");
  const isRejected = idea.status.includes("Rejected");
  const isInfoReq = idea.status.includes("Information Requested");

  const handleApproveAndForward = () => {
    const noteText = evaluatorNotes || "Screening validation criteria verified. Approved and forwarded to Stage 2 Feasibility Review.";
    updateIdeaStatus(idea.id, "Passed Initial Screening", noteText);
    alert(`Idea #${idea.id} "${idea.title}" APPROVED in Initial Screening! Forwarded to Stage 2 Feasibility Review.`);
    navigate("/initial-screening");
  };

  const handleSaveDraft = () => {
    updateIdeaStatus(idea.id, idea.status, evaluatorNotes || "Screening draft saved.");
    alert("Screening evaluation draft saved successfully!");
  };

  const handleModalDecisionSubmit = (e) => {
    e.preventDefault();
    if (!modalComments.trim()) {
      alert("Please provide detailed comments for your decision.");
      return;
    }

    let targetStatus = "Rejected in Screening";
    let alertMsg = `Idea #${idea.id} has been Rejected.`;

    if (decisionModalType === "request_info") {
      targetStatus = "Information Requested";
      alertMsg = `Information requested for Idea #${idea.id}. Due Date: ${modalDueDate}.`;
    } else if (decisionModalType === "duplicate") {
      targetStatus = "Rejected - Duplicate Submission";
      alertMsg = `Idea #${idea.id} marked as Duplicate and closed.`;
    }

    const fullNotes = `Reason: ${modalReason} | Comments: ${modalComments} | Notes: ${modalNotes || "N/A"}`;
    updateIdeaStatus(idea.id, targetStatus, fullNotes);
    alert(alertMsg);

    setDecisionModalType(null);
    navigate("/initial-screening");
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newC = {
      id: Date.now(),
      author: userRole === "Reviewer" ? "Reviewer Evaluator" : "Project Coordinator",
      role: userRole,
      date: "Just now",
      text: newCommentText.trim()
    };

    setCommentsList([...commentsList, newC]);
    setNewCommentText("");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate("/initial-screening")}
            >
              Back to Screening Queue
            </Button>
            <span className="category-chip-indigo">
              <Filter size={14} /> Stage 1 Validation Panel
            </span>
          </div>

          <h1>Screening Evaluation: {idea.title}</h1>
          <p>Validate proposal criteria, check SLA deadlines, and submit screening decision sign-off.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {isReviewer && !isPassed && !isRejected && (
            <>
              <Button
                variant="outline"
                icon={CheckCircle2}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>

              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={handleApproveAndForward}
              >
                Approve & Forward to Feasibility Review
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 9-Stage Progress Tracker */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "12px" }}>
          Enterprise Innovation Pipeline Governance (Stage 1 Active)
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {LIFECYCLE_STAGES.map((stg, idx) => {
            const isCompleted = isPassed ? true : idx === 0;
            const isCurrent = isPassed ? idx === 1 || idx === 2 : idx === 1;

            return (
              <div key={stg.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: isCompleted ? "#22c55e" : isCurrent ? "#4f46e5" : "#e2e8f0",
                    color: isCompleted || isCurrent ? "#ffffff" : "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "800",
                    marginBottom: "6px"
                  }}
                >
                  {isCompleted ? "✓" : stg.id}
                </div>
                <span style={{ fontSize: "10px", fontWeight: isCurrent ? "800" : "600", color: isCurrent ? "#4f46e5" : "#475569", textAlign: "center" }}>
                  {stg.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="screening-layout-grid" style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: "20px" }}>
        {/* LEFT COLUMN — PROPOSAL PROFILES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Card 1: Core Proposal Header */}
          <Card title="1. Proposal Details & Submitter Information">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", padding: "6px 0" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>PROPOSAL ID</span>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#4f46e5" }}>IDEA-{idea.id}</div>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>INDUSTRY DOMAIN</span>
                <div><span className="category-chip">{idea.category}</span></div>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>CURRENT STATUS</span>
                <div><span className="table-badge badge-approved">{idea.status}</span></div>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>SUBMITTER NAME</span>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{idea.author || "User"}</div>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>ASSIGNED REVIEWER</span>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#4f46e5" }}>
                  {idea.assignedReviewer ? idea.assignedReviewer.split("(")[0] : "Domain Evaluator"}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>SUBMISSION DATE</span>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Jul 30, 2026</div>
              </div>
            </div>
          </Card>

          {/* Card 2: Problem Statement */}
          <Card title="2. Problem Statement" subtitle="Quantified operational pain point and baseline impact">
            <div style={{ padding: "6px 0" }}>
              <div className="screening-text-box" style={{ fontSize: "14px", lineHeight: "1.6", color: "#334155" }}>
                {idea.problemStatement || "No detailed problem statement recorded."}
              </div>
            </div>
          </Card>

          {/* Card 3: Proposed Solution */}
          <Card title="3. Proposed Solution & Architecture" subtitle="Proposed technical innovation and workflow transformation">
            <div style={{ padding: "6px 0" }}>
              <div className="screening-text-box" style={{ fontSize: "14px", lineHeight: "1.6", color: "#334155" }}>
                {idea.description || idea.proposedSolution || "No detailed solution description recorded."}
              </div>
            </div>
          </Card>

          {/* Card 4: Expected Benefits & Business ROI */}
          <Card title="4. Expected Benefits & Financial ROI" subtitle="Projected efficiency gains, time savings, and cost reductions">
            <div style={{ padding: "6px 0" }}>
              <div className="screening-text-box" style={{ fontSize: "14px", lineHeight: "1.6", color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                {idea.expectedBenefits || idea.expectedOutcome || "30% Operational time savings & enhanced workflow efficiency."}
              </div>
            </div>
          </Card>

          {/* Card 5: Supporting Attachments */}
          <Card title="5. Supporting Attachments & Documents" subtitle="Uploaded proposal specifications, diagrams, or PDFs">
            {idea.attachment ? (
              <div className="attachment-view-card">
                <div className="attachment-view-left">
                  {idea.attachment.fileType?.includes("image") ? (
                    <div className="attachment-img-preview-box" onClick={() => setShowFilePreviewModal(true)} style={{ cursor: "pointer" }}>
                      <img src={idea.attachment.fileData} alt={idea.attachment.fileName} />
                    </div>
                  ) : (
                    <div className="attachment-pdf-big-icon">
                      <FileText size={28} color="#4f46e5" />
                    </div>
                  )}

                  <div className="attachment-file-info">
                    <span className="attachment-file-name">{idea.attachment.fileName}</span>
                    <span className="attachment-file-meta">
                      {idea.attachment.fileType?.includes("image") ? "Image File" : "PDF Document"} • {idea.attachment.fileSize}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Eye}
                    onClick={() => setShowFilePreviewModal(true)}
                  >
                    Preview
                  </Button>
                  <a
                    href={idea.attachment.fileData}
                    download={idea.attachment.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-download-btn"
                  >
                    <Download size={14} /> Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="attachment-none-box">
                <span>No file attachments uploaded for this proposal.</span>
              </div>
            )}
          </Card>

          {/* Card 6: Internal Discussion & Comments */}
          <Card title="Internal Discussion & Reviewer Feed" subtitle="Private communication thread between Project Coordinator and Reviewer">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {commentsList.map((c) => (
                  <div key={c.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 14px", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
                      <span style={{ fontWeight: "700", color: "#1e293b" }}>{c.author} <span style={{ color: "#6366f1", fontWeight: "600" }}>({c.role})</span></span>
                      <span style={{ color: "#94a3b8" }}>{c.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{c.text}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <input
                  type="text"
                  className="custom-input-elem"
                  placeholder="Post internal note for Project Coordinator..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  style={{ fontSize: "13px" }}
                />
                <Button type="submit" variant="primary" icon={Send}>Post</Button>
              </form>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN — STICKY DECISION PANEL */}
        <div style={{ position: "sticky", top: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* SLA Countdown Timer Card */}
          <div style={{ background: "#ffffff", border: "1.5px solid #6366f1", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#4f46e5", textTransform: "uppercase" }}>SLA Review Deadline</span>
              <span style={{ fontSize: "11px", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "8px", fontWeight: "700" }}>On Track</span>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>2 Days 14 Hours Remaining</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Target Due Date: {idea.reviewerDeadline || "Aug 05, 2026"}</div>
          </div>

          {/* Screening Validation Checklist */}
          <Card title="Screening Validation Checklist" subtitle="Validate proposal against 5 core criteria">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "6px 0" }}>
              
              {/* Checklist 1: Duplicate Check */}
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>1. Duplicate Check</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: duplicateCheckPassed ? "#16a34a" : "#dc2626" }}>
                    {duplicateCheckPassed ? "Valid" : "Flagged"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Duplicity Check</span>
                  <button
                    type="button"
                    onClick={() => setDuplicateCheckPassed(!duplicateCheckPassed)}
                    disabled={!isReviewer}
                    style={{
                      background: duplicateCheckPassed ? "#dcfce7" : "#fee2e2",
                      color: duplicateCheckPassed ? "#166534" : "#991b1b",
                      border: "none",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: isReviewer ? "pointer" : "default"
                    }}
                  >
                    {duplicateCheckPassed ? "Passed (No Duplicate)" : "Duplicate Found"}
                  </button>
                </div>
              </div>

              {/* Checklist 2: Enough Information */}
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>2. Sufficient Information</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: enoughInfo ? "#16a34a" : "#dc2626" }}>
                    {enoughInfo ? "Valid" : "Incomplete"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Details complete & clear</span>
                  <button
                    type="button"
                    onClick={() => setEnoughInfo(!enoughInfo)}
                    disabled={!isReviewer}
                    style={{
                      background: enoughInfo ? "#dcfce7" : "#fee2e2",
                      color: enoughInfo ? "#166534" : "#991b1b",
                      border: "none",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: isReviewer ? "pointer" : "default"
                    }}
                  >
                    {enoughInfo ? "Sufficient" : "Incomplete"}
                  </button>
                </div>
              </div>

              {/* Checklist 3: Strategic Alignment */}
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>3. Strategic Alignment</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: strategicFit ? "#16a34a" : "#dc2626" }}>
                    {strategicFit ? "Aligned" : "Low Fit"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Fits org quarterly goals</span>
                  <button
                    type="button"
                    onClick={() => setStrategicFit(!strategicFit)}
                    disabled={!isReviewer}
                    style={{
                      background: strategicFit ? "#dcfce7" : "#fee2e2",
                      color: strategicFit ? "#166534" : "#991b1b",
                      border: "none",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: isReviewer ? "pointer" : "default"
                    }}
                  >
                    {strategicFit ? "High Alignment" : "Low Fit"}
                  </button>
                </div>
              </div>

              {/* Checklist 4: Scope Clarity */}
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>4. Scope Clarity</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: scopeClarity ? "#16a34a" : "#dc2626" }}>
                    {scopeClarity ? "Clear" : "Vague"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Well-defined objectives</span>
                  <button
                    type="button"
                    onClick={() => setScopeClarity(!scopeClarity)}
                    disabled={!isReviewer}
                    style={{
                      background: scopeClarity ? "#dcfce7" : "#fee2e2",
                      color: scopeClarity ? "#166534" : "#991b1b",
                      border: "none",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: isReviewer ? "pointer" : "default"
                    }}
                  >
                    {scopeClarity ? "Clear Scope" : "Vague Scope"}
                  </button>
                </div>
              </div>

              {/* Checklist 5: Business Sponsor */}
              <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>5. Business Sponsor</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: sponsorAvailable ? "#16a34a" : "#dc2626" }}>
                    {sponsorAvailable ? "Available" : "Unassigned"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Executive sponsor</span>
                  <button
                    type="button"
                    onClick={() => setSponsorAvailable(!sponsorAvailable)}
                    disabled={!isReviewer}
                    style={{
                      background: sponsorAvailable ? "#dcfce7" : "#fee2e2",
                      color: sponsorAvailable ? "#166534" : "#991b1b",
                      border: "none",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: isReviewer ? "pointer" : "default"
                    }}
                  >
                    {sponsorAvailable ? "Available" : "Unassigned"}
                  </button>
                </div>
              </div>

              {/* VALIDATION STATUS CARD */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1.5px solid #bbf7d0",
                  borderRadius: "10px",
                  padding: "14px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#166534", textTransform: "uppercase" }}>Screening Validation Result</div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#15803d", marginTop: "4px" }}>
                  QUALIFIED FOR FEASIBILITY REVIEW
                </div>
              </div>

              {/* Evaluator Notes Textarea */}
              <div className="input-field-group">
                <label className="input-label" style={{ fontWeight: "700" }}>Reviewer Notes & Remarks</label>
                <textarea
                  className="custom-input-elem"
                  rows={3}
                  placeholder="Enter observations or recommendations..."
                  value={evaluatorNotes}
                  onChange={(e) => setEvaluatorNotes(e.target.value)}
                  readOnly={!isReviewer}
                  style={{ fontSize: "12px", background: !isReviewer ? "#f8fafc" : "#ffffff" }}
                ></textarea>
              </div>

              {/* ACTION BUTTONS FOR REVIEWER */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                {!isReviewer ? (
                  <div style={{ background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", padding: "12px", borderRadius: "8px", fontWeight: "700", textAlign: "center", fontSize: "12px" }}>
                    🔒 Read-Only View ({userRole}): Initial Screening evaluation and decision buttons are reserved exclusively for assigned Reviewers.
                  </div>
                ) : isPassed ? (
                  <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "10px", borderRadius: "8px", fontWeight: "700", textAlign: "center", fontSize: "13px" }}>
                    ✓ Passed Initial Screening & Sent to Feasibility Review
                  </div>
                ) : isRejected ? (
                  <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px", borderRadius: "8px", fontWeight: "700", textAlign: "center", fontSize: "13px" }}>
                    ✕ Rejected in Screening
                  </div>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      icon={ArrowRight}
                      onClick={handleApproveAndForward}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Approve & Forward to Feasibility Review
                    </Button>

                    <Button
                      variant="outline"
                      icon={AlertCircle}
                      onClick={() => setDecisionModalType("request_info")}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Request Information
                    </Button>

                    <Button
                      variant="danger"
                      icon={XCircle}
                      onClick={() => setDecisionModalType("reject")}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Reject Proposal
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* DECISION MODAL */}
      {decisionModalType && (
        <Modal
          isOpen={Boolean(decisionModalType)}
          onClose={() => setDecisionModalType(null)}
          title={
            decisionModalType === "reject"
              ? `Reject Proposal #${idea.id}`
              : decisionModalType === "request_info"
              ? `Request Additional Info for #${idea.id}`
              : `Mark Proposal #${idea.id} as Duplicate`
          }
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setDecisionModalType(null)}>Cancel</Button>
              <Button
                variant={decisionModalType === "reject" || decisionModalType === "duplicate" ? "danger" : "primary"}
                icon={decisionModalType === "reject" ? XCircle : Send}
                onClick={handleModalDecisionSubmit}
              >
                Submit Decision
              </Button>
            </div>
          }
        >
          <form onSubmit={handleModalDecisionSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Primary Reason *</label>
              <select
                className="custom-input-elem"
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
              >
                <option value="Insufficient Information Provided">Insufficient Information Provided</option>
                <option value="Does Not Fit Strategic Goals">Does Not Fit Strategic Goals</option>
                <option value="High Risk / Low ROI">High Risk / Low ROI</option>
                <option value="Duplicate Submission">Duplicate Submission</option>
                <option value="Budget Constraint">Budget Constraint</option>
              </select>
            </div>

            {decisionModalType === "request_info" && (
              <div className="input-field-group">
                <label className="input-label">Response Due Date *</label>
                <input
                  type="date"
                  className="custom-input-elem"
                  value={modalDueDate}
                  onChange={(e) => setModalDueDate(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-field-group">
              <label className="input-label">Detailed Comments for Submitter *</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Explain the decision..."
                value={modalComments}
                onChange={(e) => setModalComments(e.target.value)}
                required
              ></textarea>
            </div>
          </form>
        </Modal>
      )}

      {/* ATTACHMENT PREVIEW MODAL */}
      {showFilePreviewModal && idea.attachment && (
        <Modal
          isOpen={showFilePreviewModal}
          onClose={() => setShowFilePreviewModal(false)}
          title={`Attachment Preview: ${idea.attachment.fileName}`}
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowFilePreviewModal(false)}>Close Preview</Button>
            </div>
          }
        >
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            {idea.attachment.fileType?.includes("image") ? (
              <img
                src={idea.attachment.fileData}
                alt={idea.attachment.fileName}
                style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "8px" }}
              />
            ) : (
              <div style={{ padding: "40px", background: "#f8fafc", borderRadius: "10px" }}>
                <FileText size={48} color="#4f46e5" style={{ marginBottom: "12px" }} />
                <div style={{ fontWeight: "700", color: "#1e293b" }}>{idea.attachment.fileName}</div>
                <div style={{ fontSize: "12px", color: "#64748b", margin: "6px 0 16px 0" }}>{idea.attachment.fileSize} • PDF Document</div>
                <a
                  href={idea.attachment.fileData}
                  download={idea.attachment.fileName}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="primary" icon={Download}>Download PDF File</Button>
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ScreeningEvaluation;
