import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Lightbulb,
  Filter,
  FileCheck,
  BarChart,
  Calculator,
  FolderKanban,
  PlayCircle,
  TrendingUp,
  Award,
  BookOpen,
  FileBarChart,
  Settings,
  ShieldCheck
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

  // Full Navigation Items List
  const allNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "initial-screening", label: "Initial Screening", icon: Filter, path: "/initial-screening" },
    { id: "feasibility-review", label: "Feasibility Review", icon: FileCheck, path: "/feasibility-review" },
    { id: "business-analysis", label: "Business Analysis", icon: BarChart, path: "/business-analysis" },
    { id: "estimation", label: "Estimation", icon: Calculator, path: "/estimation" },
    { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
    { id: "execution", label: "Execution", icon: PlayCircle, path: "/execution" },
    { id: "progress-tracking", label: "Progress Tracking", icon: TrendingUp, path: "/progress-tracking" },
    { id: "quality-assurance", label: "Quality Assurance", icon: ShieldCheck, path: "/quality-assurance" },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    { id: "reports", label: "Reports", icon: FileBarChart, path: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  // User Navigation Items
  const userNavItems = [
    { id: "dashboard", label: "Dashboard (My Ideas)", icon: LayoutDashboard, path: "/dashboard" },
    { id: "submit-idea", label: "Submit Idea", icon: Lightbulb, path: "/submit-idea" },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  // Role-Specific Navigation Menu Logic
  const getMenuForRole = () => {
    if (userRole === "Administrator" || userRole === "Project Coordinator") {
      return allNavItems;
    }

    if (userRole === "Business Analyst") {
      // HIDE Initial Screening & Feasibility Review
      return allNavItems.filter(
        (item) => item.id !== "initial-screening" && item.id !== "feasibility-review"
      );
    }

    if (userRole === "Reviewer") {
      // HIDE Initial Screening only
      return allNavItems.filter((item) => item.id !== "initial-screening");
    }

    if (userRole === "Project Manager") {
      // HIDE everything above Projects (Initial Screening, Feasibility Review, Business Analysis, Estimation)
      return allNavItems.filter((item) => {
        if (item.id === "dashboard") return true;
        if (
          item.id === "initial-screening" ||
          item.id === "feasibility-review" ||
          item.id === "business-analysis" ||
          item.id === "estimation"
        ) {
          return false;
        }
        return true; // Projects, Execution, Progress Tracking, Benefits Tracking, Knowledge Base, Reports, Settings
      });
    }

    // Default 'User' Role
    return userNavItems;
  };

  const currentNavItems = getMenuForRole();

  return (
    <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img src={imsLogo} alt="IMS Group" className="sidebar-brand-logo" />
          <div className="brand-text-col">
            <span className="brand-text">Idea360</span>
            <span className="brand-subtext">
              {userRole} Portal
            </span>
          </div>
        </div>

        <ul className="sidebar-menu-list">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`sidebar-link-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={17} className="sidebar-link-icon" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
