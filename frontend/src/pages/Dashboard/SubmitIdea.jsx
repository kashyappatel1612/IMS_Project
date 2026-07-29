import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  ArrowLeft,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Send,
  UploadCloud,
  Info
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Input from "../../components/Input";
import { saveNewIdea } from "../../utils/ideaStorage";

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = () => {
      const fileData = reader.result;
      const sizeInKB = Math.round(file.size / 1024);
      const sizeStr = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

      setAttachment({
        fileName: file.name,
        fileType: file.type,
        fileSize: sizeStr,
        fileData: fileData
      });
      setIsUploading(false);
    };

    reader.onerror = () => {
      alert("Failed to read file.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



  const [submitting, setSubmitting] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ideaTitle.trim() || !problemStatement.trim() || !ideaDescription.trim() || !functionalArea.trim() || !targetUser.trim() || !expectedBenefits.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (ideaCategory === "Others" && !customCategory.trim()) {
      alert("Please specify your Industry Domain in the text field.");
      return;
    }

    const finalCategory = ideaCategory === "Others" ? customCategory.trim() : ideaCategory;

    setSubmitting(true);

    try {
      await saveNewIdea({
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

      alert(`Your idea "${ideaTitle}" is submitted successfully!`);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to save idea to database.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner with Back Navigation */}
      <div className="dashboard-header-flex">
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
                padding: "3px 10px",
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
      </div>

      {/* Main Submission Form Container */}
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit}>
          {/* Section 1: Overview & Categorization */}
          <Card title="1. Overview & Categorization" subtitle="Title and industry domain for your idea">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              <Input
                label="Idea Title"
                placeholder="e.g. Automated Claims Processing using AI Vision"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                required
              />

              <div className="input-field-group">
                <label className="input-label">
                  Industry Domain <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <select
                  className="custom-input-elem custom-select-elem"
                  value={ideaCategory}
                  onChange={(e) => {
                    setIdeaCategory(e.target.value);
                    if (e.target.value !== "Others") {
                      setCustomCategory("");
                    }
                  }}
                  required
                >
                  <option value="IT">IT (Information Technology)</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Banking">Banking</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="HR">HR</option>
                  <option value="Automation">Automation</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Government">Government</option>
                  <option value="Education">Education</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Travel">Travel</option>
                  <option value="Others">Others</option>
                </select>

                {ideaCategory === "Others" && (
                  <div style={{ marginTop: "12px", animation: "fadeIn 0.2s ease-in-out" }}>
                    <Input
                      label="Specify Custom Industry Domain"
                      placeholder="Type your custom industry domain here (e.g. FinTech, AI, Real Estate)..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                )}
              </div>

              <Input
                label="Functional Area"
                placeholder="e.g. Operations, Finance, HR, IT, Marketing, Supply Chain"
                value={functionalArea}
                onChange={(e) => setFunctionalArea(e.target.value)}
                required
              />

              <Input
                label="Target User"
                placeholder="e.g. End Customers, Internal Staff, Field Agents, Executive Committee"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                required
              />
            </div>
          </Card>

          <div style={{ height: "20px" }}></div>

          {/* Section 2: Problem & Solution Statement */}
          <Card title="2. Problem & Solution Statement" subtitle="Structured instructions & guidelines for detailing your innovation proposal">
            {/* Structured Instructions & Guidelines Box */}
            <div className="form-instruction-banner">
              <div className="form-instruction-title">
                <Info size={18} />
                <span>Instructions for Problem & Solution Statement:</span>
              </div>
              <ul className="form-instruction-list">
                <li><strong>Problem Statement:</strong> Describe the problem statement, customer pain point, or operational inefficiency.</li>
                <li><strong>Idea Description:</strong> Breakdown how your innovative concept effectively addresses the issue.</li>
                <li><strong>Proposed Solution (Optional):</strong> Detail any technical, process, or architectural specifics.</li>
                <li><strong>Expected Benefits:</strong> Highlight quantifiable outcomes such as estimated time savings, ROI, or UX impact.</li>
              </ul>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              <div className="input-field-group">
                <label className="input-label">
                  Problem Statement <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <textarea
                  className="custom-input-elem"
                  rows={4}
                  placeholder="Describe the problem statement, customer pain point, or operational inefficiency..."
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="input-field-group">
                <label className="input-label">
                  Idea Description <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <textarea
                  className="custom-input-elem"
                  rows={4}
                  placeholder="Detailed breakdown of how your innovative concept addresses the problem..."
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="input-field-group">
                <label className="input-label">
                  Proposed Solution <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "normal" }}>(Optional)</span>
                </label>
                <textarea
                  className="custom-input-elem"
                  rows={4}
                  placeholder="Specific technical, process, or architectural solution proposed to address the issue..."
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                ></textarea>
              </div>

              <div className="input-field-group">
                <label className="input-label">
                  Expected Benefits <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <textarea
                  className="custom-input-elem"
                  rows={4}
                  placeholder="Quantifiable benefits e.g. 30% reduction in processing time, $50K annual savings, enhanced UX..."
                  value={expectedBenefits}
                  onChange={(e) => setExpectedBenefits(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </Card>

          <div style={{ height: "20px" }}></div>

          {/* Section 3: Supporting Attachments */}
          <Card title="3. Supporting Attachments" subtitle="Upload PDF documents or image files">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              <div className="input-field-group">
                <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Paperclip size={16} /> Supporting Attachment (PDF or Image)
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.png,.jpg,.jpeg,.svg"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />

                {!attachment ? (
                  <div
                    className="attachment-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud size={32} color="var(--primary)" />
                    <div style={{ textAlign: "center" }}>
                      <span className="attachment-dropzone-title">Click to attach file (PDF / PNG / JPG)</span>
                      <span className="attachment-dropzone-sub">Maximum file size: 5MB</span>
                    </div>
                    <Button type="button" variant="outline" size="sm" icon={Paperclip}>
                      Choose Document or Image
                    </Button>
                  </div>
                ) : (
                  <div className="attachment-preview-card">
                    <div className="attachment-preview-left">
                      {attachment.fileType.includes("image") ? (
                        <div className="attachment-img-thumb">
                          <img src={attachment.fileData} alt="Preview" />
                        </div>
                      ) : (
                        <div className="attachment-pdf-icon">
                          <FileText size={28} color="#4f46e5" />
                        </div>
                      )}

                      <div className="attachment-file-info">
                        <span className="attachment-file-name">{attachment.fileName}</span>
                        <span className="attachment-file-meta">
                          {attachment.fileType.includes("image") ? "Image File" : "PDF Document"} • {attachment.fileSize}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={X}
                      onClick={handleRemoveAttachment}
                      title="Remove Attachment"
                      style={{ color: "var(--danger)" }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Form Action Buttons */}


          <div className="submit-form-actions">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={submitting}
              icon={Send}
            >
              Submit Idea for Screening
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubmitIdea;
