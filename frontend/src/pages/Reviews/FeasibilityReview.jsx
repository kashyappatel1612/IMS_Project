import { useState, useEffect } from "react";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Workflow,
  Briefcase,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Paperclip,
  FileText,
  Download,
  Building2,
  User,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function FeasibilityReview() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [activeTab, setActiveTab] = useState("technical"); // 'technical' | 'functional' | 'business'

  // Technical Review State
  const [techFeasibility, setTechFeasibility] = useState("High Feasibility");
  const [techStackFit, setTechStackFit] = useState("Compatible");
  const [techSecurityRisk, setTechSecurityRisk] = useState("Low Risk");
  const [techRemarks, setTechRemarks] = useState("");

  // Functional Review State
  const [functionalFit, setFunctionalFit] = useState("Seamless Fit");
  const [userAdoption, setUserAdoption] = useState("High Adoption");
  const [processComplexity, setProcessComplexity] = useState("Low Complexity");
  const [functionalRemarks, setFunctionalRemarks] = useState("");

  // Business Review State
  const [financialViability, setFinancialViability] = useState("High ROI");
  const [strategicPriority, setStrategicPriority] = useState("High Priority");
  const [timeToMarket, setTimeToMarket] = useState("3 - 6 Months");
  const [businessRemarks, setBusinessRemarks] = useState("");

  useEffect(() => {
    const list = getSubmittedIdeas();
    setIdeas(list);
    if (list.length > 0) {
      setSelectedIdeaId(list[0].id);
    }
  }, []);

  const selectedIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId)) || null;

  const handleApproveFeasibility = () => {
    if (!selectedIdea) return;
    const updated = updateIdeaStatus(selectedIdea.id, "Feasibility Approved");
    setIdeas(updated);
    alert(`Feasibility approved for "${selectedIdea.title}"! Sent to Business Analysis stage.`);
  };

  const handleRejectFeasibility = () => {
    if (!selectedIdea) return;
    const updated = updateIdeaStatus(selectedIdea.id, "Rejected in Feasibility");
    setIdeas(updated);
    alert(`Idea "${selectedIdea.title}" has been rejected in Feasibility Review.`);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Page Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Feasibility Review Panel</h1>
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
              <FileCheck size={14} /> Stage 2 Multi-Dimensional Review
            </span>
          </div>
          <p>Perform Technical, Functional, and Business feasibility assessments for submitted proposals.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Under Feasibility Review</span>
            <div className="kpi-icon-pill pill-purple">
              <Layers size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{ideas.length}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Technical Feasible</span>
            <div className="kpi-icon-pill pill-blue">
              <Cpu size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => !i.status.includes("Rejected")).length}
          </span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Feasibility Approved</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status.includes("Feasibility Approved")).length}
          </span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected in Feasibility</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status.includes("Rejected")).length}
          </span>
        </div>
      </div>

      {/* Main Feasibility Review Workspace */}
      <div className="screening-workspace-grid">
        {/* LEFT COLUMN: Select Idea & Details */}
        <div className="screening-left-col">
          <Card title="1. Select Proposal for Assessment" subtitle="Choose an idea to evaluate feasibility">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "6px 0" }}>
              <select
                className="custom-input-elem"
                value={selectedIdeaId || ""}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
                style={{ fontSize: "14px", fontWeight: "600" }}
              >
                {ideas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.category}) — Status: {item.status}
                  </option>
                ))}
              </select>

              {selectedIdea && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "10px" }}>
                  <div className="idea-meta-pills-row" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>
                    <span className="meta-pill">
                      <Building2 size={13} /> Category: {selectedIdea.category}
                    </span>
                    <span className="meta-pill">
                      <User size={13} /> Author: {selectedIdea.author}
                    </span>
                    <span className="meta-pill">
                      <Calendar size={13} /> {selectedIdea.date}
                    </span>
                    <span className={`table-badge ${selectedIdea.status.includes("Approved") ? "badge-approved" : selectedIdea.status.includes("Rejected") ? "badge-rejected" : "badge-review"}`}>
                      {selectedIdea.status}
                    </span>
                  </div>

                  <div className="screening-detail-block" style={{ marginBottom: 0 }}>
                    <h4 className="screening-section-label">Problem Statement</h4>
                    <div className="screening-text-box">
                      {selectedIdea.problemStatement || "No detailed problem statement recorded."}
                    </div>
                  </div>

                  <div className="screening-detail-block" style={{ marginBottom: 0 }}>
                    <h4 className="screening-section-label">Proposed Solution</h4>
                    <div className="screening-text-box">
                      {selectedIdea.description || "No detailed solution description recorded."}
                    </div>
                  </div>

                  {selectedIdea.attachment && (
                    <div className="screening-detail-block" style={{ marginBottom: 0 }}>
                      <h4 className="screening-section-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Paperclip size={14} /> Attached File
                      </h4>
                      <div className="attachment-view-card">
                        <div className="attachment-view-left">
                          {selectedIdea.attachment.fileType?.includes("image") ? (
                            <div className="attachment-img-preview-box">
                              <img src={selectedIdea.attachment.fileData} alt="Preview" />
                            </div>
                          ) : (
                            <div className="attachment-pdf-big-icon">
                              <FileText size={24} color="#4f46e5" />
                            </div>
                          )}
                          <div className="attachment-file-info">
                            <span className="attachment-file-name">{selectedIdea.attachment.fileName}</span>
                            <span className="attachment-file-meta">{selectedIdea.attachment.fileSize}</span>
                          </div>
                        </div>
                        <a
                          href={selectedIdea.attachment.fileData}
                          download={selectedIdea.attachment.fileName}
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
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: 3-Dimensional Feasibility Evaluation Panel */}
        <div className="screening-right-col">
          <Card title="2. Feasibility Evaluation (3 Reviews)" subtitle="Perform Technical, Functional, and Business assessments">
            {/* 3 Review Tabs Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: "16px",
                background: "#f1f5f9",
                padding: "4px",
                borderRadius: "var(--radius-md)"
              }}
            >
              <button
                type="button"
                className={`tab-switch-btn ${activeTab === "technical" ? "active" : ""}`}
                onClick={() => setActiveTab("technical")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: activeTab === "technical" ? "#ffffff" : "transparent",
                  color: activeTab === "technical" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: activeTab === "technical" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <Cpu size={15} /> Technical
              </button>

              <button
                type="button"
                className={`tab-switch-btn ${activeTab === "functional" ? "active" : ""}`}
                onClick={() => setActiveTab("functional")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: activeTab === "functional" ? "#ffffff" : "transparent",
                  color: activeTab === "functional" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: activeTab === "functional" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <Workflow size={15} /> Functional
              </button>

              <button
                type="button"
                className={`tab-switch-btn ${activeTab === "business" ? "active" : ""}`}
                onClick={() => setActiveTab("business")}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: activeTab === "business" ? "#ffffff" : "transparent",
                  color: activeTab === "business" ? "var(--primary)" : "var(--text-muted)",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  boxShadow: activeTab === "business" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                <Briefcase size={15} /> Business
              </button>
            </div>

            {/* TAB 1: TECHNICAL REVIEW */}
            {activeTab === "technical" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="checklist-card-item">
                  <label className="input-label">Technical Feasibility Level</label>
                  <select
                    className="custom-input-elem"
                    value={techFeasibility}
                    onChange={(e) => setTechFeasibility(e.target.value)}
                  >
                    <option value="High Feasibility"> High Feasibility (Standard Tech Stack)</option>
                    <option value="Medium Feasibility"> Medium Feasibility (Requires Custom API/Dev)</option>
                    <option value="Low Feasibility"> Low Feasibility (High Technical Complexity)</option>
                  </select>
                </div>

                <div className="checklist-card-item">
                  <label className="input-label">Architecture & Tech Stack Compatibility</label>
                  <select
                    className="custom-input-elem"
                    value={techStackFit}
                    onChange={(e) => setTechStackFit(e.target.value)}
                  >
                    <option value="Compatible"> Fully Compatible with Infrastructure</option>
                    <option value="Requires Integration"> Requires New Systems/Integrations</option>
                  </select>
                </div>

                <div className="checklist-card-item">
                  <label className="input-label">Security & Compliance Risk</label>
                  <select
                    className="custom-input-elem"
                    value={techSecurityRisk}
                    onChange={(e) => setTechSecurityRisk(e.target.value)}
                  >
                    <option value="Low Risk"> Low Security Risk</option>
                    <option value="Moderate Risk"> Moderate Security Risk</option>
                    <option value="High Risk"> High Risk (Requires InfoSec Audit)</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label className="input-label">Technical Lead Assessment Remarks</label>
                  <textarea
                    className="custom-input-elem"
                    rows={3}
                    placeholder="Enter architecture observations, API requirements, or technical risks..."
                    value={techRemarks}
                    onChange={(e) => setTechRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {/* TAB 2: FUNCTIONAL REVIEW */}
            {activeTab === "functional" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="checklist-card-item">
                  <label className="input-label">Operational Workflow Fit</label>
                  <select
                    className="custom-input-elem"
                    value={functionalFit}
                    onChange={(e) => setFunctionalFit(e.target.value)}
                  >
                    <option value="Seamless Fit"> Seamless Fit (Smooth Operational Integration)</option>
                    <option value="Moderate Change"> Moderate Operational Workflow Change</option>
                    <option value="Disruptive"> Disruptive to Current Operations</option>
                  </select>
                </div>

                <div className="checklist-card-item">
                  <label className="input-label">End-User Adoption Feasibility</label>
                  <select
                    className="custom-input-elem"
                    value={userAdoption}
                    onChange={(e) => setUserAdoption(e.target.value)}
                  >
                    <option value="High Adoption"> High Adoption Expected (Intuitive)</option>
                    <option value="Requires Training"> Requires Staff Training & Enablement</option>
                  </select>
                </div>

                <div className="checklist-card-item">
                  <label className="input-label">Process Complexity & Automation Potential</label>
                  <select
                    className="custom-input-elem"
                    value={processComplexity}
                    onChange={(e) => setProcessComplexity(e.target.value)}
                  >
                    <option value="Low Complexity"> High Automation / Low Complexity</option>
                    <option value="Medium Complexity"> Medium Process Complexity</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label className="input-label">Functional Lead Remarks</label>
                  <textarea
                    className="custom-input-elem"
                    rows={3}
                    placeholder="Enter user workflow analysis, change management notes..."
                    value={functionalRemarks}
                    onChange={(e) => setFunctionalRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {/* TAB 3: BUSINESS REVIEW */}
            {activeTab === "business" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="checklist-card-item">
                  <label className="input-label">Financial Viability & ROI Expectation</label>
                  <select
                    className="custom-input-elem"
                    value={financialViability}
                    onChange={(e) => setFinancialViability(e.target.value)}
                  >
                    <option value="High ROI"> High ROI (Strong Cost Savings/Revenue)</option>
                    <option value="Moderate ROI"> Moderate Financial Return</option>
                    <option value="Low ROI"> Low Financial Impact</option>
                  </select>
                </div>

                <div className="checklist-card-item">
                  <label className="input-label">Strategic Goal Alignment</label>
                  <select
                    className="custom-input-elem"
                    value={strategicPriority}
                    onChange={(e) => setStrategicPriority(e.target.value)}
                  >
                    <option value="High Priority"> Critical Strategic Focus Area</option>
                    <option value="Medium Priority"> Secondary Business Objective</option>
                  </select>
                </div>

                <div className="checklist-card-item">
                  <label className="input-label">Estimated Time-to-Market</label>
                  <select
                    className="custom-input-elem"
                    value={timeToMarket}
                    onChange={(e) => setTimeToMarket(e.target.value)}
                  >
                    <option value="1 - 3 Months"> Quick Win (1 - 3 Months)</option>
                    <option value="3 - 6 Months"> Medium Term (3 - 6 Months)</option>
                    <option value="6+ Months"> Long Term Initiative (6+ Months)</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label className="input-label">Business Analyst Remarks</label>
                  <textarea
                    className="custom-input-elem"
                    rows={3}
                    placeholder="Enter business value creation, market impact notes..."
                    value={businessRemarks}
                    onChange={(e) => setBusinessRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            {/* Action Final Decision Buttons */}
            <div className="screening-decision-box" style={{ marginTop: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--text-dark)" }}>
                Feasibility Review Final Action
              </h4>

              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={handleApproveFeasibility}
                style={{ width: "100%", justifyContent: "center" }}
              >
                Approve Feasibility & Send to Business Analysis
              </Button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginTop: "10px" }}>
                <Button
                  variant="danger"
                  icon={XCircle}
                  onClick={handleRejectFeasibility}
                >
                  Reject Feasibility
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FeasibilityReview;
