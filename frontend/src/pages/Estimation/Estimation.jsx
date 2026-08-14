import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Calculator,
  Clock,
  CheckCircle2,
  Plus,
  TrendingUp,
  Inbox,
  Send
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { fetchAllIdeas, fetchAnalysisReports } from "../../services/api";
import {
  getSubmittedIdeas,
  getSubmittedAnalysisReports,
  updateIdeaStatus
} from "../../utils/ideaStorage";

function Estimation() {
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [userName, setUserName] = useState("Ayushman Raj");
  const [filterTab, setFilterTab] = useState("all");

  // Estimation Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [devCost, setDevCost] = useState("35000");
  const [licenseCost, setLicenseCost] = useState("8000");
  const [teamSize, setTeamSize] = useState("5");
  const [timelineWeeks, setTimelineWeeks] = useState("8");
  const [annualSavings, setAnnualSavings] = useState("120000");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  // Estimations Cache in localStorage
  const [estimationsList, setEstimationsList] = useState([]);

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.username) setUserName(u.username);
        if (u.role) setUserRole(u.role);
      } catch (e) {
        console.error(e);
      }
    }

    loadData();

    // Load saved estimations
    try {
      const savedEst = localStorage.getItem("idea360Estimations");
      if (savedEst) {
        setEstimationsList(JSON.parse(savedEst));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadData = async () => {
    try {
      const apiIdeas = await fetchAllIdeas();
      setIdeas(apiIdeas && apiIdeas.length > 0 ? apiIdeas : getSubmittedIdeas());
    } catch (e) {
      setIdeas(getSubmittedIdeas());
    }

    try {
      const apiReports = await fetchAnalysisReports();
      setReports(apiReports && apiReports.length > 0 ? apiReports : getSubmittedAnalysisReports());
    } catch (e) {
      setReports(getSubmittedAnalysisReports());
    }
  };

  // Proposals ready for estimation (Approved by BA or in Estimation)
  const eligibleIdeas = ideas.filter(
    (i) =>
      i.status.includes("Approved by BA") ||
      i.status.includes("Feasibility Approved") ||
      i.status.includes("Estimation") ||
      i.status.includes("Accepted by PM") ||
      i.status.includes("Execution")
  );

  const filteredIdeas = eligibleIdeas.filter((item) => {
    if (filterTab === "pending") return !item.status.includes("Estimation Completed") && !item.status.includes("Execution");
    if (filterTab === "completed") return item.status.includes("Estimation Completed") || item.status.includes("Execution");
    return true;
  });

  const calculateTotalCost = () => {
    const d = parseFloat(devCost) || 0;
    const l = parseFloat(licenseCost) || 0;
    return d + l;
  };

  const calculateRoi = () => {
    const total = calculateTotalCost();
    const sav = parseFloat(annualSavings) || 0;
    if (total === 0) return "0.0%";
    const pct = ((sav - total) / total) * 100;
    return `${pct.toFixed(1)}%`;
  };

  const handleSelectProposal = (id) => {
    setSelectedIdeaId(id);
    const foundReport = reports.find((r) => String(r.ideaId) === String(id));
    if (foundReport && foundReport.estimatedCost) {
      const rawCost = foundReport.estimatedCost.replace(/[^0-9]/g, "");
      if (rawCost) setDevCost(rawCost);
    }
  };

  const handleSaveEstimation = (e) => {
    e.preventDefault();
    if (!selectedIdeaId) {
      toast("Please select a proposal to estimate!", { icon: "⚠️" });
      return;
    }

    setIsSubmitting(true);
    const totalEst = calculateTotalCost();
    const estRoi = calculateRoi();
    const foundIdea = ideas.find((i) => String(i.id) === String(selectedIdeaId));

    const estRecord = {
      id: Date.now(),
      ideaId: Number(selectedIdeaId),
      title: foundIdea ? foundIdea.title : "Innovation Project",
      category: foundIdea ? foundIdea.category : "General",
      estimatedBy: userName,
      devCost: `$${parseFloat(devCost).toLocaleString()}`,
      licenseCost: `$${parseFloat(licenseCost).toLocaleString()}`,
      totalBudget: `$${totalEst.toLocaleString()}`,
      teamSize: `${teamSize} Members`,
      timelineWeeks: `${timelineWeeks} Weeks`,
      projectedRoi: estRoi,
      annualSavings: `$${parseFloat(annualSavings).toLocaleString()}`,
      notes: notes || "Detailed estimation approved by PM & Engineering Lead.",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    };

    const updatedEstList = [estRecord, ...estimationsList.filter((e) => String(e.ideaId) !== String(selectedIdeaId))];
    setEstimationsList(updatedEstList);
    localStorage.setItem("idea360Estimations", JSON.stringify(updatedEstList));

    // Update status in central storage
    updateIdeaStatus(Number(selectedIdeaId), "Estimation Completed", `Total Budget: $${totalEst.toLocaleString()} | Timeline: ${timelineWeeks} Wks | ROI: ${estRoi}`);

    setSuccessBanner(`Estimation for "${estRecord.title}" saved successfully ($${totalEst.toLocaleString()} Budget | ${estRoi} ROI)!`);
    setShowModal(false);
    setIsSubmitting(false);
    setSelectedIdeaId("");
    loadData();
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Stage 4 — Estimation & Budgeting Panel</h1>
            <span className="mode-badge-green" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
              <Calculator size={14} /> Resource & Cost Modeling
            </span>
          </div>
        </div>

        <div className="quick-actions-flex">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Create New Estimation
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          <CheckCircle2 size={20} color="#16a34a" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 4 Clickable KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div
          className={`kpi-mini-card ${filterTab === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterTab("all")}
          style={{ cursor: "pointer", border: filterTab === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Proposals Needing Estimation</span>
            <div className="kpi-icon-pill pill-purple">
              <Calculator size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{eligibleIdeas.length}</span>
        </div>

        <div
          className={`kpi-mini-card ${filterTab === "pending" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterTab("pending")}
          style={{ cursor: "pointer", border: filterTab === "pending" ? "2px solid #f59e0b" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Pending Estimation</span>
            <div className="kpi-icon-pill pill-amber">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {eligibleIdeas.filter((i) => !i.status.includes("Estimation Completed") && !i.status.includes("Execution")).length}
          </span>
        </div>

        <div
          className={`kpi-mini-card ${filterTab === "completed" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterTab("completed")}
          style={{ cursor: "pointer", border: filterTab === "completed" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Estimations Finalized</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {eligibleIdeas.filter((i) => i.status.includes("Estimation Completed") || i.status.includes("Execution")).length}
          </span>
        </div>

        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Avg Projected ROI</span>
            <div className="kpi-icon-pill pill-blue">
              <TrendingUp size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#16a34a" }}>180%</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>Active Queue:</span>
        {[
          { id: "all", label: "All Eligible Proposals" },
          { id: "pending", label: "Pending Estimation" },
          { id: "completed", label: "Estimation Completed" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            style={{
              background: filterTab === tab.id ? "var(--primary)" : "#f1f5f9",
              color: filterTab === tab.id ? "#ffffff" : "var(--text-dark)",
              border: "none",
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <Card title={`Estimation & Resource Allocation Table (${filteredIdeas.length})`}>
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Proposal Title</th>
                <th>Category</th>
                <th>Estimated Budget</th>
                <th>Sprint Timeline</th>
                <th>Projected ROI</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No proposals in estimation queue</span>
                      <span className="empty-state-sub">Proposals approved by Business Analysts will automatically appear here.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIdeas.map((item) => {
                  const savedEst = estimationsList.find((e) => String(e.ideaId) === String(item.id));
                  const isDone = item.status.includes("Estimation Completed") || item.status.includes("Execution");

                  return (
                    <tr key={item.id}>
                      <td className="table-idea-title">{item.title}</td>
                      <td>
                        <span className="category-chip">{item.category}</span>
                      </td>
                      <td style={{ fontWeight: "700", color: "#1e293b" }}>
                        {savedEst ? savedEst.totalBudget : "$43,000"}
                      </td>
                      <td>{savedEst ? savedEst.timelineWeeks : "8 Weeks"}</td>
                      <td style={{ color: "#16a34a", fontWeight: "700" }}>
                        {savedEst ? savedEst.projectedRoi : "165.0%"}
                      </td>
                      <td>
                        <span className={`table-badge ${isDone ? "badge-approved" : "badge-review"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <Button
                            size="sm"
                            variant="primary"
                            icon={Calculator}
                            onClick={() => {
                              setSelectedIdeaId(String(item.id));
                              setShowModal(true);
                            }}
                          >
                            {isDone ? "Edit Estimation" : "Estimate Proposal"}
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

      {/* ESTIMATION MODAL */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create Engineering & Budget Estimation"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleSaveEstimation} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save & Finalize Estimation"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEstimation} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Select Proposal to Estimate</label>
              <select
                className="custom-input-elem"
                value={selectedIdeaId}
                onChange={(e) => handleSelectProposal(e.target.value)}
                style={{ fontSize: "14px", fontWeight: "600" }}
                required
              >
                <option value="">-- Choose BA Approved Proposal --</option>
                {eligibleIdeas.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title} ({i.category})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label="Direct Engineering Labor Cost ($)"
                type="number"
                value={devCost}
                onChange={(e) => setDevCost(e.target.value)}
                required
              />
              <Input
                label="Software & Infra Licensing ($)"
                type="number"
                value={licenseCost}
                onChange={(e) => setLicenseCost(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label="Assigned Team Size (Members)"
                type="number"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                required
              />
              <Input
                label="Estimated Timeline (Weeks)"
                type="number"
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(e.target.value)}
                required
              />
            </div>

            <Input
              label="Expected Annual Financial Savings ($)"
              type="number"
              value={annualSavings}
              onChange={(e) => setAnnualSavings(e.target.value)}
              required
            />

            {/* Live Calculation Display */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                <div><strong>Total Estimated Cost:</strong> <span style={{ color: "#4f46e5", fontWeight: "800" }}>${calculateTotalCost().toLocaleString()}</span></div>
                <div><strong>Projected ROI %:</strong> <span style={{ color: "#16a34a", fontWeight: "800" }}>{calculateRoi()}</span></div>
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label">Estimation Rationale & Notes</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Include details about technical complexity, external vendor dependencies, or risk factors..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Estimation;
