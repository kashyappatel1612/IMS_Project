import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/Button";
import Input from "../../components/Input";
import AuthStage from "../../components/AuthStage";
import { registerUser, verifyOtpApi, resendOtpApi } from "../../services/api";
import { switchAccount } from "../../utils/authHistory";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("User");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 6-Square OTP States
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Resend Timer Countdown
  useEffect(() => {
    let interval = null;
    if (isOtpStep && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, resendTimer]);

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

  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = ["", "", "", "", "", ""];
      cleanDigits.forEach((d, idx) => {
        if (idx < 6) newDigits[idx] = d;
      });
      setOtpDigits(newDigits);
      const lastInput = document.getElementById(`otp-box-5`);
      if (lastInput) lastInput.focus();
      return;
    }

    if (/\d/.test(value) || value === "") {
      const newDigits = [...otpDigits];
      newDigits[index] = value;
      setOtpDigits(newDigits);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-box-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const saveUserToLocalStorage = (userObj) => {
    try {
      let users = [];
      const existingStr = localStorage.getItem("idea360Users");
      if (existingStr) {
        users = JSON.parse(existingStr);
      }
      users = users.filter((u) => u.email.toLowerCase() !== userObj.email.toLowerCase());
      users.push(userObj);
      localStorage.setItem("idea360Users", JSON.stringify(users));
      localStorage.setItem("idea360User", JSON.stringify(userObj));
    } catch (err) {
      console.error("Local Storage Error:", err);
    }
  };

  // Step 1: Submit Registration -> Trigger OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username.trim()) {
      setError("Please enter your full name.");
      return;
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

    const newAcc = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: role,
      employeeId: ""
    };

    saveUserToLocalStorage(newAcc);

    try {
      const res = await registerUser(newAcc);
      setLoading(false);

      if (res && res.requiresOtp) {
        setIsOtpStep(true);
        setOtpDigits(["", "", "", "", "", ""]);
        setResendTimer(60);
        setResendDisabled(true);
      } else {
        localStorage.setItem("authFlash", `Account created as ${role}! Please sign in with your password.`);
        navigate("/");
      }
    } catch (apiErr) {
      console.error("API registration error:", apiErr.message);
      setLoading(false);
      setError(apiErr.message || "Failed to register account. Email might already exist.");
    }
  };

  // Step 2: Verify 6-Digit OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    const fullCode = otpDigits.join("");
    if (fullCode.length < 6) {
      setError("Please enter all 6 digits of the OTP verification code.");
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOtpApi({
        email: formData.email.trim(),
        otpCode: fullCode
      });
      setLoading(false);

      if (res && res.user) {
        switchAccount(res.user, navigate);
      } else {
        setError("Invalid verification response from the server.");
      }
    } catch (err) {
      console.error("OTP Verification error:", err.message);
      setLoading(false);
      setError(err.message || "Invalid or expired OTP code! Please check your email inbox.");
    }
  };

  const handleResendOtp = async () => {
    setError("");
    try {
      await resendOtpApi({ email: formData.email.trim() });
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(60);
      setResendDisabled(true);
      toast.success(`New OTP Code sent to ${formData.email.trim()}! Check your email inbox.`);
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="emerald-auth-page">
      <div className="emerald-auth-card">
        
        {/* SHARED AUTOMATED IMS GROUP ORBITING STAGE */}
        <AuthStage isSubmitting={loading} />

        {/* RIGHT PANEL — REGISTRATION FORM */}
        <div className="emerald-right-panel" style={{ padding: "36px 36px" }}>
          
          {/* Header Avatar Circle */}
          <div className="emerald-avatar-wrapper" style={{ marginBottom: "16px" }}>
            <div className="emerald-avatar-circle">
              <UserPlus size={28} color="#38bdf8" />
            </div>
            <h2 className="emerald-welcome-title">
              {isOtpStep ? "OTP VERIFICATION" : "CREATE ACCOUNT"}
            </h2>
            <p className="emerald-welcome-subtitle">
              {isOtpStep ? `6-Digit Code sent to ${formData.email}` : "Join IMS Group Innovation Portal"}
            </p>
          </div>

          {error && (
            <div className="auth-alert error" style={{ marginBottom: "12px" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 2: 6-SQUARE OTP VERIFICATION VIEW */}
          {isOtpStep ? (
            <form onSubmit={handleVerifyOtp} className="emerald-login-form">
              <div className="otp-boxes-container">
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                  ENTER 6-DIGIT OTP CODE
                </label>

                <div className="otp-boxes-grid">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-box-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="otp-digit-box"
                      autoFocus={index === 0}
                      required
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "#64748b" }}>
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code?"}
                </span>
                <button
                  type="button"
                  disabled={resendDisabled}
                  onClick={handleResendOtp}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendDisabled ? "#94a3b8" : "#2563eb",
                    fontWeight: "700",
                    cursor: resendDisabled ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <RefreshCw size={13} /> Resend OTP
                </button>
              </div>

              <button type="submit" className="emerald-login-btn" disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : "VERIFY OTP & SIGN UP"}
              </button>
            </form>
          ) : (
            /* STEP 1: REGISTRATION FORM VIEW */
            <form onSubmit={handleRegister} className="emerald-login-form">
              
              {/* Account Role Dropdown */}
              <div className="input-field-group">
                <label className="input-label" style={{ fontSize: "11.5px", fontWeight: "600", color: "#475569" }}>
                  ACCOUNT ROLE
                </label>
                <select
                  className="emerald-input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ padding: "8px 10px", fontSize: "13px" }}
                  required
                >
                  <option value="User">User</option>
                  <option value="Project Coordinator">Project Coordinator</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Project Manager">Project Manager</option>
                </select>
              </div>

              {/* Full Name */}
              <div className="input-field-group">
                <label className="input-label" style={{ fontSize: "11.5px", fontWeight: "600", color: "#475569" }}>
                  FULL NAME / USERNAME
                </label>
                <div className="emerald-input-wrapper">
                  <User size={15} className="emerald-input-icon" />
                  <input
                    type="text"
                    name="username"
                    className="emerald-line-input"
                    placeholder="Ayushman Raj"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="input-field-group">
                <label className="input-label" style={{ fontSize: "11.5px", fontWeight: "600", color: "#475569" }}>
                  WORK EMAIL ADDRESS
                </label>
                <div className="emerald-input-wrapper">
                  <Mail size={15} className="emerald-input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="emerald-line-input"
                    placeholder="ayushman@imsgroup.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-field-group">
                <label className="input-label" style={{ fontSize: "11.5px", fontWeight: "600", color: "#475569" }}>
                  PASSWORD
                </label>
                <div className="emerald-input-wrapper">
                  <Lock size={15} className="emerald-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="emerald-line-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="emerald-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="input-field-group">
                <label className="input-label" style={{ fontSize: "11.5px", fontWeight: "600", color: "#475569" }}>
                  CONFIRM PASSWORD
                </label>
                <div className="emerald-input-wrapper">
                  <Lock size={15} className="emerald-input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="emerald-line-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="emerald-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="emerald-login-btn" disabled={loading} style={{ marginTop: "4px" }}>
                {loading ? <span className="btn-spinner"></span> : `CONTINUE AS ${role.toUpperCase()}`}
              </button>
            </form>
          )}

          <div className="emerald-footer-links" style={{ marginTop: "14px" }}>
            <p>
              Already have an account?{" "}
              <Link to="/" className="emerald-reg-link">
                Sign In
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Register;