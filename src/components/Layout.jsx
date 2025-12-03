import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState, createContext, useContext } from 'react';

// Create a context to manage sidebar state
const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export default function Layout() {
  // State to keep track of which sections are expanded
  const [expandedSections, setExpandedSections] = useState({});
  const location = useLocation();

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  return (
    // Provide the state and toggle function to the Sidebar component
    <SidebarContext.Provider value={{ expandedSections, toggleSection, currentPath: location.pathname }}>
      <div className="layout-container" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div style={{ flexGrow: 1, overflowY: "auto", backgroundColor: "#f3f4f6" }}> 
          <Outlet />
        </div>
      </div>
    </SidebarContext.Provider>
  );
}