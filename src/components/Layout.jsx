import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="layout-container" style={{ display: "flex", height: "100vh" }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, overflowY: "auto", padding: "20px" }}>
        
        {/* This renders Dashboard, BookingsList, Members, etc */}
        <Outlet />
      </div>

    </div>
  );
}
