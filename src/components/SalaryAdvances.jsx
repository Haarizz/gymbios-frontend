// src/pages/SalaryAdvancesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axiosConfig";
import * as advApi from "../api/salaryAdvancesApi"; 
import { HiSearch, HiOutlineDocumentAdd } from "react-icons/hi";
import { FiEye, FiCheckCircle, FiTrash2, FiClock, FiFileText } from "react-icons/fi";

/**
 * SalaryAdvancesPage.jsx
 * - Full front-end for Salary Advances interacting with:
 * GET /api/salary/employees
 * GET /api/salary/advances
 * POST /api/salary/advances
 * POST /api/salary/advances/{id}/approve   (attempted; falls back gracefully)
 *
 * Behavior:
 * - Employee list is loaded from /api/salary/employees (staff page data).
 * - Create modal posts to /api/salary/advances.
 * - Approve modal posts to /api/salary/advances/{id}/approve (or falls back).
 *
 * This file is intentionally defensive so it still functions if backend endpoints are missing.
 */

/* ---------- Helpers ---------- */
const safeNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function StatusPill({ status }) {
  const map = {
    Active: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "Pending Approval": "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
    Completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function KPI({ title, value, subtitle, icon: Icon = null }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
      {Icon && <Icon className="w-6 h-6 text-gray-300" />}
    </div>
  );
}

function ReportCard({ title, buttonText, children, icon: Icon }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className="w-5 h-5 text-emerald-700" />}
          <h5 className="font-semibold text-gray-700">{title}</h5>
        </div>
        <div className="space-y-2">
          {children}
        </div>
      </div>
      <div className="mt-4 border-t pt-3 flex justify-end">
        <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
          Download Report
        </button>
      </div>
    </div>
  );
}


/* ---------- Create Advance Modal ---------- */
function CreateAdvanceModal({ isOpen, onClose, employees, onCreated }) {
  const [employeeId, setEmployeeId] = useState("");
  const [reqDate, setReqDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("Salary Advance");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReqDate(new Date().toISOString().slice(0, 10));
      setEmployeeId(employees.length ? employees[0].employeeId || employees[0].id : "");
      setType("Salary Advance");
      setAmount("");
      setRemarks("");
      document.body.style.overflow = "hidden";
    }
    return () => (document.body.style.overflow = "");
  }, [isOpen, employees]);

  const selectedEmployee = employees.find((e) => (e.employeeId || e.id) === employeeId) || null;

  async function handleCreate(e) {
    e.preventDefault();
    if (!employeeId) return alert("Please select an employee.");
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount (> 0).");

    setSubmitting(true);
    try {
      const payload = {
        employeeId,
        employeeName: selectedEmployee ? (selectedEmployee.name || `${selectedEmployee.firstname || ""} ${selectedEmployee.lastname || ""}`.trim()) : "",
        requestedAmount: Number(amount),
        type,
        reqDate,
        remarks,
        status: "Pending Approval",
        dept: selectedEmployee?.department || selectedEmployee?.dept || "",
      };

      // Use helper which calls /api/salary/advances
      const res = await advApi.createAdvance(payload).catch((err) => {
        // fallback: try direct api.post and return created object
        console.warn("advApi.createAdvance failed, trying direct post fallback", err);
        return api.post("/api/salary/advances", payload).then((r) => r);
      });

      const created = res?.data ?? res; // helper returns .data already, but safe
      onCreated(created);
      onClose();
    } catch (err) {
      console.error("Create advance failed:", err);
      alert("Failed to create advance. See console for details.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={handleCreate} className="bg-white rounded-lg w-full max-w-xl p-6 border shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">New Advance Request</h3>
            <div className="text-xs text-gray-500">Create a salary advance or loan request</div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Employee *</label>
            <select required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="w-full border p-2 rounded">
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id || emp.employeeId} value={emp.employeeId || emp.id}>
                  {emp.name || `${emp.firstname || ""} ${emp.lastname || ""}`.trim()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Employee ID</label>
            <input readOnly value={employeeId} className="w-full border p-2 rounded bg-gray-50 text-sm" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Advance Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border p-2 rounded">
              <option>Salary Advance</option>
              <option>Loan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Request Date *</label>
            <input type="date" value={reqDate} onChange={(e) => setReqDate(e.target.value)} className="w-full border p-2 rounded" required />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Requested Amount (AED) *</label>
            <input required type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Remarks / Justification</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full border p-2 rounded h-20" placeholder="Reason for request..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 border-t pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button type="submit" disabled={submitting} className={`px-4 py-2 rounded text-white ${submitting ? "bg-gray-400" : "bg-emerald-700"}`}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Approve Modal ---------- */
function ApproveAdvanceModal({ advance, isOpen, onClose, onApproved }) {
  const [decision, setDecision] = useState("Approve");
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [deductionMode, setDeductionMode] = useState("Monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [autoDeduct, setAutoDeduct] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (advance) {
      const req = safeNumber(advance.requestedAmount || advance.requested || advance.requestedAmount);
      setApprovedAmount(advance.approved ?? req);
      setInstallments(advance.installmentCount ?? Math.max(1, Math.round((advance.approved || req) / 500) || 1));
      const inst = advance.installmentAmount ?? Math.round((advance.approved || req) / (advance.installmentCount || 1) || req);
      setInstallmentAmount(inst || Math.round((approvedAmount || req) / Math.max(1, installments)));
      setDeductionMode(advance.deductionMode || "Monthly");
      setStartDate(new Date().toISOString().slice(0, 10));
      setAutoDeduct(true);
      setNotes("");
    }
  }, [advance]);

  if (!isOpen || !advance) return null;

  const approved = safeNumber(approvedAmount);
  const instCount = Math.max(1, Number(installments) || 1);
  const instAmt = safeNumber(installmentAmount) || Math.round(approved / instCount);

  async function handleApprove(e) {
    e.preventDefault();
    if (decision !== "Approve") {
      // handle reject
      const updated = { ...advance, status: "Rejected", approved: 0, approvedOn: new Date().toISOString(), notes };
      onApproved(updated);
      onClose();
      return;
    }
    if (approved <= 0) return alert("Approved amount must be greater than zero.");

    setSubmitting(true);
    try {
      // Prepare approval payload
      const payload = {
        decision,
        approvedAmount: approved,
        installmentCount: instCount,
        installmentAmount: instAmt,
        deductionMode,
        startDate,
        autoDeduct,
        notes,
        approvedOn: new Date().toISOString(),
        status: "Active",
      };

      // Try endpoint: POST /api/salary/advances/{id}/approve
      try {
        await api.post(`/api/salary/advances/${advance.id}/approve`, payload);
      } catch (err) {
        // Fallback: try PUT update if approve endpoint not present
        try {
          await api.put(`/api/salary/advances/${advance.id}`, { ...advance, approved: approved, paid: advance.paid || 0, status: "Active", approvedOn: payload.approvedOn });
        } catch (err2) {
          console.warn("Approve endpoints failed, will update locally only", err2);
        }
      }

      // update frontend state by callback
      const updatedAdvance = {
        ...advance,
        status: "Active",
        approved: approved,
        installmentCount: instCount,
        installmentAmount: instAmt,
        deductionMode,
        approvedOn: payload.approvedOn,
        autoDeduct,
        notes,
      };
      onApproved(updatedAdvance);
      onClose();
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Failed to approve request. See console.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-70 bg-black/50 flex items-center justify-center p-6 overflow-auto">
      <form onSubmit={handleApprove} className="bg-white rounded-lg w-full max-w-2xl p-6 border shadow-2xl">
        <div className="flex justify-between items-start mb-4 border-b pb-2">
          <div>
            <h3 className="text-lg font-semibold">{advance.employeeName || advance.employeeId} - Approve Advance</h3>
            <div className="text-xs text-gray-500">{advance.type || "Salary Advance"}</div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-500">Requested Amount</div>
            <div className="text-lg font-semibold">AED {safeNumber(advance.requestedAmount).toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Request Date: {advance.reqDate ? new Date(advance.reqDate).toLocaleDateString() : "-"}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-500">Already Paid</div>
            <div className="text-lg font-semibold text-emerald-600">AED {safeNumber(advance.paid).toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">Status: <span className="font-medium">{advance.status}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500">Decision *</label>
            <select value={decision} onChange={(e) => setDecision(e.target.value)} className="w-full border p-2 rounded">
              <option>Approve</option>
              <option>Reject</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500">Approved Amount (AED) *</label>
            <input type="number" step="0.01" value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-xs text-gray-500">Installment Count *</label>
            <input type="number" value={installments} onChange={(e) => setInstallments(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-xs text-gray-500">Installment Amount</label>
            <input type="number" value={installmentAmount || instAmt} onChange={(e) => setInstallmentAmount(e.target.value)} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="block text-xs text-gray-500">Deduction Mode</label>
            <select value={deductionMode} onChange={(e) => setDeductionMode(e.target.value)} className="w-full border p-2 rounded">
              <option>Monthly</option>
              <option>Bi-weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={autoDeduct} onChange={(e) => setAutoDeduct(e.target.checked)} />
            <span className="text-sm">Auto Deduct from Payroll</span>
          </label>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Approval Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border p-2 rounded h-20" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <button type="button" onClick={onClose} className="px-3 py-2 border rounded text-sm">Cancel</button>
          <button type="submit" disabled={submitting} className={`px-4 py-2 bg-emerald-700 text-white rounded text-sm ${submitting ? "opacity-60" : ""}`}>
            {submitting ? "Processing..." : "Approve Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- NEW COMPONENT: RepaymentSchedule ---
function RepaymentSchedule({ advances }) {
  const activeAdvances = advances.filter(a => a.status === 'Active');
  
  if (activeAdvances.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border text-center text-gray-500">
        <FiClock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        No active advances currently being repaid.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <h4 className="p-4 text-sm font-medium text-gray-700">Active Repayment Schedules</h4>
      <div className="divide-y divide-gray-100">
        {activeAdvances.map((a) => {
          const approved = safeNumber(a.approved);
          const paid = safeNumber(a.paid);
          const outstanding = Math.max(0, approved - paid);
          const installmentsRemaining = a.installmentCount - (paid / (a.installmentAmount || 1));
          const progress = approved > 0 ? Math.min(100, (paid / approved) * 100) : 0;
          
          // Placeholder for Next Deduction logic
          const nextDeductionDate = new Date();
          nextDeductionDate.setMonth(nextDeductionDate.getMonth() + 1);
          const nextDeductionAmount = a.installmentAmount || 1000;

          return (
            <div key={a.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{a.employeeName}</div>
                  <div className="text-xs text-gray-500">{a.employeeId} • {a.dept} • {a.type || 'Salary Advance'}</div>
                </div>
                <StatusPill status="Active" />
              </div>

              <div className="mb-2">
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Repayment Progress</span>
                  <span className="font-medium text-emerald-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-emerald-600 h-1.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4 text-xs mt-3">
                <div className="space-y-1">
                  <div className="text-gray-500">Total Amount</div>
                  <div className="font-medium">AED {approved.toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Installment Amount</div>
                  <div className="font-medium">AED {safeNumber(a.installmentAmount).toLocaleString() || "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Deduction Mode</div>
                  <div className="font-medium">{a.deductionMode || "Monthly"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Remaining Installments</div>
                  <div className="font-medium">{Math.ceil(installmentsRemaining)} of {a.installmentCount}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-500">Outstanding</div>
                  <div className="font-medium text-red-600">AED {outstanding.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs text-blue-800 font-semibold">Next Deduction</div>
                <div className="flex justify-between text-sm mt-1">
                  <span>{nextDeductionDate.toLocaleDateString('en-GB', { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span><strong>AED {nextDeductionAmount.toLocaleString()}</strong> (Auto-deducted)</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- NEW COMPONENT: Reports ---
function Reports({ advances }) {
  const reportData = useMemo(() => {
    const all = advances.map(a => ({
      ...a,
      approvedAmt: safeNumber(a.approved),
      paidAmt: safeNumber(a.paid),
      outstanding: Math.max(0, safeNumber(a.approved) - safeNumber(a.paid)),
    }));
    
    const totalRequests = all.length;
    const totalApproved = all.filter(a => a.status !== 'Pending Approval' && a.status !== 'Rejected').length;
    const totalAmountDisbursed = all.reduce((sum, a) => sum + a.approvedAmt, 0);
    const activeDeductions = all.filter(a => a.status === 'Active').length;
    const totalOutstandingBalance = all.reduce((sum, a) => sum + a.outstanding, 0);
    const completedAdvances = all.filter(a => a.status === 'Completed').length;
    
    // Aggregate by Department
    const deptDistribution = all.reduce((acc, a) => {
      const dept = a.dept || 'N/A';
      acc[dept] = acc[dept] || { totalRequests: 0, approved: 0, active: 0, totalAmount: 0, outstanding: 0 };
      
      acc[dept].totalRequests += 1;
      
      if (a.status !== 'Pending Approval' && a.status !== 'Rejected') {
        acc[dept].approved += 1;
        acc[dept].totalAmount += a.approvedAmt;
        acc[dept].outstanding += a.outstanding;
        if (a.status === 'Active') {
          acc[dept].active += 1;
        }
      }
      return acc;
    }, {});

    return { totalRequests, totalApproved, totalAmountDisbursed, activeDeductions, totalOutstandingBalance, completedAdvances, deptDistribution };
  }, [advances]);
  
  const avgDeductionPerMonth = 1000; // Placeholder value

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Advance Summary Report */}
        <ReportCard title="Advance Summary Report" icon={FiFileText}>
          <div className="flex justify-between text-sm"><span>Total Requests</span> <strong>{reportData.totalRequests}</strong></div>
          <div className="flex justify-between text-sm"><span>Total Approved</span> <strong>{reportData.totalApproved}</strong></div>
          <div className="flex justify-between text-sm"><span>Total Amount Disbursed</span> <strong className="text-emerald-600">AED {reportData.totalAmountDisbursed.toLocaleString()}</strong></div>
        </ReportCard>
        
        {/* Deduction Audit Report (Placeholder data) */}
        <ReportCard title="Deduction Audit Report" icon={FiClock}>
          <div className="flex justify-between text-sm"><span>Active Deductions</span> <strong>{reportData.activeDeductions}</strong></div>
          <div className="flex justify-between text-sm"><span>Total Deducted (YTD)</span> <strong className="text-emerald-600">AED 21,000</strong></div>
          <div className="flex justify-between text-sm"><span>Completed Advances</span> <strong className="text-gray-700">{reportData.completedAdvances}</strong></div>
        </ReportCard>
        
        {/* Outstanding Loan Report */}
        <ReportCard title="Outstanding Loan Report" icon={FiClock}>
          <div className="flex justify-between text-sm"><span>Active Loans</span> <strong>{reportData.activeDeductions}</strong></div>
          <div className="flex justify-between text-sm"><span>Outstanding Balance</span> <strong className="text-red-600">AED {reportData.totalOutstandingBalance.toLocaleString()}</strong></div>
          <div className="flex justify-between text-sm"><span>Avg. Deduction/Month</span> <strong className="text-gray-700">AED {avgDeductionPerMonth.toLocaleString()}</strong></div>
        </ReportCard>
      </div>

      {/* Department-wise Advance Distribution */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <h4 className="p-4 text-sm font-medium text-gray-700 border-b">Department-wise Advance Distribution</h4>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Department</th>
              <th className="py-3 text-left">Total Requests</th>
              <th className="py-3 text-left">Approved</th>
              <th className="py-3 text-left">Active</th>
              <th className="py-3 text-left">Total Amount</th>
              <th className="py-3 text-left">Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.entries(reportData.deptDistribution).map(([dept, data]) => (
              <tr key={dept} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{dept}</td>
                <td className="py-4">{data.totalRequests}</td>
                <td className="py-4">{data.approved}</td>
                <td className="py-4 text-green-600">{data.active}</td>
                <td className="py-4">AED {data.totalAmount.toLocaleString()}</td>
                <td className="py-4 text-red-600 font-medium">AED {data.outstanding.toLocaleString()}</td>
              </tr>
            ))}
            {Object.keys(reportData.deptDistribution).length === 0 && <tr><td colSpan={6} className="py-4 text-center text-gray-500">No departmental data available.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* ---------- Main Component ---------- */
export default function SalaryAdvancesPage() {
  const [advances, setAdvances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewAdvanceId, setViewAdvanceId] = useState(null);
  const [approveModalAdvance, setApproveModalAdvance] = useState(null);
  const [activeTab, setActiveTab] = useState("AdvanceRequests"); // NEW: Tab state

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // employees from salary/employees (staff list)
        const empRes = await advApi.fetchEmployees().catch((err) => {
          console.warn("fetchEmployees failed, trying /api/trainers fallback", err);
          return api.get("/api/trainers").catch(() => ({ data: [] }));
        });
        const empRaw = empRes?.data ?? empRes ?? [];
        const empData = (Array.isArray(empRaw) ? empRaw : []).map((e) => ({
          id: e.id,
          employeeId: (e.employeeId || e.emp || e.empId || e.employeeId || "").toString(),
          name: e.name || `${e.firstname || ""} ${e.lastname || ""}`.trim(),
          department: e.department || e.dept || "",
          raw: e,
        }));
        // advances list
        const advRes = await api.get("/api/salary/advances").catch(() => ({ data: [] }));
        const advRaw = advRes?.data ?? [];
        const advData = (Array.isArray(advRaw) ? advRaw : []).map((a) => ({
          id: a.id || a._id || Math.random().toString(36).slice(2, 9),
          employeeId: a.employeeId || a.empId || a.employee,
          employeeName: a.employeeName || a.employeeName || a.employee || "",
          dept: a.dept || a.department || a.departmentName || "",
          type: a.type || "Salary Advance",
          requestedAmount: safeNumber(a.requestedAmount ?? a.requested ?? a.amount),
          approved: a.approved === undefined ? (a.approvedAmount ?? null) : safeNumber(a.approved),
          paid: safeNumber(a.paid ?? 0),
          reqDate: a.reqDate || a.requestDate || a.createdAt || null,
          status: a.status || "Pending Approval",
          approvedOn: a.approvedOn || a.approvedAt || null,
          installmentAmount: a.installmentAmount || null,
          installmentCount: a.installmentCount || null,
          deductionMode: a.deductionMode || null,
          raw: a,
        }));
        if (!mounted) return;
        setEmployees(empData);
        setAdvances(advData);
      } catch (err) {
        console.warn("Failed to load salary advances data", err);
        setEmployees([]);
        setAdvances([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const uniqueDepts = useMemo(() => {
    const s = new Set(advances.concat(employees).map((x) => x.dept || x.department || "").filter(Boolean));
    return ["All Departments", ...Array.from(s)];
  }, [advances, employees]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return advances
      .filter((a) => {
        if (statusFilter !== "All Statuses" && a.status !== statusFilter) return false;
        if (deptFilter !== "All Departments" && a.dept !== deptFilter) return false;
        if (!q) return true;
        const emp = (a.employeeName || a.employeeId || "").toString().toLowerCase();
        const type = (a.type || "").toLowerCase();
        return emp.includes(q) || type.includes(q) || (a.employeeId || "").toString().toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const da = a.reqDate ? new Date(a.reqDate).getTime() : 0;
        const db = b.reqDate ? new Date(b.reqDate).getTime() : 0;
        return db - da;
      });
  }, [advances, query, statusFilter, deptFilter]);

  const stats = useMemo(() => {
    const active = advances.filter((a) => a.status === "Active").length;
    const outstanding = advances.reduce((sum, a) => {
      const approved = safeNumber(a.approved ?? a.requestedAmount);
      const paid = safeNumber(a.paid);
      return sum + Math.max(0, approved - paid);
    }, 0);
    const pending = advances.filter((a) => a.status === "Pending" || a.status === "Pending Approval").length;
    const approvedThisMonth = advances.filter((a) => {
      if (!a.approvedOn) return false;
      try {
        const d = new Date(a.approvedOn);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } catch (e) {
        return false;
      }
    }).length;
    return { active, outstanding: Math.max(0, outstanding), pending, approvedThisMonth };
  }, [advances]);

  function onAdvanceCreated(newAdv) {
    const entry = {
      id: newAdv.id || newAdv._id || Math.random().toString(36).slice(2, 9),
      employeeId: newAdv.employeeId,
      employeeName: newAdv.employeeName || employees.find((e) => e.employeeId === newAdv.employeeId)?.name || "",
      dept: newAdv.dept || employees.find((e) => e.employeeId === newAdv.employeeId)?.department || "",
      type: newAdv.type || "Salary Advance",
      requestedAmount: safeNumber(newAdv.requestedAmount || newAdv.requested),
      approved: newAdv.approved ?? null,
      reqDate: newAdv.reqDate || new Date().toISOString(),
      status: newAdv.status || "Pending Approval",
      paid: safeNumber(newAdv.paid),
      approvedOn: newAdv.approvedOn || null,
      raw: newAdv,
    };
    setAdvances((prev) => [entry, ...prev]);
  }

  function handleApproveClick(a) {
    setApproveModalAdvance(a);
  }

  function handleApproved(updated) {
    setAdvances((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this advance request?")) return;
    // attempt delete in backend, fallback to local delete
    api
      .delete(`/api/salary/advances/${id}`)
      .catch((e) => console.warn("delete API failed", e))
      .finally(() => setAdvances((prev) => prev.filter((a) => a.id !== id)));
  }

  if (loading) return <div className="p-6">Loading salary advances...</div>;

  return (
    <div className="flex min-h-screen">


      {/* Right content */}
      <div className="flex-1 p-6">

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Salary Advances</h1>
            <p className="text-sm text-gray-500">Manage employee salary advance requests and approvals</p>
          </div>
          <div>
            <button onClick={() => setIsCreateOpen(true)} className="bg-emerald-700 text-white px-4 py-2 rounded flex items-center gap-2">
              <HiOutlineDocumentAdd /> New Advance Request
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPI title="Active Advances" value={stats.active} subtitle="Currently being repaid" />
          <KPI title="Outstanding Amount" value={`AED ${stats.outstanding.toLocaleString()}`} subtitle="Total balance across all advances" />
          <KPI title="Pending Requests" value={stats.pending} subtitle="Awaiting approval" />
          <KPI title="Approved This Month" value={stats.approvedThisMonth} subtitle="New advances approved" />
        </div>

        {/* NEW: Tab Navigation */}
        <div className="border-b border-gray-200 mb-6 bg-white rounded-lg shadow-sm p-2">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {["AdvanceRequests", "RepaymentSchedule", "Reports"].map((tab) => (
              <a
                key={tab}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
                className={`
                  ${activeTab === tab ? "border-emerald-700 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                  whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-150
                `}
              >
                {tab.replace(/([A-Z])/g, ' $1').trim()}
              </a>
            ))}
          </nav>
        </div>


        {/* Conditional Rendering for Tab Content */}
        
        {/* 1. Advance Requests Tab (Original Content) */}
        {activeTab === "AdvanceRequests" && (
          <>
            {/* Controls */}
            <div className="bg-white p-4 rounded border mb-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 bg-gray-50 border rounded p-2">
                    <HiSearch className="text-gray-400" />
                    <input placeholder="Search by employee name or ID..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" />
                  </div>
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 rounded text-sm">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Pending Approval</option>
                  <option>Rejected</option>
                  <option>Completed</option>
                </select>
                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="border p-2 rounded text-sm">
                  {uniqueDepts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <h4 className="p-4 text-sm font-medium text-gray-700">Advance & Loan Requests</h4>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Employee</th>
                    <th className="py-3 text-left">Type</th>
                    <th className="py-3 text-left">Requested</th>
                    <th className="py-3 text-left">Approved</th>
                    <th className="py-3 text-left">Request Date</th>
                    <th className="py-3 text-left">Status</th>
                    <th className="py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{a.employeeName}</div>
                        <div className="text-xs text-gray-400">{a.employeeId} {a.dept ? `• ${a.dept}` : ""}</div>
                      </td>
                      <td className="py-4">{a.type}</td>
                      <td className="py-4">AED {safeNumber(a.requestedAmount).toLocaleString()}</td>
                      <td className="py-4 text-emerald-600 font-medium">{a.approved ? `AED ${safeNumber(a.approved).toLocaleString()}` : "-"}</td>
                      <td className="py-4 text-xs">{a.reqDate ? new Date(a.reqDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                      <td className="py-4"><StatusPill status={a.status} /></td>

                      <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        {a.status === "Pending Approval" && (
                          <>
                            <button onClick={() => handleApproveClick(a)} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-emerald-200">
                              <FiCheckCircle className="w-4 h-4" /> Approve
                            </button>
                            <button onClick={() => handleDelete(a.id)} className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-red-100">
                              <FiTrash2 className="w-4 h-4" /> Delete
                            </button>
                          </>
                        )}

                        <button onClick={() => setViewAdvanceId(a.id)} className="p-1 text-gray-500 hover:text-gray-800" title="View Details">
                          <FiEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-500">No requests found.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
        
        {/* 2. Repayment Schedule Tab */}
        {activeTab === "RepaymentSchedule" && (
          <RepaymentSchedule advances={advances} />
        )}
        
        {/* 3. Reports Tab */}
        {activeTab === "Reports" && (
          <Reports advances={advances} />
        )}


        {/* Modals */}
        <CreateAdvanceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} employees={employees} onCreated={onAdvanceCreated} />

        <ApproveAdvanceModal
          advance={approveModalAdvance}
          isOpen={!!approveModalAdvance}
          onClose={() => setApproveModalAdvance(null)}
          onApproved={(updated) => {
            handleApproved(updated);
            setApproveModalAdvance(null);
          }}
        />

        {/* Simple details drawer (view) */}
        {viewAdvanceId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-lg border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Advance Details</h3>
                  <div className="text-xs text-gray-500">Request ID: {viewAdvanceId}</div>
                </div>
                <button onClick={() => setViewAdvanceId(null)} className="text-gray-500 hover:text-gray-800">✕</button>
              </div>
              <div>
                {(() => {
                  const a = advances.find((x) => x.id === viewAdvanceId);
                  if (!a) return <div className="py-6 text-center text-gray-500">Not found</div>;
                  return (
                    <div className="space-y-3">
                      <div className="text-sm">{a.employeeName} • {a.employeeId}</div>
                      <div className="text-xs text-gray-500">Department: {a.dept}</div>
                      <div className="pt-2">Requested: <strong>AED {safeNumber(a.requestedAmount).toLocaleString()}</strong></div>
                      <div>Approved: <strong>{a.approved ? `AED ${safeNumber(a.approved).toLocaleString()}` : "-"}</strong></div>
                      <div>Status: <StatusPill status={a.status} /></div>
                      <div className="mt-3 text-sm text-gray-700">Remarks: {(a.raw && (a.raw.remarks || a.raw.reason)) || "-"}</div>
                    </div>
                  );
                })()}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setViewAdvanceId(null)} className="px-3 py-2 border rounded">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}