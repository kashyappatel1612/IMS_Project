import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  ArrowLeft,
  Paperclip,
  FileText,
  X,
  CheckCircle2,
  Send,
  UploadCloud,
  Info,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Bell,
  User,
  Check
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import { saveNewIdea } from "../../utils/ideaStorage";
import { createNotification } from "../../utils/notificationStorage";

function SubmitIdea() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userName, setUserName] = useState("Ayushman");
  const [userEmail, setUserEmail] = useState("");

  // Form Fields - Section 1: Basic Idea Info & Categorization
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaCategory, setIdeaCategory] = useState("Transportation");
  const [customCategory, setCustomCategory] = useState("");
  const [functionalArea, setFunctionalArea] = useState("");
  const [targetUser, setTargetUser] = useState("");

  // Form Fields - Section 2: Problem & Solution Statement
  const [problemStatement, setProblemStatement] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [expectedBenefits, setExpectedBenefits] = useState("");

  // File Attachment State
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Success Modal State
  const [submittedIdeaModal, setSubmittedIdeaModal] = useState(null);

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.username) setUserName(savedUser.username);
        if (savedUser.email) setUserEmail(savedUser.email);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit!");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileDataUri = event.target?.result;
      setAttachment({
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
        fileType: file.type || "application/pdf",
        fileData: fileDataUri
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      alert("Error reading file!");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setIdeaTitle("");
    setIdeaCategory("Transportation");
    setCustomCategory("");
    setFunctionalArea("");
    setTargetUser("");
    setProblemStatement("");
    setIdeaDescription("");
    setProposedSolution("");
    setExpectedBenefits("");
    setAttachment(null);
    setSubmittedIdeaModal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ideaTitle.trim() || !problemStatement.trim() || !ideaDescription.trim()) {
      alert("Please fill all required fields marked with *");
      return;
    }

    if (ideaCategory === "Others" && !customCategory.trim()) {
      alert("Please specify your Industry Domain in the text field.");
      return;
    }

    const finalCategory = ideaCategory === "Others" ? customCategory.trim() : ideaCategory;

    setSubmitting(true);

    try {
      const savedIdea = await saveNewIdea({
        title: ideaTitle,
        category: finalCategory,
        functionalArea: functionalArea,
        targetUser: targetUser,
        author: userName || "User",
        authorEmail: userEmail || "",
        problemStatement: problemStatement,
        description: ideaDescription,
        proposedSolution: proposedSolution,
        expectedBenefits: expectedBenefits,
        expectedOutcome: expectedBenefits,
        attachment: attachment
      });

      // Broadcast High Priority Notification to Project Coordinator
      createNotification({
        recipientRole: "Project Coordinator",
        title: `🚀 New Idea Proposal Submitted: ${ideaTitle}`,
        message: `Submitted by ${userName} (${userEmail || "User"}) in Domain: ${finalCategory}. Problem: ${problemStatement.slice(0, 100)}...`,
        ideaId: savedIdea ? savedIdea.id : null,
        type: "submission"
      });

      // Trigger Enterprise Success Modal
      setSubmittedIdeaModal(savedIdea);
    } catch (err) {
      console.error(err);
      alert("Failed to save idea to database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ maxWidth: "960px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* Centered Top Header Banner with Back Navigation */}
      <div className="dashboard-header-flex" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
            <span
              style={{
                background: "var(--primary-light)",
                color: "var(--primary)",
                padding: "3px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Lightbulb size={14} /> New Proposal Page
            </span>
          </div>
          <h1>Submit Your Innovation Proposal</h1>
          <p>Provide details of your innovative concept and attach supporting documentation.</p>
        </div>

        {/* Submitter Info & Guidelines Banner Bar */}
        <div
          style={{
            width: "100%",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "6px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <User size={16} color="var(--primary)" />
            <span>Submitter: <strong>{userName}</strong> ({userEmail || "user@imsgroup.com"})</span>
          </div>

          <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
            <Info size={14} color="#3b82f6" />
          </div>
        </div>
      </div>

      {/* CLEAN CENTERED SINGLE-COLUMN FORM */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
        {/* Card 1: Title & Category */}
        <Card title="1. Idea Identification & Domain" subtitle="Basic details for categorization and routing to domain reviewers">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Input
              label="Proposal Title *"
              placeholder="e.g. AI-Driven Automated Inventory Monitoring System"
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              required
            />

            <div className="input-field-group">
              <label className="input-label">Industry Domain Category *</label>
              <select
                className="custom-input-elem"
                value={ideaCategory}
                onChange={(e) => setIdeaCategory(e.target.value)}
              >
                <option value="Transportation">Transportation</option>
                <option value="HR">HR</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Retail">Retail</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="IT">IT</option>
                <option value="Insurance">Insurance</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Logistics">Logistics</option>
                <option value="Government">Government</option>
                <option value="Education">Education</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {ideaCategory === "Others" && (
              <Input
                label="Specify Custom Domain *"
                placeholder="e.g. Clean Energy"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            )}

            <Input
              label="Functional Area / Department"
              placeholder="e.g. Operations, Customer Care"
              value={functionalArea}
              onChange={(e) => setFunctionalArea(e.target.value)}
            />

            <Input
              label="Target End User / Stakeholder Persona"
              placeholder="e.g. Store Managers, Warehouse Supervisors, End Consumers"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
            />
          </div>
        </Card>

        {/* Card 2: Problem & Solution */}
        <Card title="2. Problem Statement" subtitle="Describe the problem statement and how your proposed innovation resolves it">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label"> Problem Statement *</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Describe the current operational friction, bottleneck, or inefficiency..."
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="input-field-group">
              <label className="input-label">Idea Description *</label>
              <textarea
                className="custom-input-elem"
                rows={4}
                placeholder="Explain how your solution works, core features, and system workflow..."
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="input-field-group">
              <label className="input-label">Expected Benefits</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="e.g. Estimated 40% reduction in processing time, $50k annual cost savings..."
                value={expectedBenefits}
                onChange={(e) => setExpectedBenefits(e.target.value)}
              ></textarea>
            </div>
          </div>
        </Card>

        {/* Card 3: Supporting Document Attachment */}
        <Card title="3. Attachments" subtitle="Upload architecture diagrams, wireframes, or business presentations (Max 10MB)">
          <div className="input-field-group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx"
            />

            {!attachment ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "10px",
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f8fafc",
                  transition: "all 0.2s ease"
                }}
              >
                <UploadCloud size={36} color="var(--primary)" style={{ marginBottom: "8px" }} />
                <div style={{ fontWeight: "700", color: "#334155", fontSize: "14px" }}>
                  {isUploading ? "Uploading file..." : "Click to browse & upload attachment"}
                </div>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Supports PDF, DOCX, XLSX, PNG, JPG (Up to 10MB)</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#e0e7ff", padding: "12px 16px", borderRadius: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={24} color="#4338ca" />
                  <div>
                    <div style={{ fontWeight: "700", color: "#3730a3", fontSize: "13px" }}>{attachment.fileName}</div>
                    <div style={{ fontSize: "11px", color: "#6366f1" }}>Size: {attachment.fileSize}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" icon={X} onClick={removeAttachment} style={{ color: "#dc2626" }}>
                  Remove
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* SUBMIT BUTTON DIRECTLY BELOW ATTACHMENTS (CENTERED FULL-WIDTH SECTION) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            marginTop: "10px",
            background: "#ffffff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)"
          }}
        >
          <Button
            type="submit"
            variant="primary"
            icon={Send}
            disabled={submitting}
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "48px",
              fontSize: "15px",
              fontWeight: "700",
              borderRadius: "10px"
            }}
          >
            {submitting ? "Saving & Notifying..." : "Submit Innovation Proposal"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            style={{ color: "#64748b" }}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* STUNNING ENTERPRISE PROPOSAL SUBMISSION SUCCESS MODAL */}
      {submittedIdeaModal && (
        <Modal
          isOpen={Boolean(submittedIdeaModal)}
          onClose={() => setSubmittedIdeaModal(null)}
          title=""
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button
                variant="ghost"
                onClick={() => {
                  resetForm();
                  setSubmittedIdeaModal(null);
                }}
              >
                Submit Another Idea
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="primary"
                icon={ArrowRight}
                onClick={() => navigate(`/screening-evaluation/${submittedIdeaModal.id}`)}
              >
                View Live Proposal Stage
              </Button>
            </div>
          }
        >
          <div style={{ textAlign: "center", padding: "10px 0 20px 0" }}>
            {/* Animated Glow Badge */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#ffffff",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(34, 197, 94, 0.35)",
                marginBottom: "16px"
              }}
            >
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px 0" }}>
              Proposal Submitted & Saved Successfully!
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Your innovation proposal has been registered in the database and enters <strong>Stage 1 Initial Screening</strong>.
            </p>

            {/* Proposal Tracking Card Badge */}
            <div
              style={{
                background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                border: "1.5px solid #cbd5e1",
                borderRadius: "12px",
                padding: "16px",
                margin: "20px 0",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ background: "#4f46e5", color: "#ffffff", fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "4px" }}>
                    IDEA-{submittedIdeaModal.id}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "700", background: "#e0e7ff", color: "#4338ca", padding: "2px 8px", borderRadius: "10px" }}>
                    {submittedIdeaModal.category} Domain
                  </span>
                </div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b" }}>{submittedIdeaModal.title}</div>
              </div>

              <span className="table-badge badge-approved" style={{ background: "#dcfce7", color: "#15803d", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                ● Active Stage 1
              </span>
            </div>

            {/* Automated Workflow Timeline Notification Alert */}
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px", borderRadius: "10px", textAlign: "left", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "#1e40af", marginBottom: "6px" }}>
                <Bell size={16} /> Automated System Alert Broadcasted
              </div>
              <p style={{ margin: 0, color: "#1e3a8a", lineHeight: "1.5" }}>
                An automated notification has been sent to the <strong>Project Coordinator</strong> to review your proposal details and allocate domain experts (Reviewer, BA, PM).
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SubmitIdea;
