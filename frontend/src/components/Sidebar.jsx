import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Filter,
  BarChart,
  Calculator,
  FolderKanban,
  PlayCircle,
  TrendingUp,
  Award,
  BookOpen,
  FileBarChart,
  Settings,
  ShieldCheck,
  Users,
  UserCheck,
  History,
  FileText
} from "lucide-react";
import imsLogo from "../assets/ims-logo.jpg";

function Sidebar({ isOpen }) {
  const location = useLocation();
  const [userRole, setUserRole] = useState("User");

  useEffect(() => {
    const savedUserStr = localStorage.getItem("currentUser");
    if (savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.role) {
          setUserRole(savedUser.role);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [location]);

  const isAdmin = userRole === "Administrator" || userRole === "Admin";
  const isPC = userRole === "Project Coordinator";

  return (
    <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-top">
        {/* Brand Header */}
        <div className="sidebar-brand">
          <img src={imsLogo} alt="IMS Group" className="sidebar-brand-logo" />
          <div className="brand-text-col">
            <span className="brand-text">Idea360</span>
          </div>
        </div>

        {/* Navigation List */}
        <ul className="sidebar-menu-list">
          {/* Main Dashboard */}
          <li>
            <Link
              to="/dashboard"
              className={`sidebar-link-item ${location.pathname === "/dashboard" ? "active" : ""}`}
            >
              <LayoutDashboard size={18} className="sidebar-link-icon" />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Administration Section */}
          {isAdmin && (
            <>
              <li className="sidebar-section-header">Administration</li>
              <li>
                <Link
                  to="/user-management"
                  className={`sidebar-link-item ${location.pathname === "/user-management" ? "active" : ""}`}
                >
                  <Users size={18} className="sidebar-link-icon" />
                  <span>User Management</span>
                </Link>
              </li>
            </>
          )}

          {/* Workflow Section */}
          <li className="sidebar-section-header">Workflow</li>

          {isPC && (
            <li>
              <Link
                to="/reviewer-allocation"
                className={`sidebar-link-item ${location.pathname === "/reviewer-allocation" ? "active" : ""}`}
              >
                <UserCheck size={18} className="sidebar-link-icon" />
                <span>Allocate Roles</span>
              </Link>
            </li>
          )}

          {(isAdmin || isPC || userRole === "Reviewer") && (
            <li>
              <Link
                to="/initial-screening"
                className={`sidebar-link-item ${location.pathname === "/initial-screening" ? "active" : ""}`}
              >
                <Filter size={18} className="sidebar-link-icon" />
                <span>Initial Screening</span>
              </Link>
            </li>
          )}

          {(isAdmin || isPC || userRole === "Business Analyst") && (
            <li>
              <Link
                to="/business-analysis"
                className={`sidebar-link-item ${location.pathname === "/business-analysis" ? "active" : ""}`}
              >
                <BarChart size={18} className="sidebar-link-icon" />
                <span>Business Analysis</span>
              </Link>
            </li>
          )}

          {(isAdmin || isPC) && (
            <li>
              <Link
                to="/estimation"
                className={`sidebar-link-item ${location.pathname === "/estimation" ? "active" : ""}`}
              >
                <Calculator size={18} className="sidebar-link-icon" />
                <span>Estimation</span>
              </Link>
            </li>
          )}

          {(isAdmin || isPC || userRole === "Project Manager") && (
            <li>
              <Link
                to="/projects"
                className={`sidebar-link-item ${location.pathname === "/projects" ? "active" : ""}`}
              >
                <FolderKanban size={18} className="sidebar-link-icon" />
                <span>Projects</span>
              </Link>
            </li>
          )}

          {(isAdmin || userRole === "Project Manager") && (
            <li>
              <Link
                to="/execution"
                className={`sidebar-link-item ${location.pathname === "/execution" ? "active" : ""}`}
              >
                <PlayCircle size={18} className="sidebar-link-icon" />
                <span>Execution</span>
              </Link>
            </li>
          )}

          {(isAdmin || isPC || userRole === "Project Manager") && (
            <li>
              <Link
                to="/progress-tracking"
                className={`sidebar-link-item ${location.pathname === "/progress-tracking" ? "active" : ""}`}
              >
                <TrendingUp size={18} className="sidebar-link-icon" />
                <span>Progress Tracking</span>
              </Link>
            </li>
          )}

          {(isAdmin || userRole === "Project Manager" || userRole === "QA") && (
            <li>
              <Link
                to="/quality-assurance"
                className={`sidebar-link-item ${location.pathname === "/quality-assurance" ? "active" : ""}`}
              >
                <ShieldCheck size={18} className="sidebar-link-icon" />
                <span>Quality Assurance</span>
              </Link>
            </li>
          )}

          {(isAdmin || userRole === "Project Manager" || userRole === "Business Analyst") && (
            <li>
              <Link
                to="/benefits-tracking"
                className={`sidebar-link-item ${location.pathname === "/benefits-tracking" ? "active" : ""}`}
              >
                <Award size={18} className="sidebar-link-icon" />
                <span>Benefits Tracking</span>
              </Link>
            </li>
          )}

          <li>
            <Link
              to="/knowledge-base"
              className={`sidebar-link-item ${location.pathname === "/knowledge-base" ? "active" : ""}`}
            >
              <BookOpen size={18} className="sidebar-link-icon" />
              <span>Knowledge Base</span>
            </Link>
          </li>

          {/* Reports */}
          {(isAdmin || isPC || userRole === "Project Manager") && (
            <li>
              <Link
                to="/reports"
                className={`sidebar-link-item ${location.pathname === "/reports" ? "active" : ""}`}
              >
                <FileBarChart size={18} className="sidebar-link-icon" />
                <span>Reports</span>
              </Link>
            </li>
          )}

          {/* Settings */}
          <li>
            <Link
              to="/settings"
              className={`sidebar-link-item ${location.pathname === "/settings" ? "active" : ""}`}
            >
              <Settings size={18} className="sidebar-link-icon" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
