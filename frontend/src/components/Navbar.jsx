import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  History,
  RefreshCw,
  ShieldCheck,
  Briefcase,
  FileCheck,
  FolderKanban,
  Lightbulb,
  X,
  ArrowRight,
  Compass,
  BarChart,
  Calculator,
  PlayCircle,
  TrendingUp,
  Award,
  BookOpen,
  LayoutDashboard,
  Filter,
  UserCheck,
  Bell
} from "lucide-react";
import imsLogo from "../assets/ims-logo.jpg";
import { getLoginHistory, switchAccount } from "../utils/authHistory";
import { getSubmittedIdeas } from "../utils/ideaStorage";
import { getUnreadCount } from "../utils/notificationStorage";

const NAV_PAGES = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Submit New Idea", path: "/submit-idea", icon: Lightbulb },
  { title: "Initial Screening Panel", path: "/initial-screening", icon: Filter },
  { title: "Feasibility Review Panel", path: "/feasibility-review", icon: FileCheck },
  { title: "Business Analysis Hub", path: "/business-analysis", icon: BarChart },
  { title: "Estimation & Budget", path: "/estimation", icon: Calculator },
  { title: "Projects Workspace", path: "/projects", icon: FolderKanban },
  { title: "Project Execution", path: "/execution", icon: PlayCircle },
  { title: "Progress Tracking", path: "/progress-tracking", icon: TrendingUp },
  { title: "Quality Assurance", path: "/quality-assurance", icon: ShieldCheck },
  { title: "Knowledge Base & Policies", path: "/knowledge-base", icon: BookOpen },
  { title: "Settings & Profile", path: "/settings", icon: Settings },
];

const KNOWLEDGE_ARTICLES = [
  { title: "How to Quantify Business Benefits & ROI", path: "/knowledge-base" },
  { title: "Writing a Winning Innovation Problem Statement", path: "/knowledge-base" },
  { title: "Understanding the 6-Stage Gate Evaluation Process", path: "/knowledge-base" },
  { title: "Intellectual Property (IP) & Innovation Rewards Policy", path: "/knowledge-base" },
  { title: "Business Feasibility & Market Validation Guidelines", path: "/knowledge-base" },
  { title: "Sprint Handoff & Agile Project Execution", path: "/knowledge-base" },
  { title: "Reviewer Stage-1 Initial Screening Rubric", path: "/knowledge-base" }
];

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "Ayushman", role: "Administrator", email: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const dropdownRef = useRef(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allIdeas, setAllIdeas] = useState([]);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.username) {
          setUser({
            username: parsed.username,
            email: parsed.email || "",
            role: parsed.role || "Administrator"
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    setLoginHistory(getLoginHistory());
    setAllIdeas(getSubmittedIdeas());

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (targetPath) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(targetPath);
  };

  // Search Filtering Logic
  const q = searchQuery.toLowerCase().trim();
  const matchedIdeas = q
    ? allIdeas.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.problemStatement && i.problemStatement.toLowerCase().includes(q)) ||
          (i.author && i.author.toLowerCase().includes(q)) ||
          (i.status && i.status.toLowerCase().includes(q))
      )
    : [];

  const matchedPages = q ? NAV_PAGES.filter((p) => p.title.toLowerCase().includes(q)) : [];
  const matchedArticles = q ? KNOWLEDGE_ARTICLES.filter((a) => a.title.toLowerCase().includes(q)) : [];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleQuickSwitchAccount = (account) => {
    setDropdownOpen(false);
    switchAccount(account, navigate);
  };

  const userInitial = user.username
    ? user.username.trim().charAt(0).toUpperCase()
    : "U";

  // Helper for role icons
  const getRoleIcon = (roleName) => {
    if (roleName === "Project Coordinator") return UserCheck;
    if (roleName === "Administrator") return ShieldCheck;
    if (roleName === "Business Analyst") return Briefcase;
    if (roleName === "Reviewer") return FileCheck;
    if (roleName === "Project Manager") return FolderKanban;
    return Lightbulb;
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button className="nav-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={20} />
        </button>

        <div className="nav-brand-flex">
          <img src={imsLogo} alt="IMS Group" className="nav-brand-logo" />
        </div>

        <div className="nav-search-box" ref={searchContainerRef}>
          <Search size={16} className="nav-search-icon" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search ideas, projects, policies, pages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              style={{
                position: "absolute",
                right: "12px",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center"
              }}
            >
              <X size={14} />
            </button>
          )}

          {/* LIVE SEARCH RESULTS POPOVER */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "46px",
                left: 0,
                width: "480px",
                maxHeight: "420px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                boxShadow: "0 20px 30px -6px rgba(15, 23, 42, 0.18)",
                overflowY: "auto",
                zIndex: 200,
                padding: "12px"
              }}
            >
              {/* Category 1: Proposals & Ideas */}
              {matchedIdeas.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Lightbulb size={13} color="#6366f1" /> Proposals & Projects ({matchedIdeas.length})
                  </div>
                  {matchedIdeas.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleResultClick("/dashboard")}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#f8fafc",
                        marginBottom: "4px",
                        transition: "background 0.15s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e7ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{item.title}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>Category: {item.category} • Author: {item.author || "User"}</div>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          background: item.status.includes("Approved") || item.status.includes("Passed") ? "#dcfce7" : "#fef3c7",
                          color: item.status.includes("Approved") || item.status.includes("Passed") ? "#166534" : "#b45309",
                          padding: "2px 8px",
                          borderRadius: "10px"
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Category 2: App Pages Quick Jump */}
              {matchedPages.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Compass size={13} color="#2563eb" /> Page Navigation ({matchedPages.length})
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {matchedPages.map((pg, idx) => {
                      const PgIcon = pg.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleResultClick(pg.path)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#f1f5f9",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#1e293b"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#dbeafe")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                        >
                          <PgIcon size={14} color="#3b82f6" />
                          <span>{pg.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category 3: Knowledge Base Articles */}
              {matchedArticles.length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <BookOpen size={13} color="#059669" /> Knowledge Base Guides ({matchedArticles.length})
                  </div>
                  {matchedArticles.map((art, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleResultClick(art.path)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#f8fafc",
                        marginBottom: "4px"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#dcfce7")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    >
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#065f46" }}>{art.title}</div>
                      <ArrowRight size={12} color="#059669" />
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {matchedIdeas.length === 0 && matchedPages.length === 0 && matchedArticles.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px" }}>
                  No matching proposals, projects, or guides found for <strong>"{searchQuery}"</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Real-time Notifications Bell Badge Button */}
        <div
          onClick={() => navigate("/notifications")}
          style={{
            position: "relative",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
          title="Notification Center"
        >
          <Bell size={18} color="#475569" />
          {getUnreadCount(user.role, user.email) > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-2px",
                right: "-2px",
                background: "#dc2626",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "800",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {getUnreadCount(user.role, user.email)}
            </span>
          )}
        </div>

        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
          <div
            className="user-profile-pill"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-initial-badge" title={user.username}>
              {userInitial}
            </div>

            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <ChevronDown size={14} color="#64748b" style={{ marginLeft: "4px" }} />
          </div>

          {dropdownOpen && (
            <div className="profile-menu-popover" style={{ width: "290px", padding: "10px" }}>
              <div className="popover-header" style={{ marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px solid #f1f5f9" }}>
                <span className="user-name" style={{ display: "block", fontWeight: "800", fontSize: "14px", color: "#1e293b" }}>{user.username}</span>
                <span className="user-role" style={{ fontSize: "11px", color: "#6366f1", fontWeight: "700" }}>{user.role}</span>
              </div>

              {/* COMPACT 2-COLUMN 6 ROLES QUICK SWITCHER */}
              <div style={{ borderBottom: "1px solid #f1f5f9", padding: "6px 0", marginBottom: "6px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px", padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <History size={11} color="var(--primary)" /> Role Switcher
                  </span>
                  <span style={{ fontSize: "9px", background: "#e0e7ff", color: "#4f46e5", padding: "1px 5px", borderRadius: "6px", fontWeight: "800" }}>Dev Mode</span>
                </div>

                <div style={{ padding: "0 6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                  {loginHistory.map((acc, idx) => {
                    const isActive = acc.role === user.role;
                    const RoleIcon = getRoleIcon(acc.role);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleQuickSwitchAccount(acc)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 6px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          background: isActive ? "#e0e7ff" : "#ffffff",
                          border: isActive ? "1.5px solid #6366f1" : "1px solid #cbd5e1"
                        }}
                        title={`Quick Switch to ${acc.role}`}
                      >
                        <RoleIcon size={12} color={isActive ? "#4f46e5" : "#64748b"} />
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {acc.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className="popover-item" onClick={() => { setDropdownOpen(false); navigate("/settings"); }}>
                <User size={15} />
                <span>My Profile</span>
              </button>

              <button className="popover-item" onClick={() => { setDropdownOpen(false); navigate("/settings"); }}>
                <Settings size={15} />
                <span>Account Settings</span>
              </button>

              <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "6px", paddingTop: "6px" }}>
                <button
                  className="popover-item danger-item"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#dc2626",
                    background: "#fee2e2",
                    padding: "7px 10px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                    border: "1px solid #fecaca"
                  }}
                >
                  <LogOut size={15} color="#dc2626" />
                  <span>Log Out / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
