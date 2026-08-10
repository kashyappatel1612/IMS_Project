import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
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
  FileText,
  Building2,
  User,
  Calendar,
  Inbox,
  Check,
  X,
  Sparkles,
  Layers,
  Star
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas, updateIdeaStatus, fetchIdeasFromApi } from "../../utils/ideaStorage";
import { patchIdeaStatus } from "../../services/api";
import { useLocation } from "react-router-dom";

// Standard Form Input & Select Styling Helper
const inputFieldStyle = {
  width: "100%",
  height: "38px",
  fontSize: "13px",
  fontWeight: "500",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box"
};

const textareaFieldStyle = {
  width: "100%",
  fontSize: "13px",
  fontWeight: "500",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#1e293b",
  outline: "none",
  boxSizing: "border-box"
};

const fieldLabelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#475569",
  marginBottom: "5px"
};

// Helper component for 1 to 10 Score Selection
const ScoreSelector10 = ({ label, value, onChange, disabled }) => {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>{label}</span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: value ? "#4f46e5" : "#64748b",
            background: value ? "#e0e7ff" : "#f1f5f9",
            padding: "2px 8px",
            borderRadius: "12px"
          }}
        >
          {value ? `${value} / 10` : "Not Scored"}
        </span>
      </div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
          const isSelected = Number(value) === score;
          return (
            <button
              key={score}
              type="button"
              disabled={disabled}
              onClick={() => onChange(score)}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                border: isSelected ? "2px solid #4f46e5" : "1px solid #cbd5e1",
                background: isSelected ? "#4f46e5" : "#ffffff",
                color: isSelected ? "#ffffff" : "#334155",
                fontWeight: "700",
                fontSize: "12px",
                cursor: disabled ? "default" : "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function FeasibilityReview() {
  const location = useLocation();
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [activeTab, setActiveTab] = useState("business"); // 'business' | 'functional' | 'technical'
  const [userRole, setUserRole] = useState("User");
  const [reviewerEmail, setReviewerEmail] = useState("");

  // =========================================================================
  // SECTION A: BUSINESS REVIEW STATE
  // =========================================================================
  const [bizReviewer, setBizReviewer] = useState("Dr. Ananya Sharma (Business Evaluator)");
  const [bizExpectedBenefits, setBizExpectedBenefits] = useState("");
  const [bizCostSavings, setBizCostSavings] = useState("");
  const [bizEffortsSavings, setBizEffortsSavings] = useState("");
  const [bizProductivityImprovement, setBizProductivityImprovement] = useState("");
  const [bizQualityImprovement, setBizQualityImprovement] = useState("");
  const [bizCustomerUserExp, setBizCustomerUserExp] = useState("");
  const [bizComplianceRiskReduction, setBizComplianceRiskReduction] = useState("");
  const [bizCompanyStrategyAlign, setBizCompanyStrategyAlign] = useState("Yes");
  const [bizRegulatoryReq, setBizRegulatoryReq] = useState("No");
  const [bizExpectedRoi, setBizExpectedRoi] = useState("");
  const [bizRisksIfImplemented, setBizRisksIfImplemented] = useState("");
  const [bizRisksIfNotImplemented, setBizRisksIfNotImplemented] = useState("");
  // Scores & Ratings
  const [bizNeedValueScore, setBizNeedValueScore] = useState(8);
  const [bizStrategicAlignScore, setBizStrategicAlignScore] = useState(9);
  const [bizImpactRating, setBizImpactRating] = useState("Med");
  const [bizComments, setBizComments] = useState("");
  const [bizRecommendation, setBizRecommendation] = useState("Approve");

  // =========================================================================
  // SECTION B: FUNCTIONAL REVIEW STATE
  // =========================================================================
  const [funcReviewer, setFuncReviewer] = useState("Vikram Sethi (Functional Lead)");
  const [funcNewOrOld, setFuncNewOrOld] = useState("New Functionality");
  const [funcUsersAffected, setFuncUsersAffected] = useState("");
  const [funcChangeManagementReq, setFuncChangeManagementReq] = useState("");
  const [funcProcessImpact, setFuncProcessImpact] = useState("Medium");
  const [funcOperationalRisk, setFuncOperationalRisk] = useState("Low");
  // Scores & Ratings
  const [funcRequirementsScore, setFuncRequirementsScore] = useState(8);
  const [funcProcessReadinessScore, setFuncProcessReadinessScore] = useState(7);
  const [funcDependenciesRating, setFuncDependenciesRating] = useState("Known");
  const [funcComments, setFuncComments] = useState("");
  const [funcRecommendation, setFuncRecommendation] = useState("Approve");

  // =========================================================================
  // SECTION C: TECHNICAL REVIEW STATE
  // =========================================================================
  const [techReviewer, setTechReviewer] = useState("Expert Reviewer (Chief Architect)");
  const [techSolutionType, setTechSolutionType] = useState("Web Application");
  const [techStack, setTechStack] = useState("React / Node.js / PostgreSQL");
  const [techComplexity, setTechComplexity] = useState("Medium");
  const [techDataAssessment, setTechDataAssessment] = useState("");
  const [techInfra, setTechInfra] = useState("");
  const [techIntegrationReq, setTechIntegrationReq] = useState("");
  const [techRisks, setTechRisks] = useState("");
  const [techDevQaEfforts, setTechDevQaEfforts] = useState("");
  const [techSecurityConcerns, setTechSecurityConcerns] = useState("");
  // Scores & Ratings
  const [techSolutionFitScore, setTechSolutionFitScore] = useState(9);
  const [techSecurityReadinessScore, setTechSecurityReadinessScore] = useState(8);
  const [techComplexityRating, setTechComplexityRating] = useState("Med");
  const [techComments, setTechComments] = useState("");
  const [techRecommendation, setTechRecommendation] = useState("Approve");

  // Overall Recommendation & Notes
  const [overallRecommendation, setOverallRecommendation] = useState("Proceed");
  const [decisionNotes, setDecisionNotes] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadInitialData = async (userEmailArg = "") => {
    let email = userEmailArg || reviewerEmail;
    let currentRole = userRole;

    if (!email || currentRole === "User") {
      const savedUserStr = localStorage.getItem("currentUser");
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          email = u.email || "";
          currentRole = u.role || "User";
        } catch (err) {}
      }
    }

    let allLoadedIdeas = [];
    try {
      allLoadedIdeas = await fetchIdeasFromApi();
    } catch (err) {
      console.warn("Backend load error:", err);
      allLoadedIdeas = getSubmittedIdeas();
    }

    // Filter to ONLY include ideas that have passed Initial Screening
    const visible = allLoadedIdeas.filter((i) => {
      if (!i || !i.status) return false;
      const s = i.status;
      if (s === "Submitted" || s === "Pending Initial Screening" || s.includes("Rejected")) {
        return false;
      }
      return (
        s.includes("Passed Initial Screening") ||
        s.includes("Feasibility") ||
        s.includes("Pending PM Approval") ||
        s.includes("Approved") ||
        s.includes("BA") ||
        s.includes("Business Analysis") ||
        s.includes("Execution") ||
        s.includes("Estimation") ||
        s.includes("Project")
      );
    });

    const listToSet = visible.length > 0 ? visible : allLoadedIdeas.filter((i) => i && i.status !== "Submitted" && i.status !== "Pending Initial Screening");
    setIdeas(listToSet);
    if (listToSet.length > 0 && !selectedIdeaId) {
      setSelectedIdeaId(String(listToSet[0].id));
    }
  };

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    let email = "";
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.role) setUserRole(savedUser.role);
        if (savedUser.email) {
          setReviewerEmail(savedUser.email);
          email = savedUser.email;
        }
      } catch (err) {}
    }

    loadInitialData(email);

    const handleUpdate = () => {
      loadInitialData(email);
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("ideaStatusChanged", handleUpdate);
    window.addEventListener("ideaAllocationChanged", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("ideaStatusChanged", handleUpdate);
      window.removeEventListener("ideaAllocationChanged", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (location.state && location.state.selectedIdeaId) {
      setSelectedIdeaId(String(location.state.selectedIdeaId));
    } else if (!selectedIdeaId && ideas.length > 0) {
      setSelectedIdeaId(String(ideas[0].id));
    }
  }, [location.state, ideas, selectedIdeaId]);

  const selectedIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId)) || null;

  // Restore state when selectedIdea changes
  useEffect(() => {
    if (!selectedIdea) return;

    let notesObj = null;
    if (selectedIdea.evaluatorNotes) {
      try {
        notesObj = JSON.parse(selectedIdea.evaluatorNotes);
      } catch (err) {
        notesObj = { bizComments: selectedIdea.evaluatorNotes };
      }
    }

    if (notesObj) {
      if (notesObj.bizReviewer) setBizReviewer(notesObj.bizReviewer);
      setBizExpectedBenefits(notesObj.bizExpectedBenefits || "");
      setBizCostSavings(notesObj.bizCostSavings || "");
      setBizEffortsSavings(notesObj.bizEffortsSavings || "");
      setBizProductivityImprovement(notesObj.bizProductivityImprovement || "");
      setBizQualityImprovement(notesObj.bizQualityImprovement || "");
      setBizCustomerUserExp(notesObj.bizCustomerUserExp || "");
      setBizComplianceRiskReduction(notesObj.bizComplianceRiskReduction || "");
      setBizCompanyStrategyAlign(notesObj.bizCompanyStrategyAlign || "Yes");
      setBizRegulatoryReq(notesObj.bizRegulatoryReq || "No");
      setBizExpectedRoi(notesObj.bizExpectedRoi || "");
      setBizRisksIfImplemented(notesObj.bizRisksIfImplemented || "");
      setBizRisksIfNotImplemented(notesObj.bizRisksIfNotImplemented || "");
      setBizNeedValueScore(notesObj.bizNeedValueScore || 8);
      setBizStrategicAlignScore(notesObj.bizStrategicAlignScore || 9);
      setBizImpactRating(notesObj.bizImpactRating || "Med");
      setBizComments(notesObj.bizComments || "");
      setBizRecommendation(notesObj.bizRecommendation || "Approve");

      if (notesObj.funcReviewer) setFuncReviewer(notesObj.funcReviewer);
      setFuncNewOrOld(notesObj.funcNewOrOld || "New Functionality");
      setFuncUsersAffected(notesObj.funcUsersAffected || "");
      setFuncChangeManagementReq(notesObj.funcChangeManagementReq || "");
      setFuncProcessImpact(notesObj.funcProcessImpact || "Medium");
      setFuncOperationalRisk(notesObj.funcOperationalRisk || "Low");
      setFuncRequirementsScore(notesObj.funcRequirementsScore || 8);
      setFuncProcessReadinessScore(notesObj.funcProcessReadinessScore || 7);
      setFuncDependenciesRating(notesObj.funcDependenciesRating || "Known");
      setFuncComments(notesObj.funcComments || "");
      setFuncRecommendation(notesObj.funcRecommendation || "Approve");

      if (notesObj.techReviewer) setTechReviewer(notesObj.techReviewer);
      setTechSolutionType(notesObj.techSolutionType || "Web Application");
      setTechStack(notesObj.techStack || "React / Node.js / PostgreSQL");
      setTechComplexity(notesObj.techComplexity || "Medium");
      setTechDataAssessment(notesObj.techDataAssessment || "");
      setTechInfra(notesObj.techInfra || "");
      setTechIntegrationReq(notesObj.techIntegrationReq || "");
      setTechRisks(notesObj.techRisks || "");
      setTechDevQaEfforts(notesObj.techDevQaEfforts || "");
      setTechSecurityConcerns(notesObj.techSecurityConcerns || "");
      setTechSolutionFitScore(notesObj.techSolutionFitScore || 9);
      setTechSecurityReadinessScore(notesObj.techSecurityReadinessScore || 8);
      setTechComplexityRating(notesObj.techComplexityRating || "Med");
      setTechComments(notesObj.techComments || "");
      setTechRecommendation(notesObj.techRecommendation || "Approve");

      if (notesObj.overallRecommendation) setOverallRecommendation(notesObj.overallRecommendation);
      if (notesObj.decisionNotes) setDecisionNotes(notesObj.decisionNotes);
    } else {
      setBizExpectedBenefits("");
      setBizCostSavings("");
      setBizEffortsSavings("");
      setBizProductivityImprovement("");
      setBizQualityImprovement("");
      setBizCustomerUserExp("");
      setBizComplianceRiskReduction("");
      setBizCompanyStrategyAlign("Yes");
      setBizRegulatoryReq("No");
      setBizExpectedRoi("");
      setBizRisksIfImplemented("");
      setBizRisksIfNotImplemented("");
      setBizNeedValueScore(8);
      setBizStrategicAlignScore(9);
      setBizImpactRating("Med");
      setBizComments("");
      setBizRecommendation("Approve");

      setFuncNewOrOld("New Functionality");
      setFuncUsersAffected("");
      setFuncChangeManagementReq("");
      setFuncProcessImpact("Medium");
      setFuncOperationalRisk("Low");
      setFuncRequirementsScore(8);
      setFuncProcessReadinessScore(7);
      setFuncDependenciesRating("Known");
      setFuncComments("");
      setFuncRecommendation("Approve");

      setTechSolutionType("Web Application");
      setTechStack("React / Node.js / PostgreSQL");
      setTechComplexity("Medium");
      setTechDataAssessment("");
      setTechInfra("");
      setTechIntegrationReq("");
      setTechRisks("");
      setTechDevQaEfforts("");
      setTechSecurityConcerns("");
      setTechSolutionFitScore(9);
      setTechSecurityReadinessScore(8);
      setTechComplexityRating("Med");
      setTechComments("");
      setTechRecommendation("Approve");

      setOverallRecommendation("Proceed");
      setDecisionNotes("");
    }
  }, [selectedIdea]);

  const isReviewer = userRole === "Reviewer" || userRole === "Administrator" || userRole === "Project Coordinator";

  const handleFinalSubmitReview = async (forcedDecision = null) => {
    if (!selectedIdea) {
      toast.error("Please select a proposal first!");
      return;
    }

    if (isSubmittingReview) return;

    const chosenRecommendation = forcedDecision || overallRecommendation;

    setIsSubmittingReview(true);

    const feasibilityData = {
      bizReviewer,
      bizExpectedBenefits,
      bizCostSavings,
      bizEffortsSavings,
      bizProductivityImprovement,
      bizQualityImprovement,
      bizCustomerUserExp,
      bizComplianceRiskReduction,
      bizCompanyStrategyAlign,
      bizRegulatoryReq,
      bizExpectedRoi,
      bizRisksIfImplemented,
      bizRisksIfNotImplemented,
      bizNeedValueScore,
      bizStrategicAlignScore,
      bizImpactRating,
      bizComments,
      bizRecommendation,

      funcReviewer,
      funcNewOrOld,
      funcUsersAffected,
      funcChangeManagementReq,
      funcProcessImpact,
      funcOperationalRisk,
      funcRequirementsScore,
      funcProcessReadinessScore,
      funcDependenciesRating,
      funcComments,
      funcRecommendation,

      techReviewer,
      techSolutionType,
      techStack,
      techComplexity,
      techDataAssessment,
      techInfra,
      techIntegrationReq,
      techRisks,
      techDevQaEfforts,
      techSecurityConcerns,
      techSolutionFitScore,
      techSecurityReadinessScore,
      techComplexityRating,
      techComments,
      techRecommendation,

      overallRecommendation: chosenRecommendation,
      decisionNotes
    };

    const notes = JSON.stringify(feasibilityData);

    let newStatus = "Pending PM Approval";
    if (chosenRecommendation === "Reject") {
      newStatus = "Not Feasible (Rejected)";
    } else if (chosenRecommendation === "Revise") {
      newStatus = "Information Requested";
    } else if (chosenRecommendation === "Hold") {
      newStatus = "On Hold";
    }

    toast.success(`Proposal "${selectedIdea.title}" evaluation saved! Status: ${newStatus}`, {
      duration: 5000,
      position: "bottom-right",
      style: { border: "2px solid #16a34a", padding: "16px", background: "#f0fdf4", color: "#15803d", fontWeight: "700" }
    });

    setIdeas((prev) =>
      prev.map((item) => (String(item.id) === String(selectedIdea.id) ? { ...item, status: newStatus, evaluatorNotes: notes } : item))
    );

    updateIdeaStatus(selectedIdea.id, newStatus, notes, selectedIdea);

    patchIdeaStatus(Number(selectedIdea.id), newStatus, notes).catch((err) => {
      console.warn("Backend API sync notice:", err);
    });

    setTimeout(() => {
      setIsSubmittingReview(false);
      loadInitialData();
    }, 500);
  };

  const todayDateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Project Idea Review</h1>
          </div>
        </div>
      </div>

      {/* METADATA BAR CARD */}
      <Card style={{ marginBottom: "20px", border: "1px solid #e2e8f0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "16px",
            alignItems: "center"
          }}
        >
          <div>
            <label style={fieldLabelStyle}>Select / Active Proposal</label>
            <select
              value={selectedIdeaId || ""}
              onChange={(e) => setSelectedIdeaId(e.target.value)}
              style={inputFieldStyle}
            >
              <option value="">Choose Proposal</option>
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={fieldLabelStyle}>Idea Owner</label>
            <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", padding: "8px 0" }}>
              {selectedIdea ? selectedIdea.author : "—"}
            </div>
          </div>

          <div>
            <label style={fieldLabelStyle}>Project ID</label>
            <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", padding: "8px 0" }}>
              {selectedIdea ? `IDEA-${selectedIdea.id}` : "—"}
            </div>
          </div>

          <div>
            <label style={fieldLabelStyle}>Review Date</label>
            <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", padding: "8px 0" }}>
              {todayDateStr}
            </div>
          </div>
        </div>
      </Card>

      {/* TABS SELECTOR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { id: "business", label: "Business Review", icon: Briefcase },
            { id: "functional", label: "Functional Review", icon: Workflow },
            { id: "technical", label: "Technical Review", icon: Cpu }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: isSel ? "1.5px solid #4f46e5" : "1px solid #cbd5e1",
                  background: isSel ? "#4f46e5" : "#ffffff",
                  color: isSel ? "#ffffff" : "#475569",
                  fontWeight: "600",
                  fontSize: "13px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer"
                }}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {selectedIdea && (
          <span className="table-badge badge-approved" style={{ fontSize: "12px", padding: "6px 12px", background: "#dcfce7", color: "#15803d" }}>
            Status: {selectedIdea.status}
          </span>
        )}
      </div>

      {/* SECTIONS CONTENT */}
      <div style={{ marginBottom: "20px" }}>
        {/* ===================================================================== */}
        {/* SECTION 1: BUSINESS REVIEW                                            */}
        {/* ===================================================================== */}
        {activeTab === "business" && (
          <Card style={{ borderTop: "3px solid #4f46e5" }}>
            <div style={{ background: "#f8fafc", color: "#1e293b", padding: "10px 14px", borderRadius: "6px", marginBottom: "16px", fontWeight: "700", fontSize: "14px", borderLeft: "4px solid #4f46e5" }}>
              Business Review
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={fieldLabelStyle}>Reviewer Name</label>
                <input style={inputFieldStyle} value={bizReviewer} onChange={(e) => setBizReviewer(e.target.value)} disabled={!isReviewer} />
              </div>

              {/* Scores Box */}
              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <ScoreSelector10 label="Need & Value Rating" value={bizNeedValueScore} onChange={setBizNeedValueScore} disabled={!isReviewer} />
                <ScoreSelector10 label="Strategic Alignment Rating" value={bizStrategicAlignScore} onChange={setBizStrategicAlignScore} disabled={!isReviewer} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Business Impact:</span>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {["Low", "Med", "High"].map((val) => (
                      <label key={val} style={{ fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <input type="radio" name="bizImpact" checked={bizImpactRating === val} onChange={() => setBizImpactRating(val)} disabled={!isReviewer} />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div>
                <label style={fieldLabelStyle}>1. Expected Benefits</label>
                <input style={inputFieldStyle} placeholder="e.g. Saves 150 hrs monthly" value={bizExpectedBenefits} onChange={(e) => setBizExpectedBenefits(e.target.value)} disabled={!isReviewer} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>2. Cost Savings (Estimated)</label>
                  <input style={inputFieldStyle} placeholder="e.g. $45,000 / year" value={bizCostSavings} onChange={(e) => setBizCostSavings(e.target.value)} disabled={!isReviewer} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>3. Effort Savings</label>
                  <input style={inputFieldStyle} placeholder="e.g. 60% manual reduction" value={bizEffortsSavings} onChange={(e) => setBizEffortsSavings(e.target.value)} disabled={!isReviewer} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>4. Productivity Improvement</label>
                  <input style={inputFieldStyle} placeholder="e.g. +35% SLA turnaround" value={bizProductivityImprovement} onChange={(e) => setBizProductivityImprovement(e.target.value)} disabled={!isReviewer} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>5. Quality Improvement</label>
                  <input style={inputFieldStyle} placeholder="e.g. 99.5% accuracy rate" value={bizQualityImprovement} onChange={(e) => setBizQualityImprovement(e.target.value)} disabled={!isReviewer} />
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>6. Customer / User Experience</label>
                <input style={inputFieldStyle} placeholder="e.g. Instant self-service bot response" value={bizCustomerUserExp} onChange={(e) => setBizCustomerUserExp(e.target.value)} disabled={!isReviewer} />
              </div>

              <div>
                <label style={fieldLabelStyle}>7. Compliance & Risk Reduction</label>
                <input style={inputFieldStyle} placeholder="e.g. Automated GDPR & SOC2 compliance audit log" value={bizComplianceRiskReduction} onChange={(e) => setBizComplianceRiskReduction(e.target.value)} disabled={!isReviewer} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>8. Alignment with Company Strategy?</label>
                  <select style={inputFieldStyle} value={bizCompanyStrategyAlign} onChange={(e) => setBizCompanyStrategyAlign(e.target.value)} disabled={!isReviewer}>
                    <option value="Yes">Yes — High Priority</option>
                    <option value="Partial">Partial Alignment</option>
                    <option value="No">No Alignment</option>
                  </select>
                </div>
                <div>
                  <label style={fieldLabelStyle}>9. Regulatory Requirement?</label>
                  <select style={inputFieldStyle} value={bizRegulatoryReq} onChange={(e) => setBizRegulatoryReq(e.target.value)} disabled={!isReviewer}>
                    <option value="No">No</option>
                    <option value="Yes">Yes (Mandatory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>10. Expected ROI</label>
                <input style={inputFieldStyle} placeholder="e.g. 280% ROI within 12 months" value={bizExpectedRoi} onChange={(e) => setBizExpectedRoi(e.target.value)} disabled={!isReviewer} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>11. Risks if Implemented</label>
                  <input style={inputFieldStyle} placeholder="e.g. Initial user adoption learning curve" value={bizRisksIfImplemented} onChange={(e) => setBizRisksIfImplemented(e.target.value)} disabled={!isReviewer} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>12. Risks if Not Implemented</label>
                  <input style={inputFieldStyle} placeholder="e.g. Support team burnout & lost customer loyalty" value={bizRisksIfNotImplemented} onChange={(e) => setBizRisksIfNotImplemented(e.target.value)} disabled={!isReviewer} />
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>Evidence / Comments</label>
                <textarea style={{ ...textareaFieldStyle, height: "64px" }} placeholder="Business feasibility comments..." value={bizComments} onChange={(e) => setBizComments(e.target.value)} disabled={!isReviewer}></textarea>
              </div>
            </div>
          </Card>
        )}

        {/* ===================================================================== */}
        {/* SECTION 2: FUNCTIONAL REVIEW                                          */}
        {/* ===================================================================== */}
        {activeTab === "functional" && (
          <Card style={{ borderTop: "3px solid #4f46e5" }}>
            <div style={{ background: "#f8fafc", color: "#1e293b", padding: "10px 14px", borderRadius: "6px", marginBottom: "16px", fontWeight: "700", fontSize: "14px", borderLeft: "4px solid #4f46e5" }}>
              Functional Review
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={fieldLabelStyle}>Reviewer Name</label>
                <input style={inputFieldStyle} value={funcReviewer} onChange={(e) => setFuncReviewer(e.target.value)} disabled={!isReviewer} />
              </div>

              {/* Scores Box */}
              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <ScoreSelector10 label="Requirements Fit Rating" value={funcRequirementsScore} onChange={setFuncRequirementsScore} disabled={!isReviewer} />
                <ScoreSelector10 label="Process Readiness Rating" value={funcProcessReadinessScore} onChange={setFuncProcessReadinessScore} disabled={!isReviewer} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Dependencies:</span>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {["None", "Known", "Assess"].map((val) => (
                      <label key={val} style={{ fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <input type="radio" name="funcDep" checked={funcDependenciesRating === val} onChange={() => setFuncDependenciesRating(val)} disabled={!isReviewer} />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>1. New or Existing Functionality</label>
                  <select style={inputFieldStyle} value={funcNewOrOld} onChange={(e) => setFuncNewOrOld(e.target.value)} disabled={!isReviewer}>
                    <option value="New Functionality">New Functionality</option>
                    <option value="Existing Functionality Enhancement">Existing Functionality Enhancement (Old)</option>
                  </select>
                </div>
                <div>
                  <label style={fieldLabelStyle}>2. Number of Users Affected</label>
                  <input style={inputFieldStyle} placeholder="e.g. 2,500 Support Agents & Customers" value={funcUsersAffected} onChange={(e) => setFuncUsersAffected(e.target.value)} disabled={!isReviewer} />
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>3. Change Management Requirements</label>
                <input style={inputFieldStyle} placeholder="e.g. 2-week SOP training & agent onboarding" value={funcChangeManagementReq} onChange={(e) => setFuncChangeManagementReq(e.target.value)} disabled={!isReviewer} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>4. Process Impact</label>
                  <select style={inputFieldStyle} value={funcProcessImpact} onChange={(e) => setFuncProcessImpact(e.target.value)} disabled={!isReviewer}>
                    <option value="Low">Low Impact</option>
                    <option value="Medium">Medium Impact</option>
                    <option value="High">High Impact</option>
                    <option value="Critical">Critical Process Shift</option>
                  </select>
                </div>
                <div>
                  <label style={fieldLabelStyle}>5. Operational Risk</label>
                  <select style={inputFieldStyle} value={funcOperationalRisk} onChange={(e) => setFuncOperationalRisk(e.target.value)} disabled={!isReviewer}>
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>Gaps / Comments</label>
                <textarea style={{ ...textareaFieldStyle, height: "72px" }} placeholder="Functional gaps, workflow comments..." value={funcComments} onChange={(e) => setFuncComments(e.target.value)} disabled={!isReviewer}></textarea>
              </div>
            </div>
          </Card>
        )}

        {/* ===================================================================== */}
        {/* SECTION 3: TECHNICAL REVIEW                                           */}
        {/* ===================================================================== */}
        {activeTab === "technical" && (
          <Card style={{ borderTop: "3px solid #4f46e5" }}>
            <div style={{ background: "#f8fafc", color: "#1e293b", padding: "10px 14px", borderRadius: "6px", marginBottom: "16px", fontWeight: "700", fontSize: "14px", borderLeft: "4px solid #4f46e5" }}>
              Technical Review
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={fieldLabelStyle}>Reviewer Name</label>
                <input style={inputFieldStyle} value={techReviewer} onChange={(e) => setTechReviewer(e.target.value)} disabled={!isReviewer} />
              </div>

              {/* Scores Box */}
              <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <ScoreSelector10 label="Solution Fit Rating" value={techSolutionFitScore} onChange={setTechSolutionFitScore} disabled={!isReviewer} />
                <ScoreSelector10 label="Security Readiness Rating" value={techSecurityReadinessScore} onChange={setTechSecurityReadinessScore} disabled={!isReviewer} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Complexity:</span>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {["Low", "Med", "High"].map((val) => (
                      <label key={val} style={{ fontSize: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <input type="radio" name="techComp" checked={techComplexityRating === val} onChange={() => setTechComplexityRating(val)} disabled={!isReviewer} />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>1. Solution Type</label>
                  <select style={inputFieldStyle} value={techSolutionType} onChange={(e) => setTechSolutionType(e.target.value)} disabled={!isReviewer}>
                    <option value="Web Application">Web Application</option>
                    <option value="Mobile App (iOS/Android)">Mobile App (iOS/Android)</option>
                    <option value="Microservices API">Microservices API</option>
                    <option value="AI / ML Automation Bot">AI / ML Automation Bot</option>
                    <option value="Enterprise ERP / CRM Integration">Enterprise ERP / CRM Integration</option>
                  </select>
                </div>

                <div>
                  <label style={fieldLabelStyle}>2. Tech Stack Tools (FE, BE, Database)</label>
                  <select style={inputFieldStyle} value={techStack} onChange={(e) => setTechStack(e.target.value)} disabled={!isReviewer}>
                    <option value="React / Node.js / PostgreSQL">React / Node.js / PostgreSQL</option>
                    <option value="Python / FastAPI / PostgreSQL">Python / FastAPI / PostgreSQL</option>
                    <option value="Java / Spring Boot / React">Java / Spring Boot / React</option>
                    <option value="Cloud Native Serverless (AWS/GCP)">Cloud Native Serverless (AWS/GCP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>3. Technical Complexity</label>
                <select style={inputFieldStyle} value={techComplexity} onChange={(e) => setTechComplexity(e.target.value)} disabled={!isReviewer}>
                  <option value="Low">Low Complexity</option>
                  <option value="Medium">Medium Complexity</option>
                  <option value="High">High Complexity</option>
                  <option value="Very High">Very High Complexity</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>4. Data Assessment</label>
                  <input style={inputFieldStyle} placeholder="e.g. Structured DB + Vector Embedding Database" value={techDataAssessment} onChange={(e) => setTechDataAssessment(e.target.value)} disabled={!isReviewer} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>5. Infrastructure</label>
                  <input style={inputFieldStyle} placeholder="e.g. Kubernetes Cluster with Autoscaling" value={techInfra} onChange={(e) => setTechInfra(e.target.value)} disabled={!isReviewer} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>6. Integration Requirements</label>
                  <input style={inputFieldStyle} placeholder="e.g. REST API integration with SAP ERP" value={techIntegrationReq} onChange={(e) => setTechIntegrationReq(e.target.value)} disabled={!isReviewer} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>7. Technical Risks</label>
                  <input style={inputFieldStyle} placeholder="e.g. LLM API latency & rate limits" value={techRisks} onChange={(e) => setTechRisks(e.target.value)} disabled={!isReviewer} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={fieldLabelStyle}>8. Dev & QA Efforts</label>
                  <input style={inputFieldStyle} placeholder="e.g. 6 Sprints (12 Weeks)" value={techDevQaEfforts} onChange={(e) => setTechDevQaEfforts(e.target.value)} disabled={!isReviewer} />
                </div>
                <div>
                  <label style={fieldLabelStyle}>9. Security Concerns</label>
                  <input style={inputFieldStyle} placeholder="e.g. Encryption at rest & TLS 1.3" value={techSecurityConcerns} onChange={(e) => setTechSecurityConcerns(e.target.value)} disabled={!isReviewer} />
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>Constraints / Comments</label>
                <textarea style={{ ...textareaFieldStyle, height: "64px" }} placeholder="Technical constraints & architecture comments..." value={techComments} onChange={(e) => setTechComments(e.target.value)} disabled={!isReviewer}></textarea>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* BOTTOM RECOMMENDATION BAR */}
      <Card style={{ borderTop: "3px solid #4f46e5" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>
                Recommendation *
              </span>
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                {[
                  { value: "Proceed", label: "Proceed (Approve)", color: "#16a34a" },
                  { value: "Revise", label: "Revise (Request Info)", color: "#d97706" },
                  { value: "Hold", label: "Hold", color: "#4f46e5" },
                  { value: "Reject", label: "Reject", color: "#dc2626" }
                ].map((opt) => (
                  <label key={opt.value} style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: isReviewer ? "pointer" : "default", fontSize: "12px", fontWeight: "600", color: opt.color }}>
                    <input
                      type="radio"
                      name="overallRec"
                      checked={overallRecommendation === opt.value}
                      onChange={() => setOverallRecommendation(opt.value)}
                      disabled={!isReviewer}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => handleFinalSubmitReview(overallRecommendation === "Proceed" ? "Approve" : overallRecommendation)}
              disabled={isSubmittingReview || !selectedIdea}
              style={{ height: "38px", fontSize: "13px", fontWeight: "700" }}
            >
              {isSubmittingReview ? "Submitting Review..." : "Submit Review & Forward to PM"}
            </Button>
          </div>

          <div>
            <label style={fieldLabelStyle}>
              Decision Notes / Overall Remarks
            </label>
            <textarea
              style={{ ...textareaFieldStyle, height: "64px" }}
              placeholder="Provide overall summary of feasibility review evaluation decision..."
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              disabled={!isReviewer}
            ></textarea>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default FeasibilityReview;
