import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Inbox,
  UserCheck,
  Key
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { DEFAULT_MASTER_EVALUATORS } from "../../utils/ideaStorage";

function UserManagementStudio() {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([
    { id: 1, name: "Ayushman Raj", email: "ayushman@imsgroup.com", role: "Administrator", department: "Executive Board", status: "Active" },
    { id: 2, name: "Project Coordinator", email: "pc@imsgroup.com", role: "Project Coordinator", department: "PMO Governance", status: "Active" },
    { id: 3, name: "Dr. Ananya Sharma", email: "ananya.hr@imsgroup.com", role: "Reviewer", department: "Human Resources", status: "Active" },
    { id: 4, name: "Vikram Sethi", email: "vikram.hrba@imsgroup.com", role: "Business Analyst", department: "HR Operations", status: "Active" },
    { id: 5, name: "Priya Nair", email: "priya.hrpm@imsgroup.com", role: "Project Manager", department: "People Systems PMO", status: "Active" }
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const displayedUsers = usersList.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Enterprise User & Role Management Studio</h1>
            <span className="category-chip-indigo">
              <Users size={14} /> User Governance
            </span>
          </div>
          <p>Manage enterprise platform users, role-based access control (RBAC), and domain evaluator permissions.</p>
        </div>

        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search users, roles, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      <Card title={`Platform Registered Users & Roles (${displayedUsers.length})`} subtitle="Enterprise role-based permissions and department mappings">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>User Name & Corporate Email</th>
                <th>Assigned Platform Role</th>
                <th>Department / Unit</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: "700", color: "#1e293b" }}>{u.name}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{u.email}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: "#e0e7ff",
                        color: "#4338ca",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#475569" }}>{u.department}</td>
                  <td>
                    <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>● {u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default UserManagementStudio;
