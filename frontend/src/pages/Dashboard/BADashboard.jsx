import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  TrendingUp,
  FileText,
  DollarSign,
  Calculator,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Eye,
  Inbox,
  Sparkles,
  PieChart,
  Briefcase,
  Upload,
  Paperclip,
  Send,
  Download
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { fetchAllIdeas, fetchAnalysisReports } from "../../services/api";
import {
  getSubmittedIdeas,
  getSubmittedAnalysisReports,
  saveAnalysisReport
} from "../../utils/ideaStorage";

function BADashboard({ userName }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [filterMode, setFilterMode] = useState("all");

  // Modal Upload Form State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [baNameInput, setBaNameInput] = useState(userName || "Ayushman Raj");
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
  }, [userName]);

  const loadData = async () => {
    try {
      const backendIdeas = await fetchAllIdeas();
      if (backendIdeas && backendIdeas.length > 0) {
        setIdeas(backendIdeas);
      } else {
        setIdeas(getSubmittedIdeas());
      }
    } catch (err) {
      setIdeas(getSubmittedIdeas());
    }

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

  // Filter proposals for BA queue
  const baQueue = ideas.filter(
    (i) =>
      i.status.includes("Feasibility Approved") ||
      i.status.includes("Business Analysis") ||
      i.status.includes("Approved by BA") ||
      i.status.includes("Estimation")
  );

  const displayedQueue = baQueue.filter((item) => {
    if (filterMode === "pending") return item.status.includes("Feasibility Approved");
    if (filterMode === "completed") return item.status.includes("Approved by BA") || item.status.includes("Business Analysis");
    return true; // 'all'
  });

  const handleIdeaSelect = (ideaId) => {
    setSelectedIdeaId(ideaId);
    const found = ideas.find((i) => String(i.id) === String(ideaId));
    if (found) {
      setReportTitle(`BA Feasibility Report - ${found.title}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit!");
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
      alert("Please fill all required fields (BA Name, Report Title, Summary)!");
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
      estimatedCost: estimatedCost.trim() || "$25,000",
      projectedRoi: projectedRoi.trim() || "300% Annual ROI",
      attachment: reportFile
    };

    try {
      const updated = await saveAnalysisReport(payload);
      setReports(updated || getSubmittedAnalysisReports());
      alert(`Report sent to Project Manager successfully! Status: Approved by BA: ${baNameInput.trim()}`);
      setShowUploadModal(false);
      setSummary("");
      setEstimatedCost("");
      setProjectedRoi("");
      setReportFile(null);
      setSelectedIdeaId("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to upload report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* BA Executive Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Business Analyst Portal</h1>
            <span className="mode-badge-green" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
              <Briefcase size={14} /> Business Analyst Mode ({userName || "BA Leader"})
            </span>
          </div>
          <p>Assess commercial viability, create feasibility reports, and send analysis directly to Project Manager (PM).</p>
        </div>

        <div className="quick-actions-flex">
          <Button
            variant="primary"
            icon={Upload}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Analysis Report to PM
          </Button>
          <Button
            variant="ghost"
            icon={BarChart}
            onClick={() => navigate("/business-analysis")}
          >
            Open BA Workspace
          </Button>
        </div>
      </div>

      {/* 4 Clickable BA Metric KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: BA Queue */}
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view All Proposals in BA Queue"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">BA Proposals Queue</span>
            <div className="kpi-icon-pill pill-purple">
              <BarChart size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{baQueue.length}</span>
        </div>

        {/* Card 2: Reports Sent to PM */}
        <div
          className={`kpi-mini-card ${filterMode === "completed" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("completed")}
          style={{ cursor: "pointer", border: filterMode === "completed" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Reports Sent to PM"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Reports Sent to PM</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{reports.length}</span>
        </div>

        {/* Card 3: Pending BA Cases */}
        <div
          className={`kpi-mini-card ${filterMode === "pending" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("pending")}
          style={{ cursor: "pointer", border: filterMode === "pending" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
          title="Click to view Pending Business Cases"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending BA Analysis</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {baQueue.filter((i) => i.status.includes("Feasibility Approved")).length}
          </span>
        </div>

        {/* Card 4: Cost Estimation */}
        <div
          className="kpi-mini-card"
          onClick={() => navigate("/estimation")}
          style={{ cursor: "pointer", border: "1px solid #e2e8f0" }}
          title="Click to open Cost Estimation module"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Cost & Effort Estimator</span>
            <div className="kpi-icon-pill pill-blue">
              <Calculator size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ fontSize: "16px", color: "var(--primary)", fontWeight: "700" }}>
            Open Estimator →
          </span>
        </div>
      </div>

      {/* SECTION 1: Reports Uploaded & Sent to PM */}
      <Card
        title={`BA Analysis Reports Prepared & Sent to PM (${reports.length})`}
        subtitle="Reports uploaded by Business Analysts and sent to Project Manager with 'Approved by BA' status"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Report Title / Proposal</th>
                <th>Approved & Prepared By</th>
                <th>Financial Projections</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No Analysis Reports Uploaded Yet</span>
                      <span className="empty-state-sub">Click "Upload Analysis Report to PM" above to send your report.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: "700", color: "var(--text-dark)" }}>{r.reportTitle || r.ideaTitle}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Proposal: {r.ideaTitle} • {r.date}</div>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                        BA: {r.baName}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>{r.projectedRoi || "N/A"}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cost: {r.estimatedCost || "N/A"}</div>
                    </td>
                    <td>
                      <span className="table-badge badge-approved" style={{ background: "#e0e7ff", color: "#4338ca" }}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Eye}
                        onClick={() => setViewingReport(r)}
                      >
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ height: "20px" }}></div>

      {/* SECTION 2: Feasible Proposals Queue */}
      <Card
        title={`Proposals Queue in BA Pipeline (${filterMode.toUpperCase()})`}
        subtitle="Proposals approved in Feasibility Review ready for Business Analysis & ROI Modeling"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea Title</th>
                <th>Category / Domain</th>
                <th>Submitted By</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No proposals found for "{filterMode}" filter</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedQueue.map((item) => (
                  <tr key={item.id}>
                    <td className="table-idea-title">{item.title}</td>
                    <td>
                      <span className="category-chip">{item.category}</span>
                    </td>
                    <td>{item.author}</td>
                    <td>
                      <span className="table-badge badge-approved">{item.status}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Upload}
                          onClick={() => {
                            setSelectedIdeaId(item.id);
                            setReportTitle(`BA Analysis Report - ${item.title}`);
                            setShowUploadModal(true);
                          }}
                        >
                          Upload Report
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={BarChart}
                          onClick={() => navigate("/business-analysis")}
                        >
                          Full Workspace
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: Upload Analysis Report */}
      {showUploadModal && (
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload & Send Analysis Report to Project Manager (PM)"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleUploadSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Report to PM"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Select Proposal / Idea *</span>
                <span style={{ fontSize: "11px", color: "#6366f1", fontWeight: "700" }}>✓ Feasibility Passed Only ({baQueue.length})</span>
              </label>
              <select
                className="custom-input-elem"
                value={selectedIdeaId}
                onChange={(e) => handleIdeaSelect(e.target.value)}
                required
              >
                <option value="">-- Choose Proposal (Feasibility Passed) --</option>
                {baQueue.length === 0 ? (
                  <option value="" disabled>-- No proposals currently passed Stage 2 Feasibility Review --</option>
                ) : (
                  baQueue.map((i) => (
                    <option key={i.id} value={i.id}>{i.title} [{i.category}] — Status: {i.status}</option>
                  ))
                )}
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
                <label className="input-label">Report Title *</label>
                <input
                  className="custom-input-elem"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Financial Feasibility Analysis"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="input-field-group">
                <label className="input-label">Estimated Cost</label>
                <input
                  className="custom-input-elem"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="e.g. $35,000"
                />
              </div>
              <div className="input-field-group">
                <label className="input-label">Projected Annual ROI</label>
                <input
                  className="custom-input-elem"
                  value={projectedRoi}
                  onChange={(e) => setProjectedRoi(e.target.value)}
                  placeholder="e.g. 280% ROI"
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label">Executive Summary & ROI Notes *</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Enter financial analysis summary for PM review..."
                required
              ></textarea>
            </div>

            <div className="input-field-group">
              <label className="input-label">Attach Report File (PDF, DOCX, XLSX)</label>
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

      {/* MODAL: View Analysis Report Details */}
      {viewingReport && (
        <Modal
          isOpen={Boolean(viewingReport)}
          onClose={() => setViewingReport(null)}
          title={`BA Report: ${viewingReport.reportTitle || viewingReport.ideaTitle}`}
          footer={<Button variant="primary" onClick={() => setViewingReport(null)}>Close</Button>}
        >
          <div className="modal-details-stack">
            <div className="auth-options-row">
              <span className="category-chip-indigo">Approved by BA: {viewingReport.baName}</span>
              <span className="table-badge badge-approved" style={{ background: "#e0e7ff", color: "#4338ca" }}>{viewingReport.status}</span>
            </div>
            <div>
              <h4 className="modal-detail-title">Proposal Title</h4>
              <p className="modal-detail-text">{viewingReport.ideaTitle}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
              <div><strong>Cost:</strong> {viewingReport.estimatedCost || "N/A"}</div>
              <div><strong>ROI:</strong> <span style={{ color: "#16a34a", fontWeight: "700" }}>{viewingReport.projectedRoi || "N/A"}</span></div>
            </div>
            <div>
              <h4 className="modal-detail-title">Summary Notes</h4>
              <p className="modal-detail-text">{viewingReport.summary}</p>
            </div>
            {viewingReport.attachment && (
              <div>
                <h4 className="modal-detail-title">Attached File</h4>
                <a href={viewingReport.attachment.fileData} download={viewingReport.attachment.fileName} target="_blank" rel="noreferrer" style={{ color: "#4f46e5", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Download size={14} /> Download {viewingReport.attachment.fileName} ({viewingReport.attachment.fileSize})
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default BADashboard;
