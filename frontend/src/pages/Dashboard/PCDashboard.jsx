import { useState, useEffect } from "react";
import {
  UserCheck,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  FolderKanban,
  FileCheck,
  Send,
  Eye,
  Sliders,
  AlertCircle,
  FileText,
  Paperclip,
  X,
  Search,
  Filter
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { getSubmittedIdeas, updateIdeaAllocation } from "../../utils/ideaStorage";

const DEFAULT_REVIEWERS = [
  "Expert Reviewer (reviewer@imsgroup.com)",
  "Technical Reviewer 1 (tech.rev1@imsgroup.com)",
  "Domain Specialist 2 (domain.spec@imsgroup.com)",
  "QA & Security Auditor (qa.sec@imsgroup.com)"
];

const DEFAULT_PMS = [
  "Project Manager Lead (pm@imsgroup.com)",
  "Agile PM Alpha (pm.alpha@imsgroup.com)",
  "Engineering PM Beta (pm.beta@imsgroup.com)",
  "Operations PM Gamma (pm.gamma@imsgroup.com)"
];

function PCDashboard({ userName = "Project Coordinator" }) {
  const [ideas, setIdeas] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // pending, allocated, all
  const [searchQuery, setSearchQuery] = useState("");

  // Allocation Modal State
  const [selectedIdeaForAllocation, setSelectedIdeaForAllocation] = useState(null);
  const [assignedReviewer, setAssignedReviewer] = useState(DEFAULT_REVIEWERS[0]);
  const [reviewerDeadline, setReviewerDeadline] = useState("");
  const [assignedPM, setAssignedPM] = useState(DEFAULT_PMS[0]);
  const [pmDeadline, setPmDeadline] = useState("");
  const [coordinatorNotes, setCoordinatorNotes] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);

  // View Idea Modal State
  const [viewingIdea, setViewingIdea] = useState(null);

  // Calculate default deadlines (7 days for reviewer, 14 days for PM)
  const getUpcomingDate = (daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split("T")[0];
  };

  const loadData = () => {
    const list = getSubmittedIdeas();
    setIdeas(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAllocationModal = (idea) => {
    setSelectedIdeaForAllocation(idea);
    setAssignedReviewer(idea.assignedReviewer || DEFAULT_REVIEWERS[0]);
    setReviewerDeadline(idea.reviewerDeadline || getUpcomingDate(7));
    setAssignedPM(idea.assignedPM || DEFAULT_PMS[0]);
    setPmDeadline(idea.pmDeadline || getUpcomingDate(14));
    setCoordinatorNotes(idea.coordinatorNotes || "");
  };

  const handleSaveAllocation = (e) => {
    e.preventDefault();
    if (!selectedIdeaForAllocation) return;

    if (!reviewerDeadline) {
      alert("Please specify a completion deadline for the Reviewer.");
      return;
    }
    if (!pmDeadline) {
      alert("Please specify a completion deadline for the Project Manager.");
      return;
    }

    setIsAllocating(true);

    try {
      updateIdeaAllocation(selectedIdeaForAllocation.id, {
        assignedReviewer,
        reviewerDeadline,
        assignedPM,
        pmDeadline,
        coordinatorNotes,
        status: "Assigned by Project Coordinator"
      });

      alert(`Allocation successful! Assigned to Reviewer (${assignedReviewer.split(" ")[0]}) with deadline ${reviewerDeadline} and PM (${assignedPM.split(" ")[0]}) with deadline ${pmDeadline}.`);

      setSelectedIdeaForAllocation(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update allocation.");
    } finally {
      setIsAllocating(false);
    }
  };

  // KPI Calculations
  const totalIdeas = ideas.length;
  const pendingCount = ideas.filter(
    (i) => i.status === "Pending PC Allocation" || i.status === "Pending Review" || !i.assignedReviewer
  ).length;
  const allocatedCount = ideas.filter((i) => i.assignedReviewer && i.assignedPM).length;
  const completedCount = ideas.filter((i) => i.status.includes("Approved") || i.status.includes("Completed")).length;

  // Filter Ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.author && idea.author.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "pending") {
      return idea.status === "Pending PC Allocation" || idea.status === "Pending Review" || !idea.assignedReviewer;
    }
    if (activeTab === "allocated") {
      return Boolean(idea.assignedReviewer && idea.assignedPM);
    }
    return true; // 'all'
  });

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Welcome, {userName}</h1>
            <span
              style={{
                background: "#e0e7ff",
                color: "#4f46e5",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <UserCheck size={14} /> Project Coordinator Control Center
            </span>
          </div>
          <p>
            Review submitted innovation proposals, allocate Reviewers and Project Managers, and establish mandatory completion deadlines.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-mini-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Submitted Proposals</span>
            <Sliders className="kpi-icon-mini" color="#6366f1" size={20} />
          </div>
          <div className="kpi-num">{totalIdeas}</div>
          <div className="kpi-sub font-medium">All incoming innovation ideas</div>
        </div>

        <div className="kpi-mini-card active-kpi-ring">
          <div className="kpi-top">
            <span className="kpi-title">Pending PC Allocation</span>
            <Clock className="kpi-icon-mini" color="#f59e0b" size={20} />
          </div>
          <div className="kpi-num" style={{ color: "#d97706" }}>
            {pendingCount}
          </div>
          <div className="kpi-sub font-medium">Awaiting Reviewer & PM assignment</div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top">
            <span className="kpi-title">Allocated & In-Progress</span>
            <CheckCircle2 className="kpi-icon-mini" color="#22c55e" size={20} />
          </div>
          <div className="kpi-num" style={{ color: "#16a34a" }}>
            {allocatedCount}
          </div>
          <div className="kpi-sub font-medium">Reviewers & PMs assigned</div>
        </div>

        <div className="kpi-mini-card">
          <div className="kpi-top">
            <span className="kpi-title">Completed & Approved</span>
            <FolderKanban className="kpi-icon-mini" color="#3b82f6" size={20} />
          </div>
          <div className="kpi-num" style={{ color: "#2563eb" }}>
            {completedCount}
          </div>
          <div className="kpi-sub font-medium">Fully evaluated ideas</div>
        </div>
      </div>

      <div style={{ height: "24px" }}></div>

      {/* Main Content Area */}
      <Card
        title="Innovation Ideas Allocation Matrix"
        subtitle="Manage proposal assignments and enforce Reviewer & Project Manager completion deadlines"
      >
        {/* Filter Bar & Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "12px"
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              variant={activeTab === "pending" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("pending")}
            >
              Pending Allocation ({pendingCount})
            </Button>
            <Button
              variant={activeTab === "allocated" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("allocated")}
            >
              Allocated Ideas ({allocatedCount})
            </Button>
            <Button
              variant={activeTab === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("all")}
            >
              All Ideas ({totalIdeas})
            </Button>
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            />
            <input
              type="text"
              className="custom-input-elem"
              placeholder="Search title, author, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "32px", height: "36px", fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Proposals List */}
        {filteredIdeas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
            <AlertCircle size={36} style={{ marginBottom: "8px", opacity: 0.5 }} />
            <p style={{ fontWeight: "600" }}>No ideas match the current tab filter.</p>
            <p style={{ fontSize: "13px" }}>Switch tabs or clear your search to view other proposals.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredIdeas.map((idea) => {
              const isAllocated = Boolean(idea.assignedReviewer && idea.assignedPM);

              return (
                <div
                  key={idea.id}
                  style={{
                    background: "#ffffff",
                    border: isAllocated ? "1px solid #cbd5e1" : "1.5px solid #a5b4fc",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span className="mode-badge-green" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                          {idea.category}
                        </span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Submitted on {idea.date || "Recent"} by <strong>{idea.author}</strong>
                        </span>
                      </div>

                      <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>
                        {idea.title}
                      </h3>

                      <p style={{ fontSize: "13.5px", color: "#334155", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {idea.problemStatement || idea.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setViewingIdea(idea)}
                      >
                        View Proposal
                      </Button>
                      <Button
                        variant={isAllocated ? "outline" : "primary"}
                        size="sm"
                        icon={UserCheck}
                        onClick={() => openAllocationModal(idea)}
                      >
                        {isAllocated ? "Edit Allocation" : "Allocate Reviewer & PM"}
                      </Button>
                    </div>
                  </div>

                  {/* Allocation Status Bar */}
                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px dashed #e2e8f0",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "10px",
                      fontSize: "12.5px"
                    }}
                  >
                    {/* Reviewer Allocation Info */}
                    <div
                      style={{
                        background: idea.assignedReviewer ? "#f0fdf4" : "#fffbeb",
                        border: `1px solid ${idea.assignedReviewer ? "#bbf7d0" : "#fef3c7"}`,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px"
                      }}
                    >
                      <div style={{ fontWeight: "700", color: idea.assignedReviewer ? "#166534" : "#b45309", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FileCheck size={14} /> Reviewer Allocation:
                      </div>
                      <div style={{ color: "#334155", fontWeight: "600" }}>
                        {idea.assignedReviewer ? idea.assignedReviewer.split(" ")[0] + " " + (idea.assignedReviewer.split(" ")[1] || "") : "Not Allocated Yet"}
                      </div>
                      {idea.reviewerDeadline && (
                        <div style={{ color: "#047857", fontWeight: "600", fontSize: "11.5px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} /> Complete before: {idea.reviewerDeadline}
                        </div>
                      )}
                    </div>

                    {/* PM Allocation Info */}
                    <div
                      style={{
                        background: idea.assignedPM ? "#eff6ff" : "#fffbeb",
                        border: `1px solid ${idea.assignedPM ? "#bfdbfe" : "#fef3c7"}`,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px"
                      }}
                    >
                      <div style={{ fontWeight: "700", color: idea.assignedPM ? "#1e40af" : "#b45309", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FolderKanban size={14} /> Project Manager Allocation:
                      </div>
                      <div style={{ color: "#334155", fontWeight: "600" }}>
                        {idea.assignedPM ? idea.assignedPM.split(" ")[0] + " " + (idea.assignedPM.split(" ")[1] || "") : "Not Allocated Yet"}
                      </div>
                      {idea.pmDeadline && (
                        <div style={{ color: "#1d4ed8", fontWeight: "600", fontSize: "11.5px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} /> Finish work by: {idea.pmDeadline}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* MODAL 1: Allocation Form */}
      {selectedIdeaForAllocation && (
        <Modal
          isOpen={Boolean(selectedIdeaForAllocation)}
          onClose={() => setSelectedIdeaForAllocation(null)}
          title="Allocate Idea to Reviewer & Project Manager"
          maxWidth="680px"
        >
          <form onSubmit={handleSaveAllocation} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                Target Idea Proposal
              </div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                {selectedIdeaForAllocation.title}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Domain: {selectedIdeaForAllocation.category} • Author: {selectedIdeaForAllocation.author}
              </div>
            </div>

            {/* Reviewer Allocation Section */}
            <div style={{ background: "#f0fdf4", padding: "14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#166534", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FileCheck size={16} /> 1. Select Reviewer & Set Completion Deadline
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-field-group">
                  <label className="input-label">Assigned Reviewer <span style={{ color: "var(--danger)" }}>*</span></label>
                  <select
                    className="custom-input-elem custom-select-elem"
                    value={assignedReviewer}
                    onChange={(e) => setAssignedReviewer(e.target.value)}
                    style={{ maxWidth: "100%", height: "38px" }}
                    required
                  >
                    {DEFAULT_REVIEWERS.map((r, idx) => (
                      <option key={idx} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="input-field-group">
                  <label className="input-label">
                    Reviewer Target End Date <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="custom-input-elem"
                    value={reviewerDeadline}
                    onChange={(e) => setReviewerDeadline(e.target.value)}
                    style={{ height: "38px" }}
                    required
                  />
                  <span style={{ fontSize: "11px", color: "#15803d" }}>
                    Reviewer must finish review before this date
                  </span>
                </div>
              </div>
            </div>

            {/* PM Allocation Section */}
            <div style={{ background: "#eff6ff", padding: "14px", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1e40af", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FolderKanban size={16} /> 2. Select Project Manager & Set Execution End Date
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-field-group">
                  <label className="input-label">Assigned Project Manager <span style={{ color: "var(--danger)" }}>*</span></label>
                  <select
                    className="custom-input-elem custom-select-elem"
                    value={assignedPM}
                    onChange={(e) => setAssignedPM(e.target.value)}
                    style={{ maxWidth: "100%", height: "38px" }}
                    required
                  >
                    {DEFAULT_PMS.map((pm, idx) => (
                      <option key={idx} value={pm}>{pm}</option>
                    ))}
                  </select>
                </div>

                <div className="input-field-group">
                  <label className="input-label">
                    Project Manager End Date <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="custom-input-elem"
                    value={pmDeadline}
                    onChange={(e) => setPmDeadline(e.target.value)}
                    style={{ height: "38px" }}
                    required
                  />
                  <span style={{ fontSize: "11px", color: "#1d4ed8" }}>
                    Project Manager must complete work by this date
                  </span>
                </div>
              </div>
            </div>

            {/* Coordinator Notes */}
            <div className="input-field-group">
              <label className="input-label">Coordinator Instructions / Priority Notes (Optional)</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Add special instructions or priority directives for the assigned Reviewer and PM..."
                value={coordinatorNotes}
                onChange={(e) => setCoordinatorNotes(e.target.value)}
              ></textarea>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
              <Button type="button" variant="outline" onClick={() => setSelectedIdeaForAllocation(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isAllocating} icon={Send}>
                Confirm Allocation & Set Deadlines
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: View Proposal Details */}
      {viewingIdea && (
        <Modal
          isOpen={Boolean(viewingIdea)}
          onClose={() => setViewingIdea(null)}
          title={`Proposal Details: ${viewingIdea.title}`}
          maxWidth="700px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span className="mode-badge-green">{viewingIdea.category}</span>
              <span style={{ fontSize: "12px", color: "#64748b", alignSelf: "center" }}>
                Author: <strong>{viewingIdea.author}</strong> ({viewingIdea.authorEmail || "No Email"})
              </span>
            </div>

            <div>
              <label className="input-label">Problem Statement</label>
              <p style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", fontSize: "13.5px", color: "#334155" }}>
                {viewingIdea.problemStatement}
              </p>
            </div>

            <div>
              <label className="input-label">Idea Description</label>
              <p style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", fontSize: "13.5px", color: "#334155" }}>
                {viewingIdea.description}
              </p>
            </div>

            {viewingIdea.proposedSolution && (
              <div>
                <label className="input-label">Proposed Solution</label>
                <p style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", fontSize: "13.5px", color: "#334155" }}>
                  {viewingIdea.proposedSolution}
                </p>
              </div>
            )}

            {viewingIdea.expectedBenefits && (
              <div>
                <label className="input-label">Expected Benefits</label>
                <p style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", fontSize: "13.5px", color: "#334155" }}>
                  {viewingIdea.expectedBenefits}
                </p>
              </div>
            )}

            {/* Allocation Details */}
            {viewingIdea.assignedReviewer && (
              <div style={{ background: "#eef2ff", padding: "12px", borderRadius: "8px", border: "1px solid #c7d2fe" }}>
                <h4 style={{ fontSize: "13.5px", fontWeight: "700", color: "#4338ca", marginBottom: "6px" }}>
                  Coordinator Allocation Record:
                </h4>
                <div style={{ fontSize: "12.5px", color: "#312e81" }}>
                  <div>• <strong>Assigned Reviewer:</strong> {viewingIdea.assignedReviewer} (Target Review Date: <strong>{viewingIdea.reviewerDeadline}</strong>)</div>
                  <div>• <strong>Assigned Project Manager:</strong> {viewingIdea.assignedPM} (Target PM End Date: <strong>{viewingIdea.pmDeadline}</strong>)</div>
                  {viewingIdea.coordinatorNotes && <div>• <strong>Notes:</strong> {viewingIdea.coordinatorNotes}</div>}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <Button variant="outline" onClick={() => setViewingIdea(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PCDashboard;
