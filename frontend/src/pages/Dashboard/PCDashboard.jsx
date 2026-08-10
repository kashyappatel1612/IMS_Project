import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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
  AlertTriangle,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import IdeaPipelineStepper from "../../components/IdeaPipelineStepper";
import IdeaJourneyModal from "../../components/IdeaJourneyModal";
import AssignUserModal from "../../components/AssignUserModal";
import WorkloadBalancingBox from "../../components/WorkloadBalancingBox";
import { getCandidateWorkload } from "../../utils/workloadUtils";
import { getIdeaPipelineStatus, LIFECYCLE_STAGES } from "../../utils/ideaPipeline";
import { fetchAllIdeas, fetchEvaluators, postEvaluator, createAssignmentAPI, fetchUsersByRole, updateIdeaAllocationAPI } from "../../services/api";
import { getSubmittedIdeas, updateIdeaAllocation, DEFAULT_MASTER_EVALUATORS } from "../../utils/ideaStorage";
import { createNotification } from "../../utils/notificationStorage";

function PCDashboard({ userName = "Project Coordinator" }) {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | stage ID (1-8) | 'evaluators'
  const [searchQuery, setSearchQuery] = useState("");

  // Evaluators Master List State
  const [evaluatorsList, setEvaluatorsList] = useState(DEFAULT_MASTER_EVALUATORS);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState("All Domains");

  // Modals State
  const [selectedIdeaForJourney, setSelectedIdeaForJourney] = useState(null);
  const [selectedIdeaForAssignModal, setSelectedIdeaForAssignModal] = useState(null);

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

    const handleUpdate = () => {
      loadData();
      loadEvaluators();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("ideaStatusChanged", handleUpdate);
    window.addEventListener("ideaAllocationChanged", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("ideaStatusChanged", handleUpdate);
      window.removeEventListener("ideaAllocationChanged", handleUpdate);
    };
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
              assignedReviewer: localMatch.assignedReviewer || bIdea.assignedReviewer || "",
              assignedBA: localMatch.assignedBA || bIdea.assignedBA || "",
              assignedPM: localMatch.assignedPM || bIdea.assignedPM || "",
              reviewerDeadline: localMatch.reviewerDeadline || bIdea.reviewerDeadline || "",
              baDeadline: localMatch.baDeadline || bIdea.baDeadline || "",
              pmDeadline: localMatch.pmDeadline || bIdea.pmDeadline || "",
              coordinatorNotes: localMatch.coordinatorNotes || bIdea.coordinatorNotes || ""
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

  const handleSaveAllocation = async (e) => {
    e.preventDefault();
    if (!selectedIdeaForAllocation) return;

    if (!reviewerDeadline || !pmDeadline) {
      toast("Please specify deadlines for Reviewer and Project Manager.", { icon: "⚠️" });
      return;
    }

    setIsAllocating(true);

    try {
      // 1. Update Backend Database Idea Allocation
      try {
        await updateIdeaAllocationAPI(selectedIdeaForAllocation.id, {
          assignedReviewer,
          reviewerDeadline,
          assignedBA,
          baDeadline,
          assignedPM,
          pmDeadline,
          coordinatorNotes,
          status: selectedIdeaForAllocation.status || "Assigned by Project Coordinator"
        });
      } catch (err) {
        console.warn("Backend allocation update warning:", err);
      }

      // 2. Sync DB assignments table for assigned BA, PM, and Reviewer
      if (assignedBA) {
        const baEmail = assignedBA.includes("(") ? assignedBA.split("(")[1].replace(")", "").trim() : "";
        fetchUsersByRole("Business Analyst").then((users) => {
          const matchUser = users.find((u) => u.email.toLowerCase() === baEmail.toLowerCase() || assignedBA.toLowerCase().includes(u.username.toLowerCase()));
          if (matchUser) {
            createAssignmentAPI({
              ideaId: selectedIdeaForAllocation.id,
              assignedRole: "Business Analyst",
              assignedUserId: matchUser.id,
              remarks: coordinatorNotes || "Assigned by Project Coordinator",
              status: "Pending",
              deadline: baDeadline
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      if (assignedPM) {
        const pmEmail = assignedPM.includes("(") ? assignedPM.split("(")[1].replace(")", "").trim() : "";
        fetchUsersByRole("Project Manager").then((users) => {
          const matchUser = users.find((u) => u.email.toLowerCase() === pmEmail.toLowerCase() || assignedPM.toLowerCase().includes(u.username.toLowerCase()));
          if (matchUser) {
            createAssignmentAPI({
              ideaId: selectedIdeaForAllocation.id,
              assignedRole: "Project Manager",
              assignedUserId: matchUser.id,
              remarks: coordinatorNotes || "Assigned by Project Coordinator",
              status: "Pending",
              deadline: pmDeadline
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      if (assignedReviewer) {
        const revEmail = assignedReviewer.includes("(") ? assignedReviewer.split("(")[1].replace(")", "").trim() : "";
        fetchUsersByRole("Reviewer").then((users) => {
          const matchUser = users.find((u) => u.email.toLowerCase() === revEmail.toLowerCase() || assignedReviewer.toLowerCase().includes(u.username.toLowerCase()));
          if (matchUser) {
            createAssignmentAPI({
              ideaId: selectedIdeaForAllocation.id,
              assignedRole: "Reviewer",
              assignedUserId: matchUser.id,
              remarks: coordinatorNotes || "Assigned by Project Coordinator",
              status: "Pending",
              deadline: reviewerDeadline
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      updateIdeaAllocation(selectedIdeaForAllocation.id, {
        assignedReviewer,
        reviewerDeadline,
        assignedBA,
        baDeadline,
        assignedPM,
        pmDeadline,
        coordinatorNotes,
        status: selectedIdeaForAllocation.status || "Assigned by Project Coordinator"
      });

      // Notifications
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

      setAllocationSuccessBanner(
        `Allocation successful for proposal "${selectedIdeaForAllocation.title}"! Instant notifications sent to Reviewer, BA, and PM.`
      );

      setSelectedIdeaForAllocation(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update allocation.");
    } finally {
      setIsAllocating(false);
    }
  };

  const handleAddExpertSubmit = async (e) => {
    e.preventDefault();
    if (!newExpertName.trim() || !newExpertEmail.trim()) {
      toast("Please fill in Name and Email!", { icon: "⚠️" });
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
    toast.success(`Domain Expert "${payload.name}" (${payload.domain} - ${payload.role}) registered successfully!`);
  };

  // Compute Stage Stats for Ideas
  const ideasWithPipeline = ideas.map((idea) => ({
    ...idea,
    pipeline: getIdeaPipelineStatus(idea)
  }));

  const totalSubmissions = ideas.length;
  const pendingAllocationCount = ideasWithPipeline.filter((i) => i.pipeline.currentStageIndex === 1).length;
  const underReviewCount = ideasWithPipeline.filter((i) => i.pipeline.currentStageIndex === 3 || i.pipeline.currentStageIndex === 2).length;
  const baAnalysisCount = ideasWithPipeline.filter((i) => i.pipeline.currentStageIndex === 4 || i.pipeline.currentStageIndex === 5).length;
  const inExecutionCount = ideasWithPipeline.filter((i) => i.pipeline.currentStageIndex === 6 || i.pipeline.currentStageIndex === 7).length;
  const completedCount = ideasWithPipeline.filter((i) => i.pipeline.currentStageIndex === 8).length;

  // Filter Ideas by Search Query & Active Stage Tab
  const filteredIdeas = ideasWithPipeline.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.author && idea.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(idea.id).includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    if (activeTab === "pending_alloc") return idea.pipeline.currentStageIndex === 1;
    if (activeTab === "under_review") return idea.pipeline.currentStageIndex === 2 || idea.pipeline.currentStageIndex === 3;
    if (activeTab === "ba_estimation") return idea.pipeline.currentStageIndex === 4 || idea.pipeline.currentStageIndex === 5;
    if (activeTab === "pm_execution") return idea.pipeline.currentStageIndex === 6 || idea.pipeline.currentStageIndex === 7;
    if (activeTab === "completed") return idea.pipeline.currentStageIndex === 8;
    if (typeof activeTab === "number") return idea.pipeline.currentStageIndex === activeTab;

    return true;
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
              Project Coordinator End-to-End Idea Command Center
            </h1>
            <span className="mode-badge-green" style={{ background: "#e0e7ff", color: "#4338ca" }}>
              <Layers size={14} /> Full Lifecycle View
            </span>
          </div>
        </div>

        <div className="quick-actions-flex" style={{ display: "flex", gap: "10px" }}>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddExpertModal(true)}>
            Register Expert
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

      {/* 5 MILESTONE PIPELINE KPI CARDS */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "20px" }}>
        {/* Card 1: Pending Allocation */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("pending_alloc")}
          style={{ cursor: "pointer", border: activeTab === "pending_alloc" ? "2px solid #ef4444" : "1px solid #e2e8f0" }}
          title="Click to view Stage 1 Ideas needing PC Allocation"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Stage 1: Needs Allocation</span>
            <div className="kpi-icon-pill pill-red">
              <Clock size={18} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#dc2626" }}>{pendingAllocationCount}</span>
        </div>

        {/* Card 2: Screening & Review */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("under_review")}
          style={{ cursor: "pointer", border: activeTab === "under_review" ? "2px solid #4f46e5" : "1px solid #e2e8f0" }}
          title="Click to view Ideas under Feasibility Review"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Stage 2-3: Review & Screening</span>
            <div className="kpi-icon-pill pill-purple">
              <ShieldCheck size={18} />
            </div>
          </div>
          <span className="kpi-num-val">{underReviewCount}</span>
        </div>

        {/* Card 3: BA Analysis & Estimation */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("ba_estimation")}
          style={{ cursor: "pointer", border: activeTab === "ba_estimation" ? "2px solid #0891b2" : "1px solid #e2e8f0" }}
          title="Click to view Ideas in Business Analysis & Estimation"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Stage 4-5: BA & Estimation</span>
            <div className="kpi-icon-pill pill-blue">
              <BarChart size={18} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#0891b2" }}>{baAnalysisCount}</span>
        </div>

        {/* Card 4: PM Execution & QA */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("pm_execution")}
          style={{ cursor: "pointer", border: activeTab === "pm_execution" ? "2px solid #d97706" : "1px solid #e2e8f0" }}
          title="Click to view Ideas in Execution & QA"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Stage 6-7: Execution & QA</span>
            <div className="kpi-icon-pill pill-amber">
              <FolderKanban size={18} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#d97706" }}>{inExecutionCount}</span>
        </div>

        {/* Card 5: Completed & Live */}
        <div
          className="kpi-mini-card"
          onClick={() => setActiveTab("completed")}
          style={{ cursor: "pointer", border: activeTab === "completed" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
          title="Click to view Completed Live Proposals"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Stage 8: Live & Completed</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#16a34a" }}>{completedCount}</span>
        </div>
      </div>

      {/* SLEEK STAGE FILTER TABS & SEARCH BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        {/* Soft Stage Pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { id: "all", label: `All Proposals (${totalSubmissions})` },
            { id: "pending_alloc", label: `Stage 1: Needs Allocation (${pendingAllocationCount})` },
            { id: "under_review", label: `Stage 2-3: Review (${underReviewCount})` },
            { id: "ba_estimation", label: `Stage 4-5: BA/Estimation (${baAnalysisCount})` },
            { id: "pm_execution", label: `Stage 6-7: Execution (${inExecutionCount})` },
            { id: "completed", label: `Stage 8: Live (${completedCount})` },
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
                  padding: "7px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
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

        {/* Search Bar */}
        <div style={{ position: "relative", width: "240px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search proposals, domain, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "36px", fontSize: "12px", borderRadius: "18px" }}
          />
        </div>
      </div>

      {/* SECTION 1: MASTER IDEAS LIFECYCLE TABLE */}
      {activeTab !== "evaluators" ? (
        <Card
          title={`Proposals End-to-End Pipeline Queue (${filteredIdeas.length})`}
          subtitle="Real-time stage tracking, assigned stakeholders, progress percentage, and audit journey"
        >
          <div className="data-table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Idea Title & ID</th>
                  <th>Domain</th>
                  <th>Author</th>
                  <th>Current Stage & Status</th>
                  <th>Lifecycle Progress %</th>
                  <th>Assigned Reviewer / BA / PM</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIdeas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state-cell">
                      <div className="empty-state-flex" style={{ padding: "30px 0" }}>
                        <Inbox size={36} color="var(--text-light)" />
                        <span className="empty-state-title">No proposals found in selected lifecycle stage</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIdeas.map((idea) => {
                    const isAllocated = Boolean(idea.assignedReviewer);

                    return (
                      <tr key={idea.id}>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span className="table-idea-title">{idea.title}</span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>ID: IDEA-{idea.id}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-chip">{idea.category || "General"}</span>
                        </td>
                        <td style={{ fontSize: "13px", fontWeight: "600" }}>{idea.author}</td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#4f46e5", textTransform: "uppercase" }}>
                              S{idea.pipeline.currentStageIndex}: {idea.pipeline.currentStageName}
                            </span>
                            <span
                              className={`table-badge ${idea.pipeline.isRejected ? "badge-rejected" : idea.pipeline.percent === 100 ? "badge-approved" : "badge-review"}`}
                            >
                              {idea.status}
                            </span>
                          </div>
                        </td>
                        <td>
                          <IdeaPipelineStepper idea={idea} compact={true} />
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "11px" }}>
                            <div>
                              <span style={{ color: "#64748b" }}>Rev: </span>
                              <strong style={{ color: idea.assignedReviewer ? "#4f46e5" : "#dc2626" }}>
                                {idea.assignedReviewer ? idea.assignedReviewer.split("(")[0] : "Needs Allocation"}
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: "#64748b" }}>BA: </span>
                              <strong style={{ color: idea.assignedBA ? "#0891b2" : "#94a3b8" }}>
                                {idea.assignedBA ? idea.assignedBA.split("(")[0] : "Unassigned"}
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: "#64748b" }}>PM: </span>
                              <strong style={{ color: idea.assignedPM ? "#16a34a" : "#94a3b8" }}>
                                {idea.assignedPM ? idea.assignedPM.split("(")[0] : "Unassigned"}
                              </strong>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <Button
                              size="sm"
                              variant={isAllocated ? "outline" : "primary"}
                              icon={UserCheck}
                              onClick={() => openAllocationModal(idea)}
                              title="Allocate or reassign Reviewer, Business Analyst (BA), and Project Manager (PM)"
                            >
                              {isAllocated ? "Reassign Roles" : "Allocate Roles"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Activity}
                              onClick={() => setSelectedIdeaForJourney(idea)}
                              title="Track full end-to-end stage progress & audit timeline"
                            >
                              Track Progress
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

      {/* MODAL: IDEA END-TO-END JOURNEY & PROGRESS TRACKER */}
      {selectedIdeaForJourney && (
        <IdeaJourneyModal
          idea={selectedIdeaForJourney}
          isOpen={Boolean(selectedIdeaForJourney)}
          onClose={() => setSelectedIdeaForJourney(null)}
          onOpenAllocation={(ideaToAllocate) => openAllocationModal(ideaToAllocate)}
        />
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

            {/* 1. Reviewer Allocation with Workload Balancing in Dropdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-field-group">
                <label className="input-label">Select Reviewer *</label>
                <select
                  className="custom-input-elem"
                  value={assignedReviewer}
                  onChange={(e) => setAssignedReviewer(e.target.value)}
                  required
                >
                  {evaluatorsList.filter((e) => e.role === "Reviewer").map((r) => {
                    const wl = getCandidateWorkload(r.email || r.name, ideas);
                    return (
                      <option key={r.id} value={`${r.name} (${r.email})`}>
                        {r.name} ({wl.activeCount} Active {wl.activeCount === 1 ? 'Idea' : 'Ideas'}) — {wl.status}
                      </option>
                    );
                  })}
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

            {/* 2. Business Analyst Allocation with Workload Balancing in Dropdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-field-group">
                <label className="input-label">Select Business Analyst (BA) *</label>
                <select
                  className="custom-input-elem"
                  value={assignedBA}
                  onChange={(e) => setAssignedBA(e.target.value)}
                  required
                >
                  {evaluatorsList.filter((e) => e.role === "Business Analyst").map((b) => {
                    const wl = getCandidateWorkload(b.email || b.name, ideas);
                    return (
                      <option key={b.id} value={`${b.name} (${b.email})`}>
                        {b.name} ({wl.activeCount} Active {wl.activeCount === 1 ? 'Idea' : 'Ideas'}) — {wl.status}
                      </option>
                    );
                  })}
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

            {/* 3. Project Manager Allocation with Workload Balancing in Dropdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="input-field-group">
                <label className="input-label">Select Project Manager (PM) *</label>
                <select
                  className="custom-input-elem"
                  value={assignedPM}
                  onChange={(e) => setAssignedPM(e.target.value)}
                  required
                >
                  {evaluatorsList.filter((e) => e.role === "Project Manager").map((p) => {
                    const wl = getCandidateWorkload(p.email || p.name, ideas);
                    return (
                      <option key={p.id} value={`${p.name} (${p.email})`}>
                        {p.name} ({wl.activeCount} Active {wl.activeCount === 1 ? 'Idea' : 'Ideas'}) — {wl.status}
                      </option>
                    );
                  })}
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

      {/* MODAL: ASSIGN USER TO WORKFLOW STAGE */}
      {selectedIdeaForAssignModal && (
        <AssignUserModal
          idea={selectedIdeaForAssignModal}
          isOpen={Boolean(selectedIdeaForAssignModal)}
          onClose={() => setSelectedIdeaForAssignModal(null)}
          onAssignmentComplete={() => loadData()}
        />
      )}
    </div>
  );
}

export default PCDashboard;
