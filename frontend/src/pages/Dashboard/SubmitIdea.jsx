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
  UploadCloud
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

  // Form Fields
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaCategory, setIdeaCategory] = useState("Healthcare");
  const [problemStatement, setProblemStatement] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");

  // File Attachment State
  const [attachment, setAttachment] = useState(null); // { fileName, fileType, fileSize, fileData }
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

    // Validate size (max 5MB)
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

    if (!ideaTitle.trim() || !problemStatement.trim() || !ideaDescription.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      await saveNewIdea({
        title: ideaTitle,
        category: ideaCategory,
        author: userName || "User",
        authorEmail: userEmail || "",
        problemStatement: problemStatement,
        description: ideaDescription,
        expectedOutcome: "",
        attachment: attachment
      });

      alert(`Idea "${ideaTitle}" submitted successfully to PostgreSQL!`);
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
                  Industry Category <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <select
                  className="custom-input-elem custom-select-elem"
                  value={ideaCategory}
                  onChange={(e) => setIdeaCategory(e.target.value)}
                  required
                >
                  <option value="Healthcare">Healthcare</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Banking">Banking</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="HR">HR</option>
                  <option value="HR">Automation</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Government">Government</option>
                  <option value="Education">Education</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Travel">Travel</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>
          </Card>

          <div style={{ height: "20px" }}></div>

          <Card title="2. Problem & Solution Statement" subtitle="Detailed explanation of the problem and proposed solution">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
              <div className="input-field-group">
                <label className="input-label">
                  Problem Statement <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <textarea
                  className="custom-input-elem"
                  rows={4}
                  placeholder="Describe the exact bottleneck, customer pain point, or inefficiency..."
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
                  rows={5}
                  placeholder="Detailed breakdown of how your innovative solution addresses the problem..."
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>
          </Card>

          <div style={{ height: "20px" }}></div>

          <Card title="3. Supporting Attachments" subtitle="Upload PDF documents or image files">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>

              {/* ATTACHMENT UPLOAD SECTION */}
              <div className="input-field-group">
                <label className="input-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Paperclip size={16} /> Supporting Attachment (PDF or Image)
                </label>

                {/* Hidden File Input */}
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
