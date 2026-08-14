import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  Send,
  Eye,
  CheckCheck,
  Inbox,
  AlertCircle,
  Briefcase,
  FolderKanban,
  UserCheck
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from "../../utils/notificationStorage";

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    let r = "User";
    let e = "";
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.role) r = u.role;
        if (u.email) e = u.email;
      } catch (err) {}
    }
    setUserRole(r);
    setUserEmail(e);
    loadNotifs(r, e);
  }, []);

  const loadNotifs = (r, e) => {
    const list = getNotifications(r, e);
    setNotifications(list);
  };

  const handleMarkOneRead = (id) => {
    markAsRead(id);
    loadNotifs(userRole, userEmail);
  };

  const handleMarkAllRead = () => {
    markAllAsRead(userRole, userEmail);
    loadNotifs(userRole, userEmail);
  };

  const displayedNotifs = notifications.filter((n) => {
    if (filterType === "unread") return !n.isRead;
    if (filterType === "submission") return n.type === "submission";
    if (filterType === "allocation") return n.type === "allocation";
    if (filterType === "stage_pass") return n.type === "stage_pass";
    return true; // 'all'
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Notification & Alert Center</h1>
            <span className="category-chip-indigo">
              <Bell size={14} /> Real-Time Notifications ({unreadCount} Unread)
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {unreadCount > 0 && (
            <Button variant="outline" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Main Notification Card */}
      <Card title={`System Alerts (${displayedNotifs.length})`}>
        {/* Filter Pills */}
        <div style={{ marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Filter Category:</span>
          {[
            { id: "all", label: `All Alerts (${notifications.length})` },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "submission", label: "New Submissions" },
            { id: "allocation", label: "Role Allocations" },
            { id: "stage_pass", label: "Stage Progressions" }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setFilterType(m.id)}
              style={{
                background: filterType === m.id ? "var(--primary)" : "#f1f5f9",
                color: filterType === m.id ? "#ffffff" : "var(--text-dark)",
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

        {/* Notifications Feed List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {displayedNotifs.length === 0 ? (
            <div className="empty-state-flex" style={{ padding: "30px 0" }}>
              <Inbox size={36} color="var(--text-light)" />
              <span className="empty-state-title">No notifications found</span>
            </div>
          ) : (
            displayedNotifs.map((n) => {
              return (
                <div
                  key={n.id}
                  style={{
                    background: n.isRead ? "#ffffff" : "#f0fdf4",
                    border: n.isRead ? "1px solid #e2e8f0" : "1.5px solid #86efac",
                    padding: "16px",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "14px",
                    boxShadow: n.isRead ? "none" : "0 2px 8px rgba(34, 197, 94, 0.08)"
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div
                      style={{
                        background: n.type === "submission" ? "#e0e7ff" : n.type === "allocation" ? "#fef3c7" : "#dcfce7",
                        color: n.type === "submission" ? "#4338ca" : n.type === "allocation" ? "#b45309" : "#15803d",
                        padding: "8px",
                        borderRadius: "10px",
                        marginTop: "2px"
                      }}
                    >
                      {n.type === "submission" ? <Send size={18} /> : n.type === "allocation" ? <UserCheck size={18} /> : <CheckCircle2 size={18} />}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span style={{ background: "#22c55e", color: "#ffffff", padding: "1px 6px", borderRadius: "8px", fontSize: "10px", fontWeight: "800" }}>
                            NEW
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                        {n.message}
                      </p>

                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
                        {n.timestamp} {n.recipientRole ? `• Target Role: ${n.recipientRole}` : ""}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {n.ideaId && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Eye}
                        onClick={() => {
                          handleMarkOneRead(n.id);
                          navigate(`/screening-evaluation/${n.ideaId}`);
                        }}
                      >
                        View Proposal
                      </Button>
                    )}

                    {!n.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkOneRead(n.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

export default NotificationsPage;
