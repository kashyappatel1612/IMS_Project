import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ListTodo,
  Plus,
  Search,
  CheckCircle2,
  Tag,
  Inbox,
  UserCheck,
  Sparkles
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { getSubmittedIdeas } from "../../utils/ideaStorage";

const DEFAULT_USER_STORIES = [
  { id: "US-101", title: "As a User, I want automated invoice processing so that manual entry errors are reduced.", persona: "End User", priority: "High", storyPoints: 5, status: "Ready for Dev" },
  { id: "US-102", title: "As an Admin, I want real-time audit logs so that security compliance is maintained.", persona: "Administrator", priority: "Urgent", storyPoints: 8, status: "In Backlog" },
  { id: "US-103", title: "As a Reviewer, I want SLA countdown badges so that review deadlines are met on time.", persona: "Reviewer", priority: "Medium", storyPoints: 3, status: "Ready for Dev" }
];

function UserStoriesStudio() {
  const navigate = useNavigate();
  const [stories, setStories] = useState(DEFAULT_USER_STORIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPersona, setNewPersona] = useState("End User");
  const [newPriority, setNewPriority] = useState("High");
  const [newPoints, setNewPoints] = useState("5");

  const handleAddStory = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newS = {
      id: `US-${Date.now().toString().slice(-3)}`,
      title: newTitle.trim(),
      persona: newPersona,
      priority: newPriority,
      storyPoints: Number(newPoints),
      status: "Ready for Dev"
    };

    setStories([newS, ...stories]);
    setShowAddModal(false);
    setNewTitle("");
    toast.success(`User Story ${newS.id} created successfully!`);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>User Stories & Acceptance Criteria Studio</h1>
            <span className="category-chip-indigo">
              <ListTodo size={14} /> Agile Requirements
            </span>
          </div>
          <p>Define user personas, story points, acceptance criteria, and business rules for developers.</p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Create User Story
        </Button>
      </div>

      <Card title={`Agile User Stories & Acceptance Criteria (${stories.length})`} subtitle="Backlog user stories ready for Estimation & Development sprint planning">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Story ID & Description</th>
                <th>Target Persona</th>
                <th>Priority</th>
                <th>Story Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((st) => (
                <tr key={st.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "#4f46e5", color: "#ffffff", padding: "1px 6px", borderRadius: "4px" }}>
                        {st.id}
                      </span>
                    </div>
                    <div style={{ fontWeight: "600", fontSize: "13px", color: "#1e293b", lineHeight: "1.4" }}>{st.title}</div>
                  </td>
                  <td><span className="category-chip">{st.persona}</span></td>
                  <td>
                    <span style={{ background: "#fee2e2", color: "#991b1b", padding: "2px 8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}>
                      {st.priority}
                    </span>
                  </td>
                  <td><strong>{st.storyPoints} Pts</strong></td>
                  <td><span className="table-badge badge-approved">{st.status}</span></td>
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
          title="Create New Agile User Story"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Plus} onClick={handleAddStory}>Save User Story</Button>
            </div>
          }
        >
          <form onSubmit={handleAddStory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">User Story Narrative (As a... I want... So that...) *</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="e.g. As a Store Manager, I want real-time inventory alerts so that out-of-stock items are prevented."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              ></textarea>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div className="input-field-group">
                <label className="input-label">Target Persona</label>
                <select className="custom-input-elem" value={newPersona} onChange={(e) => setNewPersona(e.target.value)}>
                  <option value="End User">End User</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Project Coordinator">Project Coordinator</option>
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Priority</label>
                <select className="custom-input-elem" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Story Points (Fibonacci)</label>
                <select className="custom-input-elem" value={newPoints} onChange={(e) => setNewPoints(e.target.value)}>
                  <option value="1">1 Point</option>
                  <option value="2">2 Points</option>
                  <option value="3">3 Points</option>
                  <option value="5">5 Points</option>
                  <option value="8">8 Points</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default UserStoriesStudio;
