import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import imsLogo from "../../assets/ims-logo.jpg";

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
      const savedUserStr = localStorage.getItem("idea360User");
      
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser.email.toLowerCase() !== email.trim().toLowerCase()) {
            setError("No account found with this email address.");
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        setError("No registered accounts found. Please create an account first.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Side-by-Side Logo & Heading (Bagal me) */}
        <div className="auth-brand-header">
          <img src={imsLogo} alt="IMS Group" className="auth-brand-logo" />
          <div className="auth-brand-titles">
            <h2>Reset Password</h2>
            <p>Enter email for instructions</p>
          </div>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="auth-alert success">
              <CheckCircle2 size={22} />
              <span>
                Reset instructions sent! Check your inbox for <strong>{email}</strong>.
              </span>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
              We've simulated sending a password reset token. You can now return to sign in.
            </p>

            <Link to="/" style={{ width: "100%" }}>
              <Button variant="primary" fullWidth icon={ArrowLeft}>
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="auth-form">
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="name@imsgroup.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon={Send}
            >
              Send Reset Instructions
            </Button>
          </form>
        )}
        {!success && (
          <div className="auth-footer">
            <Link to="/" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
export default ForgotPassword;
