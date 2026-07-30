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
  Building2,
  User,
  Calendar,
  Layers,
  Sparkles,
  Inbox,
  Check,
  X,
  HelpCircle,
  Shield
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

// Helper Component for Yes/No Radio Buttons (Reviewers Only)
const RadioYesNo = ({ label, value, onChange }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      background: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    }}
  >
    <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{label}</span>
    <div style={{ display: "flex", gap: "14px" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "700",
          color: value === "Yes" ? "#16a34a" : "#64748b"
        }}
      >
        <input
          type="radio"
          name={label.replace(/\s+/g, "_")}
          value="Yes"
          checked={value === "Yes"}
          onChange={() => onChange("Yes")}
        />
        Yes
      </label>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "700",
          color: value === "No" ? "#dc2626" : "#64748b"
        }}
      >
        <input
          type="radio"
          name={label.replace(/\s+/g, "_")}
          value="No"
          checked={value === "No"}
          onChange={() => onChange("No")}
        />
        No
      </label>
    </div>
  </div>
);

// Helper Component for Low / Medium / High Selector (Reviewers Only)
const RadioLevel = ({ label, value, onChange, options = ["Low", "Medium", "High"] }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      background: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0"
    }}
  >
    <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{label}</span>
    <div style={{ display: "flex", gap: "10px" }}>
      {options.map((opt) => (
        <label
          key={opt}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "700",
            color: value === opt ? "#4f46e5" : "#64748b"
          }}
        >
          <input
            type="radio"
            name={label.replace(/\s+/g, "_")}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

function FeasibilityReview() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [activeTab, setActiveTab] = useState("business"); // 'business' | 'functional' | 'technical'
  const [userRole, setUserRole] = useState("User");

  // SECTION A: BUSINESS REVIEW STATE (Reviewer: Business Head)
  const [bizReviewer, setBizReviewer] = useState("Amit Kapoor (Head of Business Strategy)");
  const [bizNeed, setBizNeed] = useState("Yes");
  const [bizRoi, setBizRoi] = useState("Yes");
  const [bizMarketOpp, setBizMarketOpp] = useState("Yes");
  const [bizCompAdvantage, setBizCompAdvantage] = useState("Yes");
  const [bizStrategicAlignment, setBizStrategicAlignment] = useState("Yes");
  const [bizCustomerDemand, setBizCustomerDemand] = useState("Yes");
  const [bizRevenuePotential, setBizRevenuePotential] = useState("Yes");
  const [bizPriorityScore, setBizPriorityScore] = useState("High");
  const [bizComments, setBizComments] = useState("");
  const [bizRecommendation, setBizRecommendation] = useState("Approve"); // 'Approve' | 'Reject' | 'Clarify'

  // SECTION B: FUNCTIONAL REVIEW STATE (Reviewer: Business Analyst)
  const [funcReviewer, setFuncReviewer] = useState("Priya Mehta (Lead Business Analyst)");
  const [funcReqClear, setFuncReqClear] = useState("Yes");
  const [funcProcessDefined, setFuncProcessDefined] = useState("Yes");
  const [funcUsersIdentified, setFuncUsersIdentified] = useState("Yes");
  const [funcWorkflowComplete, setFuncWorkflowComplete] = useState("Yes");
  const [funcComplianceConsidered, setFuncComplianceConsidered] = useState("Yes");
  const [funcDependencies, setFuncDependencies] = useState("No");
  const [funcIntegrationRequired, setFuncIntegrationRequired] = useState("Yes");
  const [funcGapAnalysis, setFuncGapAnalysis] = useState("Yes");
  const [funcComplexity, setFuncComplexity] = useState("Medium");
  const [funcComments, setFuncComments] = useState("");
  const [funcRecommendation, setFuncRecommendation] = useState("Approve"); // 'Approve' | 'Reject' | 'Clarify'

  // SECTION C: TECHNICAL REVIEW STATE (Reviewer: Technical Architect)
  const [techReviewer, setTechReviewer] = useState("Dr. Rahul Sharma (Chief Technical Architect)");
  const [techFit, setTechFit] = useState("Yes");
  const [techPlatformReuse, setTechPlatformReuse] = useState("Yes");
  const [techSecurity, setTechSecurity] = useState("Yes");
  const [techPerformance, setTechPerformance] = useState("Yes");
  const [techScalability, setTechScalability] = useState("Yes");
  const [techCloudReadiness, setTechCloudReadiness] = useState("Yes");
  const [techIntegrationComplexity, setTechIntegrationComplexity] = useState("Low");
  const [techApiAvailability, setTechApiAvailability] = useState("Yes");
  const [techInfraImpact, setTechInfraImpact] = useState("Yes");
  const [techRisks, setTechRisks] = useState("Low");
  const [techEstComplexity, setTechEstComplexity] = useState("Medium");
  const [techComments, setTechComments] = useState("");
  const [techRecommendation, setTechRecommendation] = useState("Approve"); // 'Approve' | 'Reject' | 'Clarify'

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.role) setUserRole(savedUser.role);
      } catch (err) {}
    }

    const list = getSubmittedIdeas();
    setIdeas(list);
    if (list.length > 0) {
      setSelectedIdeaId(list[0].id);
    }
  }, []);

  const isReviewer = userRole === "Reviewer";
  const selectedIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId)) || ideas[0] || null;

  // OVERALL RULE: IF ANY REJECTED => OVERALL REJECTED. ACCEPTED ONLY WHEN ALL 3 ARE APPROVED!
  const isBizApproved = bizRecommendation === "Approve";
  const isFuncApproved = funcRecommendation === "Approve";
  const isTechApproved = techRecommendation === "Approve";

  const isAnyRejected = bizRecommendation === "Reject" || funcRecommendation === "Reject" || techRecommendation === "Reject";
  const allThreeApproved = isBizApproved && isFuncApproved && isTechApproved;

  const handleFinalSubmitReview = (finalDecision) => {
    if (!selectedIdea) return;
    if (!isReviewer) {
      alert("Only assigned Reviewers can submit Feasibility Review!");
      return;
    }

    if (finalDecision === "Approve") {
      if (!allThreeApproved) {
        alert("Cannot approve proposal! All 3 Parallel Reviews (Business, Functional, Technical) MUST be Approved.");
        return;
      }

      const newStatus = "Feasibility Approved";
      const notes = `Business Review (${bizReviewer}): Approved. Functional Review (${funcReviewer}): Approved. Technical Review (${techReviewer}): Approved. Overall Status: Feasibility Approved & Sent to BA Pipeline.`;

      updateIdeaStatus(selectedIdea.id, newStatus, notes);
      setIdeas(getSubmittedIdeas());
      alert(`Proposal "${selectedIdea.title}" Feasibility APPROVED & forwarded to Stage 4 Business Analysis!`);
    } else {
      let rejectionCause = [];
      if (bizRecommendation === "Reject") rejectionCause.push("Not Business Feasible");
      if (funcRecommendation === "Reject") rejectionCause.push("Not Functionally Feasible");
      if (techRecommendation === "Reject") rejectionCause.push("Not Technically Feasible");

      const newStatus = `Not Feasible (${rejectionCause.join(", ") || "Rejected"})`;
      const notes = `Feasibility Rejected. Causes: ${rejectionCause.join("; ")}. Business Comments: ${bizComments || "N/A"}. Functional Comments: ${funcComments || "N/A"}. Tech Comments: ${techComments || "N/A"}.`;

      updateIdeaStatus(selectedIdea.id, newStatus, notes);
      setIdeas(getSubmittedIdeas());
      alert(`Proposal "${selectedIdea.title}" marked as NON-FEASIBLE.`);
    }
  };

  const isPassed = selectedIdea?.status.includes("Feasibility Approved") || selectedIdea?.status.includes("Approved by BA") || selectedIdea?.status.includes("Accepted by PM");
  const isRejected = selectedIdea?.status.includes("Not ") || selectedIdea?.status.includes("Rejected");

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Feasibility Review Workspace (Three Parallel Reviews)</h1>
            <span className="category-chip-indigo">
              <FileCheck size={14} /> Stage 3 Feasibility Gate
            </span>
          </div>
          <p>
            {isReviewer
              ? "Reviewer Evaluator Mode: Perform Business, Functional, and Technical feasibility assessments."
              : `Status Monitoring Mode (${userRole}): View live feasibility review status.`}
          </p>
        </div>
      </div>

      <div className="screening-layout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: "20px" }}>
        {/* Left Column: Proposals Queue */}
        <Card title={`Assigned Proposals (${ideas.length})`} subtitle="Select proposal to view feasibility status">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {ideas.length === 0 ? (
              <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                <Inbox size={32} color="var(--text-light)" />
                <span className="empty-state-title">No proposals in review queue</span>
              </div>
            ) : (
              ideas.map((item) => {
                const isSelected = selectedIdea && String(selectedIdea.id) === String(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIdeaId(item.id)}
                    className={`screening-queue-item ${isSelected ? "active" : ""}`}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid #6366f1" : "1px solid #e2e8f0",
                      background: isSelected ? "#e0e7ff" : "#ffffff",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "#4f46e5", color: "#ffffff", padding: "1px 6px", borderRadius: "4px" }}>
                        IDEA-{item.id}
                      </span>
                      <span className="category-chip">{item.category}</span>
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", marginBottom: "4px" }}>{item.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                      <span style={{ color: "#64748b" }}>By {item.author}</span>
                      <span className="table-badge badge-approved">{item.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Column: 3 Parallel Reviews Workspace */}
        <div>
          <Card
            title={selectedIdea ? `Three Parallel Reviews: ${selectedIdea.title}` : "Select a Proposal"}
            subtitle={isReviewer ? "Evaluate business, functional, and technical dimensions" : "Review feasibility status and recommendations"}
          >
            {/* 3 Review Section Navigation Pills */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              {[
                { id: "business", label: "A. Business Review", icon: Briefcase, status: isBizApproved ? "Feasible" : "Not Business Feasible" },
                { id: "functional", label: "B. Functional Review", icon: Workflow, status: isFuncApproved ? "Feasible" : "Not Functionally Feasible" },
                { id: "technical", label: "C. Technical Review", icon: Cpu, status: isTechApproved ? "Feasible" : "Not Technically Feasible" }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                const isApproved = tab.status === "Feasible";

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      background: isSelected ? "#4f46e5" : "#f1f5f9",
                      color: isSelected ? "#ffffff" : "#475569",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: isSelected ? "0 4px 12px rgba(79, 70, 229, 0.25)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </div>

                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        background: isApproved ? (isSelected ? "#22c55e" : "#dcfce7") : (isSelected ? "#ef4444" : "#fee2e2"),
                        color: isApproved ? (isSelected ? "#ffffff" : "#15803d") : (isSelected ? "#ffffff" : "#b91c1c")
                      }}
                    >
                      {tab.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SECTION A: BUSINESS REVIEW */}
            {activeTab === "business" && (
              isReviewer ? (
                /* INTERACTIVE REVIEWER FORM WITH RADIO BOXES */
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#e0e7ff", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#3730a3" }}>
                    Reviewer Role: Business Head ({bizReviewer})
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <RadioYesNo label="Business Need" value={bizNeed} onChange={setBizNeed} />
                    <RadioYesNo label="ROI Potential" value={bizRoi} onChange={setBizRoi} />
                    <RadioYesNo label="Market Opportunity" value={bizMarketOpp} onChange={setBizMarketOpp} />
                    <RadioYesNo label="Competitive Advantage" value={bizCompAdvantage} onChange={setBizCompAdvantage} />
                    <RadioYesNo label="Strategic Alignment" value={bizStrategicAlignment} onChange={setBizStrategicAlignment} />
                    <RadioYesNo label="Customer Demand" value={bizCustomerDemand} onChange={setBizCustomerDemand} />
                    <RadioYesNo label="Revenue Potential" value={bizRevenuePotential} onChange={setBizRevenuePotential} />
                    <RadioLevel label="Priority Score" value={bizPriorityScore} onChange={setBizPriorityScore} options={["Low", "Medium", "High"]} />
                  </div>

                  <div className="input-field-group" style={{ marginTop: "6px" }}>
                    <label className="input-label">Business Review Comments</label>
                    <textarea
                      className="custom-input-elem"
                      rows={2}
                      placeholder="Enter strategic business observations..."
                      value={bizComments}
                      onChange={(e) => setBizComments(e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "12px 16px", borderRadius: "10px", marginTop: "4px" }}>
                    <label className="input-label" style={{ fontWeight: "800", color: "#1e293b", marginBottom: "8px", display: "block" }}>
                      Business Recommendation *
                    </label>
                    <div style={{ display: "flex", gap: "20px" }}>
                      {["Approve", "Reject", "Clarify"].map((opt) => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: opt === "Approve" ? "#16a34a" : opt === "Reject" ? "#dc2626" : "#d97706" }}>
                          <input
                            type="radio"
                            name="bizRecommendation"
                            value={opt}
                            checked={bizRecommendation === opt}
                            onChange={() => setBizRecommendation(opt)}
                          />
                          {opt === "Approve" ? "Approve Business Feasibility" : opt === "Reject" ? "Reject Business Feasibility" : "Request Clarification"}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* CLEAN NON-REVIEWER STATUS CARD VIEW (NO RADIO BOXES) */
                <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "18px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                      Business Feasibility Status
                    </h3>
                    <span style={{ fontSize: "13px", padding: "4px 14px", borderRadius: "14px", fontWeight: "800", background: isBizApproved ? "#dcfce7" : "#fee2e2", color: isBizApproved ? "#15803d" : "#b91c1c" }}>
                      {isBizApproved ? "● Business Feasible (Approved)" : "● Not Business Feasible"}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>
                    Assigned Business Evaluator: <strong>{bizReviewer}</strong>
                  </div>
                  <div style={{ fontSize: "13px", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#334155" }}>
                    <strong>Evaluation Notes:</strong> {bizComments || "Business value, ROI potential, and strategic alignment verified by Business Evaluator."}
                  </div>
                </div>
              )
            )}

            {/* SECTION B: FUNCTIONAL REVIEW */}
            {activeTab === "functional" && (
              isReviewer ? (
                /* INTERACTIVE REVIEWER FORM WITH RADIO BOXES */
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#cff4fc", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#055160" }}>
                    Reviewer Role: Business Analyst ({funcReviewer})
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <RadioYesNo label="Requirements Clear?" value={funcReqClear} onChange={setFuncReqClear} />
                    <RadioYesNo label="Process Defined?" value={funcProcessDefined} onChange={setFuncProcessDefined} />
                    <RadioYesNo label="Users Identified?" value={funcUsersIdentified} onChange={setFuncUsersIdentified} />
                    <RadioYesNo label="Workflow Complete?" value={funcWorkflowComplete} onChange={setFuncWorkflowComplete} />
                    <RadioYesNo label="Compliance Considered?" value={funcComplianceConsidered} onChange={setFuncComplianceConsidered} />
                    <RadioYesNo label="Dependencies Present?" value={funcDependencies} onChange={setFuncDependencies} />
                    <RadioYesNo label="Integration Required?" value={funcIntegrationRequired} onChange={setFuncIntegrationRequired} />
                    <RadioYesNo label="Gap Analysis Performed?" value={funcGapAnalysis} onChange={setFuncGapAnalysis} />
                    <RadioLevel label="Functional Complexity" value={funcComplexity} onChange={setFuncComplexity} options={["Low", "Medium", "High"]} />
                  </div>

                  <div className="input-field-group" style={{ marginTop: "6px" }}>
                    <label className="input-label">Functional Review Comments</label>
                    <textarea
                      className="custom-input-elem"
                      rows={2}
                      placeholder="Enter operational workflow notes..."
                      value={funcComments}
                      onChange={(e) => setFuncComments(e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "12px 16px", borderRadius: "10px", marginTop: "4px" }}>
                    <label className="input-label" style={{ fontWeight: "800", color: "#1e293b", marginBottom: "8px", display: "block" }}>
                      Functional Recommendation *
                    </label>
                    <div style={{ display: "flex", gap: "20px" }}>
                      {["Approve", "Reject", "Clarify"].map((opt) => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: opt === "Approve" ? "#16a34a" : opt === "Reject" ? "#dc2626" : "#d97706" }}>
                          <input
                            type="radio"
                            name="funcRecommendation"
                            value={opt}
                            checked={funcRecommendation === opt}
                            onChange={() => setFuncRecommendation(opt)}
                          />
                          {opt === "Approve" ? "Approve Functional Feasibility" : opt === "Reject" ? "Reject Functional Feasibility" : "Request Clarification"}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* CLEAN NON-REVIEWER STATUS CARD VIEW (NO RADIO BOXES) */
                <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "18px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                      Functional Feasibility Status
                    </h3>
                    <span style={{ fontSize: "13px", padding: "4px 14px", borderRadius: "14px", fontWeight: "800", background: isFuncApproved ? "#dcfce7" : "#fee2e2", color: isFuncApproved ? "#15803d" : "#b91c1c" }}>
                      {isFuncApproved ? "● Functional Feasible (Approved)" : "● Not Functionally Feasible"}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>
                    Assigned Functional Evaluator: <strong>{funcReviewer}</strong>
                  </div>
                  <div style={{ fontSize: "13px", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#334155" }}>
                    <strong>Evaluation Notes:</strong> {funcComments || "Operational workflow fit, end-user adoption, and compliance verified by Business Analyst."}
                  </div>
                </div>
              )
            )}

            {/* SECTION C: TECHNICAL REVIEW */}
            {activeTab === "technical" && (
              isReviewer ? (
                /* INTERACTIVE REVIEWER FORM WITH RADIO BOXES */
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: "#dcfce7", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", color: "#15803d" }}>
                    Reviewer Role: Technical Architect ({techReviewer})
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <RadioYesNo label="Technology Fit" value={techFit} onChange={setTechFit} />
                    <RadioYesNo label="Existing Platform Reuse" value={techPlatformReuse} onChange={setTechPlatformReuse} />
                    <RadioYesNo label="Security & Compliance" value={techSecurity} onChange={setTechSecurity} />
                    <RadioYesNo label="Performance Expectations" value={techPerformance} onChange={setTechPerformance} />
                    <RadioYesNo label="Scalability Potential" value={techScalability} onChange={setTechScalability} />
                    <RadioYesNo label="Cloud Readiness" value={techCloudReadiness} onChange={setTechCloudReadiness} />
                    <RadioYesNo label="API Availability" value={techApiAvailability} onChange={setTechApiAvailability} />
                    <RadioYesNo label="Infrastructure Impact" value={techInfraImpact} onChange={setTechInfraImpact} />
                    <RadioLevel label="Integration Complexity" value={techIntegrationComplexity} onChange={setTechIntegrationComplexity} options={["Low", "Medium", "High"]} />
                    <RadioLevel label="Technical Risks" value={techRisks} onChange={setTechRisks} options={["Low", "Medium", "High"]} />
                    <RadioLevel label="Estimated Complexity" value={techEstComplexity} onChange={setTechEstComplexity} options={["Low", "Medium", "High"]} />
                  </div>

                  <div className="input-field-group" style={{ marginTop: "6px" }}>
                    <label className="input-label">Technical Review Comments</label>
                    <textarea
                      className="custom-input-elem"
                      rows={2}
                      placeholder="Enter architecture observations, API specifications..."
                      value={techComments}
                      onChange={(e) => setTechComments(e.target.value)}
                    ></textarea>
                  </div>

                  <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "12px 16px", borderRadius: "10px", marginTop: "4px" }}>
                    <label className="input-label" style={{ fontWeight: "800", color: "#1e293b", marginBottom: "8px", display: "block" }}>
                      Technical Recommendation *
                    </label>
                    <div style={{ display: "flex", gap: "20px" }}>
                      {["Approve", "Reject", "Clarify"].map((opt) => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: opt === "Approve" ? "#16a34a" : opt === "Reject" ? "#dc2626" : "#d97706" }}>
                          <input
                            type="radio"
                            name="techRecommendation"
                            value={opt}
                            checked={techRecommendation === opt}
                            onChange={() => setTechRecommendation(opt)}
                          />
                          {opt === "Approve" ? "Approve Technical Feasibility" : opt === "Reject" ? "Reject Technical Feasibility" : "Request Clarification"}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* CLEAN NON-REVIEWER STATUS CARD VIEW (NO RADIO BOXES) */
                <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "18px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                      Technical Feasibility Status
                    </h3>
                    <span style={{ fontSize: "13px", padding: "4px 14px", borderRadius: "14px", fontWeight: "800", background: isTechApproved ? "#dcfce7" : "#fee2e2", color: isTechApproved ? "#15803d" : "#b91c1c" }}>
                      {isTechApproved ? "● Technical Feasible (Approved)" : "● Not Technically Feasible"}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>
                    Assigned Technical Evaluator: <strong>{techReviewer}</strong>
                  </div>
                  <div style={{ fontSize: "13px", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", color: "#334155" }}>
                    <strong>Evaluation Notes:</strong> {techComments || "Architecture stack compatibility, API security, and scalability verified by Technical Architect."}
                  </div>
                </div>
              )
            )}

            {/* OVERALL FEASIBILITY ACTION & EVALUATION STATUS */}
            <div className="screening-decision-box" style={{ marginTop: "24px", paddingTop: "16px", borderTop: "2px solid #e2e8f0" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "800", marginBottom: "10px", color: "var(--text-dark)" }}>
                Three Parallel Reviews Summary & Status Breakdown
              </h4>

              {/* 3 Review Cards Status Summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
                <div style={{ padding: "10px", borderRadius: "8px", background: isBizApproved ? "#f0fdf4" : "#fef2f2", border: isBizApproved ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>A. BUSINESS REVIEW</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: isBizApproved ? "#16a34a" : "#dc2626", marginTop: "2px" }}>
                    {isBizApproved ? "Feasible" : "Not Business Feasible"}
                  </div>
                </div>

                <div style={{ padding: "10px", borderRadius: "8px", background: isFuncApproved ? "#f0fdf4" : "#fef2f2", border: isFuncApproved ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>B. FUNCTIONAL REVIEW</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: isFuncApproved ? "#16a34a" : "#dc2626", marginTop: "2px" }}>
                    {isFuncApproved ? "Feasible" : "Not Functionally Feasible"}
                  </div>
                </div>

                <div style={{ padding: "10px", borderRadius: "8px", background: isTechApproved ? "#f0fdf4" : "#fef2f2", border: isTechApproved ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>C. TECHNICAL REVIEW</div>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: isTechApproved ? "#16a34a" : "#dc2626", marginTop: "2px" }}>
                    {isTechApproved ? "Feasible" : "Not Technically Feasible"}
                  </div>
                </div>
              </div>

              {/* OVERALL STATUS NOTIFICATION */}
              {isAnyRejected ? (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", padding: "14px", borderRadius: "10px", marginBottom: "14px" }}>
                  <div style={{ fontWeight: "800", color: "#dc2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <XCircle size={18} /> OVERALL FEASIBILITY REJECTED
                  </div>
                  <p style={{ fontSize: "12px", color: "#b91c1c", margin: "4px 0 0 0" }}>
                    Rejection Status: {!isBizApproved ? "Not Business Feasible" : !isFuncApproved ? "Not Functionally Feasible" : "Not Technically Feasible"}
                  </p>
                </div>
              ) : allThreeApproved ? (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "14px", borderRadius: "10px", marginBottom: "14px" }}>
                  <div style={{ fontWeight: "800", color: "#16a34a", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={18} /> ALL 3 REVIEWS APPROVED (FEASIBLE)
                  </div>
                  <p style={{ fontSize: "12px", color: "#15803d", margin: "4px 0 0 0" }}>
                    Business, Functional, and Technical feasibility dimensions are 100% Approved.
                  </p>
                </div>
              ) : null}

              {/* ACTION BUTTONS FOR ASSIGNED REVIEWERS VS CLEAN STATUS VIEW FOR OTHERS */}
              {isReviewer ? (
                isPassed ? (
                  <div style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "8px", fontWeight: "700", textAlign: "center" }}>
                    ✓ Feasibility Approved & Accepted (Forwarded to Stage 4 Business Analysis)
                  </div>
                ) : isRejected ? (
                  <div style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "14px", borderRadius: "8px", fontWeight: "700", textAlign: "center" }}>
                    ✕ Status: {selectedIdea?.status}
                  </div>
                ) : allThreeApproved ? (
                  <Button
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={() => handleFinalSubmitReview("Approve")}
                    style={{ width: "100%", justifyContent: "center", height: "46px", fontSize: "15px", fontWeight: "700" }}
                  >
                    Accept & Approve Overall Feasibility
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    icon={XCircle}
                    onClick={() => handleFinalSubmitReview("Reject")}
                    style={{ width: "100%", justifyContent: "center", height: "46px", fontSize: "15px", fontWeight: "700" }}
                  >
                    Reject Overall Feasibility
                  </Button>
                )
              ) : (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px 18px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase" }}>FEASIBILITY MONITORING STATUS</div>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#1e3a8a", marginTop: "2px" }}>
                      {selectedIdea?.status || (isAnyRejected ? (!isBizApproved ? "Not Business Feasible" : !isFuncApproved ? "Not Functionally Feasible" : "Not Technically Feasible") : "Feasibility Approved")}
                    </div>
                  </div>
                  <span className="table-badge badge-approved" style={{ fontSize: "12px", padding: "4px 12px", background: "#dcfce7", color: "#15803d" }}>
                    ● Live Status ({userRole})
                  </span>
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
