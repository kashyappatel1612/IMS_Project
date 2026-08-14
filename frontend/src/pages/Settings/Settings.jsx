import { useState, useEffect } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  Bell,
  Check,
  Sun,
  Moon,
  Palette
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { updateUserProfile } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

function Settings() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const [user, setUser] = useState({
    username: "",
    email: "",
    role: "User",
    employeeId: ""
  });

  const [formData, setFormData] = useState({
    username: "",
    employeeId: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    screeningUpdates: true,
    weeklyReport: false
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        setUser({
          username: parsed.username || "",
          email: parsed.email || "",
          role: parsed.role || "User",
          employeeId: parsed.employeeId || ""
        });
        setFormData((prev) => ({
          ...prev,
          username: parsed.username || "",
          employeeId: parsed.employeeId || ""
        }));
      } catch (err) {
        console.error("Failed to load user settings:", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!formData.username.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setErrorMsg("Please enter your current password to update security credentials.");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setErrorMsg("New passwords do not match!");
        return;
      }
      if (formData.newPassword.length < 6) {
        setErrorMsg("New password must be at least 6 characters long.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        email: user.email,
        username: formData.username.trim(),
        employeeId: formData.employeeId.trim(),
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || undefined
      };

      const res = await updateUserProfile(payload);
      setLoading(false);

      if (res && res.user) {
        const updatedCurrentUser = {
          ...user,
          username: res.user.username,
          employeeId: res.user.employeeId
        };
        setUser(updatedCurrentUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

        // Update user name in quick-switch login history as well
        const savedHistoryStr = localStorage.getItem("idea360LoginHistory");
        if (savedHistoryStr) {
          try {
            let history = JSON.parse(savedHistoryStr);
            history = history.map((h) => {
              if (h.email && h.email.toLowerCase() === user.email.toLowerCase()) {
                return { ...h, username: res.user.username };
              }
              return h;
            });
            localStorage.setItem("idea360LoginHistory", JSON.stringify(history));
          } catch (e) {
            console.error("Failed to update login history username:", e);
          }
        }

        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));

        setSuccessMsg("Profile & database record updated successfully!");
        
        // Trigger page reload after 1 second so Navbar reflects new username
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || "Failed to update profile in database.");
    }
  };

  const userInitial = user.username
    ? user.username.trim().charAt(0).toUpperCase()
    : "U";

  return (
    <div className="dashboard-wrapper">
      {/* Top Banner Header */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
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
              <User size={14} /> My Profile & Account Settings
            </span>
          </div>
          <h1>User Account Management</h1>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Profile Card Header Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)",
            borderRadius: "16px",
            padding: "24px",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "24px",
            boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.3)"
          }}
        >
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "#ffffff",
              color: "#4f46e5",
              fontSize: "28px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            {userInitial}
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#ffffff" }}>
              {user.username || "Loading Profile..."}
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#e0e7ff", opacity: 0.9 }}>
              {user.email || "user@imsgroup.com"}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "20px",
                background: user.role === "Administrator" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(4px)",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
            >
              {user.role === "Administrator" ? <ShieldCheck size={16} /> : <User size={16} />}
              {user.role} Account
            </span>
          </div>
        </div>

        {/* Alert Notifications */}
        {successMsg && (
          <div className="auth-alert success" style={{ marginBottom: "20px" }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="auth-alert error" style={{ marginBottom: "20px" }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Profile Information */}
          <Card title="1. Profile Details">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              <Input
                label="Full Name / Display Name"
                name="username"
                placeholder="e.g. Ayushman Raj"
                value={formData.username}
                onChange={handleChange}
                icon={User}
                required
              />

              <Input
                label="Registered Work Email Address (Verified)"
                type="email"
                name="email"
                value={user.email}
                icon={Mail}
                disabled
                helperText="Email address is permanent and cannot be altered directly."
              />

              <Input
                label="Employee ID / Authorization Key"
                name="employeeId"
                placeholder="e.g. IMS-ADMIN-2026"
                value={formData.employeeId}
                onChange={handleChange}
                icon={KeyRound}
                helperText="Official employee registration key"
              />
            </div>
          </Card>

          <div style={{ height: "20px" }}></div>

          {/* Section 2: Security & Password */}
          <Card title="2. Account Security & Password">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              <Input
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                icon={Lock}
                rightAction={showCurrentPassword ? EyeOff : Eye}
                onRightActionClick={() => setShowCurrentPassword(!showCurrentPassword)}
                helperText="Required only if changing your password"
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Input
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Minimum 6 characters"
                  value={formData.newPassword}
                  onChange={handleChange}
                  icon={Lock}
                  rightAction={showNewPassword ? EyeOff : Eye}
                  onRightActionClick={() => setShowNewPassword(!showNewPassword)}
                />

                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={Lock}
                  rightAction={showConfirmPassword ? EyeOff : Eye}
                  onRightActionClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>
            </div>
          </Card>

          <div style={{ height: "20px" }}></div>

          {/* Section 3: Appearance & Theme Preferences */}
          <Card title="3. Appearance & Theme Preferences">
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "10px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                
                {/* Light Mode Option Box */}
                <div
                  onClick={() => setTheme("light")}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: theme === "light" ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                    background: theme === "light" ? "var(--primary-light, #eef2ff)" : "var(--bg-main)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6366f1"
                    }}
                  >
                    <Sun size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)", display: "block" }}>
                      Light Theme
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Clean, high-visibility bright workspace
                    </span>
                  </div>
                  {theme === "light" && <Check size={18} color="var(--primary)" style={{ marginLeft: "auto" }} />}
                </div>

                {/* Dark Mode Option Box */}
                <div
                  onClick={() => setTheme("dark")}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: theme === "dark" ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                    background: theme === "dark" ? "rgba(99, 102, 241, 0.15)" : "var(--bg-main)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#1e293b",
                      border: "1px solid #334155",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f59e0b"
                    }}
                  >
                    <Moon size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-dark)", display: "block" }}>
                      Dark Theme
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Sleek, low-glare dark slate workspace
                    </span>
                  </div>
                  {theme === "dark" && <Check size={18} color="var(--primary)" style={{ marginLeft: "auto" }} />}
                </div>

              </div>
            </div>
          </Card>

          <div style={{ height: "20px" }}></div>

          {/* Section 4: Notification Preferences */}
          <Card title="4. Notification Preferences">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Bell size={18} color="var(--primary)" />
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "700", display: "block" }}>Email Notifications</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Receive email updates when your proposals advance through evaluation stages</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={18} color="#16a34a" />
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "700", display: "block" }}>Screening & Review Alerts</span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Get instant alerts when evaluator notes are added to your ideas</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.screeningUpdates}
                  onChange={(e) => setNotifications({ ...notifications, screeningUpdates: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                />
              </label>
            </div>
          </Card>

          {/* Form Action Buttons */}
          <div className="submit-form-actions" style={{ marginTop: "24px", marginBottom: "40px" }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
