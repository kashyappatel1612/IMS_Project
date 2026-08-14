import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  TrendingUp,
  Award,
  DollarSign,
  Clock,
  CheckCircle2,
  Plus,
  Eye,
  Send,
  Inbox,
  Sparkles,
  Users,
  FileText
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { fetchAllIdeas } from "../../services/api";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function BenefitsTracking() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [actualSavings, setActualSavings] = useState("145000");
  const [hoursSaved, setHoursSaved] = useState("1200");
  const [spotBonus, setSpotBonus] = useState("$500 Spot Bonus Awarded");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apiIdeas = await fetchAllIdeas();
      filterBenefitsProjects(apiIdeas && apiIdeas.length > 0 ? apiIdeas : getSubmittedIdeas());
    } catch (e) {
      filterBenefitsProjects(getSubmittedIdeas());
    }
  };

  const filterBenefitsProjects = (list) => {
    const active = list.filter(
      (i) =>
        i.status.includes("Completed") ||
        i.status.includes("Execution") ||
        i.status.includes("QA Passed") ||
        i.status.includes("Approved")
    );
    setProjects(active);
  };

  const filteredList = projects.filter((p) => {
    if (filterMode === "completed") return p.status.includes("Completed");
    if (filterMode === "realized") return p.status.includes("Benefits Realized") || p.status.includes("Completed");
    return true;
  });

  const handleSaveBenefits = (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast("Please select a project to record benefits!", { icon: "⚠️" });
      return;
    }

    setIsSubmitting(true);
    const targetStatus = "Completed & Benefits Realized";
    const logNote = `Benefits Realized: Actual Annual Savings $${parseFloat(actualSavings).toLocaleString()} | Hours Saved: ${hoursSaved} hrs/yr | Author Reward: ${spotBonus} | Notes: ${notes || "Verified post-launch savings."}`;

    updateIdeaStatus(Number(selectedProjectId), targetStatus, logNote);

    setSuccessBanner(`Benefits Realization logged! Status updated to "Completed & Benefits Realized".`);
    setShowModal(false);
    setIsSubmitting(false);
    setSelectedProjectId("");
    setNotes("");
    loadData();
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Benefits Realization & ROI Value Tracking</h1>
            <span className="mode-badge-green" style={{ background: "#ecfdf5", color: "#059669" }}>
              <TrendingUp size={14} /> Stage 7 Post-Launch Value
            </span>
          </div>
        </div>

        <div className="quick-actions-flex">
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
            Record Realized Benefits
          </Button>
        </div>
      </div>

      {/* Success Banner */}
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

      {/* 4 KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Total Annual Savings Realized</span>
            <div className="kpi-icon-pill pill-green">
              <DollarSign size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#16a34a" }}>$420,000</span>
        </div>

        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Total Employee Hours Saved</span>
            <div className="kpi-icon-pill pill-purple">
              <Clock size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#4f46e5" }}>3,800 Hrs/Yr</span>
        </div>

        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Author Spot Bonuses Awarded</span>
            <div className="kpi-icon-pill pill-amber">
              <Award size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#d97706" }}>$4,500</span>
        </div>

        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Avg Value Realized Rate</span>
            <div className="kpi-icon-pill pill-blue">
              <Sparkles size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#2563eb" }}>115% vs Target</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>View:</span>
        {[
          { id: "all", label: "All Projects" },
          { id: "completed", label: "Completed Projects" },
          { id: "realized", label: "Benefits Verified & Realized" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id)}
            style={{
              background: filterMode === tab.id ? "var(--primary)" : "#f1f5f9",
              color: filterMode === tab.id ? "#ffffff" : "var(--text-dark)",
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

      {/* Benefits Table */}
      <Card title={`Post-Launch Benefits & Value Realization (${filteredList.length})`}>
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Author & Domain</th>
                <th>Actual Annual Savings</th>
                <th>Hours Saved / Yr</th>
                <th>Author Reward Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No completed projects in benefits queue</span>
                      <span className="empty-state-sub">Completed projects will automatically appear here for ROI tracking.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((p, idx) => (
                  <tr key={p.id}>
                    <td className="table-idea-title">{p.title}</td>
                    <td>
                      <div><strong>{p.author || "User"}</strong></div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{p.category}</div>
                    </td>
                    <td style={{ fontWeight: "700", color: "#16a34a" }}>
                      ${(120000 + idx * 25000).toLocaleString()} / Yr
                    </td>
                    <td style={{ fontWeight: "600", color: "#1e293b" }}>
                      {800 + idx * 200} Hours/Yr
                    </td>
                    <td>
                      <span
                        style={{
                          background: "#fef3c7",
                          color: "#b45309",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: "700"
                        }}
                      >
                        🏆 $500 Spot Bonus Awarded
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={TrendingUp}
                        onClick={() => {
                          setSelectedProjectId(String(p.id));
                          setShowModal(true);
                        }}
                      >
                        Update Benefits
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* RECORD BENEFITS MODAL */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Record Realized Business Benefits & Rewards"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleSaveBenefits} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save & Verify Benefits"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveBenefits} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Select Implemented Project</label>
              <select
                className="custom-input-elem"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ fontSize: "14px", fontWeight: "600" }}
                required
              >
                <option value="">-- Choose Implemented Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label="Actual Annual Cost Savings ($)"
                type="number"
                value={actualSavings}
                onChange={(e) => setActualSavings(e.target.value)}
                required
              />
              <Input
                label="Employee Hours Saved / Year"
                type="number"
                value={hoursSaved}
                onChange={(e) => setHoursSaved(e.target.value)}
                required
              />
            </div>

            <Input
              label="Author Innovation Spot Bonus Award"
              value={spotBonus}
              onChange={(e) => setSpotBonus(e.target.value)}
              placeholder="e.g. $500 Spot Bonus & Certificate"
            />

            <div className="input-field-group">
              <label className="input-label">Benefits Realization Summary</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Detail actual ROI vs projected ROI, department productivity metrics, or user adoption rate..."
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

export default BenefitsTracking;
