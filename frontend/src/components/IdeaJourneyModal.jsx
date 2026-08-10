import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  ShieldCheck,
  BarChart,
  Calculator,
  FolderKanban,
  PlayCircle,
  Award,
  Calendar,
  FileText,
  Paperclip,
  Download,
  ExternalLink,
  ChevronRight,
  User
} from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import IdeaPipelineStepper from "./IdeaPipelineStepper";
import IdeaAssignmentHistory from "./IdeaAssignmentHistory";
import { getIdeaPipelineStatus } from "../utils/ideaPipeline";

function IdeaJourneyModal({ idea, isOpen, onClose, onOpenAllocation }) {
  const navigate = useNavigate();

  if (!idea) return null;

  const pipeline = getIdeaPipelineStatus(idea);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Idea End-to-End Progress Tracker: IDEA-${idea.id}`}
      maxWidth="850px"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Current Status: <strong style={{ color: "#0f172a" }}>{idea.status}</strong>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {onOpenAllocation && (
              <Button
                variant="outline"
                icon={UserCheck}
                onClick={() => {
                  onClose();
                  onOpenAllocation(idea);
                }}
              >
                Reassign Domain Experts
              </Button>
            )}
            <Button variant="primary" onClick={onClose}>
              Close Tracker
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* IDEA HEADER BANNER */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            color: "#ffffff",
            padding: "18px 20px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span className="category-chip-indigo" style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff" }}>
                  {idea.category || "General"} Domain
                </span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>ID: IDEA-{idea.id}</span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Submitted: {idea.date || "Aug 2026"}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>{idea.title}</h3>
              <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} color="#818cf8" /> Author: <strong>{idea.author}</strong> ({idea.authorEmail || "User"})
              </div>
            </div>

            <div style={{ textAlign: "right", background: "rgba(255,255,255,0.08)", padding: "10px 14px", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700" }}>Overall Progress</div>
              <div style={{ fontSize: "22px", fontWeight: "900", color: pipeline.percent === 100 ? "#4ade80" : "#818cf8" }}>
                {pipeline.percent}%
              </div>
            </div>
          </div>
        </div>

        {/* VISUAL 8-STAGE STEPPER TRACKER */}
        <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <IdeaPipelineStepper idea={idea} />
        </div>

        {/* STAGE-BY-STAGE DETAILED CHRONOLOGY */}
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Stage-by-Stage Progression & Assigned Stakeholders
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* STAGE 1: SUBMISSION */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px 16px",
                background: pipeline.currentStageIndex >= 1 ? "#ffffff" : "#f8fafc",
                borderLeft: "4px solid #22c55e"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 size={18} color="#16a34a" />
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Stage 1: Proposal Submission</strong>
                </div>
                <span style={{ fontSize: "11px", color: "#16a34a", background: "#dcfce7", padding: "2px 8px", borderRadius: "10px", fontWeight: "700" }}>
                  Completed
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", margin: "8px 0 0 28px" }}>
                Submitted by <strong>{idea.author}</strong> on {idea.date || "Aug 2026"}. Problem statement and proposed solution logged.
              </p>
            </div>

            {/* STAGE 2: EXPERT ALLOCATION */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px 16px",
                background: pipeline.currentStageIndex >= 2 ? "#ffffff" : "#f8fafc",
                borderLeft: `4px solid ${pipeline.currentStageIndex > 2 ? "#22c55e" : pipeline.currentStageIndex === 2 ? "#4f46e5" : "#cbd5e1"}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <UserCheck size={18} color={pipeline.currentStageIndex >= 2 ? "#4f46e5" : "#94a3b8"} />
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Stage 2: Domain Expert Allocation</strong>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: idea.assignedReviewer ? "#15803d" : "#dc2626",
                    background: idea.assignedReviewer ? "#dcfce7" : "#fee2e2",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontWeight: "700"
                  }}
                >
                  {idea.assignedReviewer ? "Assigned" : "Pending PC Allocation"}
                </span>
              </div>
              <div style={{ margin: "10px 0 0 28px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", fontSize: "12px" }}>
                <div style={{ background: "#f1f5f9", padding: "8px 10px", borderRadius: "6px" }}>
                  <div style={{ color: "#64748b", fontWeight: "600" }}>Assigned Reviewer:</div>
                  <div style={{ color: "#4f46e5", fontWeight: "700" }}>{idea.assignedReviewer ? idea.assignedReviewer.split("(")[0] : "Not Assigned"}</div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Deadline: {idea.reviewerDeadline || "N/A"}</div>
                </div>

                <div style={{ background: "#f1f5f9", padding: "8px 10px", borderRadius: "6px" }}>
                  <div style={{ color: "#64748b", fontWeight: "600" }}>Assigned Business Analyst:</div>
                  <div style={{ color: "#0891b2", fontWeight: "700" }}>{idea.assignedBA ? idea.assignedBA.split("(")[0] : "Not Assigned"}</div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Deadline: {idea.baDeadline || "N/A"}</div>
                </div>

                <div style={{ background: "#f1f5f9", padding: "8px 10px", borderRadius: "6px" }}>
                  <div style={{ color: "#64748b", fontWeight: "600" }}>Assigned Project Manager:</div>
                  <div style={{ color: "#16a34a", fontWeight: "700" }}>{idea.assignedPM ? idea.assignedPM.split("(")[0] : "Not Assigned"}</div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Deadline: {idea.pmDeadline || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* STAGE 3: INITIAL SCREENING & FEASIBILITY */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px 16px",
                background: pipeline.currentStageIndex >= 3 ? "#ffffff" : "#f8fafc",
                borderLeft: `4px solid ${pipeline.currentStageIndex > 3 ? "#22c55e" : pipeline.currentStageIndex === 3 ? "#4f46e5" : "#cbd5e1"}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={18} color={pipeline.currentStageIndex >= 3 ? "#4f46e5" : "#94a3b8"} />
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Stage 3: Initial Screening & Feasibility Review</strong>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={ExternalLink}
                  onClick={() => {
                    onClose();
                    navigate(`/screening-evaluation/${idea.id}`);
                  }}
                >
                  View Review Details
                </Button>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", margin: "8px 0 0 28px" }}>
                Status: <strong>{idea.status.includes("Feasibility") || idea.status.includes("Passed") ? "Passed Screening & Feasibility" : idea.status}</strong>. Reviewer feedback: "{idea.evaluatorNotes || "Review evaluation recorded in system."}"
              </p>
            </div>

            {/* STAGE 4 & 5: BUSINESS ANALYSIS & ESTIMATION */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px 16px",
                background: pipeline.currentStageIndex >= 4 ? "#ffffff" : "#f8fafc",
                borderLeft: `4px solid ${pipeline.currentStageIndex > 4 ? "#22c55e" : pipeline.currentStageIndex === 4 ? "#4f46e5" : "#cbd5e1"}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BarChart size={18} color={pipeline.currentStageIndex >= 4 ? "#4f46e5" : "#94a3b8"} />
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Stage 4 & 5: Business Analysis & Tech Estimation</strong>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={ExternalLink}
                  onClick={() => {
                    onClose();
                    navigate("/analysis-reports");
                  }}
                >
                  View BA Reports
                </Button>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", margin: "8px 0 0 28px" }}>
                Assigned BA: <strong>{idea.assignedBA ? idea.assignedBA.split("(")[0] : "Business Analyst"}</strong>. Functional requirements, ROI, and technical story point estimation studio.
              </p>
            </div>

            {/* STAGE 6, 7 & 8: PM EXECUTION, QA & LIVE */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "14px 16px",
                background: pipeline.currentStageIndex >= 6 ? "#ffffff" : "#f8fafc",
                borderLeft: `4px solid ${pipeline.currentStageIndex >= 8 ? "#22c55e" : pipeline.currentStageIndex >= 6 ? "#4f46e5" : "#cbd5e1"}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FolderKanban size={18} color={pipeline.currentStageIndex >= 6 ? "#4f46e5" : "#94a3b8"} />
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>Stage 6, 7 & 8: Project Execution, QA & Live Rollout</strong>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={ExternalLink}
                  onClick={() => {
                    onClose();
                    navigate("/progress-tracking");
                  }}
                >
                  View Velocity & Sprints
                </Button>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", margin: "8px 0 0 28px" }}>
                Assigned PM: <strong>{idea.assignedPM ? idea.assignedPM.split("(")[0] : "Project Manager"}</strong>. Real-time sprint progress, release milestones, QA signoff, and business benefits realization.
              </p>
            </div>
          </div>
        </div>

        {/* AUDIT LOG ASSIGNMENT HISTORY */}
        <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <IdeaAssignmentHistory ideaId={idea.id} />
        </div>
      </div>
    </Modal>
  );
}

export default IdeaJourneyModal;
