import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send, KeyRound } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import AuthStage from "../../components/AuthStage";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleReset = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      let foundAccount = false;

      try {
        const usersListStr = localStorage.getItem("idea360Users");
        if (usersListStr) {
          const usersList = JSON.parse(usersListStr);
          if (usersList.some((u) => u.email?.toLowerCase() === cleanEmail)) {
            foundAccount = true;
          }
        }
      } catch (err) {
        console.error(err);
      }

      try {
        const singleUserStr = localStorage.getItem("idea360User");
        if (singleUserStr) {
          const singleUser = JSON.parse(singleUserStr);
          if (singleUser.email?.toLowerCase() === cleanEmail) {
            foundAccount = true;
          }
        }
      } catch (err) {
        console.error(err);
      }

      try {
        const historyStr = localStorage.getItem("idea360LoginHistory");
        if (historyStr) {
          const historyList = JSON.parse(historyStr);
          if (historyList.some((h) => h.email?.toLowerCase() === cleanEmail)) {
            foundAccount = true;
          }
        }
      } catch (err) {
        console.error(err);
      }

      if (cleanEmail.includes("@")) {
        foundAccount = true;
      }

      if (!foundAccount) {
        setError("No account found with this email address. Please check your email or register.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="emerald-auth-page">
      <div className="emerald-auth-card">
        
        {/* SHARED AUTOMATED IMS GROUP ORBITING STAGE */}
        <AuthStage isSubmitting={loading} />

        {/* RIGHT PANEL — FORGOT PASSWORD FORM */}
        <div className="emerald-right-panel">
          
          {/* Header Avatar Circle */}
          <div className="emerald-avatar-wrapper">
            <div className="emerald-avatar-circle">
              <KeyRound size={28} color="#38bdf8" />
            </div>
            <h2 className="emerald-welcome-title">RESET PASSWORD</h2>
            <p className="emerald-welcome-subtitle">IMS Group Account Recovery</p>
          </div>

          {error && (
            <div className="auth-alert error" style={{ marginBottom: "12px" }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="auth-alert success">
                <CheckCircle2 size={20} />
                <span>
                  Reset instructions sent! Check your inbox for <strong>{email}</strong>.
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center" }}>
                Password reset link has been dispatched to your email address.
              </p>

              <Link to="/" style={{ width: "100%" }}>
                <button type="button" className="emerald-login-btn">
                  BACK TO SIGN IN
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="emerald-login-form">
              <div className="input-field-group">
                <label className="input-label" style={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                  REGISTERED EMAIL ADDRESS
                </label>
                <div className="emerald-input-wrapper">
                  <Mail size={16} className="emerald-input-icon" />
                  <input
                    type="email"
                    className="emerald-line-input"
                    placeholder="name@imsgroup.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="emerald-login-btn" disabled={loading} style={{ marginTop: "12px" }}>
                {loading ? <span className="btn-spinner"></span> : "SEND RESET INSTRUCTIONS"}
              </button>
            </form>
          )}

          {!success && (
            <div className="emerald-footer-links">
              <Link to="/" className="emerald-reg-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <ArrowLeft size={15} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
