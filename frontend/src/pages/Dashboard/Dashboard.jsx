import { useState, useEffect } from "react";
import {
  Lightbulb,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  UserCheck,
  Inbox
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import AdminDashboard from "./AdminDashboard";
import { getSubmittedIdeas, saveNewIdea } from "../../utils/ideaStorage";

function Dashboard() {
  const [userRole, setUserRole] = useState("User");
  const [userName, setUserName] = useState("Ayushman");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState(null);

  // User's Submitted Ideas from shared storage
  const [allIdeas, setAllIdeas] = useState([]);

  // Form States
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaCategory, setIdeaCategory] = useState("Healthcare");
  const [problemStatement, setProblemStatement] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.role) {
          setUserRole(savedUser.role);
        }
        if (savedUser.username) {
          setUserName(savedUser.username);
        }
        if (savedUser.email) {
          setUserEmail(savedUser.email);
        }
      } catch (err) {
        console.error(err);
      }
    }

    setAllIdeas(getSubmittedIdeas());
  }, []);

  const handleCreateIdea = (e) => {
    e.preventDefault();
    const updatedList = saveNewIdea({
      title: ideaTitle,
      category: ideaCategory,
      author: userName || "User",
      authorEmail: userEmail || "",
      problemStatement: problemStatement,
      description: ideaDescription,
      expectedOutcome: expectedOutcome
    });

    setAllIdeas(updatedList);
    alert(`Idea "${ideaTitle}" submitted successfully under category "${ideaCategory}"! It is now visible on the Administrator Screening queue.`);
    setIdeaTitle("");
    setProblemStatement("");
    setIdeaDescription("");
    setExpectedOutcome("");
    setIsSubmitModalOpen(false);
  };

  // If logged in as Administrator, render AdminDashboard component
  if (userRole === "Administrator") {
    return <AdminDashboard userName={userName} />;
  }

  // Filter ideas to ONLY show submissions by this specific logged-in user
  const mySubmissions = allIdeas.filter(
    (item) =>
      (userEmail && item.authorEmail && item.authorEmail.toLowerCase() === userEmail.toLowerCase()) ||
      (userName && item.author && item.author.toLowerCase() === userName.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      {/* Employee Welcome Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Welcome back, {userName}</h1>
            <span className="mode-badge-green">
              <UserCheck size={14} /> Innovator Mode
            </span>
          </div>
          <p>Submit your groundbreaking innovation ideas and track their review progress.</p>
        </div>

        <div className="quick-actions-flex">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsSubmitModalOpen(true)}
          >
            Submit New Idea
          </Button>
        </div>
      </div>

      {/* User's Personal Metrics */}
      <div className="kpi-6-grid">
        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">My Submitted Ideas</span>
            <div className="kpi-icon-pill pill-purple">
              <Lightbulb size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{mySubmissions.length}</span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Review</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {mySubmissions.filter((i) => i.status === "Pending Review").length}
          </span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Approved / Screening</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {mySubmissions.filter((i) => i.status.includes("Approved") || i.status.includes("Screening")).length}
          </span>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Rejected Ideas</span>
            <div className="kpi-icon-pill pill-red">
              <XCircle size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {mySubmissions.filter((i) => i.status === "Rejected").length}
          </span>
        </div>
      </div>

      {/* My Submissions Status Table */}
      <Card
        title="My Submitted Innovation Ideas"
        subtitle="Track real-time evaluation status and committee responses for your submissions"
      >
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea Title</th>
                <th>Category</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mySubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state-cell">
                    <div className="empty-state-flex">
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">You haven't submitted any ideas yet</span>
                      <span className="empty-state-sub">Click the "Submit New Idea" button above to submit your first innovation proposal!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                mySubmissions.map((item) => {
                  const isApproved = item.status.includes("Approved") || item.status.includes("Screening");
                  const isRejected = item.status === "Rejected";

                  return (
                    <tr key={item.id}>
                      <td className="table-idea-title">{item.title}</td>
                      <td>
                        <span className="category-chip">
                          {item.category}
                        </span>
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <span
                          className={`table-badge ${
                            isApproved
                              ? "badge-approved"
                              : isRejected
                              ? "badge-rejected"
                              : "badge-review"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => setViewingSubmission(item)}
                        >
                          View Submission
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: Submit New Idea */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Innovation Idea"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateIdea}>Submit Idea for Screening</Button>
          </>
        }
      >
        <form onSubmit={handleCreateIdea} className="auth-form">
          <Input
            label="Idea Title"
            placeholder="e.g. Telehealth Remote Diagnostics System"
            value={ideaTitle}
            onChange={(e) => setIdeaTitle(e.target.value)}
            required
          />

          <div className="input-field-group">
            <label className="input-label">Industry Category <span style={{ color: "var(--danger)" }}>*</span></label>
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

          <div className="input-field-group">
            <label className="input-label">Problem Statement <span style={{ color: "var(--danger)" }}>*</span></label>
            <textarea
              className="custom-input-elem"
              rows={3}
              placeholder="Describe the exact problem, inefficiency, or pain point currently being faced..."
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="input-field-group">
            <label className="input-label">Idea Description / Proposed Solution <span style={{ color: "var(--danger)" }}>*</span></label>
            <textarea
              className="custom-input-elem"
              rows={4}
              placeholder="Detailed description of your proposed innovative solution..."
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="input-field-group">
            <label className="input-label">Expected Outcome & Impact <span style={{ color: "var(--danger)" }}>*</span></label>
            <textarea
              className="custom-input-elem"
              rows={3}
              placeholder="Detail expected business benefits, cost savings, ROI, or efficiency gains..."
              value={expectedOutcome}
              onChange={(e) => setExpectedOutcome(e.target.value)}
              required
            ></textarea>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: View Submission Details */}
      {viewingSubmission && (
        <Modal
          isOpen={Boolean(viewingSubmission)}
          onClose={() => setViewingSubmission(null)}
          title={`My Submission Details: ${viewingSubmission.title}`}
          footer={
            <Button variant="primary" onClick={() => setViewingSubmission(null)}>
              Close
            </Button>
          }
        >
          <div className="modal-details-stack">
            <div className="auth-options-row">
              <span className="category-chip-indigo">
                Category: {viewingSubmission.category}
              </span>
              <span className={`table-badge ${viewingSubmission.status.includes("Approved") ? "badge-approved" : viewingSubmission.status === "Rejected" ? "badge-rejected" : "badge-review"}`}>
                {viewingSubmission.status}
              </span>
            </div>

            <div>
              <h4 className="modal-detail-title">Problem Statement</h4>
              <p className="modal-detail-text">
                {viewingSubmission.problemStatement || "No detailed problem statement recorded."}
              </p>
            </div>

            <div>
              <h4 className="modal-detail-title">Proposed Solution & Description</h4>
              <p className="modal-detail-text">
                {viewingSubmission.description || "No solution description recorded."}
              </p>
            </div>

            <div>
              <h4 className="modal-detail-title">Expected Outcome & Impact</h4>
              <p className="modal-detail-text">
                {viewingSubmission.expectedOutcome || "No expected outcome recorded."}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;