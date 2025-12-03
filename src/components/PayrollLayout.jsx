// src/pages/payroll/PayrollLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FolderIcon, ClockIcon, DocumentTextIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function PayrollLayout() {
  const tabs = [
    { to: "", label: "Dashboard", icon: FolderIcon, end: true },
    { to: "review", label: "Review Payroll", icon: ClockIcon },
    { to: "history", label: "Payroll History", icon: DocumentTextIcon },
    { to: "reports", label: "Reports", icon: TruckIcon },
  ];

  return (
    <div className="bg-white min-h-[90vh] shadow-sm rounded-lg">
      
      {/* --- Header Section (Always Visible) --- */}
      <header className="px-6 pt-6 pb-2 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
        <p className="text-sm text-gray-500 mt-1">Automated salary processing based on attendance, shifts, and leave records.</p>
      </header>

      {/* --- Tab Navigation --- */}
      <nav className="px-6 border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => 
                `flex items-center py-2 px-4 font-medium transition-all duration-150 rounded-t-lg ${
                  isActive
                    ? "border-b-2 border-teal-600 text-teal-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              <Icon className="w-5 h-5 mr-1" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* --- Main Content Area (Outlet for Dashboard, Review, etc.) --- */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}