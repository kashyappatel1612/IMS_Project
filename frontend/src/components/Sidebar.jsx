import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Filter,
  CheckSquare,
  Users,
  BarChart,
  Calculator,
  FolderKanban,
  PlayCircle,
  TrendingUp,
  Award,
  BookOpen,
  FileBarChart,
  Settings
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
  // Full Admin Navigation Items
  const adminNavItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Initial Screening", icon: Filter, path: "/initial-screening" },
    { label: "Review Management", icon: CheckSquare, path: "/review-management" },
    { label: "Decision Committee", icon: Users, path: "/decision-committee" },
    { label: "Business Analysis", icon: BarChart, path: "/business-analysis" },
    { label: "Estimation", icon: Calculator, path: "/estimation" },
    { label: "Projects", icon: FolderKanban, path: "/projects" },
    { label: "Execution", icon: PlayCircle, path: "/execution" },
    { label: "Progress Tracking", icon: TrendingUp, path: "/progress-tracking" },
    { label: "Benefits Tracking", icon: Award, path: "/benefits-tracking" },
    { label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    { label: "Reports", icon: FileBarChart, path: "/reports" },
    { label: "Settings", icon: Settings, path: "/settings" }
  ];

  // Clean User Navigation Items (Innovators/Employees)
  const userNavItems = [
    { label: "Dashboard (My Ideas)", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
    { label: "Settings", icon: Settings, path: "/settings" }
  ];

  const currentNavItems = userRole === "Administrator" ? adminNavItems : userNavItems;

  return (
    <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img src={imsLogo} alt="IMS Group" className="sidebar-brand-logo" />
          <div className="brand-text-col">
            <span className="brand-text">Idea360</span>
            <span className="brand-subtext">
              {userRole === "Administrator" ? "Admin Portal" : "Employee Portal"}
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
