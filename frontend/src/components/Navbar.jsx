import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, ChevronDown, User, Settings, LogOut, History, RefreshCw, ShieldCheck, Briefcase, FileCheck, FolderKanban, Lightbulb } from "lucide-react";
import imsLogo from "../assets/ims-logo.jpg";
import { getLoginHistory, switchAccount } from "../utils/authHistory";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "Ayushman", role: "Administrator", email: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const dropdownRef = useRef(null);

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

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        <div className="nav-search-box">
          <Search size={16} className="nav-search-icon" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search ideas, projects, users..."
          />
        </div>
      </div>

      <div className="navbar-right">
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
            <div className="profile-menu-popover" style={{ width: "310px", padding: "12px" }}>
              <div className="popover-header" style={{ marginBottom: "10px" }}>
                <span className="user-name" style={{ display: "block" }}>{user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>

              {/* 5 ROLES QUICK SWITCHER WIDGET */}
              <div style={{ borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", padding: "10px 0", margin: "10px 0", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "8px", padding: "0 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <History size={13} color="var(--primary)" /> 5 Roles Quick Switcher
                  </span>
                  <span style={{ fontSize: "10px", background: "#e0e7ff", color: "#4f46e5", padding: "1px 6px", borderRadius: "8px" }}>Dev Mode</span>
                </div>

                <div style={{ padding: "0 10px" }}>
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
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          marginBottom: "5px",
                          background: isActive ? "#e0e7ff" : "#ffffff",
                          border: isActive ? "1.5px solid #6366f1" : "1px solid #cbd5e1"
                        }}
                        title={`Quick Switch to ${acc.role}`}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <RoleIcon size={14} color={isActive ? "#4f46e5" : "#64748b"} />
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#1e293b" }}>{acc.role}</span>
                            <span style={{ fontSize: "10px", color: "#64748b" }}>{acc.email}</span>
                          </div>
                        </div>
                        {isActive ? (
                          <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: "800", background: "#dcfce7", padding: "2px 6px", borderRadius: "6px" }}>Active</span>
                        ) : (
                          <span style={{ fontSize: "10px", color: "#6366f1", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "2px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "6px" }}>
                            <RefreshCw size={10} /> Switch
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className="popover-item" onClick={() => { setDropdownOpen(false); navigate("/settings"); }}>
                <User size={16} />
                <span>My Profile</span>
              </button>

              <button className="popover-item" onClick={() => { setDropdownOpen(false); navigate("/settings"); }}>
                <Settings size={16} />
                <span>Account Settings</span>
              </button>

              <button className="popover-item danger-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
