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
  Sparkles,
  Inbox,
  Check,
  X,
  RefreshCw
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function FeasibilityReview() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [activeTab, setActiveTab] = useState("technical");
  const [filterMode, setFilterMode] = useState("all");

  // Technical Review State
  const [techReviewer, setTechReviewer] = useState("Dr. Rahul Sharma (Chief Architect)");
  const [techFeasibility, setTechFeasibility] = useState("High Feasibility");
  const [techStackFit, setTechStackFit] = useState("Compatible");
  const [techSecurityRisk, setTechSecurityRisk] = useState("Low Risk");
  const [techStatus, setTechStatus] = useState("Approved"); // 'Approved' | 'Rejected'
  const [techRemarks, setTechRemarks] = useState("");

  // Functional Review State
  const [functionalReviewer, setFunctionalReviewer] = useState("Priya Mehta (VP Operations)");
  const [functionalFit, setFunctionalFit] = useState("Seamless Fit");
  const [userAdoption, setUserAdoption] = useState("High Adoption");
  const [processComplexity, setProcessComplexity] = useState("Low Complexity");
  const [functionalStatus, setFunctionalStatus] = useState("Approved"); // 'Approved' | 'Rejected'
  const [functionalRemarks, setFunctionalRemarks] = useState("");

  // Business Review State
  const [businessReviewer, setBusinessReviewer] = useState("Amit Kapoor (Head of Strategy)");
  const [financialViability, setFinancialViability] = useState("High ROI");
  const [strategicPriority, setStrategicPriority] = useState("High Priority");
  const [timeToMarket, setTimeToMarket] = useState("3 - 6 Months");
  const [businessStatus, setBusinessStatus] = useState("Approved"); // 'Approved' | 'Rejected'
  const [businessRemarks, setBusinessRemarks] = useState("");

  useEffect(() => {
    const list = getSubmittedIdeas();
    setIdeas(list);
    const eligible = list.filter(
      (i) => i.status.includes("Passed Initial Screening") || i.status.includes("Sent") || i.status.includes("Feasibility") || i.status.includes("Not ")
    );
    if (eligible.length > 0) {
      setSelectedIdeaId(eligible[0].id);
    } else if (list.length > 0) {
      setSelectedIdeaId(list[0].id);
    }
  }, []);

  const passedInitialScreeningIdeas = ideas.filter(
    (i) =>
      i.status.includes("Passed Initial Screening") ||
      i.status.includes("Sent") ||
      i.status.includes("Feasibility") ||
      i.status.includes("Not ")
  );

  const displayedIdeas = (passedInitialScreeningIdeas.length > 0 ? passedInitialScreeningIdeas : ideas).filter((item) => {
    if (filterMode === "Feasible") return !item.status.includes("Not") && !item.status.includes("Rejected");
    if (filterMode === "Approved") return item.status.includes("Feasibility Approved") || item.status.includes("Business Analysis");
    if (filterMode === "Rejected") return item.status.includes("Not") || item.status.includes("Rejected");
    return true; // 'all'
  });

  const selectedIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId)) || displayedIdeas[0] || null;

  // Check if ALL 3 reviews are accepted
  const allThreeApproved = techStatus === "Approved" && functionalStatus === "Approved" && businessStatus === "Approved";

  // Determine specific rejection reason
  let rejectionReason = "";
  if (techStatus === "Rejected") rejectionReason = "Not Technically Feasible";
  else if (functionalStatus === "Rejected") rejectionReason = "Not Functionally Feasible";
  else if (businessStatus === "Rejected") rejectionReason = "Not Business Feasible";

  // Accept Action Handler
  const handleDirectAcceptFeasibility = () => {
    if (!selectedIdea) return;
    if (!allThreeApproved) {
      alert(`Cannot Approve Feasibility! Reason: ${rejectionReason}. All 3 reviews must be accepted.`);
      return;
    }
    const notes = `Tech Reviewer: ${techReviewer} (Accepted) | Functional Reviewer: ${functionalReviewer} (Accepted) | Business Reviewer: ${businessReviewer} (Accepted)`;
    const updated = updateIdeaStatus(selectedIdea.id, "Feasibility Approved", notes);
    setIdeas(updated);
    alert(`All 3 Reviews Approved! Proposal "${selectedIdea.title}" is FEASIBILITY APPROVED and forwarded to Business Analysis stage.`);
  };

  // Reject Action Handler
  const handleDirectRejectFeasibility = () => {
    if (!selectedIdea) return;
    const notes = `Tech Reviewer: ${techReviewer} (${techStatus}) | Functional Reviewer: ${functionalReviewer} (${functionalStatus}) | Business Reviewer: ${businessReviewer} (${businessStatus})`;
    const updated = updateIdeaStatus(selectedIdea.id, rejectionReason || "Not Technically Feasible", notes);
    setIdeas(updated);
    alert(`Proposal "${selectedIdea.title}" marked as REJECTED: ${rejectionReason || "Not Technically Feasible"}. Status published to All Dashboards.`);
  };

  const isPassed = selectedIdea && (selectedIdea.status.includes("Feasibility Approved") || selectedIdea.status.includes("Business Analysis") || selectedIdea.status.includes("Estimation") || selectedIdea.status.includes("Project") || selectedIdea.status.includes("Execution"));
  const isRejected = selectedIdea && (selectedIdea.status.includes("Not ") || selectedIdea.status.includes("Rejected"));

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
          <p>Evaluating proposals that passed Initial Screening. All 3 reviews (Tech, Functional, Business) must be Accepted for Feasibility Approval.</p>
        </div>
      </div>

      {/* 4 Clickable KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view All Eligible Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Passed Screening Queue</span>
            <div className="kpi-icon-pill pill-purple">
              <Layers size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{passedInitialScreeningIdeas.length}</span>
        </div>

        <div
          className={`kpi-mini-card ${filterMode === "Feasible" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Feasible")}
          style={{ cursor: "pointer", border: filterMode === "Feasible" ? "2px solid #3b82f6" : "1px solid #e2e8f0" }}
          title="Click to view Technically Feasible Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Technically Feasible</span>
            <div className="kpi-icon-pill pill-blue">
              <Cpu size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => !i.status.includes("Not Technically")).length}
          </span>
        </div>

        <div
          className={`kpi-mini-card ${filterMode === "Approved" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Approved")}
          style={{ cursor: "pointer", border: filterMode === "Approved" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Approved Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Feasibility Approved</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status.includes("Feasibility Approved") || i.status.includes("Business Analysis")).length}
          </span>
        </div>

        <div
          className={`kpi-mini-card ${filterMode === "Rejected" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Rejected")}
          style={{ cursor: "pointer", border: filterMode === "Rejected" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
          title="Click to view Non-Feasible Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Non-Feasible / Rejected</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status.includes("Not") || i.status.includes("Rejected")).length}
          </span>
        </div>
      </div>

      {/* Main Feasibility Review Workspace */}
      <div className="screening-workspace-grid">
        {/* LEFT COLUMN: Select Idea & Details */}
        <div className="screening-left-col">
          <Card title="1. Select Proposal (Passed Initial Screening Only)" subtitle="Choose a proposal that passed initial screening">
            {/* Quick Filter Pill Buttons */}
            <div style={{ marginBottom: "12px", display: "flex", gap: "6px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)" }}>Filter:</span>
              {[
                { id: "all", label: "All Passed Ideas" },
                { id: "Feasible", label: "Feasible" },
                { id: "Approved", label: "Approved" },
                { id: "Rejected", label: "Non-Feasible" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFilterMode(m.id)}
                  style={{
                    background: filterMode === m.id ? "var(--primary)" : "#f1f5f9",
                    color: filterMode === m.id ? "#ffffff" : "var(--text-dark)",
                    border: "none",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "6px 0" }}>
              {displayedIdeas.length === 0 ? (
                <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                  <Inbox size={28} color="var(--text-light)" />
                  <span className="empty-state-title">No proposals found in Feasibility Queue</span>
                  <span className="empty-state-sub">Only proposals that passed Initial Screening appear here.</span>
                </div>
              ) : (
                <select
                  className="custom-input-elem"
                  value={selectedIdea?.id || ""}
                  onChange={(e) => setSelectedIdeaId(e.target.value)}
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  {displayedIdeas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.category})
                    </option>
                  ))}
                </select>
              )}

              {selectedIdea && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "10px" }}>
                  <div className="idea-meta-pills-row" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>
                    <span className="meta-pill">
                      <Building2 size={13} /> Domain: {selectedIdea.category}
                    </span>
                    <span className="meta-pill">
                      <User size={13} /> Author: {selectedIdea.author}
                    </span>
                    <span className="meta-pill">
                      <Calendar size={13} /> {selectedIdea.date}
                    </span>
                    <span className={`table-badge ${isPassed ? "badge-approved" : isRejected ? "badge-rejected" : "badge-review"}`}>
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

                  {/* Reviewer Assignment Status Summary */}
                  <div className="screening-detail-block" style={{ marginBottom: 0, background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <h4 className="screening-section-label" style={{ marginBottom: "6px" }}>Assigned Reviewers & Decision</h4>
                    <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div><strong>Tech Reviewer:</strong> {techReviewer} — <span style={{ color: techStatus === "Approved" ? "#16a34a" : "#dc2626", fontWeight: "700" }}>{techStatus === "Approved" ? "Accepted" : "Not Technically Feasible"}</span></div>
                      <div><strong>Functional Reviewer:</strong> {functionalReviewer} — <span style={{ color: functionalStatus === "Approved" ? "#16a34a" : "#dc2626", fontWeight: "700" }}>{functionalStatus === "Approved" ? "Accepted" : "Not Functionally Feasible"}</span></div>
                      <div><strong>Business Reviewer:</strong> {businessReviewer} — <span style={{ color: businessStatus === "Approved" ? "#16a34a" : "#dc2626", fontWeight: "700" }}>{businessStatus === "Approved" ? "Accepted" : "Not Business Feasible"}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: 3-Dimensional Feasibility Evaluation Panel */}
        <div className="screening-right-col">
          <Card title="2. Multi-Reviewer Feasibility Panel (3 Reviews)" subtitle="Assign Reviewers & evaluate Technical, Functional & Business Feasibility">
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
                  color: activeTab === "technical" ? (techStatus === "Approved" ? "#16a34a" : "#dc2626") : "var(--text-muted)",
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
                <Cpu size={15} /> Tech ({techStatus === "Approved" ? "Accepted" : "Rejected"})
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
                  color: activeTab === "functional" ? (functionalStatus === "Approved" ? "#16a34a" : "#dc2626") : "var(--text-muted)",
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
                <Workflow size={15} /> Functional ({functionalStatus === "Approved" ? "Accepted" : "Rejected"})
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
                  color: activeTab === "business" ? (businessStatus === "Approved" ? "#16a34a" : "#dc2626") : "var(--text-muted)",
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
                <Briefcase size={15} /> Business ({businessStatus === "Approved" ? "Accepted" : "Rejected"})
              </button>
            </div>

            {/* TAB 1: TECHNICAL REVIEW */}
            {activeTab === "technical" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <Input
                  label="Assign Technical Reviewer Name"
                  placeholder="e.g. Dr. Rahul Sharma (Chief Architect)"
                  value={techReviewer}
                  onChange={(e) => setTechReviewer(e.target.value)}
                  required
                />

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

                {/* Single Button Mutual Exclusion for Technical Review */}
                <div className="checklist-card-item">
                  <label className="input-label">Technical Decision Status</label>

                  {techStatus === "Approved" ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px" }}>
                      <span style={{ color: "#16a34a", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={18} /> Technical Review Status: ACCEPTED
                      </span>
                      <button
                        type="button"
                        onClick={() => setTechStatus("Rejected")}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <X size={12} /> Reject (Mark Non-Feasible)
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px" }}>
                      <span style={{ color: "#dc2626", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <XCircle size={18} /> Technical Review Status: REJECTED (Not Technically Feasible)
                      </span>
                      <button
                        type="button"
                        onClick={() => setTechStatus("Approved")}
                        style={{ background: "#dcfce7", color: "#16a34a", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Check size={12} /> Accept Technical Feasibility
                      </button>
                    </div>
                  )}
                </div>

                <div className="input-field-group">
                  <label className="input-label">Technical Assessment Remarks</label>
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
                <Input
                  label="Assign Functional Reviewer Name"
                  placeholder="e.g. Priya Mehta (VP Operations)"
                  value={functionalReviewer}
                  onChange={(e) => setFunctionalReviewer(e.target.value)}
                  required
                />

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

                {/* Single Button Mutual Exclusion for Functional Review */}
                <div className="checklist-card-item">
                  <label className="input-label">Functional Decision Status</label>

                  {functionalStatus === "Approved" ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px" }}>
                      <span style={{ color: "#16a34a", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={18} /> Functional Review Status: ACCEPTED
                      </span>
                      <button
                        type="button"
                        onClick={() => setFunctionalStatus("Rejected")}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <X size={12} /> Reject (Mark Non-Feasible)
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px" }}>
                      <span style={{ color: "#dc2626", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <XCircle size={18} /> Functional Review Status: REJECTED (Not Functionally Feasible)
                      </span>
                      <button
                        type="button"
                        onClick={() => setFunctionalStatus("Approved")}
                        style={{ background: "#dcfce7", color: "#16a34a", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Check size={12} /> Accept Functional Feasibility
                      </button>
                    </div>
                  )}
                </div>

                <div className="input-field-group">
                  <label className="input-label">Functional Assessment Remarks</label>
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
                <Input
                  label="Assign Business Reviewer Name"
                  placeholder="e.g. Amit Kapoor (Head of Strategy)"
                  value={businessReviewer}
                  onChange={(e) => setBusinessReviewer(e.target.value)}
                  required
                />

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

                {/* Single Button Mutual Exclusion for Business Review */}
                <div className="checklist-card-item">
                  <label className="input-label">Business Decision Status</label>

                  {businessStatus === "Approved" ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px" }}>
                      <span style={{ color: "#16a34a", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={18} /> Business Review Status: ACCEPTED
                      </span>
                      <button
                        type="button"
                        onClick={() => setBusinessStatus("Rejected")}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <X size={12} /> Reject (Mark Non-Feasible)
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: "8px" }}>
                      <span style={{ color: "#dc2626", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <XCircle size={18} /> Business Review Status: REJECTED (Not Business Feasible)
                      </span>
                      <button
                        type="button"
                        onClick={() => setBusinessStatus("Approved")}
                        style={{ background: "#dcfce7", color: "#16a34a", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Check size={12} /> Accept Business Feasibility
                      </button>
                    </div>
                  )}
                </div>

                <div className="input-field-group">
                  <label className="input-label">Business Assessment Remarks</label>
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

            {/* Action Final Decision Box */}
            <div className="screening-decision-box" style={{ marginTop: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px", color: "var(--text-dark)" }}>
                Feasibility Review Final Action
              </h4>

              {/* Real-time Summary Status of 3 Reviews */}
              <div style={{ background: allThreeApproved ? "#f0fdf4" : "#fef2f2", border: allThreeApproved ? "1px solid #bbf7d0" : "1px solid #fecaca", padding: "12px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" }}>
                <div style={{ marginBottom: "6px", fontWeight: "700", color: allThreeApproved ? "#16a34a" : "#dc2626" }}>
                  {allThreeApproved ? "All 3 Reviews Accepted (Technical, Functional, Business)" : `NON-FEASIBLE — Reason: ${rejectionReason}`}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px" }}>
                  <div><strong>Tech Review:</strong> <span style={{ color: techStatus === "Approved" ? "#16a34a" : "#dc2626", fontWeight: "700" }}>{techStatus === "Approved" ? "Accepted" : "Not Technically Feasible"}</span></div>
                  <div><strong>Functional Review:</strong> <span style={{ color: functionalStatus === "Approved" ? "#16a34a" : "#dc2626", fontWeight: "700" }}>{functionalStatus === "Approved" ? "Accepted" : "Not Functionally Feasible"}</span></div>
                  <div><strong>Business Review:</strong> <span style={{ color: businessStatus === "Approved" ? "#16a34a" : "#dc2626", fontWeight: "700" }}>{businessStatus === "Approved" ? "Accepted" : "Not Business Feasible"}</span></div>
                </div>
              </div>

              {/* Conditional Action Render: Hide Accept button once Feasibility is Approved */}
              {isPassed ? (
                <div style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "8px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px" }}>
                  <CheckCircle2 size={20} />
                  <span>Feasibility Approved & Accepted (Forwarded to Stage 3)</span>
                </div>
              ) : isRejected ? (
                <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "14px", borderRadius: "8px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px" }}>
                  <XCircle size={20} />
                  <span>Status: {selectedIdea.status}</span>
                </div>
              ) : allThreeApproved ? (
                <div>
                  <p style={{ fontSize: "12px", color: "#16a34a", marginBottom: "10px", fontWeight: "600" }}>
                    All 3 Reviews are Accepted. Click below to approve feasibility for this proposal:
                  </p>
                  <Button
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={handleDirectAcceptFeasibility}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Accept & Approve Feasibility
                  </Button>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: "12px", color: "#dc2626", marginBottom: "10px", fontWeight: "600" }}>
                    Cannot Approve Feasibility because one or more reviews failed. Click below to publish the non-feasible status:
                  </p>
                  <Button
                    variant="danger"
                    icon={XCircle}
                    onClick={handleDirectRejectFeasibility}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Reject Feasibility ({rejectionReason})
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FeasibilityReview;
