import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Eye,
  Inbox
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

function InitialScreening() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'Passed' | 'Info Requested' | 'Rejected'

  useEffect(() => {
    setIdeas(getSubmittedIdeas());
  }, []);

  // Dynamic Metrics
  const totalQueue = ideas.length;
  const passedCount = ideas.filter((i) => i.status.includes("Passed") || i.status.includes("Approved")).length;
  const infoCount = ideas.filter((i) => i.status === "Information Requested").length;
  const rejectedCount = ideas.filter((i) => i.status.includes("Rejected")).length;

  // Filtered List based on clicked Stat Card
  const displayedIdeas = ideas.filter((item) => {
    if (filterMode === "Passed") return item.status.includes("Passed") || item.status.includes("Approved");
    if (filterMode === "Info Requested") return item.status === "Information Requested";
    if (filterMode === "Rejected") return item.status.includes("Rejected");
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Initial Screening & Validation Panel</h1>
            <span
              style={{
                background: "var(--primary-light)",
                color: "var(--primary)",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Filter size={14} /> Stage 1 Evaluation
            </span>
          </div>
          <p>Click on any KPI card below to filter ideas. Once an idea is screened, its status is displayed and "Start Screening" button is hidden.</p>
        </div>
      </div>

      {/* 4 Clickable KPI Cards for Screening Metrics */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: In Screening Queue */}
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view All Screening Queue Items"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">In Screening Queue</span>
            <div className="kpi-icon-pill pill-purple">
              <Filter size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{totalQueue}</span>
        </div>

        {/* Card 2: Passed Screening */}
        <div
          className={`kpi-mini-card ${filterMode === "Passed" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Passed")}
          style={{ cursor: "pointer", border: filterMode === "Passed" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Passed Screening Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Passed Screening</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{passedCount}</span>
        </div>

        {/* Card 3: Info Requested */}
        <div
          className={`kpi-mini-card ${filterMode === "Info Requested" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Info Requested")}
          style={{ cursor: "pointer", border: filterMode === "Info Requested" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
          title="Click to view Info Requested Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Info Requested</span>
            <div className="kpi-icon-pill pill-amber">
              <AlertCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{infoCount}</span>
        </div>

        {/* Card 4: Rejected in Screening */}
        <div
          className={`kpi-mini-card ${filterMode === "Rejected" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Rejected")}
          style={{ cursor: "pointer", border: filterMode === "Rejected" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
          title="Click to view Rejected Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected in Screening</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{rejectedCount}</span>
        </div>
      </div>

      {/* Screening Queue Table */}
      <Card
        title={`Initial Screening Queue (${filterMode.toUpperCase()})`}
        subtitle="Validate incoming innovation submissions. Completed evaluations display current status."
      >
        {/* Quick Filter Bar */}
        <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Active Filter:</span>
          {[
            { id: "all", label: "All Items" },
            { id: "Passed", label: "Passed Screening" },
            { id: "Info Requested", label: "Info Requested" },
            { id: "Rejected", label: "Rejected" }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterMode(m.id)}
              style={{
                background: filterMode === m.id ? "var(--primary)" : "#f1f5f9",
                color: filterMode === m.id ? "#ffffff" : "var(--text-dark)",
                border: "none",
                padding: "4px 12px",
                borderRadius: "14px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea Title</th>
                <th>Category</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Current Status</th>
                <th>Screening Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedIdeas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>
                    <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No submissions found for "{filterMode}" filter</span>
                      <span className="empty-state-sub">Select another status card above to view submissions.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedIdeas.map((item) => {
                  const isPassed = item.status.includes("Passed") || item.status.includes("Approved");
                  const isRejected = item.status.includes("Rejected");
                  const isInfoReq = item.status === "Information Requested";
                  const isScreeningDone = isPassed || isRejected || isInfoReq;

                  return (
                    <tr key={item.id}>
                      <td className="table-idea-title">{item.title}</td>
                      <td>
                        <span
                          style={{
                            background: "#e0e7ff",
                            color: "#4338ca",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: "600"
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td>{item.author}</td>
                      <td>{item.date}</td>
                      <td>
                        <span
                          className={`table-badge ${
                            isPassed
                              ? "badge-approved"
                              : isRejected
                              ? "badge-rejected"
                              : isInfoReq
                              ? "badge-review"
                              : "badge-review"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {/* IF REJECTED: Hide Start Screening button, show Rejected status text */}
                        {isRejected ? (
                          <span style={{ color: "var(--danger)", fontSize: "13px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <XCircle size={15} /> Screening Rejected
                          </span>
                        ) : isPassed ? (
                          /* IF PASSED: Hide Start Screening button, show Passed Status & View Button */
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ color: "var(--success)", fontSize: "13px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle2 size={15} /> Passed Screening
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Eye}
                              onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                              title="View Screening Evaluation"
                            >
                              View Details
                            </Button>
                          </div>
                        ) : isInfoReq ? (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={AlertCircle}
                            onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                          >
                            Update Info
                          </Button>
                        ) : (
                          /* ONLY SHOW "Start Screening" FOR PENDING IDEAS */
                          <Button
                            size="sm"
                            variant="primary"
                            icon={FileCheck}
                            onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                          >
                            Start Screening
                          </Button>
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
    </div>
  );
}

export default InitialScreening;
