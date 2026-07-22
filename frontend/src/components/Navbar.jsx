import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, ChevronDown, User, Settings, LogOut, RefreshCw } from "lucide-react";
import imsLogo from "../assets/ims-logo.jpg";
import { getLoginHistory, switchAccount } from "../utils/authHistory";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "Ayushman", role: "Administrator", email: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setRecentAccounts(getLoginHistory());

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

  const handleSwitch = (acc) => {
    setDropdownOpen(false);
    switchAccount(acc, navigate);
  };

  const userInitial = user.username
    ? user.username.trim().charAt(0).toUpperCase()
    : "U";

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
            <div className="profile-menu-popover" style={{ width: "260px" }}>
              <div className="popover-header">
                <span className="user-name" style={{ display: "block" }}>{user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>

              <button className="popover-item" onClick={() => { setDropdownOpen(false); navigate("/settings"); }}>
                <User size={16} />
                <span>My Profile</span>
              </button>

              <button className="popover-item" onClick={() => { setDropdownOpen(false); navigate("/settings"); }}>
                <Settings size={16} />
                <span>Account Settings</span>
              </button>

              {/* Recent Accounts History Switcher (Placed directly above Sign Out) */}
              {recentAccounts.length > 0 && (
                <div style={{ padding: "8px", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)", margin: "4px 0" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "6px"
                    }}
                  >
                    <RefreshCw size={11} /> Switch Account (Last 3 Logins)
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {recentAccounts.map((acc, index) => {
                      const isCurrent = acc.email && acc.email.toLowerCase() === user.email.toLowerCase();
                      const init = acc.username ? acc.username.trim().charAt(0).toUpperCase() : "U";

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSwitch(acc)}
                          disabled={isCurrent}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 8px",
                            background: isCurrent ? "var(--primary-light)" : "#f8fafc",
                            border: isCurrent ? "1px solid var(--primary-subtle)" : "1px solid var(--border-color)",
                            borderRadius: "var(--radius-sm)",
                            cursor: isCurrent ? "default" : "pointer",
                            textAlign: "left"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                background: "var(--primary)",
                                color: "#fff",
                                fontSize: "10px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              {init}
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: isCurrent ? "700" : "500", color: "var(--text-dark)" }}>
                              {acc.username} {isCurrent ? "(Active)" : ""}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: "700",
                              padding: "1px 5px",
                              borderRadius: "6px",
                              background: acc.role === "Administrator" ? "#e0e7ff" : "#dcfce7",
                              color: acc.role === "Administrator" ? "#4338ca" : "#15803d"
                            }}
                          >
                            {acc.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
