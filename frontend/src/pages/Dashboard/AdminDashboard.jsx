import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Inbox
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function AdminDashboard({ userName }) {
  const navigate = useNavigate();
  // Submitted Ideas Queue from shared localStorage
  const [allIdeas, setAllIdeas] = useState([]);

  useEffect(() => {
    setAllIdeas(getSubmittedIdeas());
  }, []);

  const handleApproveIdea = (id) => {
    const updated = updateIdeaStatus(id, "Sent to Initial Screening");
    setAllIdeas(updated);
    alert(`Idea successfully sent to Initial Screening! It is now visible on the Initial Screening page.`);
  };

  const handleViewIdea = (id) => {
    // Direct navigate to Initial Screening page as requested
    navigate("/initial-screening");
  };

  // Admin Queue shows all active submitted ideas (excluding rejected ideas)
  const activeQueue = allIdeas.filter((i) => i.status !== "Rejected");

  // Dynamic 100% Legal KPI Counts
  const totalSubmissions = allIdeas.length;
  const pendingCount = allIdeas.filter((i) => i.status === "Pending Review").length;
  const approvedCount = allIdeas.filter((i) => i.status.includes("Approved") || i.status.includes("Screening")).length;
  const rejectedCount = allIdeas.filter((i) => i.status === "Rejected").length;
  const totalProjects = allIdeas.filter((i) => i.status.includes("Passed") || i.status.includes("Approved")).length;
  const activeProjects = allIdeas.filter((i) => i.status.includes("Passed Initial Screening")).length;

  return (
    <div className="dashboard-wrapper">
      {/* Clean Admin Executive Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Executive Admin Panel </h1>
            <span className="mode-badge-purple">
            </span>
          </div>
          <p>Review all employee innovation submissions and forward to Initial Screening.</p>
        </div>
      </div>

      {/* 6 Dynamic Executive KPI Mini Cards */}
      <div className="kpi-6-grid">
        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Total Submissions</span>
            <div className="kpi-icon-pill pill-purple">
              <Lightbulb size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{totalSubmissions}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Review</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{pendingCount}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Approved / Screening</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{approvedCount}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected Ideas</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{rejectedCount}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Total Projects</span>
            <div className="kpi-icon-pill pill-blue">
              <FolderKanban size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{totalProjects}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Active Projects</span>
            <div className="kpi-icon-pill pill-indigo">
              <PlayCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{activeProjects}</span>
        </div>
      </div>

      {/* Row 1: Ideas Overview SVG Line Chart + Idea Status Donut */}
      <div className="dash-row-2col">
        <Card title="Company Ideas Overview" subtitle="Submitted vs Approved ideas over time">
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

              <path
                d="M 40 165 C 90 150, 130 160, 180 135 C 230 160, 280 140, 330 155 C 380 120, 430 145, 480 140 L 480 170 L 40 170 Z"
                fill="url(#adminGreenGrad)"
              />
              <path
                d="M 40 165 C 90 150, 130 160, 180 135 C 230 160, 280 140, 330 155 C 380 120, 430 145, 480 140"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
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
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="14" strokeDasharray="52.5 186.2" strokeDashoffset="-143.2" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="14" strokeDasharray="43 195.7" strokeDashoffset="-195.7" />
              </svg>
              <div className="donut-center-num">
                <span className="big">{totalSubmissions}</span>
                <span className="sub">Total</span>
              </div>
            </div>

            <div className="donut-legend-col">
              <div className="legend-row-item">
                <div className="legend-dot-label">
                  <span className="dot-color bg-green"></span>
                  <span>Approved / Screening</span>
                </div>
                <span>{approvedCount}</span>
              </div>
              <div className="legend-row-item">
                <div className="legend-dot-label">
                  <span className="dot-color bg-amber"></span>
                  <span>Pending Review</span>
                </div>
                <span>{pendingCount}</span>
              </div>
              <div className="legend-row-item">
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

      {/* Interactive Admin Ideas Review & Screening Queue Table */}
      <div className="dash-row-2col">
        <Card
          title="Admin Screening Queue (All User Submissions)"
          subtitle="Review submitted ideas and forward them to Initial Screening"
        >
          <div className="data-table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Idea Title</th>
                  <th>Category</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {activeQueue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state-cell">
                      <div className="empty-state-flex">
                        <Inbox size={32} color="var(--text-light)" />
                        <span className="empty-state-title">No active ideas in screening queue</span>
                        <span className="empty-state-sub">User submissions will automatically appear here for your review.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeQueue.map((item) => {
                    const isSent = item.status !== "Pending Review";

                    return (
                      <tr key={item.id}>
                        <td className="table-idea-title">{item.title}</td>
                        <td>{item.category}</td>
                        <td>{item.author}</td>
                        <td>
                          <span
                            className={`table-badge ${
                              isSent ? "badge-approved" : "badge-review"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions-flex">
                            <Button
                              size="sm"
                              variant={isSent ? "ghost" : "primary"}
                              icon={ArrowRight}
                              onClick={() => handleApproveIdea(item.id)}
                              disabled={isSent}
                              title="Send to Initial Screening Page"
                            >
                              {isSent ? "Sent to Screening" : "Send to Initial Screening"}
                            </Button>
                            {isSent && (
                              <Button
                                size="sm"
                                variant="ghost"
                                icon={Eye}
                                onClick={() => handleViewIdea(item.id)}
                                title="View & Open Initial Screening Page"
                              >
                                View Screening
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Department Breakdown */}
        <Card title="Department-wise Ideas">
          <div className="dept-progress-list">
            <div className="dept-item">
              <div className="dept-header-flex">
                <span>Healthcare & Medical</span>
                <span>{allIdeas.filter((i) => i.category === "Healthcare").length} Ideas</span>
              </div>
              <div className="progress-track-bg">
                <div className="progress-fill-bar bar-indigo" style={{ width: `${allIdeas.length > 0 ? (allIdeas.filter((i) => i.category === "Healthcare").length / allIdeas.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="dept-item">
              <div className="dept-header-flex">
                <span>Banking & Finance</span>
                <span>{allIdeas.filter((i) => i.category === "Banking").length} Ideas</span>
              </div>
              <div className="progress-track-bg">
                <div className="progress-fill-bar bar-blue" style={{ width: `${allIdeas.length > 0 ? (allIdeas.filter((i) => i.category === "Banking").length / allIdeas.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="dept-item">
              <div className="dept-header-flex">
                <span>Logistics & Transport</span>
                <span>{allIdeas.filter((i) => i.category === "Logistics" || i.category === "Transportation").length} Ideas</span>
              </div>
              <div className="progress-track-bg">
                <div className="progress-fill-bar bar-green" style={{ width: `${allIdeas.length > 0 ? (allIdeas.filter((i) => i.category === "Logistics" || i.category === "Transportation").length / allIdeas.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="dept-item">
              <div className="dept-header-flex">
                <span>HR & Administration</span>
                <span>{allIdeas.filter((i) => i.category === "HR").length} Ideas</span>
              </div>
              <div className="progress-track-bg">
                <div className="progress-fill-bar bar-amber" style={{ width: `${allIdeas.length > 0 ? (allIdeas.filter((i) => i.category === "HR").length / allIdeas.length) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
