import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, ShieldCheck, KeyRound } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import imsLogo from "../../assets/ims-logo.jpg";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("User"); // 'User' | 'Administrator'
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const VALID_ADMIN_KEYS = ["IMS-ADMIN-2026", "EMP-ADMIN-101", "ADMIN123"];

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) && pass.length >= 8) score += 1;

    if (score === 1) return { score: 1, label: "Weak", class: "strength-weak" };
    if (score === 2) return { score: 2, label: "Medium", class: "strength-medium" };
    if (score === 3) return { score: 3, label: "Strong", class: "strength-strong" };
    return { score: 1, label: "Weak", class: "strength-weak" };
  };

  const strength = calculatePasswordStrength(formData.password);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    if (!formData.username.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (role === "Administrator") {
      if (!formData.adminKey.trim()) {
        setError("Admin Authorization Key / Employee ID is required to register as Administrator.");
        return;
      }
      if (!VALID_ADMIN_KEYS.includes(formData.adminKey.trim().toUpperCase())) {
        setError("Invalid Admin Authorization Key! Use IMS-ADMIN-2026 or EMP-ADMIN-101.");
        return;
      }
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const existingUserStr = localStorage.getItem("idea360User");
      if (existingUserStr) {
        try {
          const existingUser = JSON.parse(existingUserStr);
          if (existingUser.email.toLowerCase() === formData.email.trim().toLowerCase()) {
            setError("Email address is already registered! Please sign in.");
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
      const newUser = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: role
      };
      localStorage.setItem("idea360User", JSON.stringify(newUser));
      localStorage.setItem("authFlash", `Account created as ${role}! Please sign in.`);

      navigate("/");
    }, 400);
  };
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Side-by-Side Logo & Heading */}
        <div className="auth-brand-header">
          <img src={imsLogo} alt="IMS Group" className="auth-brand-logo" />
          <div className="auth-brand-titles">
            <h2>Create Account</h2>
            <p>Join IMS Group Innovation Portal</p>
          </div>
        </div>
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleRegister} className="auth-form">
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
            label="Full Name / Username"
            name="username"
            placeholder="Ayushman Raj"
            value={formData.username}
            onChange={handleChange}
            icon={User}
            required
          />
          <Input
            label="Work Email Address"
            type="email"
            name="email"
            placeholder="ayushman@imsgroup.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            required
          />
          {/* Mandatory Admin Key field if Administrator role selected */}
          {role === "Administrator" && (
            <Input
              label="Admin Security Code / Employee ID"
              name="adminKey"
              placeholder="e.g. IMS-ADMIN-2026"
              value={formData.adminKey}
              onChange={handleChange}
              icon={KeyRound}
              helperText="Only authorized personnel (Key: IMS-ADMIN-2026 or EMP-ADMIN-101)"
              required
            />
          )}
          <div>
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create strong password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              rightAction={showPassword ? EyeOff : Eye}
              onRightActionClick={() => setShowPassword(!showPassword)}
              required
            />
            {formData.password && (
              <div className={`strength-meter-container ${strength.class}`}>
                <div className="strength-bars-flex">
                  <div className="strength-bar-segment bar-1"></div>
                  <div className="strength-bar-segment bar-2"></div>
                  <div className="strength-bar-segment bar-3"></div>
                </div>
                <span className="strength-label-text">
                  Password strength: {strength.label}
                </span>
              </div>
            )}
          </div>
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={Lock}
            rightAction={showConfirmPassword ? EyeOff : Eye}
            onRightActionClick={() => setShowConfirmPassword(!showConfirmPassword)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={UserPlus}
          >
            Register as {role}
          </Button>
        </form>
        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Register;