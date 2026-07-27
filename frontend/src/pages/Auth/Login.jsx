import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, User, ShieldCheck, KeyRound } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import imsLogo from "../../assets/ims-logo.jpg";
import { switchAccount } from "../../utils/authHistory";
import { loginUser } from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Administrator"); // 'User' | 'Administrator'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const VALID_ADMIN_KEYS = ["IMS-ADMIN-2026", "EMP-ADMIN-101", "ADMIN123"];

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

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (role === "Administrator" && !employeeId.trim()) {
      setError("Employee ID / Admin Key is required for Administrator sign in.");
      return;
    }

    setLoading(true);

    try {
      // 1. Try Backend PostgreSQL Auth API
      const response = await loginUser({ email, password, role, employeeId });
      if (response && response.user) {
        switchAccount(response.user, navigate);
        return;
      }
    } catch (apiErr) {
      console.warn("Backend Auth Notice:", apiErr.message);

      // Fallback to local authentication
      if (email.trim().toLowerCase() === "admin@imsgroup.com" && password === "admin123") {
        if (role !== "Administrator") {
          setError("This account is registered as Administrator. You cannot log in under the User role!");
          setLoading(false);
          return;
        }
        if (!VALID_ADMIN_KEYS.includes(employeeId.trim().toUpperCase())) {
          setError("Invalid Employee ID / Admin Key! Use IMS-ADMIN-2026 or EMP-ADMIN-101.");
          setLoading(false);
          return;
        }
        const adminAcc = {
          username: "Ayushman Raj",
          email: "admin@imsgroup.com",
          role: "Administrator",
          employeeId: employeeId.trim()
        };
        switchAccount(adminAcc, navigate);
        return;
      }

      let users = [];
      const usersStr = localStorage.getItem("idea360Users");
      if (usersStr) {
        try { users = JSON.parse(usersStr); } catch (err) { users = []; }
      }

      const singleUserStr = localStorage.getItem("idea360User");
      if (singleUserStr) {
        try {
          const singleUser = JSON.parse(singleUserStr);
          if (!users.some((u) => u.email.toLowerCase() === singleUser.email.toLowerCase())) {
            users.push(singleUser);
          }
        } catch (err) { console.error(err); }
      }

      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!foundUser) {
        setError(apiErr.message || "Account not found! Check your email address or register first.");
        setLoading(false);
        return;
      }

      if (foundUser.role && foundUser.role !== role) {
        setError(
          `This account was created as "${foundUser.role}". You cannot sign in under "${role}" role!`
        );
        setLoading(false);
        return;
      }

      if (foundUser.password !== password) {
        setError("Incorrect password! Please try again.");
        setLoading(false);
        return;
      }

      const loggedInAcc = {
        username: foundUser.username || "User",
        email: foundUser.email,
        role: foundUser.role || role,
        employeeId: foundUser.employeeId || employeeId
      };
      switchAccount(loggedInAcc, navigate);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Side-by-Side Logo & Heading */}
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
          {/* Role Selection Field */}
          <div className="role-selector-container">
            <label className="role-selector-label">Select Account Role</label>
            <div className="role-tabs-grid">
              <button
                type="button"
                className={`role-tab-btn ${role === "User" ? "active" : ""}`}
                onClick={() => setRole("User")}
              >
                <User size={15} />
                <span>User</span>
              </button>

              <button
                type="button"
                className={`role-tab-btn ${role === "Administrator" ? "active" : ""}`}
                onClick={() => setRole("Administrator")}
              >
                <ShieldCheck size={15} />
                <span>Administrator</span>
              </button>
            </div>
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

          {role === "Administrator" && (
            <Input
              label="Employee ID / Admin Key"
              type="text"
              placeholder="e.g. IMS-ADMIN-2026 or EMP-ADMIN-101"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              icon={KeyRound}
              helperText="Enter your official Admin Employee ID"
              required
            />
          )}

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