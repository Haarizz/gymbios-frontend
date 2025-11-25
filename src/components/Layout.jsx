import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar fixed on the left */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="ml-64 w-full p-6">
        {children}
      </div>
    </div>
  );
}
