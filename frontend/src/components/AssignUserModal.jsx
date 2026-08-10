import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { UserCheck, Search, Send, Calendar, Clock, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { fetchUsersByRole, createAssignmentAPI } from "../services/api";

const WORKFLOW_ROLES = [
  "Reviewer",
  "Business Analyst",
  "Project Manager"
];

function AssignUserModal({ idea, isOpen, onClose, onAssignmentComplete }) {
  const [selectedRole, setSelectedRole] = useState("Business Analyst");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchText, setUserSearchText] = useState("");
  const [remarks, setRemarks] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen && selectedRole) {
      loadRoleUsers(selectedRole);
    }
  }, [isOpen, selectedRole]);

  const loadRoleUsers = async (roleName) => {
    setIsLoadingUsers(true);
    try {
      const users = await fetchUsersByRole(roleName);
      if (users && Array.isArray(users) && users.length > 0) {
        setAvailableUsers(users);
        setSelectedUserId(String(users[0].id));
      } else {
        // Sample fallback users if backend table is seeding
        const fallbacks = getFallbackUsersForRole(roleName);
        setAvailableUsers(fallbacks);
        if (fallbacks.length > 0) setSelectedUserId(String(fallbacks[0].id));
      }
    } catch (err) {
      const fallbacks = getFallbackUsersForRole(roleName);
      setAvailableUsers(fallbacks);
      if (fallbacks.length > 0) setSelectedUserId(String(fallbacks[0].id));
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const getFallbackUsersForRole = (role) => {
    if (role === "Business Analyst") {
      return [
        { id: 101, username: "Mayur Patel", name: "Mayur Patel", email: "mayur@imsgroup.com", employeeId: "EMP-BA-01" },
        { id: 102, username: "Mohit Verma", name: "Mohit Verma", email: "mohit@imsgroup.com", employeeId: "EMP-BA-02" },
        { id: 103, username: "Sanjay Gupta", name: "Sanjay Gupta", email: "sanjay@imsgroup.com", employeeId: "EMP-BA-03" }
      ];
    }
    if (role === "Reviewer") {
      return [
        { id: 201, username: "Dr. Ananya Sharma", name: "Dr. Ananya Sharma", email: "ananya.hr@imsgroup.com", employeeId: "EMP-REV-01" },
        { id: 202, username: "Expert Reviewer", name: "Expert Reviewer", email: "reviewer@imsgroup.com", employeeId: "EMP-REV-02" }
      ];
    }
    if (role === "Project Manager") {
      return [
        { id: 301, username: "Priya Nair", name: "Priya Nair", email: "priya.nair@imsgroup.com", employeeId: "EMP-PM-01" },
        { id: 302, username: "Rajesh Kapoor", name: "Rajesh Kapoor", email: "rajesh.kapoor@imsgroup.com", employeeId: "EMP-PM-02" }
      ];
    }
    return [];
  };

  const filteredUserList = availableUsers.filter((u) => {
    const term = userSearchText.toLowerCase();
    return (
      (u.username || u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.employeeId || "").toLowerCase().includes(term)
    );
  });

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast("Please select a user to assign!", { icon: "⚠️" });
      return;
    }

    setIsSubmitting(true);
    const assignedUser = availableUsers.find((u) => String(u.id) === String(selectedUserId));
    const targetUserName = assignedUser ? (assignedUser.username || assignedUser.name) : `User ${selectedUserId}`;

    try {
      await createAssignmentAPI({
        ideaId: idea.id,
        assignedRole: selectedRole,
        assignedUserId: Number(selectedUserId),
        remarks: remarks || `Assigned to ${selectedRole}: ${targetUserName}`,
        status: "Pending",
        deadline: deadline || "2026-08-15"
      });

      toast.success(`Successfully assigned proposal IDEA-${idea.id} to ${selectedRole}: ${targetUserName}!`);
      if (onAssignmentComplete) onAssignmentComplete();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to assign user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!idea) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Workflow Stage for: "${idea.title}"`}
      maxWidth="600px"
      footer={
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" icon={Send} onClick={handleAssignSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign User"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleAssignSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Proposal Summary Card */}
        <div style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
          <div><strong>Proposal:</strong> IDEA-{idea.id}: {idea.title}</div>
          <div style={{ marginTop: "4px" }}><strong>Domain Category:</strong> <span className="category-chip">{idea.category || "General"}</span></div>
        </div>

        {/* 1. Select Role */}
        <div className="input-field-group">
          <label className="input-label" style={{ fontWeight: "700" }}>
            Select Workflow Role *
          </label>
          <select
            className="custom-input-elem"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ fontSize: "14px", fontWeight: "600" }}
          >
            {WORKFLOW_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Searchable User Dropdown */}
        <div className="input-field-group">
          <label className="input-label" style={{ fontWeight: "700", display: "flex", justifyContent: "space-between" }}>
            <span>Select User ({selectedRole}) *</span>
            <span style={{ fontSize: "12px", color: "#6366f1" }}>{filteredUserList.length} User(s) Available</span>
          </label>

          {/* Quick Search Filter */}
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              className="custom-input-elem"
              placeholder={`Search ${selectedRole} name or email...`}
              value={userSearchText}
              onChange={(e) => setUserSearchText(e.target.value)}
              style={{ paddingLeft: "32px", height: "34px", fontSize: "12px" }}
            />
          </div>

          <select
            className="custom-input-elem"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ fontSize: "14px", fontWeight: "600", padding: "10px" }}
            required
            size={Math.min(4, Math.max(2, filteredUserList.length))}
          >
            {filteredUserList.length === 0 ? (
              <option value="">No users found for {selectedRole}</option>
            ) : (
              filteredUserList.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.username || u.name} ({u.email}) {u.employeeId ? `[${u.employeeId}]` : ""}
                </option>
              ))
            )}
          </select>
        </div>

        {/* 3. Target Deadline */}
        <div className="input-field-group">
          <label className="input-label" style={{ fontWeight: "700" }}>Completion Target Deadline</label>
          <input
            type="date"
            className="custom-input-elem"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {/* 4. Remarks */}
        <div className="input-field-group">
          <label className="input-label" style={{ fontWeight: "700" }}>Remarks & Assignment Directives</label>
          <textarea
            className="custom-input-elem"
            rows={3}
            placeholder={`Enter specific instructions for ${selectedRole}...`}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          ></textarea>
        </div>
      </form>
    </Modal>
  );
}

export default AssignUserModal;
