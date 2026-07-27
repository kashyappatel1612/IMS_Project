import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Menu, ChevronDown, User, Settings, LogOut } from "lucide-react";
import imsLogo from "../assets/ims-logo.jpg";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "Ayushman", role: "Administrator", email: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
