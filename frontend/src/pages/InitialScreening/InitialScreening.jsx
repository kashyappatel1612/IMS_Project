import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

function InitialScreening() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    setIdeas(getSubmittedIdeas());
  }, []);

  // Show all submitted ideas in screening queue
  const screeningQueue = ideas;

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Initial Screening & Validation Panel </h1>
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
          <p>Validate incoming ideas for duplicate check, information sufficiency, goal alignment & business support.</p>
        </div>
      </div>

      {/* KPI Cards for Screening Metrics */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">In Screening Queue</span>
            <div className="kpi-icon-pill pill-purple">
              <Filter size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{screeningQueue.length}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Passed Screening</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status.includes("Passed")).length}
          </span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Info Requested</span>
            <div className="kpi-icon-pill pill-amber">
              <AlertCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status === "Information Requested").length}
          </span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected in Screening</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {ideas.filter((i) => i.status.includes("Rejected")).length}
          </span>
        </div>
      </div>

      {/* Screening Queue Table */}
      <Card
        title="Initial Screening Assessment Queue "
        subtitle="Perform 5-point validation checklist on incoming innovation submissions"
      >
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
              {screeningQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                    No ideas currently in screening queue. Submissions sent by Admin from the Admin Dashboard will appear here.
                  </td>
                </tr>
              ) : (
                screeningQueue.map((item) => {
                  const isPassed = item.status.includes("Passed");
                  const isRejected = item.status.includes("Rejected");

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
                              : "badge-review"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant={isPassed ? "ghost" : "primary"}
                          icon={FileCheck}
                          onClick={() => navigate(`/screening-evaluation/${item.id}`)}
                        >
                          {isPassed ? "Re-evaluate" : "Start Screening"}
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
  );
}

export default InitialScreening;
