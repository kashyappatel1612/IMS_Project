import { useState, useEffect } from "react";
import { fetchAnalysisReports } from "../../services/api";
import { getSubmittedAnalysisReports } from "../../utils/ideaStorage";
import { Eye, Inbox, User, Briefcase, CheckCircle2 } from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";

function SubmittedAnalysisReports() {
  const [reports, setReports] = useState([]);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Submitted Analysis Reports</h1>
            <span className="mode-badge-green" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
              <Briefcase size={14} /> Stage 3 Reports Tracker
            </span>
          </div>
        </div>
      </div>

      <Card
        title={`Submitted Analysis Reports (${reports.length})`}
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
                      <span className="empty-state-title">No Analysis Reports Dispatched Yet</span>
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
          <div className="modal-details-stack" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <span className="category-chip-indigo" style={{ display: "flex", alignItems: "center", gap: "4px", background: "#eeeffe", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", color: "#6366f1" }}>
                <User size={13} /> Approved by BA: {viewingReport.baName}
              </span>
              <span className="table-badge badge-approved" style={{ background: "#e0e7ff", color: "#4338ca", padding: "4px 10px", borderRadius: "12px", fontSize: "12px" }}>
                Status: {viewingReport.status}
              </span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Estimated Cost</span>
                <div style={{ fontWeight: "700", color: "#e11d48" }}>{viewingReport.estimatedCost || "N/A"}</div>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Projected ROI</span>
                <div style={{ fontWeight: "700", color: "#16a34a" }}>{viewingReport.projectedRoi || "N/A"}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11.5px", fontWeight: "700", display: "block", marginBottom: "4px" }}>Executive Summary & Requirements Notes</span>
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "13px", whiteSpace: "pre-wrap", border: "1px solid #e2e8f0", maxHeight: "200px", overflowY: "auto" }}>
                {viewingReport.summary}
              </div>
            </div>

            {viewingReport.attachment && (
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "700", display: "block", marginBottom: "6px" }}>Attachment File</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fdf4", padding: "8px 12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#16a34a" }}>{viewingReport.attachment.fileName} ({viewingReport.attachment.fileSize})</span>
                  <a href={viewingReport.attachment.fileData} download={viewingReport.attachment.fileName} style={{ textDecoration: "none" }}>
                    <Button size="sm" variant="outline">Download</Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SubmittedAnalysisReports;
