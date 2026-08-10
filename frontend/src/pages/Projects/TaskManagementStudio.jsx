import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  Tag,
  Inbox,
  AlertCircle
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";

const DEFAULT_TASKS = [
  { id: "TSK-201", title: "Setup OAuth2 JWT Authentication Middleware", assignee: "Ayushman Raj", priority: "High", deadline: "Aug 02, 2026", status: "In Progress" },
  { id: "TSK-202", title: "Design Responsive Initial Screening Header", assignee: "Frontend Lead", priority: "Medium", deadline: "Aug 04, 2026", status: "In Progress" },
  { id: "TSK-203", title: "Configure PostgreSQL Evaluators Table Seeding", assignee: "Database Architect", priority: "Urgent", deadline: "Aug 01, 2026", status: "Completed" }
];

function TaskManagementStudio() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [assignee, setAssignee] = useState("Ayushman Raj");
  const [priority, setPriority] = useState("High");
  const [deadline, setDeadline] = useState("2026-08-05");

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newT = {
      id: `TSK-${Date.now().toString().slice(-3)}`,
      title: taskTitle.trim(),
      assignee: assignee,
      priority: priority,
      deadline: deadline,
      status: "In Progress"
    };

    setTasks([newT, ...tasks]);
    setShowAddModal(false);
    setTaskTitle("");
    toast.success(`Task ${newT.id} created and assigned to ${assignee}!`);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Agile Task Management & Board</h1>
            <span className="category-chip-indigo">
              <CheckSquare size={14} /> Task Allocation
            </span>
          </div>
          <p>Assign sprint tasks, set completion deadlines, and monitor development backlog status.</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Create Sprint Task
        </Button>
      </div>

      <Card title={`Sprint Tasks Backlog (${tasks.length})`} subtitle="Development tasks assigned to engineering team leads">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Task ID & Title</th>
                <th>Assigned Developer</th>
                <th>Priority</th>
                <th>Target Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((tk) => (
                <tr key={tk.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "#4f46e5", color: "#ffffff", padding: "1px 6px", borderRadius: "4px" }}>
                        {tk.id}
                      </span>
                    </div>
                    <div style={{ fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>{tk.title}</div>
                  </td>
                  <td><strong>{tk.assignee}</strong></td>
                  <td>
                    <span style={{ background: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>
                      {tk.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#d97706" }}>{tk.deadline}</td>
                  <td>
                    <span className={`table-badge ${tk.status === "Completed" ? "badge-approved" : "badge-review"}`}>
                      {tk.status}
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
          title="Assign New Sprint Task"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Plus} onClick={handleAddTask}>Assign Task</Button>
            </div>
          }
        >
          <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Task Summary / Title *</label>
              <input
                className="custom-input-elem"
                placeholder="e.g. Implement Webhook notification listener"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div className="input-field-group">
                <label className="input-label">Assignee</label>
                <input
                  className="custom-input-elem"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                />
              </div>

              <div className="input-field-group">
                <label className="input-label">Priority</label>
                <select className="custom-input-elem" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Target Deadline</label>
                <input
                  type="date"
                  className="custom-input-elem"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default TaskManagementStudio;
