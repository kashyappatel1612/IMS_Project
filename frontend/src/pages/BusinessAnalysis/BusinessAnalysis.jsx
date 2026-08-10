import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart,
  Upload,
  FileText,
  Paperclip,
  Send,
  User,
  Mail,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Inbox,
  Eye,
  Download,
  Trash2,
  Building2,
  Clock,
  Sparkles,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import {
  getSubmittedIdeas,
  getSubmittedAnalysisReports,
  saveAnalysisReport
} from "../../utils/ideaStorage";
import { fetchAllIdeas, fetchAnalysisReports, fetchMyAssignments } from "../../services/api";

function BusinessAnalysis() {
  const location = useLocation();
  const [userRole, setUserRole] = useState("User");
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [isChangingSelection, setIsChangingSelection] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);

  // Form State
  const [baName, setBaName] = useState("Business Analyst");
  const [baEmail, setBaEmail] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [projectedRoi, setProjectedRoi] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let currentEmail = "";
    let currentUsername = "";
    // Read logged-in user profile
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.role) setUserRole(u.role);
        if (u.username) {
          setBaName(u.username);
          currentUsername = u.username;
        }
        if (u.email) {
          setBaEmail(u.email);
          currentEmail = u.email;
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadInitialData(currentEmail, currentUsername);

    const handleUpdate = () => {
      loadInitialData(currentEmail, currentUsername);
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

  const loadInitialData = async (activeEmail = "", activeName = "") => {
    let rawIdeas = [];
    try {
      const apiIdeas = await fetchMyAssignments();
      if (apiIdeas && apiIdeas.length > 0) {
        rawIdeas = apiIdeas;
      } else {
        rawIdeas = getSubmittedIdeas();
      }
    } catch (err) {
      rawIdeas = getSubmittedIdeas();
    }

    if (userRole === "Business Analyst") {
      const strictlyMyIdeas = rawIdeas.filter((i) => {
        const assignedBAStr = (i.assignedBA || "").toLowerCase();
        if (!assignedBAStr) return false;
        if (activeEmail && assignedBAStr.includes(activeEmail.toLowerCase())) return true;
        if (activeName && assignedBAStr.includes(activeName.toLowerCase())) return true;
        return false;
      });
      const listToSet = strictlyMyIdeas.length > 0 ? strictlyMyIdeas : rawIdeas;
      setIdeas(listToSet);
    } else {
      setIdeas(rawIdeas);
    }

    try {
      const apiReports = await fetchAnalysisReports();
      if (apiReports && apiReports.length > 0) {
        setReports(apiReports);
      } else {
        setReports(getSubmittedAnalysisReports());
      }
    } catch (err) {
      setReports(getSubmittedAnalysisReports());
    }
  };

  useEffect(() => {
    if (location.state && location.state.selectedIdeaId) {
      const targetId = String(location.state.selectedIdeaId);
      setSelectedIdeaId(targetId);
      setIsChangingSelection(false);
      const idea = ideas.find((i) => String(i.id) === targetId);
      if (idea) {
        setReportTitle(`Business Analysis & Financial ROI Report - ${idea.title}`);
      }
    }
  }, [location.state, ideas]);

  // Pre-fill report title when idea is selected
  const handleIdeaSelect = (ideaId) => {
    setSelectedIdeaId(ideaId);
    const idea = ideas.find((i) => String(i.id) === String(ideaId));
    if (idea) {
      setReportTitle(`Business Analysis & Financial ROI Report - ${idea.title}`);
    }
  };

  // Handle Report File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit! Please upload a smaller analysis document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setReportFile({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
        fileType: file.type || "application/pdf",
        fileData: uploadEvent.target?.result
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Submission to PM
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!baName.trim()) {
      alert("Please enter Business Analyst Name!");
      return;
    }
    if (!reportTitle.trim()) {
      alert("Please enter Report Title!");
      return;
    }
    if (!summary.trim()) {
      alert("Please enter Executive Summary / ROI Notes!");
      return;
    }

    setIsSubmitting(true);
    setSuccessMsg("");

    const selectedIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId));
    const ideaTitle = selectedIdea ? selectedIdea.title : reportTitle;

    const reportPayload = {
      ideaId: selectedIdeaId ? Number(selectedIdeaId) : null,
      ideaTitle: ideaTitle,
      baName: baName.trim(),
      baEmail: baEmail.trim(),
      reportTitle: reportTitle.trim(),
      summary: summary.trim(),
      estimatedCost: estimatedCost.trim() || "$25,000",
      projectedRoi: projectedRoi.trim() || "250% Annual ROI",
      attachment: reportFile
    };

    try {
      const updatedReports = await saveAnalysisReport(reportPayload);
      setReports(updatedReports || getSubmittedAnalysisReports());
      setSuccessMsg(`Analysis Report "${reportTitle}" successfully uploaded & sent to Project Manager (PM)! Status set to: Approved by BA: ${baName.trim()}`);
      
      // Reset form
      setSummary("");
      setEstimatedCost("");
      setProjectedRoi("");
      setReportFile(null);
      setSelectedIdeaId("");
      
      // Refresh idea list to reflect new status
      setIdeas(getSubmittedIdeas());
    } catch (err) {
      console.error(err);
      alert("Failed to submit analysis report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to match submitted report to an idea
  const getReportForIdea = (ideaId, ideaTitle) => {
    return reports.find(
      (r) =>
        (r.ideaId && String(r.ideaId) === String(ideaId)) ||
        (r.ideaTitle && r.ideaTitle.toLowerCase() === (ideaTitle || "").toLowerCase())
    );
  };

  // Filter ONLY ideas that passed Stage 2 Feasibility Review
  const feasibleIdeas = ideas.filter((item) => {
    const s = item.status || "";
    if (s.includes("Not ") || s.includes("Rejected")) return false;
    return (
      s.includes("Pending PM Approval") ||
      s.includes("Feasibility Approved") ||
      s.includes("Approved by BA") ||
      s.includes("Business Analysis") ||
      s.includes("Estimation") ||
      s.includes("Project") ||
      s.includes("Execution") ||
      s.includes("Benefits")
    );
  });

  const selectedIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId));

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Business Analysis & Feasibility Hub</h1>
            <span className="mode-badge-green" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
              <Briefcase size={14} /> Stage 3 Business & Commercial Evaluation
            </span>
          </div>
          <p>
            {userRole === "Business Analyst"
              ? "Upload comprehensive business case reports, financial ROI projections, and submit directly to Project Manager (PM)."
              : "Track proposals accepted from Stage 2 Feasibility Review, their assigned Business Analysts, and report submission status."}
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          <CheckCircle2 size={20} color="#16a34a" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ROLE-BASED VIEW SPLIT */}
      {userRole !== "Business Analyst" ? (
        /* ADMIN, PROJECT MANAGER & REVIEWER VIEW: Status Tracking Board */
        <Card
          title={`Feasibility Accepted Proposals & BA Report Status (${feasibleIdeas.length})`}
          subtitle="Overview of proposals passed from Stage 2 Feasibility Review, assigned Business Analyst, and report status"
        >
          <div className="data-table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Project Title & Category</th>
                  <th style={{ width: "35%" }}>Problem Statement</th>
                  <th style={{ width: "18%" }}>Assigned Business Analyst</th>
                  <th style={{ width: "15%" }}>Report Submission Status</th>
                  <th style={{ width: "10%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {feasibleIdeas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state-cell">
                      <div className="empty-state-flex" style={{ padding: "32px 0" }}>
                        <Inbox size={36} color="var(--text-light)" />
                        <span className="empty-state-title">No Feasibility Approved Proposals Found</span>
                        <span className="empty-state-sub">
                          Proposals accepted in Stage 2 Feasibility Review will automatically appear here.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  feasibleIdeas.map((item) => {
                    const rep = getReportForIdea(item.id, item.title);
                    const isSubmitted = Boolean(rep);
                    const assignedBaName = rep?.baName || item.assignedBA || "Nushkiee (Business Analyst)";

                    return (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: "700", color: "var(--text-dark)", fontSize: "14px" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            Category: {item.category} • Date: {item.date || "Jul 2026"}
                          </div>
                        </td>
                        <td>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "var(--text-main)",
                              margin: 0,
                              lineHeight: "1.4",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden"
                            }}
                          >
                            {item.problemStatement || item.description || item.proposedSolution || "No problem statement specified."}
                          </p>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "#f1f5f9",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#1e293b"
                            }}
                          >
                            <User size={13} color="#6366f1" /> {assignedBaName}
                          </span>
                        </td>
                        <td>
                          {isSubmitted ? (
                            <span
                              className="table-badge badge-approved"
                              style={{ background: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe" }}
                            >
                              ✓ Report Submitted
                            </span>
                          ) : (
                            <span
                              className="table-badge badge-review"
                              style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}
                            >
                              ⏳ Pending Submission
                            </span>
                          )}
                        </td>
                        <td>
                          {isSubmitted ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Eye}
                              onClick={() => setViewingReport(rep)}
                            >
                              View Report
                            </Button>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
                              Awaiting BA
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* BUSINESS ANALYST ROLE VIEW: Full Width Form */
        <div style={{ width: "100%" }}>
          <Card
            title="1. Upload & Send Analysis Report to PM"
            subtitle="Fill BA details, attach analysis document & dispatch to Project Manager"
          >
            <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Select Idea Display or Dropdown */}
              {selectedIdea && !isChangingSelection ? (
                <div className="input-field-group">
                  <label className="input-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#1e293b" }}>Selected Proposal for Business Analysis *</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => setIsChangingSelection(true)}
                      style={{ fontSize: "12px", color: "#4f46e5", height: "28px" }}
                    >
                      🔄 Change Selected Idea
                    </Button>
                  </label>
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: "10px",
                      border: "1.5px solid #6366f1",
                      background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      boxShadow: "0 2px 8px rgba(99, 102, 241, 0.08)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", background: "#4f46e5", color: "#ffffff", padding: "4px 8px", borderRadius: "6px" }}>
                        IDEA-{selectedIdea.id}
                      </span>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b" }}>
                          {selectedIdea.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", display: "flex", gap: "12px", marginTop: "3px" }}>
                          <span>Domain: <strong>{selectedIdea.category}</strong></span>
                          <span>Author: <strong>{selectedIdea.author}</strong></span>
                        </div>
                      </div>
                    </div>
                    <span className="table-badge badge-approved" style={{ fontSize: "12px", padding: "6px 12px" }}>
                      {selectedIdea.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="input-field-group">
                  <label className="input-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>Select Proposal / Idea to Analyze *</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {isChangingSelection && (
                        <Button size="sm" variant="ghost" type="button" onClick={() => setIsChangingSelection(false)} style={{ fontSize: "12px", height: "26px" }}>
                          Cancel Change
                        </Button>
                      )}
                      <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "700" }}>
                        ✓ Feasibility Approved Only ({feasibleIdeas.length} Available)
                      </span>
                    </div>
                  </label>
                  <select
                    className="custom-input-elem"
                    value={selectedIdeaId}
                    onChange={(e) => {
                      handleIdeaSelect(e.target.value);
                      setIsChangingSelection(false);
                    }}
                    style={{ fontSize: "14px", fontWeight: "600" }}
                    required
                  >
                    <option value="">Select Your Idea</option>
                    {feasibleIdeas.length === 0 ? (
                      <option value="" disabled>
                        -- No proposals currently passed Stage 2 Feasibility Review --
                      </option>
                    ) : (
                      feasibleIdeas.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} [{item.category}] — Status: {item.status}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {/* BA Name & Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Input
                  label="Business Analyst (BA) Name"
                  placeholder="e.g. Ayushman Raj"
                  icon={User}
                  value={baName}
                  onChange={(e) => setBaName(e.target.value)}
                  required
                />
                <Input
                  label="BA Contact Email"
                  placeholder="e.g. ba@company.com"
                  icon={Mail}
                  value={baEmail}
                  onChange={(e) => setBaEmail(e.target.value)}
                  required
                />
              </div>

              {/* Dynamic Feasibility Evaluator Review Details Card */}
              {selectedIdea && (
                <Card
                  title="📑 Feasibility Evaluator Review Details"
                  subtitle="Detailed recommendations, ratings and remarks submitted by evaluators in Stage 2"
                  style={{
                    background: "var(--card-bg, #ffffff)",
                    border: "1.5px solid var(--border-color, #e2e8f0)",
                    boxShadow: "none",
                    padding: "16px",
                    marginTop: "4px",
                    marginBottom: "4px"
                  }}
                >
                  {(() => {
                    let notes = null;
                    if (selectedIdea.evaluatorNotes) {
                      try {
                        notes = typeof selectedIdea.evaluatorNotes === "string" 
                          ? JSON.parse(selectedIdea.evaluatorNotes) 
                          : selectedIdea.evaluatorNotes;
                      } catch (e) {
                        console.error("Error parsing notes:", e);
                      }
                    }

                    if (!notes) {
                      return (
                        <div style={{ padding: "8px", fontSize: "12.5px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center" }}>
                          No parallel feasibility evaluation remarks details recorded for this proposal.
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Business Review Details */}
                        <div style={{ borderBottom: "1px dashed var(--border-color)", paddingBottom: "12px" }}>
                          <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#6366f1", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                            💼 A. BUSINESS FEASIBILITY REVIEW
                          </h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div>
                              <strong>Evaluator Name:</strong> {notes.bizReviewer || "N/A"}
                            </div>
                            <div>
                              <strong>Expected Benefits:</strong> {notes.bizExpectedBenefits || "N/A"}
                            </div>
                            <div>
                              <strong>Cost Savings:</strong> {notes.bizCostSavings || "N/A"}
                            </div>
                            <div>
                              <strong>Time Savings:</strong> {notes.bizTimeSavings || "N/A"}
                            </div>
                            <div>
                              <strong>Productivity Improvement:</strong> {notes.bizProductivity || "N/A"}
                            </div>
                            <div>
                              <strong>Quality Improvement:</strong> {notes.bizQuality || "N/A"}
                            </div>
                            <div>
                              <strong>Customer/User Experience:</strong> {notes.bizCustomerExp || "N/A"}
                            </div>
                            <div>
                              <strong>Compliance/Risk Reduction:</strong> {notes.bizCompliance || "N/A"}
                            </div>
                            <div>
                              <strong>Aligns Strategy?:</strong> {notes.bizAlignsStrategy || "N/A"}
                            </div>
                            <div>
                              <strong>Digital Transformation?:</strong> {notes.bizDigitalTransformation || "N/A"}
                            </div>
                            <div>
                              <strong>AI/Automation Roadmap?:</strong> {notes.bizAiRoadmap || "N/A"}
                            </div>
                            <div>
                              <strong>Regulatory Requirement?:</strong> {notes.bizRegulatoryRequirement || "N/A"}
                            </div>
                            <div>
                              <strong>Departments Impacted:</strong> {notes.bizDepartmentsImpacted || "N/A"}
                            </div>
                            <div>
                              <strong>Users Affected:</strong> {notes.bizUsersAffected || "N/A"}
                            </div>
                            <div>
                              <strong>Geographic Locations:</strong> {notes.bizGeographicLocations || "N/A"}
                            </div>
                            <div>
                              <strong>Criticality Level:</strong> <span style={{ fontWeight: "700", color: notes.bizCriticality === "High" ? "#dc2626" : notes.bizCriticality === "Medium" ? "#d97706" : "#2563eb" }}>{notes.bizCriticality || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Functional Review Details */}
                        <div style={{ borderBottom: "1px dashed var(--border-color)", paddingBottom: "12px" }}>
                          <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#6366f1", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                            ⚙️ B. FUNCTIONAL FEASIBILITY REVIEW
                          </h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div>
                              <strong>Input Data:</strong> {notes.funcInputData || "N/A"}
                            </div>
                            <div>
                              <strong>Output Data:</strong> {notes.funcOutputData || "N/A"}
                            </div>
                            <div>
                              <strong>Master Data Changes:</strong> {notes.funcMasterDataChanges || "N/A"}
                            </div>
                            <div>
                              <strong>Data Quality Concerns:</strong> {notes.funcDataQualityConcerns || "N/A"}
                            </div>
                            <div>
                              <strong>Process Definition Status:</strong> {notes.funcProcessDefinition || "N/A"}
                            </div>
                            <div>
                              <strong>SOPs/Guidelines Status:</strong> {notes.funcSopAvailability || "N/A"}
                            </div>
                            <div>
                              <strong>User Training Status:</strong> {notes.funcUserTraining || "N/A"}
                            </div>
                            <div>
                              <strong>Change Management Impact:</strong> {notes.funcChangeManagement || "N/A"}
                            </div>
                            <div>
                              <strong>Other App Dependencies:</strong> {notes.funcAppDependencies || "N/A"}
                            </div>
                            <div>
                              <strong>Existing Process Dependencies:</strong> {notes.funcProcessDependencies || "N/A"}
                            </div>
                            <div>
                              <strong>Third-Party Dependencies:</strong> {notes.funcThirdPartyDependencies || "N/A"}
                            </div>
                            <div>
                              <strong>Recommendation Status:</strong> <span style={{ fontWeight: "700", color: notes.funcRecommendation === "Approved" ? "#16a34a" : "#dc2626" }}>{notes.funcRecommendation || "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Technical Review Details */}
                        <div>
                          <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#6366f1", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                            💻 C. TECHNICAL FEASIBILITY REVIEW
                          </h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <div>
                              <strong>Technical Evaluator:</strong> {notes.techReviewer || "N/A"}
                            </div>
                            <div>
                              <strong>Architectural Fit:</strong> {notes.techArchitectureFit || "N/A"}
                            </div>
                            <div>
                              <strong>Security/Compliance:</strong> {notes.techSecurityCompliance || "N/A"}
                            </div>
                            <div>
                              <strong>Infrastructure Scale:</strong> {notes.techInfrastructureScalability || "N/A"}
                            </div>
                            <div>
                              <strong>Developer Skills Fit:</strong> {notes.techResourceSkills || "N/A"}
                            </div>
                            <div>
                              <strong>Integration Complexity:</strong> {notes.techIntegrationComplexity || "N/A"}
                            </div>
                            <div>
                              <strong>Deployment Window:</strong> {notes.techDeploymentEffort || "N/A"}
                            </div>
                            <div>
                              <strong>Evaluation Recommendation:</strong> <span style={{ fontWeight: "700", color: notes.techRecommendation === "Approved" ? "#16a34a" : "#dc2626" }}>{notes.techRecommendation || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              )}

              {/* Already Processed / Submitted Card */}
              {selectedIdea && (selectedIdea.status.includes("Approved by BA") || selectedIdea.status.includes("Estimation") || selectedIdea.status === "In Execution" || selectedIdea.status === "Rejected by PM" || selectedIdea.status === "On Hold") ? (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "#ecfdf5",
                    border: "1.5px solid #10b981",
                    color: "#065f46",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span>Requirements Analysis Completed</span>
                  </div>
                  <span style={{ fontSize: "13px", color: "#047857" }}>
                    This proposal is already successfully evaluated and approved by BA. The Requirements report has been dispatched to the PM for execution kickoff.
                  </span>
                </div>
              ) : (
                <>
                  <Input
                    label="Analysis Report Title"
                    placeholder="e.g. Detailed Financial & Technical Feasibility Study"
                    icon={FileText}
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    required
                  />

                  {/* Financial Cost & ROI Projections */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <Input
                      label="Estimated Implementation Cost"
                      placeholder="e.g. $45,000 / INR 5,00,000"
                      icon={DollarSign}
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(e.target.value)}
                    />
                    <Input
                      label="Projected Annual ROI / Value"
                      placeholder="e.g. 320% ROI / $150k Annual Benefit"
                      icon={TrendingUp}
                      value={projectedRoi}
                      onChange={(e) => setProjectedRoi(e.target.value)}
                    />
                  </div>

                  {/* Executive Summary / Notes */}
                  <div className="input-field-group">
                    <label className="input-label">Executive Summary & Commercial Analysis Notes *</label>
                    <textarea
                      className="custom-input-elem"
                      rows={4}
                      placeholder="Provide key insights, risk assessment, payback period, and strategic alignment notes for the PM..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {/* Upload File Box */}
                  <div className="input-field-group">
                    <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Paperclip size={14} /> Upload Analysis Report Document (PDF, DOCX, XLSX, Images)
                    </label>

                    {!reportFile ? (
                      <div
                        style={{
                          border: "2px dashed #cbd5e1",
                          borderRadius: "10px",
                          padding: "20px",
                          textAlign: "center",
                          background: "#f8fafc",
                          cursor: "pointer",
                          transition: "border-color 0.2s"
                        }}
                        onClick={() => document.getElementById("baReportFileInput")?.click()}
                      >
                        <Upload size={28} color="#6366f1" style={{ marginBottom: "6px" }} />
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)" }}>
                          Click to Browse or Drag & Drop Report File
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                          Supports PDF, DOCX, XLSX, CSV, PNG, JPG (Max 10MB)
                        </div>
                        <input
                          id="baReportFileInput"
                          type="file"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "#e0e7ff",
                          border: "1px solid #c7d2fe",
                          padding: "12px 16px",
                          borderRadius: "10px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <FileText size={22} color="#4f46e5" />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e1b4b" }}>
                              {reportFile.fileName}
                            </div>
                            <div style={{ fontSize: "11px", color: "#4338ca" }}>
                              {reportFile.fileSize}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReportFile(null)}
                          style={{
                            background: "#fee2e2",
                            border: "none",
                            color: "#ef4444",
                            padding: "6px",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                          title="Remove file"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Send}
                    disabled={isSubmitting}
                    style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "15px" }}
                  >
                    {isSubmitting ? "Dispatching Report to PM..." : "Send Analysis Report to Project Manager (PM)"}
                  </Button>
                </>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: View Full BA Analysis Report */}
      {viewingReport && (
        <Modal
          isOpen={Boolean(viewingReport)}
          onClose={() => setViewingReport(null)}
          title={`BA Analysis Report: ${viewingReport.reportTitle || viewingReport.ideaTitle}`}
          footer={
            <Button variant="primary" onClick={() => setViewingReport(null)}>
              Close
            </Button>
          }
        >
          <div className="modal-details-stack">
            <div className="auth-options-row">
              <span className="category-chip-indigo" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <User size={13} /> Approved by BA: {viewingReport.baName}
              </span>
              <span className="table-badge badge-approved" style={{ background: "#e0e7ff", color: "#4338ca" }}>
                Status: {viewingReport.status}
              </span>
            </div>

            <div>
              <h4 className="modal-detail-title">Proposal Title</h4>
              <p className="modal-detail-text" style={{ fontWeight: "700", color: "var(--text-dark)" }}>
                {viewingReport.ideaTitle}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>ESTIMATED COST</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-dark)" }}>{viewingReport.estimatedCost || "N/A"}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)" }}>PROJECTED ANNUAL ROI</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#16a34a" }}>{viewingReport.projectedRoi || "N/A"}</div>
              </div>
            </div>

            <div>
              <h4 className="modal-detail-title">Executive Summary & Commercial Analysis</h4>
              <p className="modal-detail-text" style={{ whiteSpace: "pre-wrap" }}>
                {viewingReport.summary || "No executive summary provided."}
              </p>
            </div>

            {/* Attached File View */}
            {viewingReport.attachment && (
              <div>
                <h4 className="modal-detail-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Paperclip size={14} /> Attached Analysis Report Document
                </h4>
                <div className="attachment-view-card" style={{ marginTop: "6px" }}>
                  <div className="attachment-view-left">
                    <div className="attachment-pdf-big-icon">
                      <FileText size={24} color="#4f46e5" />
                    </div>
                    <div className="attachment-file-info">
                      <span className="attachment-file-name">{viewingReport.attachment.fileName}</span>
                      <span className="attachment-file-meta">{viewingReport.attachment.fileSize}</span>
                    </div>
                  </div>
                  <a
                    href={viewingReport.attachment.fileData}
                    download={viewingReport.attachment.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment-download-btn"
                  >
                    <Download size={14} /> Download File
                  </a>
                </div>
              </div>
            )}

            {viewingReport.pmNotes && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px" }}>
                <h4 className="modal-detail-title" style={{ color: "#16a34a" }}>PM Feedback / Notes</h4>
                <p className="modal-detail-text" style={{ color: "#15803d" }}>
                  {viewingReport.pmNotes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default BusinessAnalysis;
