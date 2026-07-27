import { useState, useEffect } from "react";
import {
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  FileCheck,
  Check,
  X,
  HelpCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function InitialScreening() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

  // 5 Screening Checklist Criteria States
  const [duplicateCheck, setDuplicateCheck] = useState("No Duplicate"); // 'No Duplicate' | 'Duplicate Exists'
  const [infoSufficiency, setInfoSufficiency] = useState("Sufficient"); // 'Sufficient' | 'Insufficient'
  const [orgGoalFit, setOrgGoalFit] = useState("High Alignment"); // 'High Alignment' | 'Low Alignment'
  const [scopeClarity, setScopeClarity] = useState("Clear Scope"); // 'Clear Scope' | 'Vague Scope'
  const [businessSupport, setBusinessSupport] = useState("Available"); // 'Available' | 'Not Available'
  const [evaluatorNotes, setEvaluatorNotes] = useState("");

  useEffect(() => {
    setIdeas(getSubmittedIdeas());
  }, []);

  const openEvaluationModal = (idea) => {
    setSelectedIdea(idea);
    setDuplicateCheck("No Duplicate");
    setInfoSufficiency("Sufficient");
    setOrgGoalFit("High Alignment");
    setScopeClarity("Clear Scope");
    setBusinessSupport("Available");
    setEvaluatorNotes("");
    setIsEvaluationModalOpen(true);
  };

  const handlePassScreening = () => {
    if (!selectedIdea) return;
    const updated = updateIdeaStatus(selectedIdea.id, "Passed Initial Screening");
    setIdeas(updated);
    alert(`Idea "${selectedIdea.title}" passed Initial Screening! Sent to Review Management.`);
    setIsEvaluationModalOpen(false);
  };

  const handleRejectScreening = () => {
    if (!selectedIdea) return;
    const updated = updateIdeaStatus(selectedIdea.id, "Rejected in Screening");
    setIdeas(updated);
    alert(`Idea "${selectedIdea.title}" has been Rejected in Screening.`);
    setIsEvaluationModalOpen(false);
  };

  const handleRequestInfo = () => {
    if (!selectedIdea) return;
    const updated = updateIdeaStatus(selectedIdea.id, "Information Requested");
    setIdeas(updated);
    alert(`Requested additional information for "${selectedIdea.title}".`);
    setIsEvaluationModalOpen(false);
  };

  // Filter ideas for screening queue: Exclude "Pending Review" ideas until explicitly sent by Admin
  const screeningQueue = ideas.filter(
    (i) => i.status !== "Pending Review"
  );

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Initial Screening & Validation Panel </h1>
            <span
              style={{
                background: "var(--primary-light)",
                color: "var(--primary)",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Filter size={14} /> Stage 1 Evaluation
            </span>
          </div>
          <p>Validate incoming ideas for duplicate check, information sufficiency, goal alignment & business support.</p>
        </div>
      </div>

      {/* KPI Cards for Screening Metrics */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">In Screening Queue</span>
            <div className="kpi-icon-pill pill-purple">
              <Filter size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{screeningQueue.length}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Passed Screening</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status.includes("Passed")).length}
          </span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Info Requested</span>
            <div className="kpi-icon-pill pill-amber">
              <AlertCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status === "Information Requested").length}
          </span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected in Screening</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status.includes("Rejected")).length}
          </span>
        </div>
      </div>

      {/* Screening Queue Table */}
      <Card
        title="Initial Screening Assessment Queue "
        subtitle="Perform 5-point validation checklist on incoming innovation submissions"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea Title</th>
                <th>Category</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Current Status</th>
                <th>Screening Action</th>
              </tr>
            </thead>
            <tbody>
              {screeningQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                    No ideas currently in screening queue. Submissions sent by Admin from the Admin Dashboard will appear here.
                  </td>
                </tr>
              ) : (
                screeningQueue.map((item) => {
                  const isPassed = item.status.includes("Passed");
                  const isRejected = item.status.includes("Rejected");

                  return (
                    <tr key={item.id}>
                      <td className="table-idea-title">{item.title}</td>
                      <td>
                        <span
                          style={{
                            background: "#e0e7ff",
                            color: "#4338ca",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: "600"
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td>{item.author}</td>
                      <td>{item.date}</td>
                      <td>
                        <span
                          className={`table-badge ${
                            isPassed
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
                          variant={isPassed ? "ghost" : "primary"}
                          icon={FileCheck}
                          onClick={() => openEvaluationModal(item)}
                        >
                          {isPassed ? "Re-evaluate" : "Start Screening"}
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

      {/* INTERACTIVE MODAL: 5-Point Initial Screening Checklist */}
      {selectedIdea && (
        <Modal
          isOpen={isEvaluationModalOpen}
          onClose={() => setIsEvaluationModalOpen(false)}
          title={`Screening Evaluation: ${selectedIdea.title}`}
          footer={
            <>
              <Button variant="danger" icon={X} onClick={handleRejectScreening}>
                Reject Idea
              </Button>

              <Button variant="outline" icon={HelpCircle} onClick={handleRequestInfo}>
                Request More Info
              </Button>

              <Button variant="primary" icon={ArrowRight} onClick={handlePassScreening}>
                Pass & Send to Review Management
              </Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Idea Details Preview Box */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "14px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--primary)" }}>
                  {selectedIdea.category.toUpperCase()}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Author: {selectedIdea.author} | {selectedIdea.date}
                </span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px" }}>
                {selectedIdea.title}
              </h4>
              {selectedIdea.problemStatement && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  <strong>Problem:</strong> {selectedIdea.problemStatement}
                </p>
              )}
            </div>

            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)", borderBottom: "1px solid var(--border-light)", paddingBottom: "6px" }}>
               5-Point Initial Screening Checklist
            </h4>

            {/* Criteria 1: Duplicate Check */}
            <div className="input-field-group">
              <label className="input-label">1. Duplicate Idea Check</label>
              <select
                className="custom-input-elem"
                value={duplicateCheck}
                onChange={(e) => setDuplicateCheck(e.target.value)}
              >
                <option value="No Duplicate"> No Duplicate (Unique Idea)</option>
                <option value="Duplicate Exists"> Duplicate of Existing Idea/Project</option>
              </select>
            </div>

            {/* Criteria 2: Information Sufficiency */}
            <div className="input-field-group">
              <label className="input-label">2. Enough Information Provided?</label>
              <select
                className="custom-input-elem"
                value={infoSufficiency}
                onChange={(e) => setInfoSufficiency(e.target.value)}
              >
                <option value="Sufficient"> Sufficient Information Provided</option>
                <option value="Insufficient"> Insufficient / Incomplete Details</option>
              </select>
            </div>

            {/* Criteria 3: Alignment with Organizational Goals */}
            <div className="input-field-group">
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

            {/* Criteria 4: Scope Clarity */}
            <div className="input-field-group">
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

            {/* Criteria 5: Business Support & Feasibility */}
            <div className="input-field-group">
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

            {/* Evaluator Notes */}
            <div className="input-field-group">
              <label className="input-label">Screening Evaluator Remarks</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Enter key evaluation observations or recommendations..."
                value={evaluatorNotes}
                onChange={(e) => setEvaluatorNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default InitialScreening;
