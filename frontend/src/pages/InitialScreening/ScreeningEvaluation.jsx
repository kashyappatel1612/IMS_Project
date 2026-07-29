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
  ExternalLink,
  Download
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getIdeaById, updateIdeaStatus } from "../../utils/ideaStorage";

function ScreeningEvaluation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idea, setIdea] = useState(null);

  // Screening Checklist Criteria States
  const [infoSufficiency, setInfoSufficiency] = useState("Sufficient");
  const [orgGoalFit, setOrgGoalFit] = useState("High Alignment");
  const [scopeClarity, setScopeClarity] = useState("Clear Scope");
  const [businessSupport, setBusinessSupport] = useState("Available");
  const [evaluatorNotes, setEvaluatorNotes] = useState("");

  useEffect(() => {
    if (id) {
      const found = getIdeaById(id);
      if (found) {
        setIdea(found);
        if (found.evaluatorNotes) {
          setEvaluatorNotes(found.evaluatorNotes);
        }
      }
    }
  }, [id]);

  if (!idea) {

    return (
      <div className="dashboard-wrapper">
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Idea Not Found</h2>
          <p>The requested idea submission could not be located.</p>
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

  const handlePassScreening = () => {
    updateIdeaStatus(idea.id, "Passed Initial Screening", evaluatorNotes);
    alert(`Idea "${idea.title}" passed Initial Screening! Sent to Feasibility Review.`);
    navigate("/initial-screening");
  };

  const handleRejectScreening = () => {
    updateIdeaStatus(idea.id, "Rejected in Screening", evaluatorNotes);
    alert(`Idea "${idea.title}" has been Rejected in Screening.`);
    navigate("/initial-screening");
  };

  const handleRequestInfo = () => {
    updateIdeaStatus(idea.id, "Information Requested", evaluatorNotes);
    alert(`Requested additional information for "${idea.title}".`);
    navigate("/initial-screening");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Top Navigation Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate("/initial-screening")}
            >
              Back to Queue
            </Button>
            <span className="category-chip-indigo">
              <Filter size={13} /> Stage 1 Evaluation Workspace
            </span>
          </div>
          <h1>Initial Screening Assessment: {idea.title}</h1>
          <p>Evaluate employee innovation proposal using the 5-point validation framework.</p>
        </div>
      </div>

      {/* Main Executive 2-Column Workspace */}
      <div className="screening-workspace-grid">
        {/* LEFT COLUMN: Idea Details & Attachment */}
        <div className="screening-left-col">
          {/* Section 1: Overview & Categorization */}
          <Card title="1. Overview & Categorization" subtitle="Title and industry domain for your idea">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "6px 0" }}>
              <div className="screening-detail-block" style={{ marginBottom: 0 }}>
                <h4 className="screening-section-label">Idea Title</h4>
                <div className="screening-text-box" style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>
                  {idea.title}
                </div>
              </div>

              <div className="idea-meta-pills-row" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>
                <span className="meta-pill">
                  <Building2 size={13} /> Domain: {idea.category}
                </span>
                <span className="meta-pill">
                  <User size={13} /> Author: {idea.author}
                </span>
                <span className="meta-pill">
                  <Calendar size={13} /> Date: {idea.date}
                </span>
                <span className={`table-badge ${isPassed ? "badge-approved" : isRejected ? "badge-rejected" : "badge-review"}`}>
                  {idea.status}
                </span>
              </div>
            </div>
          </Card>

          {/* Section 2: Problem & Solution Statement */}
          <Card title="2. Problem & Solution Statement" subtitle="Detailed explanation of the problem and proposed solution">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "6px 0" }}>
              <div className="screening-detail-block" style={{ marginBottom: 0 }}>
                <h4 className="screening-section-label">Problem Statement</h4>
                <div className="screening-text-box">
                  {idea.problemStatement || "No detailed problem statement provided."}
                </div>
              </div>

              <div className="screening-detail-block" style={{ marginBottom: 0 }}>
                <h4 className="screening-section-label">Idea Description</h4>
                <div className="screening-text-box">
                  {idea.description || "No detailed idea description provided."}
                </div>
              </div>

              {idea.proposedSolution && (
                <div className="screening-detail-block" style={{ marginBottom: 0 }}>
                  <h4 className="screening-section-label">Proposed Solution</h4>
                  <div className="screening-text-box">
                    {idea.proposedSolution}
                  </div>
                </div>
              )}

              {(idea.expectedBenefits || idea.expectedOutcome) && (
                <div className="screening-detail-block" style={{ marginBottom: 0 }}>
                  <h4 className="screening-section-label">Expected Benefits</h4>
                  <div className="screening-text-box">
                    {idea.expectedBenefits || idea.expectedOutcome}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Section 3: Supporting Attachments */}
          <Card title="3. Supporting Attachments" subtitle="Uploaded PDF documents or image files">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "6px 0" }}>
              {idea.attachment ? (
                <div className="attachment-view-card">
                  <div className="attachment-view-left">
                    {idea.attachment.fileType?.includes("image") ? (
                      <div className="attachment-img-preview-box">
                        <img src={idea.attachment.fileData} alt={idea.attachment.fileName} />
                      </div>
                    ) : (
                      <div className="attachment-pdf-big-icon">
                        <FileText size={32} color="#4f46e5" />
                      </div>
                    )}

                    <div className="attachment-file-info">
                      <span className="attachment-file-name">{idea.attachment.fileName}</span>
                      <span className="attachment-file-meta">
                        {idea.attachment.fileType?.includes("image") ? "Image File" : "PDF Document"} • {idea.attachment.fileSize}
                      </span>
                    </div>
                  </div>

                  <a
                    href={idea.attachment.fileData}
                    download={idea.attachment.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-download-btn"
                  >
                    <Download size={15} /> Download Attachment
                  </a>
                </div>
              ) : (
                <div className="attachment-none-box">
                  <span>No attachment was uploaded with this idea proposal.</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Screening Validation Checklist & Action Buttons */}
        <div className="screening-right-col">
          <Card title="Screening Validation Checklist" subtitle="Perform criteria screening evaluation">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              {/* Criteria 1 */}
              <div className="checklist-card-item">
                <label className="input-label">1. Enough Information Provided?</label>
                <select
                  className="custom-input-elem"
                  value={infoSufficiency}
                  onChange={(e) => setInfoSufficiency(e.target.value)}
                >
                  <option value="Sufficient"> Sufficient Information Provided</option>
                  <option value="Insufficient"> Insufficient / Incomplete Details</option>
                </select>
              </div>

              {/* Criteria 3 */}
              <div className="checklist-card-item">
                <label className="input-label">3. Fits Organizational Strategic Goals?</label>
                <select
                  className="custom-input-elem"
                  value={orgGoalFit}
                  onChange={(e) => setOrgGoalFit(e.target.value)}
                >
                  <option value="High Alignment"> High Strategic Alignment</option>
                  <option value="Low Alignment"> Low / No Alignment with Goals</option>
                </select>
              </div>

              {/* Criteria 4 */}
              <div className="checklist-card-item">
                <label className="input-label">4. Scope & Objectives Clear?</label>
                <select
                  className="custom-input-elem"
                  value={scopeClarity}
                  onChange={(e) => setScopeClarity(e.target.value)}
                >
                  <option value="Clear Scope"> Scope & Objectives Clear</option>
                  <option value="Vague Scope"> Vague / Ambiguous Scope</option>
                </select>
              </div>

              {/* Criteria 5 */}
              <div className="checklist-card-item">
                <label className="input-label">5. Business Support & Feasibility Available?</label>
                <select
                  className="custom-input-elem"
                  value={businessSupport}
                  onChange={(e) => setBusinessSupport(e.target.value)}
                >
                  <option value="Available"> Business Sponsor & Resources Available</option>
                  <option value="Not Available"> Business Support Not Available</option>
                </select>
              </div>

              {/* Evaluator Remarks */}
              <div className="input-field-group">
                <label className="input-label">Screening Evaluator Remarks</label>
                <textarea
                  className="custom-input-elem"
                  rows={4}
                  placeholder="Enter evaluation observations, key risks, or recommendations..."
                  value={evaluatorNotes}
                  onChange={(e) => setEvaluatorNotes(e.target.value)}
                ></textarea>
              </div>

              {/* Action Buttons with Strict Mutual Exclusion */}
              <div className="screening-decision-box">
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--text-dark)" }}>
                  Screening Final Decision
                </h4>

                {isRejected ? (
                  <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                    <XCircle size={20} />
                    <span>Status: Rejected (Approve Action Disabled)</span>
                  </div>
                ) : isPassed ? (
                  <div style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "8px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={20} />
                    <span>Status: Passed Screening (Reject Action Disabled)</span>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      icon={ArrowRight}
                      onClick={handlePassScreening}
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Pass & Send to Feasibility Review
                    </Button>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
                      <Button
                        variant="outline"
                        icon={HelpCircle}
                        onClick={handleRequestInfo}
                      >
                        Request Info
                      </Button>

                      <Button
                        variant="danger"
                        icon={X}
                        onClick={handleRejectScreening}
                      >
                        Reject Idea
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ScreeningEvaluation;
