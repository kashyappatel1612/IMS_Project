import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Eye,
  Inbox,
  Clock,
  Timer,
  Search,
  ShieldCheck
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas, fetchIdeasFromApi } from "../../utils/ideaStorage";

function InitialScreening() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState("User");

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.role) setUserRole(u.role);
      } catch (err) {
        console.error(err);
      }
    }

    fetchIdeasFromApi().then((data) => {
      setIdeas(data || getSubmittedIdeas());
    });
  }, []);

  const isReviewer = userRole === "Reviewer";

  // Enterprise Dashboard Metrics
  const totalQueue = ideas.length;
  const passedCount = ideas.filter((i) => i.status.includes("Passed") || i.status.includes("Approved")).length;
  const infoCount = ideas.filter((i) => i.status === "Information Requested").length;
  const rejectedCount = ideas.filter((i) => i.status.includes("Rejected")).length;
  const pendingCount = totalQueue - (passedCount + rejectedCount);

  // Filtered List based on clicked Stat Card and Search Query
  const displayedIdeas = ideas.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(item.id).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterMode === "Passed") return item.status.includes("Passed") || item.status.includes("Approved");
    if (filterMode === "Info Requested") return item.status === "Information Requested";
    if (filterMode === "Rejected") return item.status.includes("Rejected");
    if (filterMode === "Pending") return !item.status.includes("Passed") && !item.status.includes("Approved") && !item.status.includes("Rejected");
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
                background: isReviewer ? "#ecfdf5" : "var(--primary-light)",
                color: isReviewer ? "#059669" : "var(--primary)",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              {isReviewer ? <ShieldCheck size={14} /> : <Filter size={14} />}
              {isReviewer ? "Reviewer Evaluator Workspace" : `Read-Only Status View (${userRole})`}
            </span>
          </div>
        </div>

        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search idea ID, title, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      {/* 5 Enterprise Dashboard Statistics Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "20px" }}>
        <div
          className={`kpi-mini-card ${filterMode === "Pending" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Pending")}
          style={{ cursor: "pointer", border: filterMode === "Pending" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
          title="Click to view Pending Screening Reviews"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Reviews</span>
            <div className="kpi-icon-pill pill-purple">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{pendingCount}</span>
        </div>

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

        <div
          className={`kpi-mini-card ${filterMode === "Rejected" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("Rejected")}
          style={{ cursor: "pointer", border: filterMode === "Rejected" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
          title="Click to view Rejected Ideas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected Proposals</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{rejectedCount}</span>
        </div>

        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Avg Screening Time</span>
            <div className="kpi-icon-pill pill-blue">
              <Timer size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#2563eb" }}>2.4 Days</span>
        </div>
      </div>

      {/* Screening Queue Table */}
      <Card title={`Initial Screening Pipeline Queue (${displayedIdeas.length})`}>
        {/* Quick Filter Bar */}
        <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Active Filter:</span>
          {[
            { id: "all", label: `All Items (${totalQueue})` },
            { id: "Pending", label: `Pending Reviews (${pendingCount})` },
            { id: "Passed", label: `Passed (${passedCount})` },
            { id: "Info Requested", label: `Info Requested (${infoCount})` },
            { id: "Rejected", label: `Rejected (${rejectedCount})` }
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
                <th>Idea ID & Title</th>
                <th>Domain Category</th>
                <th>Submitted By</th>
                <th>SLA Timer / Due Date</th>
                <th>Current Status</th>
                <th>Screening View / Action</th>
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

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span className="table-idea-title">{item.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-chip">{item.category}</span>
                      </td>
                      <td>{item.author || "User"}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
                          <span style={{ fontWeight: "700", color: "#d97706" }}>{item.reviewerDeadline || "Aug 05, 2026"}</span>
                          <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "600" }}>✓ 2 Days Remaining</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`table-badge ${
                            isPassed
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
                        {/* ONLY REVIEWERS GET THE "START SCREENING" EVALUATION BUTTON */}
                        {isReviewer ? (
                          isRejected ? (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ color: "var(--danger)", fontSize: "12px", fontWeight: "700" }}>Screening Rejected</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Eye}
                                onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          ) : isPassed ? (
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ color: "var(--success)", fontSize: "12px", fontWeight: "700" }}>Passed</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Eye}
                                onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                              >
                                View
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
                            <Button
                              size="sm"
                              variant="primary"
                              icon={FileCheck}
                              onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                            >
                              Start Screening
                            </Button>
                          )
                        ) : (
                          /* NON-REVIEWER ROLES (ADMIN, PC, BA, PM, USER) ONLY GET READ-ONLY VIEW */
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Eye}
                              onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                              title="View Screening Evaluation & Status Details"
                            >
                              View Status Details
                            </Button>
                          </div>
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
