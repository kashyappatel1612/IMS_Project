import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  Inbox,
  PlayCircle
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

const DEFAULT_SPRINTS = [
  { id: "SPRINT-01", name: "Sprint 1: Core Architecture & Setup", status: "Active", startDate: "Jul 20, 2026", endDate: "Aug 03, 2026", velocity: "34 Points", completion: "85%" },
  { id: "SPRINT-02", name: "Sprint 2: UI Components & API Integration", status: "Upcoming", startDate: "Aug 04, 2026", endDate: "Aug 18, 2026", velocity: "40 Points", completion: "0%" },
  { id: "SPRINT-03", name: "Sprint 3: Security, QA & Staging Release", status: "Planned", startDate: "Aug 19, 2026", endDate: "Sep 02, 2026", velocity: "38 Points", completion: "0%" }
];

function SprintPlanningStudio() {
  const navigate = useNavigate();
  const [sprints, setSprints] = useState(DEFAULT_SPRINTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [velocityPoints, setVelocityPoints] = useState("35");
  const [startDate, setStartDate] = useState("2026-08-19");
  const [endDate, setEndDate] = useState("2026-09-02");

  const handleAddSprint = (e) => {
    e.preventDefault();
    if (!sprintName.trim()) return;

    const newS = {
      id: `SPRINT-0${sprints.length + 1}`,
      name: sprintName.trim(),
      status: "Planned",
      startDate: startDate,
      endDate: endDate,
      velocity: `${velocityPoints} Points`,
      completion: "0%"
    };

    setSprints([...sprints, newS]);
    setShowAddModal(false);
    setSprintName("");
    toast.success(`Sprint ${newS.id} created successfully!`);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Agile Sprint Planning Studio</h1>
            <span className="category-chip-indigo">
              <Calendar size={14} /> Sprint Management
            </span>
          </div>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Create New Sprint
        </Button>
      </div>

      <Card title={`Active & Planned Agile Sprints (${sprints.length})`}>
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Sprint ID & Name</th>
                <th>Target Capacity Velocity</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Completion %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sprints.map((sp) => (
                <tr key={sp.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "#4f46e5", color: "#ffffff", padding: "1px 6px", borderRadius: "4px" }}>
                        {sp.id}
                      </span>
                    </div>
                    <div style={{ fontWeight: "700", color: "#1e293b" }}>{sp.name}</div>
                  </td>
                  <td><strong>{sp.velocity}</strong></td>
                  <td style={{ fontSize: "12px", color: "#475569" }}>{sp.startDate}</td>
                  <td style={{ fontSize: "12px", color: "#d97706" }}>{sp.endDate}</td>
                  <td>
                    <div style={{ fontWeight: "700", color: "#16a34a" }}>{sp.completion}</div>
                  </td>
                  <td>
                    <span className={`table-badge ${sp.status === "Active" ? "badge-approved" : "badge-review"}`}>
                      {sp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Create New Agile Sprint"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Plus} onClick={handleAddSprint}>Create Sprint</Button>
            </div>
          }
        >
          <form onSubmit={handleAddSprint} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Sprint Name *</label>
              <input
                className="custom-input-elem"
                placeholder="e.g. Sprint 4: Payment Gateway & Security Hardening"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div className="input-field-group">
                <label className="input-label">Target Velocity Points</label>
                <input
                  type="number"
                  className="custom-input-elem"
                  value={velocityPoints}
                  onChange={(e) => setVelocityPoints(e.target.value)}
                />
              </div>

              <div className="input-field-group">
                <label className="input-label">Start Date</label>
                <input
                  type="date"
                  className="custom-input-elem"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="input-field-group">
                <label className="input-label">End Date</label>
                <input
                  type="date"
                  className="custom-input-elem"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default SprintPlanningStudio;
