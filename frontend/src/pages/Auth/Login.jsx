import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, User, ShieldCheck } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import imsLogo from "../../assets/ims-logo.jpg";
import { switchAccount } from "../../utils/authHistory";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Administrator"); // 'User' | 'Administrator'
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

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const savedUserStr = localStorage.getItem("idea360User");

      // Default demo login check for admin@imsgroup.com / admin123
      if (email.trim().toLowerCase() === "admin@imsgroup.com" && password === "admin123") {
        const adminAcc = {
          username: "Ayushman Raj",
          email: "admin@imsgroup.com",
          role: role
        };
        switchAccount(adminAcc, navigate);
        return;
      }

      if (!savedUserStr) {
        setError("No account found with this email! Please register first or use admin@imsgroup.com");
        setLoading(false);
        return;
      }

      try {
        const savedUser = JSON.parse(savedUserStr);

        if (savedUser.email.toLowerCase() !== email.trim().toLowerCase()) {
          setError("Account not found! Check your email address or register.");
          setLoading(false);
          return;
        }

        if (savedUser.password !== password) {
          setError("Incorrect password! Please try again.");
          setLoading(false);
          return;
        }

        // Login successful
        const loggedInAcc = {
          username: savedUser.username || "User",
          email: savedUser.email,
          role: role
        };
        switchAccount(loggedInAcc, navigate);
      } catch (err) {
        console.error("Auth Parse Error", err);
        setError("Authentication failed. Please try again.");
        setLoading(false);
      }
    }, 400);
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