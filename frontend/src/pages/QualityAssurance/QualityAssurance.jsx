import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlayCircle,
  FileCheck,
  Plus,
  Eye,
  Send,
  Inbox,
  Lock,
  Award
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { fetchAllIdeas } from "../../services/api";
import { getSubmittedIdeas, updateIdeaStatus } from "../../utils/ideaStorage";

function QualityAssurance() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filterMode, setFilterMode] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Modal Form State
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [testPassRate, setTestPassRate] = useState("98");
  const [securityStatus, setSecurityStatus] = useState("Cleared (No Critical Vulnerabilities)");
  const [defectsCount, setDefectsCount] = useState("0");
  const [qaNotes, setQaNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apiIdeas = await fetchAllIdeas();
      filterQAProjects(apiIdeas && apiIdeas.length > 0 ? apiIdeas : getSubmittedIdeas());
    } catch (e) {
      filterQAProjects(getSubmittedIdeas());
    }
  };

  const filterQAProjects = (list) => {
    const active = list.filter(
      (i) =>
        i.status.includes("Execution") ||
        i.status.includes("Estimation Completed") ||
        i.status.includes("QA Passed") ||
        i.status.includes("Completed") ||
        i.status.includes("Project")
    );
    setProjects(active);
  };

  const filteredList = projects.filter((p) => {
    if (filterMode === "passed") return p.status.includes("QA Passed") || p.status.includes("Completed");
    if (filterMode === "testing") return !p.status.includes("QA Passed") && !p.status.includes("Completed");
    return true;
  });

  const handleSignOffQA = (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast("Please select a project for QA Sign-Off!", { icon: "⚠️" });
      return;
    }

    setIsSubmitting(true);
    const targetStatus = "QA Passed & Release Ready";
    const logNote = `QA Sign-Off: Pass Rate ${testPassRate}% | Security: ${securityStatus} | Open Defects: ${defectsCount} | Auditor Notes: ${qaNotes || "All quality gates passed."}`;

    updateIdeaStatus(Number(selectedProjectId), targetStatus, logNote);

    setSuccessBanner(`Quality Gate SIGNED OFF for project! Status updated to "QA Passed & Release Ready".`);
    setShowModal(false);
    setIsSubmitting(false);
    setSelectedProjectId("");
    setQaNotes("");
    loadData();
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header Banner */}
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div className="title-flex-row">
            <h1>Quality Assurance & Compliance Control Hub</h1>
            <span className="mode-badge-green" style={{ background: "#e0e7ff", color: "#4f46e5" }}>
              <ShieldCheck size={14} /> Stage 6 Quality Gate
            </span>
          </div>
          <p>Execute automated unit test suites, security compliance audits, defect resolution tracking, and final production release sign-offs.</p>
        </div>

        <div className="quick-actions-flex">
          <Button variant="primary" icon={ShieldCheck} onClick={() => setShowModal(true)}>
            Execute QA Sign-Off Gate
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

      {/* 4 KPI Cards */}
      <div className="kpi-6-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "20px" }}>
        <div
          className={`kpi-mini-card ${filterMode === "all" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("all")}
          style={{ cursor: "pointer", border: filterMode === "all" ? "2px solid #6366f1" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Projects in QA Gate</span>
            <div className="kpi-icon-pill pill-purple">
              <FileCheck size={20} />
            </div>
          </div>
          <span className="kpi-num-val">{projects.length}</span>
        </div>

        <div
          className={`kpi-mini-card ${filterMode === "passed" ? "active-kpi-ring" : ""}`}
          onClick={() => setFilterMode("passed")}
          style={{ cursor: "pointer", border: filterMode === "passed" ? "2px solid #22c55e" : "1px solid #e2e8f0" }}
        >
          <div className="kpi-top-row">
            <span className="kpi-label-txt">QA Signed Off (Passed)</span>
            <div className="kpi-icon-pill pill-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <span className="kpi-num-val">
            {projects.filter((p) => p.status.includes("QA Passed") || p.status.includes("Completed")).length}
          </span>
        </div>

        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Test Suite Pass Rate</span>
            <div className="kpi-icon-pill pill-blue">
              <Award size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#16a34a" }}>99.2%</span>
        </div>

        <div className="kpi-mini-card" style={{ border: "1px solid #e2e8f0" }}>
          <div className="kpi-top-row">
            <span className="kpi-label-txt">Critical Security Vulnerabilities</span>
            <div className="kpi-icon-pill pill-green">
              <Lock size={20} />
            </div>
          </div>
          <span className="kpi-num-val" style={{ color: "#16a34a" }}>0 Defect</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-muted)" }}>QA Filter:</span>
        {[
          { id: "all", label: "All QA Projects" },
          { id: "testing", label: "In Active Testing" },
          { id: "passed", label: "QA Cleared & Release Ready" }
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

      {/* Main QA Testing Table */}
      <Card title={`Quality Assurance Gate & Compliance Audit Matrix (${filteredList.length})`} subtitle="Unit tests, UAT sign-off, and security clearance tracking">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>Category</th>
                <th>Test Suite Pass Rate</th>
                <th>Security Clearance</th>
                <th>QA Status</th>
                <th>Gate Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    <div className="empty-state-flex" style={{ padding: "24px 0" }}>
                      <Inbox size={32} color="var(--text-light)" />
                      <span className="empty-state-title">No projects in QA queue for "{filterMode}" filter</span>
                      <span className="empty-state-sub">Projects in execution automatically populate the QA testing pipeline.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((p) => {
                  const isPassed = p.status.includes("QA Passed") || p.status.includes("Completed");

                  return (
                    <tr key={p.id}>
                      <td className="table-idea-title">{p.title}</td>
                      <td>
                        <span className="category-chip">{p.category}</span>
                      </td>
                      <td style={{ fontWeight: "700", color: "#16a34a" }}>
                        {isPassed ? "100% Pass (All Suites)" : "98.5% Pass (124/126 Passed)"}
                      </td>
                      <td>
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#166534",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: "700"
                          }}
                        >
                          ✓ Security Cleared
                        </span>
                      </td>
                      <td>
                        <span className={`table-badge ${isPassed ? "badge-approved" : "badge-review"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="primary"
                          icon={ShieldCheck}
                          onClick={() => {
                            setSelectedProjectId(String(p.id));
                            setShowModal(true);
                          }}
                        >
                          {isPassed ? "Re-Audit QA Gate" : "Execute QA Sign-Off"}
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

      {/* QA AUDIT MODAL */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Quality Assurance & Security Compliance Sign-Off"
          footer={
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" icon={Send} onClick={handleSignOffQA} disabled={isSubmitting}>
                {isSubmitting ? "Signing Off..." : "Approve & Sign-Off QA Gate"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSignOffQA} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="input-field-group">
              <label className="input-label">Select Project for QA Clearance</label>
              <select
                className="custom-input-elem"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ fontSize: "14px", fontWeight: "600" }}
                required
              >
                <option value="">-- Choose Project --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category}) — Status: {p.status}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label="Automated Test Suite Pass Rate (%)"
                type="number"
                value={testPassRate}
                onChange={(e) => setTestPassRate(e.target.value)}
                required
              />
              <Input
                label="Open Defect Count (Bugs)"
                type="number"
                value={defectsCount}
                onChange={(e) => setDefectsCount(e.target.value)}
                required
              />
            </div>

            <div className="input-field-group">
              <label className="input-label">Security & IP Compliance Clearance</label>
              <select
                className="custom-input-elem"
                value={securityStatus}
                onChange={(e) => setSecurityStatus(e.target.value)}
              >
                <option value="Cleared (No Critical Vulnerabilities)">Cleared (No Critical Vulnerabilities)</option>
                <option value="Conditional Approval (Minor Advisory)">Conditional Approval (Minor Advisory)</option>
                <option value="Pending Penetration Testing">Pending Penetration Testing</option>
              </select>
            </div>

            <div className="input-field-group">
              <label className="input-label">QA Auditor & Compliance Notes</label>
              <textarea
                className="custom-input-elem"
                rows={3}
                placeholder="Log UAT sign-off notes, test environment details, or deployment approval comments..."
                value={qaNotes}
                onChange={(e) => setQaNotes(e.target.value)}
              ></textarea>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default QualityAssurance;
