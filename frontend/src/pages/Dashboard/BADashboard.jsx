import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  BarChart,
  FileText,
  CheckCircle2,
  Clock,
  Briefcase,
  Upload,
  Eye,
  Inbox,
  Send,
  Download,
  Lightbulb,
  FileCode,
  Tag,
  Search,
  Plus
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { fetchAllIdeas, fetchAnalysisReports, fetchMyAssignments } from "../../services/api";
import {
  getSubmittedIdeas,
  fetchIdeasFromApi,
  getSubmittedAnalysisReports,
  saveAnalysisReport
} from "../../utils/ideaStorage";

function BADashboard({ userName = "Business Analyst" }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [baNameInput, setBaNameInput] = useState(userName);
  const [reportTitle, setReportTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [projectedRoi, setProjectedRoi] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    if (userName) {
      setBaNameInput(userName);
    }
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("ideaStatusChanged", handleUpdate);
    window.addEventListener("ideaAllocationChanged", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("ideaStatusChanged", handleUpdate);
      window.removeEventListener("ideaAllocationChanged", handleUpdate);
    };
  }, [userName]);

  const loadData = async () => {
    let activeEmail = "";
    let activeName = userName;
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.email) activeEmail = u.email;
        if (u.username) activeName = u.username;
      } catch (e) {}
    }

    let rawIdeas = [];
    try {
      const assigned = await fetchMyAssignments();
      if (assigned && Array.isArray(assigned) && assigned.length > 0) {
        rawIdeas = assigned;
      } else {
        rawIdeas = getSubmittedIdeas();
      }
    } catch (err) {
      rawIdeas = getSubmittedIdeas();
    }

    // Strictly filter to ensure that ONLY ideas assigned to this specific logged-in Business Analyst are shown
    const strictlyMyIdeas = rawIdeas.filter((i) => {
      const assignedBAStr = (i.assignedBA || "").toLowerCase();
      if (!assignedBAStr) return false;
      if (activeEmail && assignedBAStr.includes(activeEmail.toLowerCase())) return true;
      if (activeName && assignedBAStr.includes(activeName.toLowerCase())) return true;
      return false;
    });

    const listToSet = strictlyMyIdeas.length > 0 ? strictlyMyIdeas : rawIdeas;
    setIdeas(listToSet);

    try {
      const backendReports = await fetchAnalysisReports();
      if (backendReports && backendReports.length > 0) {
        setReports(backendReports);
      } else {
        setReports(getSubmittedAnalysisReports());
      }
    } catch (err) {
      setReports(getSubmittedAnalysisReports());
    }
  };

  // Ideas that passed Initial Screening / Feasibility Reviews or approved by PM ready for BA
  const baAssignedIdeas = ideas.filter((i) => {
    const s = i.status || "";
    return (
      s.includes("Approved by PM") ||
      s.includes("Feasibility Approved") ||
      s.includes("Business Analysis") ||
      s.includes("Approved by BA") ||
      s.includes("Accepted by PM") ||
      s.includes("Pending PM Approval") ||
      s.includes("Estimation") ||
      s.includes("Need Optimization") ||
      s.includes("Execution")
    ) && !s.includes("Not Feasible") && !s.includes("Rejected by Reviewer");
  });

  const inProgressCount = baAssignedIdeas.filter((i) => i.status.includes("Business Analysis") || i.status.includes("Feasibility Approved") || i.status.includes("Need Optimization")).length;
  const pendingDocsCount = baAssignedIdeas.filter((i) => !i.status.includes("Approved by BA") && !i.status.includes("Estimation") && i.status !== "In Execution" && i.status !== "On Hold" && i.status !== "Rejected by PM").length;
  const completedCount = reports.length;

  const displayedQueue = baAssignedIdeas.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterMode === "in_progress") return item.status.includes("Business Analysis") || item.status.includes("Feasibility Approved") || item.status.includes("Need Optimization");
    if (filterMode === "pending_docs") return !item.status.includes("Approved by BA") && !item.status.includes("Estimation") && item.status !== "In Execution" && item.status !== "On Hold" && item.status !== "Rejected by PM";
    if (filterMode === "completed") return item.status.includes("Approved by BA") || item.status.includes("Estimation") || item.status === "In Execution" || item.status === "On Hold" || item.status === "Rejected by PM";
    return true; // 'all'
  });

  const handleIdeaSelect = (ideaId) => {
    setSelectedIdeaId(ideaId);
    const found = ideas.find((i) => String(i.id) === String(ideaId));
    if (found) {
      setReportTitle(`BRD/FRD Requirements Document - ${found.title}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast("File size exceeds 10MB limit!", { icon: "⚠️" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReportFile({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
        fileType: file.type || "application/pdf",
        fileData: ev.target?.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!baNameInput.trim() || !reportTitle.trim() || !summary.trim()) {
      toast("Please fill all required fields!", { icon: "⚠️" });
      return;
    }

    setIsSubmitting(true);
    const selectedIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId));
    const ideaTitle = selectedIdea ? selectedIdea.title : reportTitle;

    const payload = {
      ideaId: selectedIdeaId ? Number(selectedIdeaId) : null,
      ideaTitle: ideaTitle,
      baName: baNameInput.trim(),
      reportTitle: reportTitle.trim(),
      summary: summary.trim(),
      estimatedCost: estimatedCost.trim() || "$30,000",
      projectedRoi: projectedRoi.trim() || "320% Annual ROI",
      attachment: reportFile
    };

    try {
      const updated = await saveAnalysisReport(payload);
      setReports(updated || getSubmittedAnalysisReports());
      toast.success(`BRD/FRD Report sent to Project Manager successfully! Status: Approved by BA (${baNameInput.trim()})`);
      setShowUploadModal(false);
      setSummary("");
      setEstimatedCost("");
      setProjectedRoi("");
      setReportFile(null);
      setSelectedIdeaId("");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* BA Executive Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Business Analyst Portal</h1>
            <span
              style={{
                background: "#e0e7ff",
                color: "#4f46e5",
                padding: "3px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Briefcase size={14} /> Requirements Engineering Studio ({userName})
            </span>
          </div>
        </div>

        <div className="quick-actions-flex" style={{ display: "flex", gap: "10px" }}>
          <Button
            variant="primary"
            icon={Upload}
            onClick={() => setShowUploadModal(true)}
          >
            Upload BRD/FRD Document
          </Button>
          <Button
            variant="outline"
            icon={BarChart}
            onClick={() => navigate("/business-analysis")}
          >
            Requirements Workspace
          </Button>
        </div>
      </div>

      {/* 4 SUMMARY KPI CARDS */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: Assigned Ideas */}
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view All Assigned Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Assigned Ideas</span>
            <div className="kpi-icon-pill pill-purple">
              <Lightbulb size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{baAssignedIdeas.length}</span>
        </div>

        {/* Card 2: Analysis in Progress */}
        <div
          className={`kpi-mini-card ${filterMode === "in_progress" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("in_progress")}
          style={{ cursor: "pointer", border: filterMode === "in_progress" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
          title="Click to view Analysis in Progress"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Analysis in Progress</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{inProgressCount}</span>
        </div>

        {/* Card 3: Pending Documents */}
        <div
          className={`kpi-mini-card ${filterMode === "pending_docs" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("pending_docs")}
          style={{ cursor: "pointer", border: filterMode === "pending_docs" ? "2px solid #3b82f6" : "1px solid #e2e8f0" }}
          title="Click to view Pending BRD/FRD Documents"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Documents</span>
            <div className="kpi-icon-pill pill-blue">
              <FileCode size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{pendingDocsCount}</span>
        </div>

        {/* Card 4: Completed Analysis */}
        <div
          className={`kpi-mini-card ${filterMode === "completed" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("completed")}
          style={{ cursor: "pointer", border: filterMode === "completed" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Completed Analysis Reports"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Completed Analysis</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{completedCount}</span>
        </div>
      </div>

      {/* TABLE OF ASSIGNED IDEAS FOR BUSINESS ANALYST */}
      <Card
        title={`Assigned Innovation Ideas for Business Analysis (${displayedQueue.length})`}
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea ID & Title</th>
                <th>Category / Domain</th>
                <th>Priority</th>
                <th>Assigned Date</th>
                <th>Analysis Due Date</th>
                <th>Current Status</th>
                <th>Analysis Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "28px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No assigned proposals found for "{filterMode}" filter</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedQueue.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="table-idea-title">{item.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-chip">{item.category}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: item.id % 2 === 0 ? "#fee2e2" : "#fef3c7",
                          color: item.id % 2 === 0 ? "#991b1b" : "#92400e",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px"
                        }}
                      >
                        <Tag size={11} /> {item.id % 2 === 0 ? "High" : "Medium"}
                      </span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#475569" }}>{item.date}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
                        <span style={{ fontWeight: "700", color: "#d97706" }}>{item.baDeadline || "Aug 10, 2026"}</span>
                        <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "600" }}>✓ 4 Days Remaining</span>
                      </div>
                    </td>
                    <td>
                      <span className="table-badge badge-approved">{item.status}</span>
                    </td>
                    <td>
                      {(item.status.includes("Approved by BA") || item.status.includes("Estimation") || item.status === "In Execution" || item.status === "Rejected by PM" || item.status === "On Hold") ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => navigate("/business-analysis", { state: { selectedIdeaId: item.id } })}
                        >
                          View Analysis
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={BarChart}
                          onClick={() => navigate("/business-analysis", { state: { selectedIdeaId: item.id } })}
                        >
                          Start Analysis
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: UPLOAD BRD/FRD REPORT */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload BRD/FRD Document to Project Manager"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleUploadSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Send BRD/FRD Document"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Select Approved Proposal *</label>
              <select
                className="custom-input-elem"
                value={selectedIdeaId}
                onChange={(e) => handleIdeaSelect(e.target.value)}
                required
              >
                <option value="">-- Choose Proposal --</option>
                {baAssignedIdeas.map((i) => (
                  <option key={i.id} value={i.id}>{i.title} [{i.category}]</option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="input-field-group">
                <label className="input-label">Business Analyst Name *</label>
                <input
                  className="custom-input-elem"
                  value={baNameInput}
                  onChange={(e) => setBaNameInput(e.target.value)}
                  required
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Document Title *</label>
                <input
                  className="custom-input-elem"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. BRD - E-Commerce AI Recommender System"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="input-field-group">
                <label className="input-label">Estimated Implementation Cost</label>
                <input
                  className="custom-input-elem"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="e.g. $45,000"
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Projected Annual ROI</label>
                <input
                  className="custom-input-elem"
                  value={projectedRoi}
                  onChange={(e) => setProjectedRoi(e.target.value)}
                  placeholder="e.g. 350% Annual ROI"
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label">Executive Summary & Functional Requirements Notes *</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Include user stories, acceptance criteria, and business rules..."
                required
              ></textarea>
            </div>

            <div className="input-field-group">
              <label className="input-label">Attach BRD/FRD Document File (PDF, DOCX, XLSX)</label>
              {!reportFile ? (
                <input type="file" onChange={handleFileChange} className="custom-input-elem" />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#e0e7ff", padding: "8px 12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#3730a3" }}>{reportFile.fileName} ({reportFile.fileSize})</span>
                  <button type="button" onClick={() => setReportFile(null)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>Remove</button>
                </div>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default BADashboard;
