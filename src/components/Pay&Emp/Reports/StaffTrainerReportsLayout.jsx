import { NavLink, Outlet } from "react-router-dom";

export default function StaffTrainerReportsLayout() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Payroll Reports
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Generate payroll, staff, and trainer performance reports.
      </p>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <NavLink
          to="staff"
          className={({ isActive }) =>
            `pb-2 text-sm font-medium ${
              isActive
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          Staff Reports
        </NavLink>

        <NavLink
          to="trainer"
          className={({ isActive }) =>
            `pb-2 text-sm font-medium ${
              isActive
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-gray-500 hover:text-gray-700"
            }`
          }
        >
          Trainer Reports
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
}