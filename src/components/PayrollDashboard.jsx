import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData, getPayrollHistory } from "../api/payroll";
import { Eye, Clock, CheckCircle2, FileCheck } from "lucide-react";

const PayrollDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingPayrolls: 0,
    approvedPayrolls: 0,
    disbursedPayrolls: 0,
    recentCycles: []
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadDashboard();
    loadHistory();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getDashboardData();
      setStats(res);
    } catch (e) {
      console.error("Dashboard load failed", e);
    }
  };

  const loadHistory = async () => {
  try {
    const res = await getPayrollHistory();

    // CASE 1: Backend returns { data: [...] }
    if (Array.isArray(res.data)) {
      setHistory(res.data);
      return;
    }

    // CASE 2: Backend returns { content: [...] }
    if (res.data?.content) {
      setHistory(res.data.content);
      return;
    }

    // CASE 3: Backend returns single object
    if (typeof res.data === "object") {
      setHistory([res.data]);
      return;
    }

    setHistory([]);

  } catch (err) {
    console.error("Failed to load payroll history", err);
  }
};


  return (
    <div className="p-6">

      <h2 className="text-2xl font-semibold mb-2">Payroll Management</h2>
      <p className="text-gray-600 mb-6">
        Automated salary processing based on attendance, shifts, and leave records.
      </p>

      {/* ===================== */}
      {/* TOP STATS CARDS      */}
      {/* ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-white shadow-sm p-5 rounded-xl">
          <p className="text-gray-500 mb-1">Total Employees</p>
          <h3 className="text-3xl font-bold">{stats.totalEmployees}</h3>
        </div>

        <div className="bg-white shadow-sm p-5 rounded-xl">
          <p className="text-gray-500 mb-1">Pending Payrolls</p>
          <h3 className="text-3xl font-bold text-orange-600">{stats.pendingPayrolls}</h3>
        </div>

        <div className="bg-white shadow-sm p-5 rounded-xl">
          <p className="text-gray-500 mb-1">Approved Payrolls</p>
          <h3 className="text-3xl font-bold text-blue-600">{stats.approvedPayrolls}</h3>
        </div>

        <div className="bg-white shadow-sm p-5 rounded-xl">
          <p className="text-gray-500 mb-1">Disbursed Payrolls</p>
          <h3 className="text-3xl font-bold text-green-600">{stats.disbursedPayrolls}</h3>
        </div>

      </div>

      {/* ===================== */}
      {/* RECENT PAYROLL CYCLES */}
      {/* ===================== */}
      <div className="bg-white p-5 rounded-xl shadow-sm mb-8">
        <h3 className="text-xl font-semibold mb-4">Recent Payroll Cycles</h3>

        {stats.recentCycles.length === 0 ? (
          <p className="text-gray-500">No recent payroll cycles found.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentCycles.map((c) => (
              <div
                key={c.id}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <h4 className="text-lg font-medium">
                    {c.month} {c.year}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {c.employeesCount} employees • {c.totalAmountFormatted}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/payroll/review/${c.id}`)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <Eye size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================== */}
      {/* FULL PAYROLL HISTORY TABLE */}
      {/* ========================== */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Payroll History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-3">Period</th>
                <th className="p-3">Employees</th>
                <th className="p-3">Gross Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500">
                    No payroll history available.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-3">
                      {row.month} {row.year}
                    </td>
                    <td className="p-3">{row.employeesCount}</td>
                    <td className="p-3">AED {row.totalAmount}</td>

                    <td className="p-3">
                      {row.status === "PENDING" && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
                          Pending
                        </span>
                      )}
                      {row.status === "APPROVED" && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                          Approved
                        </span>
                      )}
                      {row.status === "DISBURSED" && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                          Disbursed
                        </span>
                      )}
                    </td>

                    <td className="p-3">{row.createdAt?.substring(0, 10)}</td>

                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/payroll/review/${row.id}`)}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PayrollDashboard;
