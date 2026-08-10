import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FileBarChart,
  PieChart,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Search,
  Printer,
  Calendar,
  Building2
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getSubmittedIdeas, getSubmittedAnalysisReports } from "../../utils/ideaStorage";

function ReportsPage() {
  const [ideas, setIdeas] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    setIdeas(getSubmittedIdeas());
    setReports(getSubmittedAnalysisReports());
  }, []);

  const totalSubmitted = ideas.length;
  const passedScreening = ideas.filter((i) => (i.status || "").includes("Passed") || (i.status || "").includes("Approved")).length;
  const inFeasibility = ideas.filter((i) => (i.status || "").includes("Feasibility") || (i.status || "").includes("Assigned")).length;
  const rejectedCount = ideas.filter((i) => (i.status || "").includes("Rejected") || (i.status || "").includes("Not ")).length;

  const filteredIdeas = ideas.filter((i) => {
    const matchesSearch =
      (i.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.author || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "All" || i.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categoriesList = Array.from(new Set(ideas.map((i) => i.category || "General"))).filter(Boolean);

  const handleExportCSV = () => {
    if (ideas.length === 0) {
      toast("No data available to export.", { icon: "⚠️" });
      return;
    }

    const headers = ["Idea ID", "Title", "Category", "Author", "Status", "Assigned Reviewer", "Date"];
    const rows = ideas.map((i) => [
      `IDEA-${i.id}`,
      `"${(i.title || "").replace(/"/g, '""')}"`,
      `"${i.category || ""}"`,
      `"${i.author || ""}"`,
      `"${i.status || ""}"`,
      `"${(i.assignedReviewer || "Unassigned").replace(/"/g, '""')}"`,
      `"${i.date || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Idea360_Innovation_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Enterprise Innovation Reports & Analytics</h1>
            <span className="category-chip-indigo">
              <FileBarChart size={14} /> Executive Reporting Studio
            </span>
          </div>
          <p>Comprehensive pipeline metrics, domain distribution, stage funnel SLA compliance, and exportable audit logs.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="outline" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
          <Button variant="primary" icon={Download} onClick={handleExportCSV}>
            Export Executive CSV
          </Button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="kpi-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase" }}>Total Submissions</span>
            <div style={{ background: "#e0e7ff", color: "#4f46e5", padding: "6px", borderRadius: "50%" }}>
              <FileBarChart size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "#1e293b" }}>{totalSubmitted}</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Across all business domains</div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#166534", textTransform: "uppercase" }}>Passed Initial Screening</span>
            <div style={{ background: "#dcfce7", color: "#16a34a", padding: "6px", borderRadius: "50%" }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "#15803d" }}>{passedScreening}</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Qualified for Feasibility Review</div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#1e40af", textTransform: "uppercase" }}>In Parallel Review</span>
            <div style={{ background: "#dbeafe", color: "#2563eb", padding: "6px", borderRadius: "50%" }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "#1d4ed8" }}>{inFeasibility}</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Active in Business/Tech/Func</div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#991b1b", textTransform: "uppercase" }}>Non-Feasible / Rejected</span>
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "6px", borderRadius: "50%" }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "#b91c1c" }}>{rejectedCount}</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Closed in screening/review</div>
        </div>
      </div>

      {/* FILTER & TABLE */}
      <Card title={`Detailed Audit & Pipeline Reports (${filteredIdeas.length})`} subtitle="Filter and inspect detailed status across all stage gates">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "16px" }}>
          <div style={{ position: "relative", width: "300px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              className="custom-input-elem"
              placeholder="Search title, author, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Domain Filter:</span>
            <select
              className="custom-input-elem"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: "180px", height: "38px", fontSize: "13px" }}
            >
              <option value="All">All Domains</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Idea ID & Title</th>
                <th>Domain Category</th>
                <th>Author</th>
                <th>Assigned Reviewer</th>
                <th>Assigned BA</th>
                <th>Pipeline Status</th>
                <th>Submission Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#64748b", padding: "24px" }}>
                    No matching proposal reports found.
                  </td>
                </tr>
              ) : (
                filteredIdeas.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="table-idea-title">{i.title}</span>
                      </div>
                    </td>
                    <td><span className="category-chip">{i.category}</span></td>
                    <td><span style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b" }}>{i.author}</span></td>
                    <td>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#4f46e5" }}>
                        {i.assignedReviewer ? i.assignedReviewer.split("(")[0] : "Needs Reviewer"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0891b2" }}>
                        {i.assignedBA ? i.assignedBA.split("(")[0] : "Unassigned"}
                      </span>
                    </td>
                    <td><span className="table-badge badge-approved">{i.status}</span></td>
                    <td><span style={{ fontSize: "12px", color: "#64748b" }}>{i.date}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ReportsPage;
