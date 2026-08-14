import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Tag,
  Inbox,
  Users,
  Send,
  Activity,
  Layers
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import IdeaPipelineStepper from "../../components/IdeaPipelineStepper";
import IdeaJourneyModal from "../../components/IdeaJourneyModal";
import WorkloadBalancingBox from "../../components/WorkloadBalancingBox";
import { getCandidateWorkload } from "../../utils/workloadUtils";
import { getSubmittedIdeas, updateIdeaAllocation, DEFAULT_MASTER_EVALUATORS } from "../../utils/ideaStorage";
import { createNotification } from "../../utils/notificationStorage";
import { fetchEvaluators, updateIdeaAllocationAPI } from "../../services/api";

function ReviewerAllocationStudio() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [evaluators, setEvaluators] = useState(DEFAULT_MASTER_EVALUATORS);
  const [searchQuery, setSearchQuery] = useState("");

  // Journey Tracker Modal State
  const [selectedIdeaForJourney, setSelectedIdeaForJourney] = useState(null);

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
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    const updateAll = () => {
      setIdeas(getSubmittedIdeas());
      loadEvaluators();
    };

    async function loadEvaluators() {
      try {
        const evals = await fetchEvaluators();
        if (evals && evals.length > 0) {
          setEvaluators(evals);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic evaluators from backend:", err);
      }
    }

    updateAll();

    window.addEventListener("storage", updateAll);
    window.addEventListener("ideaStatusChanged", updateAll);
    window.addEventListener("ideaAllocationChanged", updateAll);

    return () => {
      window.removeEventListener("storage", updateAll);
      window.removeEventListener("ideaStatusChanged", updateAll);
      window.removeEventListener("ideaAllocationChanged", updateAll);
    };
  }, []);

  const openAllocationModal = (idea) => {
    setSelectedIdeaForAllocation(idea);
    const domain = idea.category || "IT";

    const domainReviewers = evaluators.filter(
      (e) => e.role === "Reviewer" && (e.domain.toLowerCase() === domain.toLowerCase() || e.domain === "IT")
    );
    const domainBAs = evaluators.filter(
      (e) => e.role === "Business Analyst" && (e.domain.toLowerCase() === domain.toLowerCase() || e.domain === "IT")
    );
    const domainPMs = evaluators.filter(
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

    setIsAllocating(true);

    try {
      // 1. Update Backend Database
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

      // 2. Update Local Storage Cache
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

      // Send instant notifications
      createNotification({
        recipientRole: "Reviewer",
        recipientEmail: assignedReviewer.includes("(") ? assignedReviewer.split("(")[1].replace(")", "").trim() : null,
        title: `🎯 Assigned as Reviewer: "${selectedIdeaForAllocation.title}"`,
        message: `Project Coordinator assigned you as Reviewer for Proposal IDEA-${selectedIdeaForAllocation.id}. Completion Deadline: ${reviewerDeadline}.`,
        ideaId: selectedIdeaForAllocation.id,
        type: "allocation"
      });

      createNotification({
        recipientRole: "Business Analyst",
        recipientEmail: assignedBA.includes("(") ? assignedBA.split("(")[1].replace(")", "").trim() : null,
        title: `📋 Assigned as Business Analyst: "${selectedIdeaForAllocation.title}"`,
        message: `Project Coordinator assigned you as BA for Proposal IDEA-${selectedIdeaForAllocation.id}. Analysis Deadline: ${baDeadline}.`,
        ideaId: selectedIdeaForAllocation.id,
        type: "allocation"
      });

      createNotification({
        recipientRole: "Project Manager",
        recipientEmail: assignedPM.includes("(") ? assignedPM.split("(")[1].replace(")", "").trim() : null,
        title: `📁 Assigned as Project Manager: "${selectedIdeaForAllocation.title}"`,
        message: `Project Coordinator assigned you as PM for Proposal IDEA-${selectedIdeaForAllocation.id}. Kick-off Deadline: ${pmDeadline}.`,
        ideaId: selectedIdeaForAllocation.id,
        type: "allocation"
      });

      setSuccessBanner(`Roles allocated successfully for proposal "${selectedIdeaForAllocation.title}"! Notifications dispatched.`);
      setSelectedIdeaForAllocation(null);
      setIdeas(getSubmittedIdeas());
    } catch (err) {
      console.error(err);
      toast.error("Failed to update allocation.");
    } finally {
      setIsAllocating(false);
    }
  };

  const displayedIdeas = ideas.filter((i) => {
    return (
      (i.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.category || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Allocate Roles & Domain Experts Studio</h1>
            <span className="category-chip-indigo">
              <UserCheck size={14} /> Stage 2: Expert Allocation
            </span>
          </div>
        </div>

        <div style={{ position: "relative", width: "280px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="custom-input-elem"
            placeholder="Search proposals, domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      {successBanner && (
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
          <span>{successBanner}</span>
        </div>
      )}

      <Card title={`Proposals & Allocated Roles (${displayedIdeas.length})`}>
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea ID & Title</th>
                <th>Domain Category</th>
                <th>Lifecycle Progress</th>
                <th>Assigned Reviewer</th>
                <th>Assigned BA</th>
                <th>Assigned PM</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedIdeas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "28px" }}>
                    <div className="empty-state-flex" style={{ padding: "20px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No proposals found for role allocation</span>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedIdeas.map((i) => {
                  const isAllocated = Boolean(i.assignedReviewer);

                  return (
                    <tr key={i.id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span className="table-idea-title">{i.title}</span>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>IDEA-{i.id}</span>
                        </div>
                      </td>
                      <td><span className="category-chip">{i.category}</span></td>
                      <td>
                        <IdeaPipelineStepper idea={i} compact={true} />
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#4f46e5" }}>
                          {i.assignedReviewer ? i.assignedReviewer.split("(")[0] : "Needs Allocation"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#0891b2" }}>
                          {i.assignedBA ? i.assignedBA.split("(")[0] : "Unassigned"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a" }}>
                          {i.assignedPM ? i.assignedPM.split("(")[0] : "Unassigned"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={Activity}
                            onClick={() => setSelectedIdeaForJourney(i)}
                          >
                            Track Journey
                          </Button>
                          <Button
                            size="sm"
                            variant={isAllocated ? "outline" : "primary"}
                            icon={UserCheck}
                            onClick={() => openAllocationModal(i)}
                          >
                            {isAllocated ? "Reassign" : "Allocate"}
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

      {/* TRACK JOURNEY MODAL */}
      {selectedIdeaForJourney && (
        <IdeaJourneyModal
          idea={selectedIdeaForJourney}
          isOpen={Boolean(selectedIdeaForJourney)}
          onClose={() => setSelectedIdeaForJourney(null)}
          onOpenAllocation={(ideaToAllocate) => openAllocationModal(ideaToAllocate)}
        />
      )}

      {/* ALLOCATION MODAL */}
      {selectedIdeaForAllocation && (
        <Modal
          isOpen={Boolean(selectedIdeaForAllocation)}
          onClose={() => setSelectedIdeaForAllocation(null)}
          title={`Allocate Roles for: "${selectedIdeaForAllocation.title}"`}
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setSelectedIdeaForAllocation(null)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleSaveAllocation} disabled={isAllocating}>
                {isAllocating ? "Assigning..." : "Assign Roles & Set Deadlines"}
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
                  {evaluators.filter((e) => e.role === "Reviewer").map((r) => {
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
                  {evaluators.filter((e) => e.role === "Business Analyst").map((b) => {
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
                  {evaluators.filter((e) => e.role === "Project Manager").map((p) => {
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
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ReviewerAllocationStudio;
