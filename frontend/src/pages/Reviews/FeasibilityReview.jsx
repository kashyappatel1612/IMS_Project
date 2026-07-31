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
  Inbox,
  Check,
  X,
  ChevronDown
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function FeasibilityReview() {
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(""); // Default empty string
  const [activeTab, setActiveTab] = useState("business"); // 'business' | 'functional' | 'technical'
  const [userRole, setUserRole] = useState("User");

  // =========================================================================
  // SECTION A: BUSINESS REVIEW STATE (Fields from Excel Sheet Column 1)
  // All Text Inputs
  // =========================================================================
  const [bizReviewer, setBizReviewer] = useState("Amit Kapoor (Head of Business Strategy)");
  const [bizExpectedBenefits, setBizExpectedBenefits] = useState("");
  const [bizCostSavings, setBizCostSavings] = useState("");
  const [bizEffortsSavings, setBizEffortsSavings] = useState("");
  const [bizProductivityImprovement, setBizProductivityImprovement] = useState("");
  const [bizQualityImprovement, setBizQualityImprovement] = useState("");
  const [bizCustomerUserExp, setBizCustomerUserExp] = useState("");
  const [bizComplianceRiskReduction, setBizComplianceRiskReduction] = useState("");
  const [bizCompanyStrategyAlign, setBizCompanyStrategyAlign] = useState("");
  const [bizRegulatoryReq, setBizRegulatoryReq] = useState("");
  const [bizExpectedRoi, setBizExpectedRoi] = useState("");
  const [bizRisksIfImplemented, setBizRisksIfImplemented] = useState("");
  const [bizRisksIfNotImplemented, setBizRisksIfNotImplemented] = useState("");
  const [bizComments, setBizComments] = useState("");
  const [bizRecommendation, setBizRecommendation] = useState("Approve"); // Restored to default 'Approve'

  // =========================================================================
  // SECTION B: FUNCTIONAL REVIEW STATE (Fields from Excel Sheet Column 2)
  // All Text Inputs
  // =========================================================================
  const [funcReviewer, setFuncReviewer] = useState("Priya Mehta (Lead Business Analyst)");
  const [funcNewOrOld, setFuncNewOrOld] = useState("");
  const [funcUsersAffected, setFuncUsersAffected] = useState("");
  const [funcChangeManagementReq, setFuncChangeManagementReq] = useState("");
  const [funcProcessImpact, setFuncProcessImpact] = useState("");
  const [funcOperationalRisk, setFuncOperationalRisk] = useState("");
  const [funcComments, setFuncComments] = useState("");
  const [funcRecommendation, setFuncRecommendation] = useState("Approve"); // Restored to default 'Approve'

  // =========================================================================
  // SECTION C: TECHNICAL REVIEW STATE (Fields from Excel Sheet Column 3)
  // Solution type (DD), Tech Stack (DD), Tech complexity (DD) -> Dropdowns
  // All other fields -> Text Inputs
  // =========================================================================
  const [techReviewer, setTechReviewer] = useState("Dr. Rahul Sharma (Chief Technical Architect)");
  const [techSolutionType, setTechSolutionType] = useState("Web Application"); // Dropdown
  const [techStack, setTechStack] = useState("React / Node.js / PostgreSQL"); // Dropdown
  const [techComplexity, setTechComplexity] = useState("Medium"); // Dropdown
  const [techDataAssessment, setTechDataAssessment] = useState("");
  const [techInfra, setTechInfra] = useState("");
  const [techIntegrationReq, setTechIntegrationReq] = useState("");
  const [techRisks, setTechRisks] = useState("");
  const [techDevQaEfforts, setTechDevQaEfforts] = useState("");
  const [techSecurityConcerns, setTechSecurityConcerns] = useState("");
  const [techComments, setTechComments] = useState("");
  const [techRecommendation, setTechRecommendation] = useState("Approve"); // Restored to default 'Approve'

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
  }, []);

  const isReviewer = userRole === "Reviewer";
  const selectedIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId)) || null;

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
      const notes = `Business Review (${bizReviewer}): Approved. Functional Review (${funcReviewer}): Approved. Technical Review (${techReviewer}): Approved. Solution: ${techSolutionType}, Stack: ${techStack}, Complexity: ${techComplexity}.`;

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

  const isPassed = selectedIdea?.status?.includes("Feasibility Approved") || selectedIdea?.status?.includes("Approved by BA") || selectedIdea?.status?.includes("Accepted by PM");
  const isRejected = selectedIdea?.status?.includes("Not ") || selectedIdea?.status?.includes("Rejected");

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex" style={{ marginBottom: "20px" }}>
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Feasibility Review Workspace (Three Parallel Reviews)</h1>
            <span className="category-chip-indigo">
              <FileCheck size={14} /> Stage 3 Feasibility Gate
            </span>
          </div>
          <p>
            {isReviewer
              ? "Reviewer Evaluator Mode: Select proposal from top dropdown and perform feasibility assessments."
              : `Status Monitoring Mode (${userRole}): View live feasibility review status.`}
          </p>
        </div>
      </div>

      {/* TOP PROPOSAL SELECTOR DROPDOWN BAR */}
      <div
        style={{
          background: "#ffffff",
          border: "1.5px solid #c7d2fe",
          padding: "16px 20px",
          borderRadius: "14px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          gap: "20px",
          boxShadow: "0 4px 14px rgba(79, 70, 229, 0.08)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
          <label style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", whiteSpace: "nowrap" }}>
            Select Assigned Proposal for Review:
          </label>
          <select
            className="custom-input-elem"
            value={selectedIdeaId || ""}
            onChange={(e) => setSelectedIdeaId(e.target.value)}
            style={{
              flex: 1,
              fontWeight: "700",
              fontSize: "14px",
              color: selectedIdeaId ? "#4f46e5" : "#64748b",
              background: "#eeeffe",
              border: "1.5px solid #4f46e5",
              padding: "10px 14px",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            <option value="">Select Your Idea</option>
            {ideas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} ({item.category}) — By {item.author} [{item.status}]
              </option>
            ))}
          </select>
        </div>

        {selectedIdea && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="table-badge badge-approved" style={{ fontSize: "12px", padding: "6px 14px" }}>
              {selectedIdea.status}
            </span>
          </div>
        )}
      </div>

      {/* WORKSPACE CONTENT AREA */}
      {!selectedIdea ? (
        <Card title="Feasibility Review Workspace" subtitle="Please select your idea to evaluate">
          <div style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff", borderRadius: "12px" }}>
            <Inbox size={48} color="#4f46e5" style={{ marginBottom: "14px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b", marginBottom: "8px" }}>Select Your Idea</h3>
            <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "480px", margin: "0 auto" }}>
              Please select an idea from the dropdown above to view or perform the feasibility review.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ marginBottom: "28px" }}>
          <Card
            title={`Three Parallel Reviews: ${selectedIdea.title}`}
            subtitle={isReviewer ? "Evaluate business, functional, and technical dimensions" : "Review feasibility status and recommendations"}
          >
            {/* 3 Review Section Navigation Pills */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
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
                      background: isSelected ? "#4f46e5" : "#f8fafc",
                      color: isSelected ? "#ffffff" : "#475569",
                      border: isSelected ? "1.5px solid #4f46e5" : "1.5px solid #e2e8f0",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justify: "space-between",
                      boxShadow: isSelected ? "0 4px 14px rgba(79, 70, 229, 0.25)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "3px 10px",
                        borderRadius: "12px",
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
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "#eeeffe", border: "1px solid #c7d2fe", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", color: "#3730a3" }}>
                  Assigned Business Evaluator: {bizReviewer}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="input-field-group">
                    <label className="input-label">Expected benefits</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter expected business benefits..."
                      value={bizExpectedBenefits}
                      onChange={(e) => setBizExpectedBenefits(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Cost savings (estimated)</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. $50,000 / year or 20% cost reduction"
                      value={bizCostSavings}
                      onChange={(e) => setBizCostSavings(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Efforts savings</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. 15 hours / week per employee"
                      value={bizEffortsSavings}
                      onChange={(e) => setBizEffortsSavings(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Productivity improvement</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter productivity impact details..."
                      value={bizProductivityImprovement}
                      onChange={(e) => setBizProductivityImprovement(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Quality improvement</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter quality enhancements..."
                      value={bizQualityImprovement}
                      onChange={(e) => setBizQualityImprovement(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Customer/user experience</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter CX/UX impact..."
                      value={bizCustomerUserExp}
                      onChange={(e) => setBizCustomerUserExp(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Compliance or risk reduction</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter compliance or risk details..."
                      value={bizComplianceRiskReduction}
                      onChange={(e) => setBizComplianceRiskReduction(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Aligns with company strategy?</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. Yes, aligns with Q3 Automation Goals"
                      value={bizCompanyStrategyAlign}
                      onChange={(e) => setBizCompanyStrategyAlign(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Regulatory requirement?</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. GDPR, ISO27001, or N/A"
                      value={bizRegulatoryReq}
                      onChange={(e) => setBizRegulatoryReq(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Expected ROI</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. 250% ROI over 12 months"
                      value={bizExpectedRoi}
                      onChange={(e) => setBizExpectedRoi(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Risks if implemented</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter implementation risks..."
                      value={bizRisksIfImplemented}
                      onChange={(e) => setBizRisksIfImplemented(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Risks if not implemented</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter non-implementation opportunity loss risks..."
                      value={bizRisksIfNotImplemented}
                      onChange={(e) => setBizRisksIfNotImplemented(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label className="input-label">Business Review Overall Comments</label>
                  <textarea
                    className="custom-input-elem"
                    rows={2}
                    placeholder="Enter additional business review remarks..."
                    value={bizComments}
                    onChange={(e) => setBizComments(e.target.value)}
                    disabled={!isReviewer}
                  ></textarea>
                </div>

                <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "14px 18px", borderRadius: "10px" }}>
                  <label className="input-label" style={{ fontWeight: "800", color: "#1e293b", marginBottom: "8px", display: "block" }}>
                    Business Recommendation *
                  </label>
                  <div style={{ display: "flex", gap: "24px" }}>
                    {["Approve", "Reject", "Clarify"].map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: isReviewer ? "pointer" : "default", fontSize: "14px", fontWeight: "700", color: opt === "Approve" ? "#16a34a" : opt === "Reject" ? "#dc2626" : "#d97706" }}>
                        <input
                          type="radio"
                          name="bizRecommendation"
                          value={opt}
                          checked={bizRecommendation === opt}
                          onChange={() => setBizRecommendation(opt)}
                          disabled={!isReviewer}
                        />
                        {opt === "Approve" ? "Approve Business Feasibility" : opt === "Reject" ? "Reject Business Feasibility" : "Request Clarification"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION B: FUNCTIONAL REVIEW */}
            {activeTab === "functional" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "#e0f2fe", border: "1px solid #7dd3fc", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", color: "#0369a1" }}>
                  Assigned Functional Evaluator: {funcReviewer}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="input-field-group">
                    <label className="input-label">New functionality or Old</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. Completely New Module or Enhancing Existing Workflow"
                      value={funcNewOrOld}
                      onChange={(e) => setFuncNewOrOld(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Number of users affected</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. 500+ Internal Staff or 10,000 Customers"
                      value={funcUsersAffected}
                      onChange={(e) => setFuncUsersAffected(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Change management required</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. User Training Needed, Process SOP Update"
                      value={funcChangeManagementReq}
                      onChange={(e) => setFuncChangeManagementReq(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Process impact</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. Automates manual data entry in Billing"
                      value={funcProcessImpact}
                      onChange={(e) => setFuncProcessImpact(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group" style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Operational Risk</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter operational risks or downtime concerns..."
                      value={funcOperationalRisk}
                      onChange={(e) => setFuncOperationalRisk(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label className="input-label">Functional Review Overall Comments</label>
                  <textarea
                    className="custom-input-elem"
                    rows={2}
                    placeholder="Enter operational workflow remarks..."
                    value={funcComments}
                    onChange={(e) => setFuncComments(e.target.value)}
                    disabled={!isReviewer}
                  ></textarea>
                </div>

                <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "14px 18px", borderRadius: "10px" }}>
                  <label className="input-label" style={{ fontWeight: "800", color: "#1e293b", marginBottom: "8px", display: "block" }}>
                    Functional Recommendation *
                  </label>
                  <div style={{ display: "flex", gap: "24px" }}>
                    {["Approve", "Reject", "Clarify"].map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: isReviewer ? "pointer" : "default", fontSize: "14px", fontWeight: "700", color: opt === "Approve" ? "#16a34a" : opt === "Reject" ? "#dc2626" : "#d97706" }}>
                        <input
                          type="radio"
                          name="funcRecommendation"
                          value={opt}
                          checked={funcRecommendation === opt}
                          onChange={() => setFuncRecommendation(opt)}
                          disabled={!isReviewer}
                        />
                        {opt === "Approve" ? "Approve Functional Feasibility" : opt === "Reject" ? "Reject Functional Feasibility" : "Request Clarification"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION C: TECHNICAL REVIEW */}
            {activeTab === "technical" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "#dcfce7", border: "1px solid #86efac", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", color: "#15803d" }}>
                  Assigned Technical Evaluator: {techReviewer}
                </div>

                <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "16px", borderRadius: "10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                  <div className="input-field-group">
                    <label className="input-label" style={{ fontWeight: "800", color: "#4f46e5" }}>
                      Solution type
                    </label>
                    <select
                      className="custom-input-elem"
                      value={techSolutionType}
                      onChange={(e) => setTechSolutionType(e.target.value)}
                      disabled={!isReviewer}
                      style={{ fontWeight: "600" }}
                    >
                      <option value="Web Application">Web Application</option>
                      <option value="Mobile Application">Mobile Application</option>
                      <option value="Microservice / API">Microservice / API</option>
                      <option value="Automation Script / Bot">Automation Script / Bot</option>
                      <option value="Cloud Service / SaaS">Cloud Service / SaaS</option>
                      <option value="Internal Enterprise Tool">Internal Enterprise Tool</option>
                      <option value="Legacy System Enhancement">Legacy System Enhancement</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="input-field-group">
                    <label className="input-label" style={{ fontWeight: "800", color: "#4f46e5" }}>
                      Tech Stack 
                    </label>
                    <select
                      className="custom-input-elem"
                      value={techStack}
                      onChange={(e) => setTechStack(e.target.value)}
                      disabled={!isReviewer}
                      style={{ fontWeight: "600" }}
                    >
                      <option value="React / Node.js / PostgreSQL">React / Node.js / PostgreSQL</option>
                      <option value="Python / FastAPI / SQLite">Python / FastAPI / SQLite</option>
                      <option value="Java / Spring Boot / Oracle">Java / Spring Boot / Oracle</option>
                      <option value=".NET Core / C# / SQL Server">.NET Core / C# / SQL Server</option>
                      <option value="Angular / Express / MongoDB">Angular / Express / MongoDB</option>
                      <option value="Vue.js / Django / MySQL">Vue.js / Django / MySQL</option>
                      <option value="Custom Enterprise Stack">Custom Enterprise Stack</option>
                    </select>
                  </div>

                  <div className="input-field-group">
                    <label className="input-label" style={{ fontWeight: "800", color: "#4f46e5" }}>
                      Tech complexityf
                    </label>
                    <select
                      className="custom-input-elem"
                      value={techComplexity}
                      onChange={(e) => setTechComplexity(e.target.value)}
                      disabled={!isReviewer}
                      style={{ fontWeight: "600" }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Very High">Very High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="input-field-group">
                    <label className="input-label">Data Assessment</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter data volume, storage & migration details..."
                      value={techDataAssessment}
                      onChange={(e) => setTechDataAssessment(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Infra</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. AWS Cloud / On-Prem Kubernetes Server"
                      value={techInfra}
                      onChange={(e) => setTechInfra(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Integration Requirement</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. REST APIs, SAP ERP, Salesforce Integration"
                      value={techIntegrationReq}
                      onChange={(e) => setTechIntegrationReq(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Tech Risks</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter technical architecture or vendor lock-in risks..."
                      value={techRisks}
                      onChange={(e) => setTechRisks(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Dev + QA Efforts</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="e.g. 4 Sprints / 120 Man-Days"
                      value={techDevQaEfforts}
                      onChange={(e) => setTechDevQaEfforts(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>

                  <div className="input-field-group">
                    <label className="input-label">Security Concerns</label>
                    <input
                      type="text"
                      className="custom-input-elem"
                      placeholder="Enter security compliance & encryption requirements..."
                      value={techSecurityConcerns}
                      onChange={(e) => setTechSecurityConcerns(e.target.value)}
                      disabled={!isReviewer}
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label className="input-label">Technical Review Overall Comments</label>
                  <textarea
                    className="custom-input-elem"
                    rows={2}
                    placeholder="Enter architecture observations, API specifications..."
                    value={techComments}
                    onChange={(e) => setTechComments(e.target.value)}
                    disabled={!isReviewer}
                  ></textarea>
                </div>

                <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", padding: "14px 18px", borderRadius: "10px" }}>
                  <label className="input-label" style={{ fontWeight: "800", color: "#1e293b", marginBottom: "8px", display: "block" }}>
                    Technical Recommendation *
                  </label>
                  <div style={{ display: "flex", gap: "24px" }}>
                    {["Approve", "Reject", "Clarify"].map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: isReviewer ? "pointer" : "default", fontSize: "14px", fontWeight: "700", color: opt === "Approve" ? "#16a34a" : opt === "Reject" ? "#dc2626" : "#d97706" }}>
                        <input
                          type="radio"
                          name="techRecommendation"
                          value={opt}
                          checked={techRecommendation === opt}
                          onChange={() => setTechRecommendation(opt)}
                          disabled={!isReviewer}
                        />
                        {opt === "Approve" ? "Approve Technical Feasibility" : opt === "Reject" ? "Reject Technical Feasibility" : "Request Clarification"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* OVERALL FEASIBILITY ACTION & EVALUATION STATUS */}
            <div className="screening-decision-box" style={{ marginTop: "24px", paddingTop: "20px", borderTop: "2px solid #e2e8f0" }}>
              <h4 style={{ fontSize: "15px", fontWeight: "800", marginBottom: "12px", color: "#0f172a" }}>
                Three Parallel Reviews Summary & Status Breakdown
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "18px" }}>
                <div style={{ padding: "12px", borderRadius: "8px", background: isBizApproved ? "#f0fdf4" : "#fef2f2", border: isBizApproved ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b" }}>A. BUSINESS REVIEW</div>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: isBizApproved ? "#16a34a" : "#dc2626", marginTop: "2px" }}>
                    {isBizApproved ? "Feasible" : "Not Business Feasible"}
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "8px", background: isFuncApproved ? "#f0fdf4" : "#fef2f2", border: isFuncApproved ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b" }}>B. FUNCTIONAL REVIEW</div>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: isFuncApproved ? "#16a34a" : "#dc2626", marginTop: "2px" }}>
                    {isFuncApproved ? "Feasible" : "Not Functionally Feasible"}
                  </div>
                </div>

                <div style={{ padding: "12px", borderRadius: "8px", background: isTechApproved ? "#f0fdf4" : "#fef2f2", border: isTechApproved ? "1px solid #bbf7d0" : "1px solid #fecaca" }}>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b" }}>C. TECHNICAL REVIEW</div>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: isTechApproved ? "#16a34a" : "#dc2626", marginTop: "2px" }}>
                    {isTechApproved ? "Feasible" : "Not Technically Feasible"}
                  </div>
                </div>
              </div>

              {isAnyRejected ? (
                <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", padding: "14px", borderRadius: "10px", marginBottom: "16px" }}>
                  <div style={{ fontWeight: "800", color: "#dc2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <XCircle size={18} /> OVERALL FEASIBILITY REJECTED
                  </div>
                  <p style={{ fontSize: "12px", color: "#b91c1c", margin: "4px 0 0 0" }}>
                    Rejection Status: {!isBizApproved ? "Not Business Feasible" : !isFuncApproved ? "Not Functionally Feasible" : "Not Technically Feasible"}
                  </p>
                </div>
              ) : allThreeApproved ? (
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", padding: "14px", borderRadius: "10px", marginBottom: "16px" }}>
                  <div style={{ fontWeight: "800", color: "#16a34a", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={18} /> ALL 3 REVIEWS APPROVED (FEASIBLE)
                  </div>
                  <p style={{ fontSize: "12px", color: "#15803d", margin: "4px 0 0 0" }}>
                    Business, Functional, and Technical feasibility dimensions are 100% Approved.
                  </p>
                </div>
              ) : null}

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
      )}
    </div>
  );
}

export default FeasibilityReview;
