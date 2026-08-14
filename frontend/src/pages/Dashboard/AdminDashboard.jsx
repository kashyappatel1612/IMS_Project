import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  FolderKanban,
  PlayCircle,
  Eye,
  ShieldCheck,
  ArrowRight,
  Inbox,
  X,
  Check,
  Filter
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function AdminDashboard({ userName }) {
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [allIdeas, setAllIdeas] = useState([]);
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'Pending Review' | 'Approved' | 'Rejected' | 'Projects'

  useEffect(() => {
    setAllIdeas(getSubmittedIdeas());
  }, []);

  const handleStatCardClick = (mode) => {
    setFilterMode(mode);
    // Smooth scroll to table when a card is clicked
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleApproveIdea = (id) => {
    const updated = updateIdeaStatus(id, "Sent to Initial Screening");
    setAllIdeas(updated);
    toast.success(`Idea successfully Approved & Sent to Initial Screening!`);
  };

  const handleRejectIdea = (id) => {
    const updated = updateIdeaStatus(id, "Rejected", "Rejected by Admin");
    setAllIdeas(updated);
    toast.success(`Idea has been Rejected.`);
  };

  const handleViewIdea = (id) => {
    navigate("/initial-screening");
  };

  // Dynamic KPI Counts
  const totalSubmissions = allIdeas.length;
  const pendingCount = allIdeas.filter((i) => i.status === "Pending Review").length;
  const approvedCount = allIdeas.filter((i) => i.status.includes("Approved") || i.status.includes("Screening") || i.status.includes("Sent") || i.status.includes("Passed")).length;
  const rejectedCount = allIdeas.filter((i) => i.status === "Rejected" || i.status.includes("Rejected")).length;
  const totalProjects = allIdeas.filter((i) => i.status.includes("Passed") || i.status.includes("Approved") || i.status.includes("Sent")).length;
  const activeProjects = allIdeas.filter((i) => i.status.includes("Passed Initial Screening")).length;

  // Filtered Ideas based on clicked KPI Stat Card
  const displayedIdeas = allIdeas.filter((item) => {
    if (filterMode === "Pending Review") return item.status === "Pending Review";
    if (filterMode === "Approved") return item.status.includes("Approved") || item.status.includes("Screening") || item.status.includes("Sent") || item.status.includes("Passed");
    if (filterMode === "Rejected") return item.status === "Rejected" || item.status.includes("Rejected");
    if (filterMode === "Projects") return item.status.includes("Passed") || item.status.includes("Approved") || item.status.includes("Sent");
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* Executive Admin Panel Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Executive Admin Panel</h1>
          </div>
        </div>
      </div>

      {/* 6 Clickable Executive KPI Stat Cards */}
      <div className="kpi-6-grid" style={{ marginBottom: "20px" }}>
        {/* Card 1: Total Submissions */}
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => handleStatCardClick("all")}
          style={{
            cursor: "pointer",
            border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0",
            boxShadow: filterMode === "all" ? "0 0 0 3px rgba(99, 102, 241, 0.2)" : "none"
          }}
          title="Click to view All Submissions"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Total Submissions</span>
            <div className="kpi-icon-pill pill-purple">
              <Lightbulb size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{totalSubmissions}</span>
        </div>

        {/* Card 2: Pending Review */}
        <div
          className={`kpi-mini-card ${filterMode === "Pending Review" ? "active-kpi-ring" : ""}`}
          onClick={() => handleStatCardClick("Pending Review")}
          style={{
            cursor: "pointer",
            border: filterMode === "Pending Review" ? "2px solid #f59e0b" : "1px solid #e2e8f0",
            boxShadow: filterMode === "Pending Review" ? "0 0 0 3px rgba(245, 158, 11, 0.2)" : "none"
          }}
          title="Click to view Pending Review Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Review</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{pendingCount}</span>
        </div>

        {/* Card 3: Approved / Screening */}
        <div
          className={`kpi-mini-card ${filterMode === "Approved" ? "active-kpi-ring" : ""}`}
          onClick={() => handleStatCardClick("Approved")}
          style={{
            cursor: "pointer",
            border: filterMode === "Approved" ? "2px solid #22c55e" : "1px solid #e2e8f0",
            boxShadow: filterMode === "Approved" ? "0 0 0 3px rgba(34, 197, 94, 0.2)" : "none"
          }}
          title="Click to view Approved Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Approved / Screening</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{approvedCount}</span>
        </div>

        {/* Card 4: Rejected Ideas */}
        <div
          className={`kpi-mini-card ${filterMode === "Rejected" ? "active-kpi-ring" : ""}`}
          onClick={() => handleStatCardClick("Rejected")}
          style={{
            cursor: "pointer",
            border: filterMode === "Rejected" ? "2px solid #ef4444" : "1px solid #e2e8f0",
            boxShadow: filterMode === "Rejected" ? "0 0 0 3px rgba(239, 68, 68, 0.25)" : "none"
          }}
          title="Click to view Rejected Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected Ideas</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{rejectedCount}</span>
        </div>

        {/* Card 5: Total Projects */}
        <div
          className={`kpi-mini-card ${filterMode === "Projects" ? "active-kpi-ring" : ""}`}
          onClick={() => handleStatCardClick("Projects")}
          style={{
            cursor: "pointer",
            border: filterMode === "Projects" ? "2px solid #3b82f6" : "1px solid #e2e8f0",
            boxShadow: filterMode === "Projects" ? "0 0 0 3px rgba(59, 130, 246, 0.2)" : "none"
          }}
          title="Click to view Total Projects"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Total Projects</span>
            <div className="kpi-icon-pill pill-blue">
              <FolderKanban size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{totalProjects}</span>
        </div>

        {/* Card 6: Active Projects */}
        <div
          className={`kpi-mini-card ${filterMode === "Projects" ? "active-kpi-ring" : ""}`}
          onClick={() => handleStatCardClick("Projects")}
          style={{
            cursor: "pointer",
            border: filterMode === "Projects" ? "2px solid #6366f1" : "1px solid #e2e8f0",
            boxShadow: filterMode === "Projects" ? "0 0 0 3px rgba(99, 102, 241, 0.2)" : "none"
          }}
          title="Click to view Active Projects"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Active Projects</span>
            <div className="kpi-icon-pill pill-indigo">
              <PlayCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{activeProjects}</span>
        </div>
      </div>

      {/* DIRECTLY BELOW CARDS: Filtered Admin Submissions Table */}
      <div ref={tableRef}>
        <Card
          title={`Idea Submissions List (${filterMode.toUpperCase()})`}
        >
          <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Active Filter:</span>
            {[
              { id: "all", label: "All Submissions" },
              { id: "Pending Review", label: "Pending Review" },
              { id: "Approved", label: "Approved / Screening" },
              { id: "Rejected", label: "Rejected" },
              { id: "Projects", label: "Projects" }
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
                  <th>Action / Details</th>
                </tr>
              </thead>
              <tbody>
                {displayedIdeas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state-cell">
                      <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                        <Inbox size={32} color="var(--text-light)" />
                        <span className="empty-state-title">No submissions found for "{filterMode}" filter</span>
                        <span className="empty-state-sub">Select another filter card above to view submissions.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedIdeas.map((item) => {
                    const isApproved = (item.status.includes("Approved") || item.status.includes("Screening") || item.status.includes("Sent") || item.status.includes("Passed")) && !item.status.includes("Not ");
                    const isRejected = item.status === "Rejected" || item.status.includes("Rejected") || item.status.includes("Not ");

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
                        <td>{item.date || "Jul 28, 2026"}</td>
                        <td>
                          <span
                            className={`table-badge ${
                              isApproved
                                ? "badge-approved"
                                : isRejected
                                ? "badge-rejected"
                                : "badge-review"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Eye}
                            onClick={() => handleViewIdea(item.id)}
                            title="View Initial Screening & Details"
                          >
                            View Details
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

      <div style={{ height: "20px" }}></div>

      {/* Row 2: Visual Charts & Analytics */}
      <div className="dash-row-2col">
        <Card title="Company Ideas Overview">
          <div className="line-chart-box">
            <svg viewBox="0 0 500 200" className="line-chart-svg">
              <defs>
                <linearGradient id="adminPurpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="adminGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeDasharray="4" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeDasharray="4" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeDasharray="4" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="#f1f5f9" strokeDasharray="4" />

              <path
                d="M 40 140 C 90 100, 130 115, 180 80 C 230 110, 280 60, 330 90 C 380 50, 430 70, 480 65 L 480 170 L 40 170 Z"
                fill="url(#adminPurpleGrad)"
              />
              <path
                d="M 40 140 C 90 100, 130 115, 180 80 C 230 110, 280 60, 330 90 C 380 50, 430 70, 480 65"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
              />
            </svg>
          </div>
        </Card>

        <Card title="Idea Status Breakdown">
          <div className="donut-center-flex">
            <div className="donut-svg-box">
              <svg viewBox="0 0 100 100" className="donut-svg-elem">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="14" strokeDasharray="83.5 155.2" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="59.7 179" strokeDashoffset="-83.5" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="14" strokeDasharray="43 195.7" strokeDashoffset="-195.7" />
              </svg>
              <div className="donut-center-num">
                <span className="big">{totalSubmissions}</span>
                <span className="sub">Total</span>
              </div>
            </div>

            <div className="donut-legend-col">
              <div className="legend-row-item" onClick={() => handleStatCardClick("Approved")} style={{ cursor: "pointer" }}>
                <div className="legend-dot-label">
                  <span className="dot-color bg-green"></span>
                  <span>Approved / Screening</span>
                </div>
                <span>{approvedCount}</span>
              </div>
              <div className="legend-row-item" onClick={() => handleStatCardClick("Pending Review")} style={{ cursor: "pointer" }}>
                <div className="legend-dot-label">
                  <span className="dot-color bg-amber"></span>
                  <span>Pending Review</span>
                </div>
                <span>{pendingCount}</span>
              </div>
              <div className="legend-row-item" onClick={() => handleStatCardClick("Rejected")} style={{ cursor: "pointer" }}>
                <div className="legend-dot-label">
                  <span className="dot-color bg-red"></span>
                  <span>Rejected</span>
                </div>
                <span>{rejectedCount}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
