import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  DocumentChartBarIcon, // Replaces DocumentReportIcon
  ArrowPathIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline"; 

export default function ReportsLayout() {
  const location = useLocation();
  const isSalesOrPurchase =
    location.pathname.includes("sales") ||
    location.pathname.includes("purchase");

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Comprehensive business intelligence and performance metrics.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-sm font-medium shadow-sm transition-all">
            <DocumentChartBarIcon className="h-5 w-5 mr-2" />
            Custom Reports
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-all">
            <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-500" />
            Refresh Data
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-all">
            <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
            Custom Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 text-sm font-medium shadow-sm transition-all">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
        {["Overview", "Membership", "Revenue", "Operations"].map((tab) => (
          <button
            key={tab}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors whitespace-nowrap"
          >
            {tab}
          </button>
        ))}
        
        {/* Active Tab for Sales/Purchase */}
        <NavLink
          to="sales"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              isActive || isSalesOrPurchase
                ? "border-b-2 border-teal-600 text-teal-800"
                : "text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            }`
          }
        >
          Sales & Purchase
        </NavLink>
        
        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors whitespace-nowrap">
          Custom Reports
        </button>
      </div>

      {/* Sub-navigation for Sales/Purchase context */}
      {isSalesOrPurchase && (
        <div className="flex gap-4 mb-6">
          <NavLink
            to="sales"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal-50 text-teal-700 border border-teal-100"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            Sales Reports
          </NavLink>
          <NavLink
            to="purchase"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal-50 text-teal-700 border border-teal-100"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            Purchase Reports
          </NavLink>
        </div>
      )}

      <Outlet />
    </div>
  );
}