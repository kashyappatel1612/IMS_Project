import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className={`app-main-wrapper ${!sidebarOpen ? "sidebar-collapsed" : ""}`}>
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="app-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
