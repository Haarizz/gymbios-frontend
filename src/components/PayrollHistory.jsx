// src/components/PayrollHistory.jsx
import React, { useEffect, useState } from "react";
import { getPayrollHistory } from "../api/payroll";
import toast from "react-hot-toast";
import { EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; // Icons for View and Download

// Helper function to render Status Badge based on value
const StatusBadge = ({ status }) => {
  let classes = "px-2.5 py-0.5 text-xs font-medium rounded-full";
  if (status === 'Draft') {
    classes += " bg-yellow-100 text-yellow-800";
  } else if (status === 'Disbursed') {
    classes += " bg-green-100 text-green-800";
  } else {
    classes += " bg-gray-100 text-gray-800"; // Default
  }
  return <span className={classes}>{status}</span>;
};


export default function PayrollHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    setLoading(true);
    getPayrollHistory()
      .then(res => setHistory(res.data))
      .catch(err => toast.error("Failed to load payroll history"))
      .finally(() => setLoading(false));
  };

  useEffect(loadHistory, []);

  // Action handlers (placeholders for now)
  const handleView = (id) => {
    toast(`Viewing payroll cycle ID: ${id}`);
    // Navigation logic to view detail page goes here
  };

  const handleDownload = (id) => {
    toast(`Downloading report for payroll cycle ID: ${id}`);
    // API call to download report goes here
  };

  if (loading) return <div className="text-center py-10 text-gray-600">Loading payroll history...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Payroll History</h2>
      <p className="text-gray-600 mb-6">View all past payroll cycles and their status.</p>

      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-500 border rounded-lg bg-gray-50">
          No payroll history records found.
        </div>
      ) : (
        // --- Payroll History Table ---
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disbursed</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map(h => (
                <tr key={h.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{h.month} {h.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.employeesCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">AED {h.totalAmount} </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">0</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 text-right font-semibold">AED {h.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={h.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.createdAt?.split("T")[0]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.disbursedDate || '-'}</td>
                  
                  {/* Actions Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleView(h.id)}
                      title="View Details"
                      className="text-teal-600 hover:text-teal-900 p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(h.id)}
                      title="Download Report"
                      className="text-blue-600 hover:text-blue-900 p-1 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}