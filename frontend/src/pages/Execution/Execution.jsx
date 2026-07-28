import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlayCircle,
  FolderKanban,
  CheckCircle2,
  Clock,
  User,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Inbox,
  Sparkles,
  Layers,
  Award,
  AlertTriangle
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { fetchAllIdeas } from "../../services/api";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function Execution() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apiIdeas = await fetchAllIdeas();
      if (apiIdeas && apiIdeas.length > 0) {
        filterExecutionProjects(apiIdeas);
        return;
      }
    } catch (e) {}
    filterExecutionProjects(getSubmittedIdeas());
  };

  const filterExecutionProjects = (list) => {
    const active = list.filter(
      (i) =>
        i.status.includes("In Execution") ||
        i.status.includes("Accepted by PM") ||
        i.status.includes("Project") ||
        i.status.includes("Approved by BA")
    );
    setProjects(active);
  };

  const handleUpdateStatus = (id, newStatus) => {
    const updated = updateIdeaStatus(id, newStatus, `Execution update: ${newStatus}`);
    filterExecutionProjects(updated);
    alert(`Project status updated to "${newStatus}"!`);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Project Execution & Sprint Tracking</h1>
            <span className="mode-badge-green" style={{ background: "#ecfdf5", color: "#059669" }}>
              <PlayCircle size={14} /> Active Implementation Lifecycle
            </span>
          </div>
          <p>Monitor sprint milestones, deliverable progress, target launch dates, and project status updates in real-time.</p>
        </div>

        <div className="quick-actions-flex">
          <Button variant="primary" icon={FolderKanban} onClick={() => navigate("/projects")}>
            Open PM Projects Hub
          </Button>
        </div>
      </div>

      {/* Main Execution Table */}
      <Card title={`Active Projects in Execution Pipeline (${projects.length})`} subtitle="Real-time execution status synced with BA Analysis Reports & PM Control Hub">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Domain / Category</th>
                <th>Current Status</th>
                <th>Sprint Deliverables</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No Active Projects in Execution</span>
                      <span className="empty-state-sub">Onboard a BA Approved proposal from the PM Projects Hub to start execution.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((p, idx) => {
                  const progressPct = p.status.includes("Completed") ? 100 : (idx % 2 === 0 ? 80 : 50);

                  return (
                    <tr key={p.id}>
                      <td className="table-idea-title">{p.title}</td>
                      <td>
                        <span className="category-chip">{p.category}</span>
                      </td>
                      <td>
                        <span className="table-badge badge-approved">{p.status}</span>
                      </td>
                      <td style={{ minWidth: "160px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700" }}>
                            <span>Sprint Completion</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div style={{ height: "6px", width: "100%", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--primary)", borderRadius: "4px" }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {!p.status.includes("Completed") ? (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={CheckCircle2}
                              onClick={() => handleUpdateStatus(p.id, "Completed")}
                            >
                              Mark Completed
                            </Button>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>✓ Project Live</span>
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
    </div>
  );
}

export default Execution;
