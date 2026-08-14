import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Search,
  Download,
  Edit,
  Shield,
  KeyRound,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  RefreshCw,
  User
} from "lucide-react";
import {
  fetchAdminUsers,
  createAdminUserRBAC,
  updateAdminUserRBAC,
  updateAdminUserStatusRBAC,
  updateAdminUserRoleRBAC,
  resetAdminUserPasswordRBAC,
  deleteAdminUserRBAC,
  fetchAdminDepartments
} from "../../services/api";

function UserManagementStudio() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Active User for Actions
  const [activeUser, setActiveUser] = useState(null);

  // Form Data States
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    employeeId: "",
    departmentId: "",
    role: "User",
    status: "Active",
    password: ""
  });

  const [newPasswordData, setNewPasswordData] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const availableRoles = [
    "Administrator",
    "Project Coordinator",
    "Business Analyst",
    "Project Manager",
    "Reviewer",
    "QA Lead",
    "User",
    "Employee"
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, deptsData] = await Promise.all([
        fetchAdminUsers({ search: searchQuery, role: selectedRole, department: selectedDepartment, status: selectedStatus }),
        fetchAdminDepartments().catch(() => [])
      ]);

      setUsers(usersData || []);
      if (deptsData && deptsData.length > 0) setDepartments(deptsData);
    } catch (err) {
      console.error("Failed to load user management data", err);
      setError(err.message || "Failed to load users list from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedRole, selectedDepartment, selectedStatus]);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Summary Metrics Calculation
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === "Active").length;
  const inactiveUsersCount = users.filter((u) => u.status === "Inactive" || u.status === "Suspended").length;
  const pendingUsersCount = users.filter((u) => u.status === "Pending" || u.status === "Pending Verification").length;

  // Add User Form Submission
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email) {
      setError("Full Name and Email address are required.");
      return;
    }

    try {
      await createAdminUserRBAC({
        username: formData.username,
        email: formData.email,
        employeeId: formData.employeeId,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        role: formData.role || "User",
        status: formData.status || "Active",
        password: formData.password || "Password@123"
      });

      setShowAddModal(false);
      setFormData({ username: "", email: "", employeeId: "", departmentId: "", role: "User", status: "Active", password: "" });
      showNotification("User account created successfully!");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit User Details Submission
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!activeUser) return;

    try {
      await updateAdminUserRBAC(activeUser.id, {
        username: formData.username,
        email: formData.email,
        employeeId: formData.employeeId,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        role: formData.role,
        status: formData.status
      });

      setShowEditModal(false);
      setActiveUser(null);
      showNotification("User account details updated successfully!");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Change Role Submission
  const handleChangeRoleSubmit = async (e) => {
    e.preventDefault();
    if (!activeUser || !formData.role) return;

    try {
      await updateAdminUserRoleRBAC(activeUser.id, formData.role);
      setShowRoleModal(false);
      setActiveUser(null);
      showNotification(`Role for '${activeUser.username}' updated to '${formData.role}' successfully!`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  // Reset Password Submission
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!activeUser || !newPasswordData || newPasswordData.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await resetAdminUserPasswordRBAC(activeUser.id, newPasswordData);
      setShowPasswordModal(false);
      setActiveUser(null);
      setNewPasswordData("");
      showNotification(`Password for '${activeUser.username}' has been reset successfully!`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Confirm Actions (Deactivate / Activate / Delete)
  const handleExecuteConfirmedAction = async () => {
    if (!activeUser || !confirmAction) return;

    try {
      if (confirmAction.type === "toggle_status") {
        const targetStatus = activeUser.status === "Active" ? "Inactive" : "Active";
        await updateAdminUserStatusRBAC(activeUser.id, targetStatus);
        showNotification(`User '${activeUser.username}' status changed to '${targetStatus}'.`);
      } else if (confirmAction.type === "delete") {
        await deleteAdminUserRBAC(activeUser.id);
        showNotification(`User account '${activeUser.username}' deleted successfully.`);
      }
      setShowConfirmModal(false);
      setActiveUser(null);
      setConfirmAction(null);
      loadData();
    } catch (err) {
      setError(err.message);
      setShowConfirmModal(false);
    }
  };

  // Export Users to CSV
  const handleExportCSV = () => {
    if (users.length === 0) return;

    const headers = ["ID,Name,Email,Employee ID,Department,Role,Status,Last Login,Created Date"];
    const rows = users.map(u => 
      `"${u.id}","${u.username}","${u.email}","${u.employeeId || ""}","${u.department || ""}","${u.role}","${u.status}","${u.lastLogin || "Never"}","${u.createdAt || ""}"`
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Idea360_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const s = (status || "Active").toLowerCase();
    if (s === "active") {
      return <span className="um-badge um-badge-active"><CheckCircle size={12} /> Active</span>;
    }
    if (s === "inactive") {
      return <span className="um-badge um-badge-inactive"><XCircle size={12} /> Inactive</span>;
    }
    if (s === "suspended") {
      return <span className="um-badge um-badge-suspended"><AlertTriangle size={12} /> Suspended</span>;
    }
    return <span className="um-badge um-badge-pending"><Clock size={12} /> Pending</span>;
  };

  return (
    <div className="um-container">
      {/* Page Header */}
      <div className="um-header">
        <div className="um-title-group">
          <h1>
            <Users style={{ color: "var(--primary)" }} size={22} /> User Management
          </h1>
        </div>

        <div className="um-header-actions">
          <button onClick={handleExportCSV} className="um-btn um-btn-secondary">
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => {
              setFormData({ username: "", email: "", employeeId: "", departmentId: "", role: "User", status: "Active", password: "" });
              setError(null);
              setShowAddModal(true);
            }}
            className="um-btn um-btn-primary"
          >
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="um-banner um-banner-success">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={18} /> {successMsg}
          </span>
          <button onClick={() => setSuccessMsg("")} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>&times;</button>
        </div>
      )}

      {error && (
        <div className="um-banner um-banner-error">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={18} /> {error}
          </span>
          <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>&times;</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="um-stats-grid">
        <div className="um-stat-card">
          <div className="um-stat-info">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{totalUsersCount}</div>
          </div>
          <div className="um-stat-icon">
            <Users size={22} />
          </div>
        </div>

        <div className="um-stat-card card-active">
          <div className="um-stat-info">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{activeUsersCount}</div>
          </div>
          <div className="um-stat-icon">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="um-stat-card card-inactive">
          <div className="um-stat-info">
            <div className="stat-label">Inactive Users</div>
            <div className="stat-value">{inactiveUsersCount}</div>
          </div>
          <div className="um-stat-icon">
            <UserX size={22} />
          </div>
        </div>

        <div className="um-stat-card card-pending">
          <div className="um-stat-info">
            <div className="stat-label">Pending Users</div>
            <div className="stat-value">{pendingUsersCount}</div>
          </div>
          <div className="um-stat-icon">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="um-filters-card">
        <div className="um-filters-grid">
          <div className="um-search-wrapper">
            <Search className="um-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="um-search-input"
            />
          </div>

          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="um-filter-select"
            >
              <option value="ALL">All Roles</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="um-filter-select"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="um-filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="um-table-card">
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            <RefreshCw className="animate-spin" size={24} style={{ marginBottom: "8px" }} />
            <div>Loading user records...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
            <p style={{ fontWeight: 600 }}>No users found matching search or filters.</p>
          </div>
        ) : (
          <div className="um-table-wrapper">
            <table className="um-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="um-user-cell">
                        <div>
                          <div className="um-user-name">{user.username}</div>
                          {user.employeeId && (
                            <div className="um-user-id">ID: {user.employeeId}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ fontWeight: 500 }}>{user.email}</td>

                    <td>{user.department || "General"}</td>

                    <td>
                      <span className="um-badge um-badge-role">
                        <Shield size={11} /> {user.role}
                      </span>
                    </td>

                    <td>{getStatusBadge(user.status)}</td>

                    <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                      {user.lastLogin || "Never"}
                    </td>

                    <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                      {user.createdAt ? user.createdAt.slice(0, 10) : "N/A"}
                    </td>

                    <td>
                      <div className="um-actions-cell">
                        <button
                          onClick={() => {
                            setActiveUser(user);
                            setShowViewModal(true);
                          }}
                          title="View Details"
                          className="um-action-btn"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setActiveUser(user);
                            setFormData({
                              username: user.username,
                              email: user.email,
                              employeeId: user.employeeId || "",
                              departmentId: user.departmentId || "",
                              role: user.role,
                              status: user.status
                            });
                            setError(null);
                            setShowEditModal(true);
                          }}
                          title="Edit User"
                          className="um-action-btn btn-edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setActiveUser(user);
                            setConfirmAction({
                              type: "delete",
                              title: "Delete User Account",
                              description: `Warning: Are you sure you want to permanently delete user '${user.username}'?`
                            });
                            setShowConfirmModal(true);
                          }}
                          title="Delete User"
                          className="um-action-btn btn-delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* ADD USER MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog-card" style={{ maxWidth: "520px" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={20} color="var(--primary)" /> Create New User
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted)" }}>&times;</button>
            </div>

            <form onSubmit={handleCreateUserSubmit} style={{ padding: "24px" }}>
              <div className="um-form-group">
                <label className="um-form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="um-form-input"
                />
              </div>

              <div className="um-form-group">
                <label className="um-form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="um-form-input"
                />
              </div>

              <div className="um-form-row">
                <div className="um-form-group">
                  <label className="um-form-label">Employee ID</label>
                  <input
                    type="text"
                    placeholder="EMP-1001"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="um-form-input"
                  />
                </div>
                <div className="um-form-group">
                  <label className="um-form-label">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="um-form-select"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="um-form-row">
                <div className="um-form-group">
                  <label className="um-form-label">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="um-form-select"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="um-form-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="um-form-group">
                <label className="um-form-label">Password (Default: Password@123)</label>
                <input
                  type="password"
                  placeholder="Leave empty for default 'Password@123'"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="um-form-input"
                />
              </div>

              <div style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="um-btn um-btn-primary"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && activeUser && (
        <div className="modal-backdrop">
          <div className="modal-dialog-card" style={{ maxWidth: "520px" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Edit size={20} color="var(--primary)" /> Edit User Details
              </h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted)" }}>&times;</button>
            </div>

            <form onSubmit={handleEditUserSubmit} style={{ padding: "24px" }}>
              <div className="um-form-group">
                <label className="um-form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="um-form-input"
                />
              </div>

              <div className="um-form-group">
                <label className="um-form-label">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="um-form-input"
                />
              </div>

              <div className="um-form-row">
                <div className="um-form-group">
                  <label className="um-form-label">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="um-form-input"
                  />
                </div>
                <div className="um-form-group">
                  <label className="um-form-label">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="um-form-select"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="um-form-row">
                <div className="um-form-group">
                  <label className="um-form-label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="um-form-select"
                  >
                    {availableRoles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="um-form-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="um-btn um-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {showRoleModal && activeUser && (
        <div className="modal-backdrop">
          <div className="modal-dialog-card" style={{ maxWidth: "440px" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={20} color="#7e22ce" /> Change Role
              </h3>
              <button onClick={() => setShowRoleModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted)" }}>&times;</button>
            </div>

            <form onSubmit={handleChangeRoleSubmit} style={{ padding: "24px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "16px" }}>
                Select a new system role for <strong style={{ color: "var(--text-dark)" }}>{activeUser.username}</strong>.
              </p>

              <div className="um-form-group">
                <label className="um-form-label">Select Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="um-form-select"
                  style={{ fontWeight: 600 }}
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="um-btn"
                  style={{ background: "#7e22ce", color: "#ffffff" }}
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showPasswordModal && activeUser && (
        <div className="modal-backdrop">
          <div className="modal-dialog-card" style={{ maxWidth: "440px" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <KeyRound size={20} color="#b45309" /> Reset Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted)" }}>&times;</button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} style={{ padding: "24px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "16px" }}>
                Set a new password for <strong style={{ color: "var(--text-dark)" }}>{activeUser.username}</strong> ({activeUser.email}).
              </p>

              <div className="um-form-group">
                <label className="um-form-label">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPasswordData}
                  onChange={(e) => setNewPasswordData(e.target.value)}
                  className="um-form-input"
                />
              </div>

              <div style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="um-btn"
                  style={{ background: "#b45309", color: "#ffffff" }}
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && activeUser && (
        <div className="modal-backdrop">
          <div className="modal-dialog-card" style={{ maxWidth: "520px" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Eye size={20} color="var(--primary)" /> User Account Details
              </h3>
              <button onClick={() => setShowViewModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-muted)" }}>&times;</button>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-dark)" }}>{activeUser.username}</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{activeUser.email}</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                  <span className="um-form-label">Role</span>
                  <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{activeUser.role}</span>
                </div>

                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                  <span className="um-form-label">Status</span>
                  <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{activeUser.status}</span>
                </div>

                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                  <span className="um-form-label">Employee ID</span>
                  <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{activeUser.employeeId || "N/A"}</span>
                </div>

                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                  <span className="um-form-label">Department</span>
                  <span style={{ fontWeight: 600, color: "var(--text-dark)" }}>{activeUser.department || "General"}</span>
                </div>

                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                  <span className="um-form-label">Last Login</span>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-dark)" }}>{activeUser.lastLogin || "Never"}</span>
                </div>

                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                  <span className="um-form-label">Created Date</span>
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-dark)" }}>{activeUser.createdAt || "N/A"}</span>
                </div>
              </div>

              <div style={{ paddingTop: "16px", marginTop: "16px", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && confirmAction && activeUser && (
        <div className="modal-backdrop">
          <div className="modal-dialog-card" style={{ maxWidth: "420px", textAlign: "center" }}>
            <div style={{ padding: "24px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justifyCenter: "center", margin: "0 auto 16px auto" }}>
                <AlertTriangle size={24} style={{ margin: "auto" }} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-dark)", marginBottom: "8px" }}>{confirmAction.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>{confirmAction.description}</p>

              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="um-btn um-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteConfirmedAction}
                  className="um-btn"
                  style={{ background: "#ef4444", color: "#ffffff" }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagementStudio;
