import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  Clock,
  CheckCircle2,
  Calendar,
  FolderKanban,
  FileCheck,
  Send,
  Eye,
  Search,
  Users,
  Plus,
  ShieldCheck,
  Inbox,
  Filter,
  Lightbulb,
  BarChart,
  AlertTriangle
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import { fetchAllIdeas, fetchEvaluators, postEvaluator } from "../../services/api";
import { getSubmittedIdeas, updateIdeaAllocation, DEFAULT_MASTER_EVALUATORS } from "../../utils/ideaStorage";
import { createNotification } from "../../utils/notificationStorage";

function PCDashboard({ userName = "Project Coordinator" }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'pending' | 'under_review' | 'ready_project' | 'evaluators' | 'all'
  const [searchQuery, setSearchQuery] = useState("");

  // Evaluators Master List State
  const [evaluatorsList, setEvaluatorsList] = useState(DEFAULT_MASTER_EVALUATORS);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState("All Domains");

  // Allocation Modal State
  const [selectedIdeaForAllocation, setSelectedIdeaForAllocation] = useState(null);
  const [assignedReviewer, setAssignedReviewer] = useState("");
  const [reviewerDeadline, setReviewerDeadline] = useState("");
  const [assignedBA, setAssignedBA] = useState("");
  const [baDeadline, setBaDeadline] = useState("");
  const [assignedPM, setAssignedPM] = useState("");
  const [pmDeadline, setPmDeadline] = useState("");
  const [coordinatorNotes, setCoordinatorNotes] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationSuccessBanner, setAllocationSuccessBanner] = useState("");

  // Add Domain Expert Modal
  const [showAddExpertModal, setShowAddExpertModal] = useState(false);
  const [newExpertName, setNewExpertName] = useState("");
  const [newExpertEmail, setNewExpertEmail] = useState("");
  const [newExpertRole, setNewExpertRole] = useState("Reviewer");
  const [newExpertDomain, setNewExpertDomain] = useState("HR");
  const [newExpertDept, setNewExpertDept] = useState("");

  useEffect(() => {
    loadData();
    loadEvaluators();
  }, []);

  const loadData = async () => {
    const localIdeas = getSubmittedIdeas();
    try {
      const backendIdeas = await fetchAllIdeas();
      if (backendIdeas && backendIdeas.length > 0) {
        const merged = backendIdeas.map((bIdea) => {
          const localMatch = localIdeas.find((l) => String(l.id) === String(bIdea.id));
          if (localMatch) {
            return {
              ...bIdea,
              assignedReviewer: bIdea.assignedReviewer || localMatch.assignedReviewer || "",
              assignedBA: bIdea.assignedBA || localMatch.assignedBA || "",
              assignedPM: bIdea.assignedPM || localMatch.assignedPM || "",
              reviewerDeadline: bIdea.reviewerDeadline || localMatch.reviewerDeadline || "",
              baDeadline: bIdea.baDeadline || localMatch.baDeadline || "",
              pmDeadline: bIdea.pmDeadline || localMatch.pmDeadline || "",
              coordinatorNotes: bIdea.coordinatorNotes || localMatch.coordinatorNotes || ""
            };
          }
          return bIdea;
        });
        setIdeas(merged);
        return;
      }
    } catch (e) {}
    setIdeas(localIdeas);
  };

  const loadEvaluators = async () => {
    try {
      const apiEvals = await fetchEvaluators();
      if (apiEvals && apiEvals.length > 0) {
        setEvaluatorsList(apiEvals);
        return;
      }
    } catch (e) {}
    setEvaluatorsList(DEFAULT_MASTER_EVALUATORS);
  };

  const openAllocationModal = (idea) => {
    setSelectedIdeaForAllocation(idea);
    const domain = idea.category || "IT";

    const domainReviewers = evaluatorsList.filter(
      (e) => e.role === "Reviewer" && (e.domain.toLowerCase() === domain.toLowerCase() || e.domain === "IT")
    );
    const domainBAs = evaluatorsList.filter(
      (e) => e.role === "Business Analyst" && (e.domain.toLowerCase() === domain.toLowerCase() || e.domain === "IT")
    );
    const domainPMs = evaluatorsList.filter(
      (e) => e.role === "Project Manager" && (e.domain.toLowerCase() === domain.toLowerCase() || e.domain === "IT")
    );

    setAssignedReviewer(
      idea.assignedReviewer || (domainReviewers[0] ? `${domainReviewers[0].name} (${domainReviewers[0].email})` : "Dr. Ananya Sharma (ananya.hr@imsgroup.com)")
    );
    setReviewerDeadline(idea.reviewerDeadline || "2026-08-05");

    setAssignedBA(
      idea.assignedBA || (domainBAs[0] ? `${domainBAs[0].name} (${domainBAs[0].email})` : "Vikram Sethi (vikram.hrba@imsgroup.com)")
    );
    setBaDeadline(idea.baDeadline || "2026-08-10");

    setAssignedPM(
      idea.assignedPM || (domainPMs[0] ? `${domainPMs[0].name} (${domainPMs[0].email})` : "Priya Nair (priya.hrpm@imsgroup.com)")
    );
    setPmDeadline(idea.pmDeadline || "2026-08-15");

    setCoordinatorNotes(idea.coordinatorNotes || "");
  };

  const handleSaveAllocation = (e) => {
    e.preventDefault();
    if (!selectedIdeaForAllocation) return;

    if (!reviewerDeadline || !pmDeadline) {
      alert("Please specify deadlines for Reviewer and Project Manager.");
      return;
    }

    setIsAllocating(true);

    try {
      updateIdeaAllocation(selectedIdeaForAllocation.id, {
        assignedReviewer,
        reviewerDeadline,
        assignedBA,
        baDeadline,
        assignedPM,
        pmDeadline,
        coordinatorNotes,
        status: "Assigned by Project Coordinator"
      });

      // Send instant notifications to Reviewer, Business Analyst, and Project Manager
      createNotification({
        recipientRole: "Reviewer",
        recipientEmail: assignedReviewer.includes("(") ? assignedReviewer.split("(")[1].replace(")", "").trim() : null,
        title: `🎯 Assigned as Reviewer: "${selectedIdeaForAllocation.title}"`,
        message: `Project Coordinator assigned you as Reviewer for Proposal IDEA-${selectedIdeaForAllocation.id} (${selectedIdeaForAllocation.category} domain). Completion Deadline: ${reviewerDeadline}.`,
        ideaId: selectedIdeaForAllocation.id,
        type: "allocation"
      });

      createNotification({
        recipientRole: "Business Analyst",
        recipientEmail: assignedBA.includes("(") ? assignedBA.split("(")[1].replace(")", "").trim() : null,
        title: `📋 Assigned as Business Analyst: "${selectedIdeaForAllocation.title}"`,
        message: `Project Coordinator assigned you as BA for Proposal IDEA-${selectedIdeaForAllocation.id} (${selectedIdeaForAllocation.category} domain). Analysis Deadline: ${baDeadline || reviewerDeadline}.`,
        ideaId: selectedIdeaForAllocation.id,
        type: "allocation"
      });

      createNotification({
        recipientRole: "Project Manager",
        recipientEmail: assignedPM.includes("(") ? assignedPM.split("(")[1].replace(")", "").trim() : null,
        title: `📁 Assigned as Project Manager: "${selectedIdeaForAllocation.title}"`,
        message: `Project Coordinator assigned you as PM for Proposal IDEA-${selectedIdeaForAllocation.id} (${selectedIdeaForAllocation.category} domain). Kick-off Deadline: ${pmDeadline}.`,
        ideaId: selectedIdeaForAllocation.id,
        type: "allocation"
      });

      const domainName = selectedIdeaForAllocation.category || "General";
      setAllocationSuccessBanner(
        `Allocation successful for proposal "${selectedIdeaForAllocation.title}"! Instant notifications sent to Reviewer, BA, and PM.`
      );

      setSelectedIdeaForAllocation(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update allocation.");
    } finally {
      setIsAllocating(false);
    }
  };

  const handleAddExpertSubmit = async (e) => {
    e.preventDefault();
    if (!newExpertName.trim() || !newExpertEmail.trim()) {
      alert("Please fill in Name and Email!");
      return;
    }

    const payload = {
      id: Date.now(),
      name: newExpertName.trim(),
      email: newExpertEmail.trim(),
      role: newExpertRole,
      domain: newExpertDomain,
      department: newExpertDept || `${newExpertDomain} Department`
    };

    try {
      await postEvaluator(payload);
    } catch (err) {}

    const updated = [payload, ...evaluatorsList];
    setEvaluatorsList(updated);
    setShowAddExpertModal(false);
    setNewExpertName("");
    setNewExpertEmail("");
    alert(`Domain Expert "${payload.name}" (${payload.domain} - ${payload.role}) registered successfully!`);
  };

  // KPI CALCULATIONS
  const totalSubmissions = ideas.length;
  const pendingAllocationCount = ideas.filter((i) => i.status === "Pending PC Allocation" || i.status === "Pending Review" || !i.assignedReviewer).length;
  const underReviewCount = ideas.filter((i) => i.status.includes("Review") || i.status.includes("Assigned")).length;
  const baAnalysisCount = ideas.filter((i) => i.status.includes("Feasibility Approved") || i.status.includes("Business Analysis")).length;
  const readyForProjectCount = ideas.filter((i) => i.status.includes("Approved by BA") || i.status.includes("Accepted by PM")).length;

  // Filter Ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.author && idea.author.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "pending") return idea.status === "Pending PC Allocation" || idea.status === "Pending Review" || !idea.assignedReviewer;
    if (activeTab === "under_review") return idea.status.includes("Review") || idea.status.includes("Assigned");
    if (activeTab === "ba_pending") return idea.status.includes("Feasibility Approved") || idea.status.includes("Business Analysis");
    if (activeTab === "ready_project") return idea.status.includes("Approved by BA") || idea.status.includes("Accepted by PM");
    return true; // 'all'
  });

  // Filter Evaluators
  const filteredEvaluators = evaluatorsList.filter((e) => {
    if (selectedDomainFilter === "All Domains") return true;
    return e.domain.toLowerCase() === selectedDomainFilter.toLowerCase();
  });

  return (
    <div className="dashboard-wrapper">
      {/* Clean Header Banner */}
      <div className="dashboard-header-flex" style={{ marginBottom: "20px" }}>
        <div className="dash-title-box">
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
            Project Coordinator Command Center
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
            Allocate domain experts (Reviewers, BAs, PMs), monitor review stages, and approve project creation.
          </p>
        </div>

        <div className="quick-actions-flex" style={{ display: "flex", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddExpertModal(true)}>
            Register Domain Expert
          </Button>
          <Button variant="outline" icon={Users} onClick={() => setActiveTab("evaluators")}>
            Experts Directory ({evaluatorsList.length})
          </Button>
        </div>
      </div>

      {/* Real-time Success Notification Banner */}
      {allocationSuccessBanner && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "600",
            fontSize: "13px"
          }}
        >
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{allocationSuccessBanner}</span>
        </div>
      )}

      {/* 4 CLEAN SPACIOUS KPI CARDS */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "24px" }}>
        {/* Card 1: Pending Allocation */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("pending")}
          style={{ cursor: "pointer", border: activeTab === "pending" ? "2px solid #4f46e5" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Allocation</span>
            <div className="kpi-icon-pill pill-purple">
              <Clock size={18} />
            </div>
          </div>
          <span className="kpi-num-val">{pendingAllocationCount}</span>
        </div>

        {/* Card 2: Ideas Under Review */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("under_review")}
          style={{ cursor: "pointer", border: activeTab === "under_review" ? "2px solid #3b82f6" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Under Review</span>
            <div className="kpi-icon-pill pill-blue">
              <FileCheck size={18} />
            </div>
          </div>
          <span className="kpi-num-val">{underReviewCount}</span>
        </div>

        {/* Card 3: Business Analysis Pending */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("ba_pending")}
          style={{ cursor: "pointer", border: activeTab === "ba_pending" ? "2px solid #8b5cf6" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">BA Analysis Pending</span>
            <div className="kpi-icon-pill pill-purple">
              <BarChart size={18} />
            </div>
          </div>
          <span className="kpi-num-val">{baAnalysisCount}</span>
        </div>

        {/* Card 4: Ready for Project Creation */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("ready_project")}
          style={{ cursor: "pointer", border: activeTab === "ready_project" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Ready for Project</span>
            <div className="kpi-icon-pill pill-green">
              <FolderKanban size={18} />
            </div>
          </div>
          <span className="kpi-num-val">{readyForProjectCount}</span>
        </div>
      </div>

      {/* SLEEK PILL FILTER TABS & SEARCH BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        {/* Soft Rounded Pill Tabs (No ugly grey box borders) */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Proposals (${totalSubmissions})` },
            { id: "pending", label: `Pending Allocation (${pendingAllocationCount})` },
            { id: "under_review", label: `Under Review (${underReviewCount})` },
            { id: "ba_pending", label: `BA Analysis (${baAnalysisCount})` },
            { id: "ready_project", label: `Ready for Project (${readyForProjectCount})` },
            { id: "evaluators", label: `Experts Directory (${evaluatorsList.length})` }
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isSelected ? "#4f46e5" : "#f1f5f9",
                  color: isSelected ? "#ffffff" : "#475569",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: isSelected ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isSelected ? "0 2px 8px rgba(79, 70, 229, 0.25)" : "none"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", width: "240px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px", borderRadius: "20px" }}
          />
        </div>
      </div>

      {/* SECTION 1: MASTER IDEAS LIFECYCLE TABLE */}
      {activeTab !== "evaluators" ? (
        <Card
          title={`Proposals Queue (${filteredIdeas.length})`}
          subtitle="Assign domain experts, track review progress, and approve project creation"
        >
          <div className="data-table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Idea ID & Title</th>
                  <th>Domain</th>
                  <th>Author</th>
                  <th>Assigned Reviewer</th>
                  <th>Assigned BA</th>
                  <th>Assigned PM</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIdeas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-state-cell">
                      <div className="empty-state-flex" style={{ padding: "30px 0" }}>
                        <Inbox size={36} color="var(--text-light)" />
                        <span className="empty-state-title">No proposals found in queue</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIdeas.map((idea) => {
                    const isAllocated = Boolean(idea.assignedReviewer);

                    return (
                      <tr key={idea.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className="table-idea-title">{idea.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-chip">{idea.category || "General"}</span>
                        </td>
                        <td style={{ fontSize: "13px", fontWeight: "600" }}>{idea.author}</td>
                        <td>
                          {idea.assignedReviewer ? (
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#4f46e5" }}>
                              {idea.assignedReviewer.split("(")[0]}
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "700", background: "#fee2e2", padding: "2px 8px", borderRadius: "10px" }}>
                              Needs Reviewer
                            </span>
                          )}
                        </td>
                        <td>
                          {idea.assignedBA ? (
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#0891b2" }}>
                              {idea.assignedBA.split("(")[0]}
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          {idea.assignedPM ? (
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>
                              {idea.assignedPM.split("(")[0]}
                            </span>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Unassigned</span>
                          )}
                        </td>
                        <td>
                          <span className="table-badge badge-approved">{idea.status}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <Button
                              size="sm"
                              variant={isAllocated ? "outline" : "primary"}
                              icon={UserCheck}
                              onClick={() => openAllocationModal(idea)}
                            >
                              {isAllocated ? "Reassign" : "Allocate Experts"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Eye}
                              onClick={() => navigate(`/screening-evaluation/${idea.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* SECTION 2: DOMAIN EXPERTS DIRECTORY TAB */
        <Card
          title={`Domain Experts Directory (${filteredEvaluators.length})`}
          subtitle="Reviewers, Business Analysts, and Project Managers mapped to specific Industry Domains"
        >
          <div style={{ marginBottom: "14px", display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Domain Filter:</span>
            <select
              className="custom-input-elem"
              style={{ width: "200px", height: "34px", fontSize: "12px" }}
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
            >
              <option value="All Domains">All Domains ({evaluatorsList.length})</option>
              <option value="HR">HR</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Retail">Retail</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="IT">IT</option>
            </select>
          </div>

          <div className="data-table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Expert Name & Email</th>
                  <th>Assigned Role</th>
                  <th>Mapped Domain</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvaluators.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <div style={{ fontWeight: "700", color: "#1e293b" }}>{ev.name}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{ev.email}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: ev.role === "Reviewer" ? "#e0e7ff" : ev.role === "Business Analyst" ? "#cff4fc" : "#dcfce7",
                          color: ev.role === "Reviewer" ? "#4338ca" : ev.role === "Business Analyst" ? "#055160" : "#15803d",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "700"
                        }}
                      >
                        {ev.role}
                      </span>
                    </td>
                    <td>
                      <span className="category-chip">{ev.domain}</span>
                    </td>
                    <td style={{ fontSize: "12px", color: "#475569" }}>{ev.department || "Enterprise Division"}</td>
                    <td>
                      <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>● Active Expert</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: DOMAIN EXPERTS ALLOCATION */}
      {selectedIdeaForAllocation && (
        <Modal
          isOpen={Boolean(selectedIdeaForAllocation)}
          onClose={() => setSelectedIdeaForAllocation(null)}
          title={`Allocate Domain Experts for: "${selectedIdeaForAllocation.title}"`}
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setSelectedIdeaForAllocation(null)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleSaveAllocation} disabled={isAllocating}>
                {isAllocating ? "Assigning..." : "Assign Experts & Set Deadlines"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveAllocation} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}>
              <div><strong>Proposal:</strong> {selectedIdeaForAllocation.title}</div>
              <div><strong>Category Domain:</strong> <span className="category-chip">{selectedIdeaForAllocation.category}</span></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-field-group">
                <label className="input-label">Select Reviewer *</label>
                <select
                  className="custom-input-elem"
                  value={assignedReviewer}
                  onChange={(e) => setAssignedReviewer(e.target.value)}
                  required
                >
                  {evaluatorsList.filter((e) => e.role === "Reviewer").map((r) => (
                    <option key={r.id} value={`${r.name} (${r.email})`}>
                      {r.name} [{r.domain} Reviewer]
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Review Completion Deadline *</label>
                <input
                  type="date"
                  className="custom-input-elem"
                  value={reviewerDeadline}
                  onChange={(e) => setReviewerDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-field-group">
                <label className="input-label">Select Business Analyst (BA) *</label>
                <select
                  className="custom-input-elem"
                  value={assignedBA}
                  onChange={(e) => setAssignedBA(e.target.value)}
                  required
                >
                  {evaluatorsList.filter((e) => e.role === "Business Analyst").map((b) => (
                    <option key={b.id} value={`${b.name} (${b.email})`}>
                      {b.name} [{b.domain} BA]
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">BA Analysis Deadline *</label>
                <input
                  type="date"
                  className="custom-input-elem"
                  value={baDeadline}
                  onChange={(e) => setBaDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-field-group">
                <label className="input-label">Select Project Manager (PM) *</label>
                <select
                  className="custom-input-elem"
                  value={assignedPM}
                  onChange={(e) => setAssignedPM(e.target.value)}
                  required
                >
                  {evaluatorsList.filter((e) => e.role === "Project Manager").map((p) => (
                    <option key={p.id} value={`${p.name} (${p.email})`}>
                      {p.name} [{p.domain} PM]
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Project Kick-off Deadline *</label>
                <input
                  type="date"
                  className="custom-input-elem"
                  value={pmDeadline}
                  onChange={(e) => setPmDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label">Coordinator Instructions & Stage Directives</label>
              <textarea
                className="custom-input-elem"
                rows={2}
                placeholder="Instructions for domain experts..."
                value={coordinatorNotes}
                onChange={(e) => setCoordinatorNotes(e.target.value)}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: REGISTER NEW DOMAIN EXPERT */}
      {showAddExpertModal && (
        <Modal
          isOpen={showAddExpertModal}
          onClose={() => setShowAddExpertModal(false)}
          title="Register New Domain Expert / Evaluator"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowAddExpertModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Plus} onClick={handleAddExpertSubmit}>Register Expert</Button>
            </div>
          }
        >
          <form onSubmit={handleAddExpertSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Full Name *</label>
              <input
                className="custom-input-elem"
                placeholder="e.g. Dr. Rajesh Sharma"
                value={newExpertName}
                onChange={(e) => setNewExpertName(e.target.value)}
                required
              />
            </div>

            <div className="input-field-group">
              <label className="input-label">Corporate Email Address *</label>
              <input
                type="email"
                className="custom-input-elem"
                placeholder="e.g. rajesh.sharma@imsgroup.com"
                value={newExpertEmail}
                onChange={(e) => setNewExpertEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div className="input-field-group">
                <label className="input-label">Assigned Expert Role *</label>
                <select className="custom-input-elem" value={newExpertRole} onChange={(e) => setNewExpertRole(e.target.value)}>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Business Analyst">Business Analyst (BA)</option>
                  <option value="Project Manager">Project Manager (PM)</option>
                </select>
              </div>

              <div className="input-field-group">
                <label className="input-label">Mapped Industry Domain *</label>
                <select className="custom-input-elem" value={newExpertDomain} onChange={(e) => setNewExpertDomain(e.target.value)}>
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
                </select>
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label">Department / Enterprise Division</label>
              <input
                className="custom-input-elem"
                placeholder="e.g. HR Systems & Talent Division"
                value={newExpertDept}
                onChange={(e) => setNewExpertDept(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default PCDashboard;
