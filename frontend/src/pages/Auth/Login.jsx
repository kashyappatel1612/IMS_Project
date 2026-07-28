import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, UserCheck } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import imsLogo from "../../assets/ims-logo.jpg";
import { switchAccount } from "../../utils/authHistory";
import { loginUser } from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("User");
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
  }, [navigate]);

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
      // 1. Authenticate against PostgreSQL FastAPI Backend (Single Source of Truth)
      const response = await loginUser({ email: cleanEmail, password, role });
      setLoading(false);

      if (response && response.user) {
        // Authenticated successfully via DB
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
      // DISPLAY BACKEND AUTHENTICATION ERROR DIRECTLY (No local bypass allowed!)
      setError(apiErr.message || `Account not found for "${cleanEmail}". You must register an account first before signing in!`);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <img src={imsLogo} alt="IMS Group" className="auth-brand-logo" />
          <div className="auth-brand-titles">
            <h2>Sign In to Idea360</h2>
            <p>IMS Group Innovation Portal</p>
          </div>
        </div>

        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          {/* Select Account Role Dropdown */}
          <div className="input-field-group">
            <label className="input-label" style={{ fontWeight: "700", color: "var(--text-dark)" }}>
              Select Account Role <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              className="custom-input-elem custom-select-elem"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ fontSize: "14px", padding: "11px 14px", fontWeight: "600", width: "100%" }}
              required
            >
              <option value="User">User</option>
              <option value="Administrator">Administrator</option>
              <option value="Business Analyst">Business Analyst</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Project Manager">Project Manager</option>
            </select>
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="name@imsgroup.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            rightAction={showPassword ? EyeOff : Eye}
            onRightActionClick={() => setShowPassword(!showPassword)}
            required
          />

          <div className="auth-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={LogIn}
          >
            Sign In as {role}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;