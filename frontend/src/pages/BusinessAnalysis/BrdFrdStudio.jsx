import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Briefcase,
  FileCode,
  Inbox
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas, getSubmittedAnalysisReports } from "../../utils/ideaStorage";

function BrdFrdStudio() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIdeas(getSubmittedIdeas());
    setReports(getSubmittedAnalysisReports());
  }, []);

  const displayedReports = reports.filter((r) => {
    return (
      (r.reportTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.ideaTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.baName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>BRD & FRD Document Studio</h1>
            <span className="category-chip-indigo">
              <FileText size={14} /> Requirements Engineering
            </span>
          </div>
        </div>

        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search BRDs, FRDs, proposal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      <Card title={`BRD & FRD Specifications Repository (${displayedReports.length})`}>
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Proposal Mapping</th>
                <th>Author BA</th>
                <th>Version</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedReports.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "28px" }}>
                    <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No BRD/FRD documents created yet</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedReports.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>{r.reportTitle || "BRD Document"}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>Created: {r.date}</div>
                    </td>
                    <td><span className="category-chip">{r.ideaTitle}</span></td>
                    <td><strong>{r.baName}</strong></td>
                    <td><span style={{ fontSize: "11px", fontWeight: "700", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>v1.0 Final</span></td>
                    <td><span className="table-badge badge-approved">{r.status}</span></td>
                    <td>
                      <Button size="sm" variant="primary" icon={Eye} onClick={() => navigate("/business-analysis")}>
                        View Requirements
                      </Button>
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

export default BrdFrdStudio;
