import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ShieldCheck,
  History,
  Bell,
  FileText,
  ListTodo,
  Folder,
  Calendar,
  CheckSquare,
  Rocket,
  UserCheck,
  Users,
  LogOut
} from "lucide-react";
import imsLogo from "../assets/ims-logo.jpg";

function Sidebar({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Full Admin Navigation Items List
  const adminNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "initial-screening", label: "Initial Screening", icon: Filter, path: "/initial-screening" },
    { id: "business-analysis", label: "Business Analysis", icon: BarChart, path: "/business-analysis" },
    { id: "estimation", label: "Estimation", icon: Calculator, path: "/estimation" },
    { id: "projects", label: "Projects", icon: FolderKanban, path: "/projects" },
    { id: "execution", label: "Execution", icon: PlayCircle, path: "/execution" },
    { id: "progress-tracking", label: "Progress Tracking", icon: TrendingUp, path: "/progress-tracking" },
    { id: "quality-assurance", label: "Quality Assurance", icon: ShieldCheck, path: "/quality-assurance" },
    { id: "benefits-tracking", label: "Benefits Tracking", icon: Award, path: "/benefits-tracking" },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    { id: "reports", label: "Reports", icon: FileBarChart, path: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  // Dedicated Project Coordinator Navigation Menu Items
  const pcNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "allocate-roles", label: "Allocate Roles", icon: UserCheck, path: "/reviewer-allocation" },
    { id: "initial-screening", label: "Initial Screening", icon: Filter, path: "/initial-screening" },
    { id: "business-analysis", label: "Business Analysis", icon: BarChart, path: "/business-analysis" },
    { id: "estimation", label: "Estimation", icon: Calculator, path: "/estimation" },
    { id: "project-creation", label: "Project Creation", icon: FolderKanban, path: "/projects" },
    { id: "progress-tracking", label: "Progress Tracking", icon: TrendingUp, path: "/progress-tracking" },
    { id: "reports", label: "Reports", icon: FileBarChart, path: "/reports" },
    { id: "user-management", label: "User Management", icon: Users, path: "/user-management" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  // Dedicated Reviewer Navigation Menu Items
  const reviewerNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "initial-screening", label: "Initial Screening", icon: Filter, path: "/initial-screening" },
    { id: "feasibility-review", label: "Feasibility Review", icon: ShieldCheck, path: "/feasibility-review" },
    { id: "review-history", label: "Review History", icon: History, path: "/review-history" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  // Dedicated Business Analyst Navigation Menu Items
  const baNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "brd-frd", label: "BRD / FRD Studio", icon: FileText, path: "/brd-frd" },
    { id: "documents", label: "Documents", icon: Folder, path: "/documents" },
    { id: "analysis-reports", label: "Analysis Reports", icon: FileBarChart, path: "/analysis-reports" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  // Dedicated Project Manager Navigation Menu Items
  const pmNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "my-projects", label: "My Projects", icon: FolderKanban, path: "/projects" },
    { id: "sprint-planning", label: "Sprint Planning", icon: Calendar, path: "/sprint-planning" },
    { id: "task-management", label: "Task Management", icon: CheckSquare, path: "/task-management" },
    { id: "execution", label: "Execution", icon: PlayCircle, path: "/execution" },
    { id: "progress-tracking", label: "Progress Tracking", icon: TrendingUp, path: "/progress-tracking" },
    { id: "quality-assurance", label: "Quality Assurance", icon: ShieldCheck, path: "/quality-assurance" },
    { id: "release-management", label: "Release Management", icon: Rocket, path: "/release-management" },
    { id: "benefits-tracking", label: "Benefits Tracking", icon: Award, path: "/benefits-tracking" },
    { id: "notifications", label: "Notifications", icon: Bell, path: "/notifications" },
    { id: "reports", label: "Reports", icon: FileBarChart, path: "/reports" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  // User Navigation Items
  const userNavItems = [
    { id: "dashboard", label: "Dashboard (My Ideas)", icon: LayoutDashboard, path: "/dashboard" },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }
  ];

  // Role-Specific Navigation Menu Logic
  const getMenuForRole = () => {
    if (userRole === "Administrator") {
      return adminNavItems;
    }

    if (userRole === "Project Coordinator") {
      return pcNavItems;
    }

    if (userRole === "Reviewer") {
      return reviewerNavItems;
    }

    if (userRole === "Business Analyst") {
      return baNavItems;
    }

    if (userRole === "Project Manager") {
      return pmNavItems;
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
