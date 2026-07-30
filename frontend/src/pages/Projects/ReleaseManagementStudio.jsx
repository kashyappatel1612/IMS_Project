import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Tag,
  Inbox,
  AlertTriangle
} from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";

const DEFAULT_RELEASES = [
  { id: "REL-v1.0.0", name: "Version 1.0 Production Release", targetDate: "Aug 15, 2026", qaGate: "Passed", securityGate: "Passed", status: "Staging Ready" },
  { id: "REL-v1.1.0", name: "Version 1.1 Maintenance & Patch", targetDate: "Sep 01, 2026", qaGate: "In Audit", securityGate: "Pending", status: "In Development" }
];

function ReleaseManagementStudio() {
  const navigate = useNavigate();
  const [releases, setReleases] = useState(DEFAULT_RELEASES);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-flex">
        <div className="dash-title-box">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1>Production Release & Deployment Management</h1>
            <span className="category-chip-indigo">
              <Rocket size={14} /> Release Control
            </span>
          </div>
          <p>Oversee release versioning, QA release gates, security compliance sign-offs, and production deployments.</p>
        </div>
      </div>

      <Card title={`Production Releases & Deployment Pipeline (${releases.length})`} subtitle="Release gates verification and target release dates">
        <div className="data-table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Release Version & Title</th>
                <th>Target Deployment Date</th>
                <th>QA Release Gate</th>
                <th>Security Compliance Gate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((rl) => (
                <tr key={rl.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "#4f46e5", color: "#ffffff", padding: "1px 6px", borderRadius: "4px" }}>
                        {rl.id}
                      </span>
                    </div>
                    <div style={{ fontWeight: "700", color: "#1e293b" }}>{rl.name}</div>
                  </td>
                  <td style={{ fontSize: "12px", color: "#d97706", fontWeight: "700" }}>{rl.targetDate}</td>
                  <td>
                    <span style={{ color: rl.qaGate === "Passed" ? "#16a34a" : "#d97706", fontWeight: "700", fontSize: "12px" }}>
                      ✓ {rl.qaGate}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: rl.securityGate === "Passed" ? "#16a34a" : "#dc2626", fontWeight: "700", fontSize: "12px" }}>
                      ✓ {rl.securityGate}
                    </span>
                  </td>
                  <td>
                    <span className="table-badge badge-approved">{rl.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ReleaseManagementStudio;
