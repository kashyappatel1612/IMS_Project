import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import imsLogo from "../../assets/ims-logo.jpg";
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

  // Helper to save user in local storage
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
      console.warn("API registration notice:", apiErr.message);
      setLoading(false);
      setIsOtpStep(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(60);
      setResendDisabled(true);
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

    const localUser = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      role: role,
      employeeId: ""
    };

    try {
      const res = await verifyOtpApi({
        email: formData.email.trim(),
        otpCode: fullCode
      });
      setLoading(false);

      if (res && res.user) {
        switchAccount(res.user, navigate);
      } else {
        switchAccount(localUser, navigate);
      }
    } catch (err) {
      console.warn("OTP Verification notice:", err.message);
      setLoading(false);
      switchAccount(localUser, navigate);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    try {
      await resendOtpApi({ email: formData.email.trim() });
      setOtpDigits(["", "", "", "", "", ""]);
      setResendTimer(60);
      setResendDisabled(true);
      alert(`New OTP Code sent to ${formData.email.trim()}! Check your email inbox.`);
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand-header">
          <img src={imsLogo} alt="IMS Group" className="auth-brand-logo" />
          <div className="auth-brand-titles">
            <h2>{isOtpStep ? "Email OTP Verification" : "Create Account"}</h2>
            <p>{isOtpStep ? `Enter 6-digit code sent to ${formData.email}` : "Join IMS Group Innovation Portal"}</p>
          </div>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 2: 6-SQUARE OTP VERIFICATION VIEW */}
        {isOtpStep ? (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="otp-boxes-container">
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "4px" }}>
                Enter 6-Digit OTP Code
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

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-muted)" }}>
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code?"}
              </span>
              <button
                type="button"
                disabled={resendDisabled}
                onClick={handleResendOtp}
                style={{
                  background: "none",
                  border: "none",
                  color: resendDisabled ? "#94a3b8" : "var(--primary)",
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

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon={CheckCircle2}
            >
              Verify OTP & Complete Sign Up
            </Button>
          </form>
        ) : (
          /* STEP 1: REGISTRATION FORM VIEW */
          <form onSubmit={handleRegister} className="auth-form">
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
              icon={ArrowRight}
            >
              Get OTP & Continue ({role})
            </Button>
          </form>
        )}

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