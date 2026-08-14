import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  User,
  UserCheck,
  ShieldCheck,
  BarChart,
  FileCheck,
  FolderKanban,
  ChevronDown,
  Check,
  Sparkles,
  TrendingUp,
  Zap,
  Lightbulb,
  Globe
} from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import imsLogo from "../../assets/ims-logo.jpg";
import { switchAccount } from "../../utils/authHistory";
import { loginUser } from "../../services/api";

import AuthStage from "../../components/AuthStage";

const ROLES_OPTIONS = [
  { id: "User", label: "User", icon: User, color: "#38bdf8", desc: "Submit & Track Proposals" },
  { id: "Project Coordinator", label: "Project Coordinator", icon: UserCheck, color: "#10b981", desc: "Pipeline & Role Allocations" },
  { id: "Administrator", label: "Administrator", icon: ShieldCheck, color: "#818cf8", desc: "Full Governance & Systems" },
  { id: "Business Analyst", label: "Business Analyst", icon: BarChart, color: "#3b82f6", desc: "BRD/FRD & ROI Studies" },
  { id: "Reviewer", label: "Reviewer", icon: FileCheck, color: "#f59e0b", desc: "Stage Screening & Feasibility" },
  { id: "Project Manager", label: "Project Manager", icon: FolderKanban, color: "#a855f7", desc: "Sprints, Execution & Releases" }
];

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("User");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const flash = localStorage.getItem("authFlash");
    if (flash) {
      setSuccessMsg(flash);
      localStorage.removeItem("authFlash");
    }

    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/dashboard");
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const activeRoleObj = ROLES_OPTIONS.find((r) => r.id === role) || ROLES_OPTIONS[0];
  const ActiveRoleIcon = activeRoleObj.icon;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({ email: cleanEmail, password, role });
      setLoading(false);

      if (response && response.user) {
        const userObj = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role || role,
          employeeId: response.user.employeeId || ""
        };
        switchAccount(userObj, navigate);
        return;
      }
    } catch (apiErr) {
      setLoading(false);
      setError(apiErr.message || `Account not found for "${cleanEmail}". Please register first!`);
    }
  };

  return (
    <div className="emerald-auth-page">
      <div className="emerald-auth-card">
        
        {/* SHARED AUTOMATED IMS GROUP ORBITING STAGE */}
        <AuthStage isSubmitting={loading} />

        {/* RIGHT PANEL — LOGIN FORM (IMS BRANDING) */}
        <div className="emerald-right-panel">
          
          {/* User Avatar Circle Header */}
          <div className="emerald-avatar-wrapper">
            <div className="emerald-avatar-circle">
              <User size={30} color="#38bdf8" />
            </div>
            <h2 className="emerald-welcome-title">WELCOME</h2>
            <p className="emerald-welcome-subtitle">IMS Group Innovation Portal</p>
          </div>

          {successMsg && (
            <div className="auth-alert success" style={{ marginBottom: "12px" }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="auth-alert error" style={{ marginBottom: "12px" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="emerald-login-form">
            
            {/* Animated Account Role Dropdown */}
            <div className="input-field-group">
              <label className="input-label" style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1" }}>
                ACCOUNT ROLE
              </label>

              <div className="emerald-role-dropdown-wrapper" ref={dropdownRef}>
                <div
                  className={`emerald-role-trigger ${isDropdownOpen ? "open" : ""}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="emerald-role-trigger-left">
                    <div className="emerald-role-icon-box">
                      <ActiveRoleIcon size={18} color={activeRoleObj.color} />
                    </div>
                    <div>
                      <div className="emerald-role-item-title">{activeRoleObj.label}</div>
                      <div className="emerald-role-item-desc">{activeRoleObj.desc}</div>
                    </div>
                  </div>
                  <ChevronDown size={18} className={`emerald-role-chevron ${isDropdownOpen ? "open" : ""}`} />
                </div>

                {isDropdownOpen && (
                  <div className="emerald-role-dropdown-popover">
                    {ROLES_OPTIONS.map((item) => {
                      const ItemIcon = item.icon;
                      const isSelected = item.id === role;
                      return (
                        <div
                          key={item.id}
                          className={`emerald-role-item ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            setRole(item.id);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div className="emerald-role-item-left">
                            <div className="emerald-role-icon-box" style={{ background: isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.06)" }}>
                              <ItemIcon size={16} color={item.color} />
                            </div>
                            <div>
                              <div className="emerald-role-item-title">{item.label}</div>
                              <div className="emerald-role-item-desc">{item.desc}</div>
                            </div>
                          </div>
                          {isSelected && <Check size={16} color="#38bdf8" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Email Address */}
            <div className="input-field-group">
              <label className="input-label" style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                USERNAME / EMAIL
              </label>
              <div className="emerald-input-wrapper">
                <Mail size={16} className="emerald-input-icon" />
                <input
                  type="email"
                  className="emerald-line-input"
                  placeholder="name@imsgroup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-field-group">
              <label className="input-label" style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                PASSWORD
              </label>
              <div className="emerald-input-wrapper">
                <Lock size={16} className="emerald-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="emerald-line-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="emerald-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="emerald-forgot-row">
              <Link to="/forgot-password" className="emerald-forgot-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="emerald-login-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner"></span>
              ) : (
                `LOGIN AS ${role.toUpperCase()}`
              )}
            </button>
          </form>

          {/* QUICK DEMO ROLE ACCOUNTS SWITCHER */}
          <div className="emerald-quick-roles-section" style={{ marginTop: "20px", textAlign: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "8px" }}>
              ⚡ Quick Demo 1-Click Accounts
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { role: "User", email: "user@imsgroup.com", pwd: "Password@123", color: "#38bdf8" },
                { role: "PC", fullRole: "Project Coordinator", email: "pc@imsgroup.com", pwd: "Password@123", color: "#10b981" },
                { role: "Admin", fullRole: "Administrator", email: "admin@imsgroup.com", pwd: "Password@123", color: "#818cf8" },
                { role: "BA", fullRole: "Business Analyst", email: "ba@imsgroup.com", pwd: "Password@123", color: "#3b82f6" },
                { role: "Reviewer", fullRole: "Reviewer", email: "reviewer@imsgroup.com", pwd: "Password@123", color: "#f59e0b" },
                { role: "PM", fullRole: "Project Manager", email: "pm@imsgroup.com", pwd: "Password@123", color: "#a855f7" }
              ].map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => {
                    setRole(acc.fullRole || acc.role);
                    setEmail(acc.email);
                    setPassword(acc.pwd);
                    setError("");
                  }}
                  style={{
                    background: "rgba(30, 41, 59, 0.7)",
                    border: `1px solid ${acc.color}55`,
                    color: acc.color,
                    padding: "4px 10px",
                    borderRadius: "14px",
                    fontSize: "11px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = acc.color;
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.boxShadow = `0 0 12px ${acc.color}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(30, 41, 59, 0.7)";
                    e.currentTarget.style.color = acc.color;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>

          {/* Account Switch & Registration Links */}
          <div className="emerald-footer-links" style={{ marginTop: "16px" }}>
            <p style={{ color: "#94a3b8", fontSize: "12.5px" }}>
              Don't have an account?{" "}
              <Link to="/register" className="emerald-reg-link" style={{ color: "#38bdf8", fontWeight: "700" }}>
                Create Account
              </Link>
            </p>

            <div style={{ marginTop: "12px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "4px 12px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
              <ShieldCheck size={13} />
              <span>IMS 256-Bit Encrypted & Role Secured</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;