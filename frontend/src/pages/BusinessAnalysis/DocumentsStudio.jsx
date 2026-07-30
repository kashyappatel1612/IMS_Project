import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  FileText,
  Download,
  Eye,
  Inbox,
  Search,
  Upload
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedAnalysisReports } from "../../utils/ideaStorage";

function DocumentsStudio() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setReports(getSubmittedAnalysisReports());
  }, []);

  const displayedDocs = reports.filter((r) => {
    return (
      (r.reportTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.ideaTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Business Documents Repository</h1>
            <span className="category-chip-indigo">
              <Folder size={14} /> Document Management
            </span>
          </div>
          <p>Centralized repository of attached BRD, FRD, and business feasibility documents.</p>
        </div>

        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      <Card title={`Requirements Documents & Attachments (${displayedDocs.length})`} subtitle="Download and inspect attached PDF specs and Excel models">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Document File & Title</th>
                <th>Proposal Mapping</th>
                <th>Author BA</th>
                <th>Status</th>
                <th>Download Link</th>
              </tr>
            </thead>
            <tbody>
              {displayedDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)", padding: "28px" }}>
                    <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No attached documents found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedDocs.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FileText size={20} color="#4f46e5" />
                        <div>
                          <div style={{ fontWeight: "700", color: "#1e293b" }}>{r.reportTitle || "Requirements Document"}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>Uploaded: {r.date}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="category-chip">{r.ideaTitle}</span></td>
                    <td><strong>{r.baName}</strong></td>
                    <td><span className="table-badge badge-approved">{r.status}</span></td>
                    <td>
                      {r.attachment ? (
                        <a
                          href={r.attachment.fileData}
                          download={r.attachment.fileName}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#4f46e5", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <Download size={14} /> Download ({r.attachment.fileSize})
                        </a>
                      ) : (
                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>No file attached</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default DocumentsStudio;
