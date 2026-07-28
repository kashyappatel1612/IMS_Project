import { useState, useEffect } from "react";
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
import { fetchAllIdeas, fetchAnalysisReports } from "../../services/api";

function BusinessAnalysis() {
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [viewingReport, setViewingReport] = useState(null);

  // Form State
  const [baName, setBaName] = useState("Ayushman Raj");
  const [baEmail, setBaEmail] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [projectedRoi, setProjectedRoi] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Read logged-in user profile
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.username) setBaName(u.username);
        if (u.email) setBaEmail(u.email);
      } catch (e) {
        console.error(e);
      }
    }

    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const apiIdeas = await fetchAllIdeas();
      if (apiIdeas && apiIdeas.length > 0) {
        setIdeas(apiIdeas);
      } else {
        setIdeas(getSubmittedIdeas());
      }
    } catch (err) {
      setIdeas(getSubmittedIdeas());
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
          <p>Upload comprehensive business case reports, financial ROI projections, and submit directly to Project Manager (PM).</p>
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

      {/* Main Grid: Upload Form (Left) & Reports Table (Right) */}
      <div className="screening-workspace-grid">
        {/* LEFT COLUMN: Upload Analysis Report Form */}
        <div className="screening-left-col">
          <Card
            title="1. Upload & Send Analysis Report to PM"
            subtitle="Fill BA details, attach analysis document & dispatch to Project Manager"
          >
            <form onSubmit={handleSubmitReport} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Select Idea Dropdown */}
              <div className="input-field-group">
                <label className="input-label">Select Proposal / Idea to Analyze</label>
                <select
                  className="custom-input-elem"
                  value={selectedIdeaId}
                  onChange={(e) => handleIdeaSelect(e.target.value)}
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  <option value="">-- Choose Proposal from Innovation Queue --</option>
                  {ideas.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} [{item.category}] — Current: {item.status}
                    </option>
                  ))}
                </select>
              </div>

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
                  label="BA Email Address"
                  placeholder="e.g. ba@company.com"
                  icon={Mail}
                  value={baEmail}
                  onChange={(e) => setBaEmail(e.target.value)}
                />
              </div>

              {/* Report Title */}
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
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: Submitted Analysis Reports Table */}
        <div className="screening-right-col">
          <Card
            title={`2. Submitted Analysis Reports (${reports.length})`}
            subtitle="Track reports dispatched to Project Manager & current approval status"
          >
            <div className="data-table-wrapper">
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Proposal / Report Title</th>
                    <th>Prepared & Approved By</th>
                    <th>Financial ROI</th>
                    <th>Current Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-state-cell">
                        <div className="empty-state-flex" style={{ padding: "28px 0" }}>
                          <Inbox size={32} color="var(--text-light)" />
                          <span className="empty-state-title">No Analysis Reports Uploaded Yet</span>
                          <span className="empty-state-sub">Use the form on the left to upload & send an analysis report to PM.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reports.map((rep) => {
                      const isBaApproved = rep.status.includes("Approved by BA");
                      const isPmAccepted = rep.status.includes("Accepted by PM") || rep.status.includes("Execution");

                      return (
                        <tr key={rep.id}>
                          <td>
                            <div style={{ fontWeight: "700", color: "var(--text-dark)" }}>
                              {rep.reportTitle || rep.ideaTitle}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                              Idea: {rep.ideaTitle} • {rep.date}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                background: "#f1f5f9",
                                padding: "3px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}
                            >
                              <User size={12} color="#6366f1" /> BA: {rep.baName}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>
                              {rep.projectedRoi || "N/A"}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              Cost: {rep.estimatedCost || "N/A"}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`table-badge ${
                                isPmAccepted
                                  ? "badge-approved"
                                  : isBaApproved
                                  ? "badge-approved"
                                  : "badge-review"
                              }`}
                              style={{
                                background: isBaApproved ? "#e0e7ff" : undefined,
                                color: isBaApproved ? "#4338ca" : undefined
                              }}
                            >
                              {rep.status}
                            </span>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Eye}
                              onClick={() => setViewingReport(rep)}
                            >
                              View Report
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
        </div>
      </div>

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
