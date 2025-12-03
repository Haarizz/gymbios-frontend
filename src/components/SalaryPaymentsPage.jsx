// src/pages/SalaryPaymentsPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { HiSearch } from "react-icons/hi";
import { FiCheckCircle, FiDownload } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import api from "../api/axiosConfig";

// ------------------- CONSTANTS -------------------
const COLORS = ["#1f6f63", "#f87171", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185"];

const DEFAULT_SUMMARY_DATA = {
  bankAmount: 0,
  cashAmount: 0,
  totalPaid: 0,
  pieData: []
};

// ------------------- HELPERS -------------------
const safeNumber = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

function KPI({ title, value, subtitle, icon, color = "text-gray-800" }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-5 border border-gray-300 flex items-center justify-between">
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className={`mt-1 text-2xl font-bold ${color}`}>{value}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
      {icon && <div className={`text-3xl ${color.replace("800", "500")} opacity-60`}>{icon}</div>}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-300 w-full ${className}`}>
      <HiSearch className="text-lg text-gray-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 outline-none text-sm" />
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    "On Hold": "bg-rose-100 text-rose-700",
    Active: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
    "Pending Approval": "bg-yellow-100 text-yellow-700"
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
}

// ------------------- ADD/EDIT SALARY MODAL -------------------
function AddSalaryModal({ isOpen, onClose, employee, onSaved }) {
  const [base, setBase] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [status, setStatus] = useState("Pending");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setBase(safeNumber(employee.base));
      setAllowances(safeNumber(employee.allowances));
      setDeductions(safeNumber(employee.deductions));
      setStatus(employee.status || "Pending");
      setSaving(false);
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const net = safeNumber(base) + safeNumber(allowances) - safeNumber(deductions);

  // Try a few PUT endpoints so frontend works with different backend path choices
  async function tryPutPaths(payload) {
    const paths = [
      `/staff/${employee.dbId}`,
      `/api/staff/${employee.dbId}`,
      `/staff/${employee.dbId}/salary`,
      `/api/staff/${employee.dbId}/salary`
    ];
    let lastErr = null;
    for (const p of paths) {
      try {
        const res = await api.put(p, payload);
        if (res && (res.status === 200 || res.status === 201)) return res;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("All PUT attempts failed");
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      baseSalary: Number(base || 0),
      allowances: Number(allowances || 0),
      deductions: Number(deductions || 0),
      status: status
    };

    try {
      await tryPutPaths(payload);

      const updated = {
        ...employee,
        base: Number(payload.baseSalary),
        allowances: Number(payload.allowances),
        deductions: Number(payload.deductions),
        status: payload.status
      };

      onSaved(updated);
      onClose();
    } catch (err) {
      console.error("Failed to save salary/ status:", err);
      const msg = err?.response?.data || err?.message || "Unknown error";
      alert("Failed to save salary: " + msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Set Salary for {employee.name}</h3>
            <div className="text-xs text-gray-500">{employee.empCode} • {employee.dept} / {employee.designation}</div>
          </div>
          <div>
            <button className="text-sm text-gray-600" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500">Base Salary</label>
            <input type="number" className="w-full border rounded p-2 text-sm" value={base} onChange={(e) => setBase(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Allowances</label>
            <input type="number" className="w-full border rounded p-2 text-sm" value={allowances} onChange={(e) => setAllowances(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Deductions</label>
            <input type="number" className="w-full border rounded p-2 text-sm" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded p-2 text-sm">
              <option>Pending</option>
              <option>Paid</option>
              <option>On Hold</option>
              <option>Active</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-gray-500">Net Payable (computed)</div>
          <div className="text-xl font-bold">AED {net.toLocaleString()}</div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={handleSave} disabled={saving} className={`px-4 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-emerald-700 hover:bg-emerald-800'}`}>
            {saving ? "Saving..." : "Save Salary"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- PROCESS PAYMENT MODAL -------------------
function ProcessPaymentModal({ isOpen, onClose, employee, onConfirmPayment }) {
  if (!isOpen || !employee) return null;

  const netPayable = safeNumber(employee.base) + safeNumber(employee.allowances) - safeNumber(employee.deductions);
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [cashAmount, setCashAmount] = useState(0);
  const [bankAmount, setBankAmount] = useState(netPayable);

  useEffect(() => {
    if (employee) {
      setCashAmount(0);
      setBankAmount(netPayable);
      setIsSplitEnabled(false);
    }
  }, [employee, netPayable]);

  const handleSplitChange = (type, value) => {
    let amount = Number(value) || 0;
    if (amount < 0) amount = 0;
    if (amount > netPayable) amount = netPayable;
    if (type === "cash") {
      setCashAmount(amount);
      setBankAmount(netPayable - amount);
    } else {
      setBankAmount(amount);
      setCashAmount(netPayable - amount);
    }
  };

  const isSplitValid = !isSplitEnabled || (Math.abs((cashAmount + bankAmount) - netPayable) < 0.001 && cashAmount >= 0 && bankAmount >= 0);
  const processButtonText = isSplitValid ? "Process Payment" : "Invalid Split Amount";

  // Disable payment if netPayable is zero
  const isPayDisabled = netPayable <= 0 || !isSplitValid;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-8 border border-gray-300">
        <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-800">Process Individual Salary Payment</h3>
          <div className="text-sm text-gray-500">
            {employee.name} - {employee.empCode}
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Salary Breakdown</h4>
          <div className="grid grid-cols-2 text-sm text-gray-700">
            <div>Base Salary:</div>
            <div className="text-right">AED {safeNumber(employee.base).toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 text-sm text-emerald-600">
            <div>Allowances:</div>
            <div className="text-right">+ AED {safeNumber(employee.allowances).toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 text-sm text-rose-600 border-b border-gray-300 pb-2">
            <div>Deductions:</div>
            <div className="text-right">- AED {safeNumber(employee.deductions).toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 text-md font-bold text-gray-800 pt-2">
            <div>Net Payable:</div>
            <div className="text-right">AED {netPayable.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-500">Salary Month *</label>
            <select className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500">
              <option>{new Date().toLocaleString("default", { month: "long" })}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500">Year *</label>
            <input type="number" defaultValue={new Date().getFullYear()} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Payment Date *</label>
            <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg border border-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Enable Split Payment</span>
            <IoIosArrowDown className="text-gray-400" />
            <p className="text-xs text-gray-500 ml-2">Divide payment between multiple modes (e.g., cash + bank)</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isSplitEnabled} onChange={() => setIsSplitEnabled(!isSplitEnabled)} className="sr-only peer" />
            <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Payment Mode / Note</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500">Bank Transfer (Amount)</label>
              <input
                type="number"
                value={isSplitEnabled ? bankAmount.toFixed(0) : netPayable.toFixed(0)}
                onChange={(e) => isSplitEnabled && handleSplitChange("bank", e.target.value)}
                disabled={!isSplitEnabled && netPayable > 0}
                className={`w-full mt-1 border border-gray-300 rounded-md p-2 text-sm ${isSplitEnabled ? "bg-white" : "bg-gray-100 text-gray-500"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Transaction ID or reference</label>
              <input type="text" placeholder="T/A or Reference number" className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
            </div>
          </div>

          {isSplitEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Cash (Amount)</label>
                <input type="number" value={cashAmount.toFixed(0)} onChange={(e) => handleSplitChange("cash", e.target.value)} className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Reference / Note</label>
                <input type="text" placeholder="e.g., Cash envelope handover" className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm" />
              </div>
            </div>
          )}

          <div className="pt-4">
            <label className="block text-xs font-medium text-gray-500">Remarks (Optional)</label>
            <textarea rows="2" placeholder="Additional notes or comments..." className="w-full mt-1 border border-gray-300 rounded-md p-2 text-sm"></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-300 pt-4 mt-6">
          <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => {
              // Prevent sending zero payments
              if (netPayable <= 0) {
                alert("Net payable is zero — cannot process payment.");
                return;
              }
              const bank = isSplitEnabled ? Number(bankAmount) : netPayable;
              const cash = isSplitEnabled ? Number(cashAmount) : 0;
              onConfirmPayment(employee.dbId, { bankAmount: bank, cashAmount: cash });
            }}
            disabled={isPayDisabled}
            className={`text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 ${!isPayDisabled ? "bg-emerald-700 hover:bg-emerald-800" : "bg-gray-400 cursor-not-allowed"}`}
          >
            <FiCheckCircle /> {isPayDisabled ? "Cannot Pay" : processButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- SALARY ADVANCE TAB -------------------
function SalaryAdvanceTab({ advanceRequests, employees }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-300">
      <h2 className="text-xl font-semibold mb-4">Salary Advances</h2>
      <p className="text-sm text-gray-500">Advance request data is loaded from the backend API if available</p>
      <ul className="mt-4 space-y-2">
        {advanceRequests.map((req) => (
          <li key={req.id} className="p-3 border rounded flex justify-between items-center">
            <span className="font-medium">{req.employee} ({req.empId})</span>
            <StatusPill status={req.status} />
          </li>
        ))}
        {advanceRequests.length === 0 && <li className="text-center text-gray-500 py-4">No advance requests found.</li>}
      </ul>
    </div>
  );
}

// ------------------- MAIN COMPONENT -------------------
export default function SalaryPaymentsPage() {
  const [activePage, setActivePage] = useState("payments");
  const [tab, setTab] = useState("individual");

  const [employees, setEmployees] = useState([]);
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [summaryData, setSummaryData] = useState(DEFAULT_SUMMARY_DATA);

  const [query, setQuery] = useState("");
  const [selectedBulk, setSelectedBulk] = useState(new Set());
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddSalaryOpen, setIsAddSalaryOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // Summary calculation — improved to group by paymentMode
  const calculateSummary = (payments) => {
    // payments is array with fields amount, paymentMode, bankAmount, cashAmount
    let bankAmount = 0;
    let cashAmount = 0;

    // Aggregate by paymentMode to build pieData that reflects actual modes used
    const modeTotals = {}; // mode => sum

    (payments || []).forEach((p) => {
      const amt = safeNumber(p.amount ?? p.netSalary ?? 0);

      // If explicit mode present, use it; else derive from bankAmount/cashAmount or fallback to 'Bank'
      let mode = (p.paymentMode || p.mode || "").toString().trim();
      if (!mode) {
        // try explicit fields
        if (safeNumber(p.bankAmount) > 0 && safeNumber(p.cashAmount) > 0) mode = "Bank + Cash";
        else if (safeNumber(p.bankAmount) > 0) mode = "Bank";
        else if (safeNumber(p.cashAmount) > 0) mode = "Cash";
        else mode = "Bank";
      }

      // Normalize a few common strings
      const mnorm = mode.toLowerCase().includes("bank") && mode.toLowerCase().includes("cash") ? "Bank + Cash" : (mode.toLowerCase().includes("cash") ? "Cash" : (mode.toLowerCase().includes("bank") ? "Bank" : mode));

      modeTotals[mnorm] = (modeTotals[mnorm] || 0) + amt;

      // Also compute bank/cash approximations
      if (mnorm === "Bank") bankAmount += amt;
      else if (mnorm === "Cash") cashAmount += amt;
      else if (mnorm === "Bank + Cash") {
        // If payment record contains breakdown try to use it, else split evenly
        if (safeNumber(p.bankAmount) || safeNumber(p.cashAmount)) {
          bankAmount += safeNumber(p.bankAmount);
          cashAmount += safeNumber(p.cashAmount);
        } else {
          bankAmount += amt / 2;
          cashAmount += amt / 2;
        }
      } else {
        // unknown mode treat as bank
        bankAmount += amt;
      }
    });

    const pieData = Object.keys(modeTotals).map((k) => ({ name: `${k} AED ${modeTotals[k].toLocaleString()}`, value: modeTotals[k] }));

    const totalPaid = bankAmount + cashAmount;

    setSummaryData({
      bankAmount,
      cashAmount,
      pieData,
      totalPaid
    });
  };

  // Fetch employees & payments
  const fetchData = async (mounted) => {
    try {
      const empsRes = await api.get("/salary/employees");
      // recent payments endpoint optional — if missing treat as empty
      const paymentsRes = await api.get("/salary/payments/recent").catch(() => ({ data: [] }));

      if (!mounted) return;

      const normalizedEmps = (empsRes.data || []).map((r) => ({
        dbId: r.id,
        empCode: r.employeeId || r.empId || `EMP${r.id}`,
        idForSearch: r.id || r.employeeId || "",
        name: `${r.firstname || ""} ${r.lastname || ""}`.trim() || (r.name || r.employeeName || ""),
        dept: r.department || r.dept,
        designation: r.role || r.designation,
        base: safeNumber(r.baseSalary ?? r.base ?? r.salary ?? 0),
        allowances: safeNumber(r.allowances ?? 0),
        deductions: safeNumber(r.deductions ?? 0),
        status: r.status || "Pending",
        raw: r
      }));
      setEmployees(normalizedEmps);

      setAdvanceRequests([]); // no advance API available by default
      setRecentPayments((paymentsRes && paymentsRes.data) ? paymentsRes.data : []);
      calculateSummary((paymentsRes && paymentsRes.data) ? paymentsRes.data : []);
    } catch (err) {
      console.error("Failed to load salary backend data:", err);
    } finally {
      if (mounted) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchData(mounted);
    return () => {
      mounted = false;
    };
  }, []);

  // filters / derived lists
  const filteredEmployees = useMemo(() => {
    let list = employees;
    const q = (query || "").toLowerCase();
    if (q) list = list.filter((emp) => (`${emp.name} ${emp.empCode} ${emp.idForSearch}`).toLowerCase().includes(q));
    if (departmentFilter !== "All Departments") list = list.filter((e) => e.dept === departmentFilter);
    if (statusFilter !== "All Status") list = list.filter((e) => e.status === statusFilter);
    return list;
  }, [employees, query, departmentFilter, statusFilter]);

  const employeesForBulk = useMemo(() => filteredEmployees.filter((e) => ["Pending", "On Hold", "Active"].includes(e.status)), [filteredEmployees]);

  const totalEmployees = employees.length;
  const totalPayable = useMemo(() => employees.reduce((s, e) => s + (safeNumber(e.base) + safeNumber(e.allowances) - safeNumber(e.deductions)), 0), [employees]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(employees.map((e) => e.dept || "Unknown"));
    return ["All Departments", ...Array.from(depts)];
  }, [employees]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(employees.map((e) => e.status || "Unknown"));
    return ["All Status", ...Array.from(statuses)];
  }, [employees]);

  function toggleBulk(id) {
    const clone = new Set(selectedBulk);
    if (clone.has(id)) clone.delete(id);
    else clone.add(id);
    setSelectedBulk(clone);
  }

  function toggleSelectAll() {
    const bulkIds = employeesForBulk.map((e) => e.dbId);
    if (selectedBulk.size === bulkIds.length && employeesForBulk.length > 0) setSelectedBulk(new Set());
    else setSelectedBulk(new Set(bulkIds));
  }

  // helper to update staff status via PUT
  async function markStaffPaid(dbId) {
    if (!dbId) return;
    const payload = { status: "Paid" };
    const paths = [`/staff/${dbId}`, `/api/staff/${dbId}`];
    for (const p of paths) {
      try {
        await api.put(p, payload);
        return;
      } catch (err) {
        // try next
      }
    }
    // not fatal
  }

  // Bulk payment implementation (skip zero-amount employees)
  async function processBulk() {
    if (selectedBulk.size === 0) return;
    const ids = Array.from(selectedBulk);

    // Filter employees with net > 0
    const payableEmployees = ids
      .map((dbId) => employees.find((e) => e.dbId === dbId))
      .filter((emp) => emp && (safeNumber(emp.base) + safeNumber(emp.allowances) - safeNumber(emp.deductions)) > 0);

    if (payableEmployees.length === 0) {
      alert("No selected employees have payable amount > 0. Nothing to process.");
      return;
    }

    try {
      const promises = payableEmployees.map((emp) => {
        const dbId = emp.dbId;
        const net = safeNumber(emp.base + emp.allowances - emp.deductions);
        const payload = {
          staffId: dbId,
          amount: net,
          month: `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`,
          status: "Paid",
          paymentMode: "Bank", // bulk default — change to UI choice if you need per-employee modes
          remarks: "Bulk payment"
        };
        return api.post("/salary", payload)
          .then(() => markStaffPaid(dbId))
          .catch((err) => { throw err; });
      });
      await Promise.all(promises);
      await fetchData(true);
      setSelectedBulk(new Set());
    } catch (err) {
      console.error("Bulk pay failed:", err);
      alert("Bulk payment failed. See console.");
    }
  }

  function openPayModal(employee) {
    setSelectedEmployee(employee);
    setIsPaymentModalOpen(true);
  }
  function openAddSalaryModal(employee) {
    setSelectedEmployee(employee);
    setIsAddSalaryOpen(true);
  }

  // Process a single payment and update staff status
  async function handleConfirmPayment(dbId, amounts) {
    try {
      const emp = employees.find((e) => e.dbId === dbId);
      const netFromStaff = safeNumber(emp ? (emp.base + emp.allowances - emp.deductions) : 0);
      const bank = safeNumber(amounts.bankAmount);
      const cash = safeNumber(amounts.cashAmount);
      const net = netFromStaff > 0 ? netFromStaff : (bank + cash);

      if (net <= 0) {
        alert("Cannot process payment: amount is zero.");
        return;
      }

      // Choose paymentMode accurately
      let mode = "Bank";
      if (bank > 0 && cash > 0) mode = "Bank + Cash";
      else if (cash > 0) mode = "Cash";
      else mode = "Bank";

      const payload = {
        staffId: dbId,
        amount: net,
        month: `${new Date().toLocaleString("default", { month: "long" })} ${new Date().getFullYear()}`,
        status: "Paid",
        paymentMode: mode,
        bankAmount: bank,
        cashAmount: cash,
        remarks: `Paid ${mode}`
      };

      await api.post("/salary", payload);
      // ensure staff status updated (double-write safeguard)
      await markStaffPaid(dbId);
      await fetchData(true);
      setIsPaymentModalOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error("Process payment error:", err);
      alert("Failed to process payment. See console for details.");
    }
  }

  async function handleSalarySaved(updated) {
    setEmployees((prev) => prev.map((e) => (e.dbId === updated.id ? {
      ...e,
      base: updated.base ?? e.base,
      allowances: updated.allowances ?? e.allowances,
      deductions: updated.deductions ?? e.deductions,
      status: updated.status ?? e.status
    } : e)));
    try {
      await fetchData(true);
    } catch (e) {
      // ignore
    }
  }

  // UI render helpers
  const IndividualPaymentTab = () => (
    <>
      <div className="flex justify-between gap-4 mb-4">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name or employee ID..." className="w-1/3" />
        <div className="flex gap-4">
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="border border-gray-300 p-2 rounded-lg text-sm">
            {uniqueDepartments.map((dept) => <option key={dept}>{dept}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 p-2 rounded-lg text-sm">
            {uniqueStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Select Employee for Payment</h4>
        <p className="text-xs text-gray-500 mb-4">Click Pay to process individual salary payment</p>
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 border-b border-gray-300">
            <tr>
              <th className="py-3 text-left">Employee</th>
              <th className="text-left">Department / Designation</th>
              <th className="text-left">Base Salary</th>
              <th className="text-left">Allowances</th>
              <th className="text-left">Deductions</th>
              <th className="text-left">Net Payable</th>
              <th className="text-left">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  {loading ? "Loading..." : "No employees found."}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.dbId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.empCode}</div>
                  </td>
                  <td className="py-3">{emp.dept} <div className="text-xs text-gray-400">{emp.designation}</div></td>
                  <td className="py-3 text-sm">AED {safeNumber(emp.base).toLocaleString()}</td>
                  <td className="py-3 text-emerald-600 text-sm">+{safeNumber(emp.allowances).toLocaleString()}</td>
                  <td className="py-3 text-rose-600 text-sm">-{safeNumber(emp.deductions).toLocaleString()}</td>
                  <td className="py-3 font-semibold text-sm">AED {(safeNumber(emp.base) + safeNumber(emp.allowances) - safeNumber(emp.deductions)).toLocaleString()}</td>
                  <td className="py-3"><StatusPill status={emp.status} /></td>
                  <td className="py-3 text-center">
                    {emp.status !== "Paid" ? (
                      <>
                        <button onClick={() => openPayModal(emp)} className="bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm hover:bg-emerald-800">Pay</button>
                        <button onClick={() => openAddSalaryModal(emp)} className="ml-2 bg-white border px-3 py-1 rounded text-sm">Set Salary</button>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-gray-500">Completed</span>
                        <button onClick={() => openAddSalaryModal(emp)} className="ml-2 bg-white border px-2 py-1 rounded text-xs">Edit</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const BulkPaymentTab = () => (
    <>
      <div className="flex justify-between gap-4 mb-4">
        <div className="flex gap-4 w-2/3">
          <SearchBar value={query} onChange={setQuery} placeholder="Search employees..." className="flex-1" />
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="border border-gray-300 p-2 rounded-lg text-sm">
            {uniqueDepartments.map((dept) => <option key={dept}>{dept}</option>)}
          </select>
        </div>
        <div className="flex gap-4">
          <button onClick={processBulk} disabled={selectedBulk.size === 0} className={`px-4 py-2 rounded-md text-sm flex items-center ${selectedBulk.size > 0 ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-rose-100 text-rose-400 cursor-not-allowed"}`}>
            Process Payment ({selectedBulk.size})
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-md text-sm flex items-center">Export</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Select Employees for Bulk Payment</h4>
        <p className="text-xs text-gray-500 mb-4">Select multiple employees to process payments in batch</p>
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 border-b border-gray-300">
            <tr>
              <th className="py-3 w-10 text-left">
                <input type="checkbox" onChange={toggleSelectAll} checked={selectedBulk.size === employeesForBulk.length && employeesForBulk.length > 0} className="form-checkbox text-emerald-600 rounded" />
              </th>
              <th className="text-left">Employee</th>
              <th className="text-left">Department</th>
              <th className="text-left">Net Payable</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {employeesForBulk.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  {loading ? "Loading..." : "No pending employees to select for bulk payment."}
                </td>
              </tr>
            ) : (
              employeesForBulk.map((emp) => (
                <tr key={emp.dbId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-left">
                    <input type="checkbox" checked={selectedBulk.has(emp.dbId)} onChange={() => toggleBulk(emp.dbId)} className="form-checkbox text-emerald-600 rounded" />
                  </td>
                  <td className="py-3">
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.empCode}</div>
                  </td>
                  <td className="py-3 text-sm">{emp.dept}</td>
                  <td className="py-3 font-semibold text-sm text-emerald-700">AED {(safeNumber(emp.base) + safeNumber(emp.allowances) - safeNumber(emp.deductions)).toLocaleString()}</td>
                  <td className="py-3"><StatusPill status={emp.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const PaymentSummaryTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-300">
        <h3 className="font-medium text-gray-700 mb-3">Payment Mode Distribution</h3>
        <p className="text-xs text-gray-500 mb-4">Breakdown by payment method</p>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={summaryData.pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={5} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {summaryData.pieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => `AED ${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-300 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Payment Statistics</h3>
          <p className="text-xs text-gray-500 mb-4">Current month overview</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <div className="text-sm text-gray-500">Total Payments</div>
              <div className="text-2xl font-semibold mt-1">{recentPayments.length}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <div className="text-sm text-gray-500">Amount Paid</div>
              <div className="text-2xl font-semibold mt-1">AED {summaryData.totalPaid.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Payment Mode Breakdown</div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="text-sm">Bank Transfer</div>
              <div className="font-semibold text-emerald-600">AED {summaryData.bankAmount.toLocaleString()}</div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="text-sm">Cash</div>
              <div className="font-semibold text-red-600">AED {summaryData.cashAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 bg-white p-6 rounded-lg border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-700">Recent Payment Transactions</h3>
          <button className="text-xs border border-gray-300 px-3 py-1 rounded-md flex items-center gap-1">
            <FiDownload className="text-sm" /> Export Report
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Latest salary payments processed</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-b border-gray-300">
              <tr>
                <th className="py-3">Employee</th>
                <th>Month</th>
                <th>Net Salary</th>
                <th>Payment Mode(s)</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">{p.staffName || p.employeeName || p.employee}</td>
                  <td className="py-3">{p.month}</td>
                  <td className="py-3 font-semibold">AED {safeNumber(p.amount ?? p.netSalary).toLocaleString()}</td>
                  <td className="py-3 text-xs bg-gray-50 inline-flex items-center gap-1 px-2 py-1 rounded">{p.paymentMode || p.mode || (p.bankAmount && p.cashAmount ? "Bank + Cash" : (p.bankAmount ? "Bank" : (p.cashAmount ? "Cash" : "Bank")))}</td>
                  <td className="py-3">{p.paymentDate || p.date}</td>
                  <td className="py-3"><StatusPill status={p.status || "Paid"} /></td>
                  <td className="py-3 text-right"><button className="bg-white border border-gray-300 px-3 py-2 rounded text-sm"><FiDownload /></button></td>
                </tr>
              ))}
              {recentPayments.length === 0 && <tr><td colSpan={7} className="py-4 text-center text-gray-500">No recent payments</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const currentTabContent = useMemo(() => {
    if (tab === "individual") return <IndividualPaymentTab />;
    if (tab === "bulk") return <BulkPaymentTab />;
    if (tab === "summary") return <PaymentSummaryTab />;
    return null;
  }, [tab, filteredEmployees, employeesForBulk, selectedBulk, departmentFilter, statusFilter, query, recentPayments, summaryData]);

  if (loading) return <div className="p-6">Loading salary data...</div>;

  return (
    <div className="p-8">
      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Salary Payments
        </h1>
        <p className="text-sm text-gray-500">
          Process individual and bulk salary payments with split payment options
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPI
          title="Total Employees"
          value={totalEmployees}
          subtitle="Active staff members"
        />
        <KPI
          title="Total Payable"
          value={`AED ${totalPayable.toLocaleString()}`}
          subtitle="This month's commitment"
        />
        <KPI
          title="Pending Payments"
          value={employeesForBulk.length}
          subtitle={`AED ${employeesForBulk
            .reduce(
              (s, e) =>
                s +
                (safeNumber(e.base) +
                  safeNumber(e.allowances) -
                  safeNumber(e.deductions)),
              0
            )
            .toLocaleString()} to process`}
          color="text-red-600"
        />
        <KPI
          title="Paid This Month"
          value={recentPayments.length}
          subtitle={`AED ${summaryData.totalPaid.toLocaleString()} processed`}
          color="text-emerald-700"
        />
      </div>

      {/* TAB SWITCHER */}
      <div className="flex items-center border-b border-gray-300 mb-6 bg-white rounded-lg shadow-sm p-2">
        <button
          onClick={() => setTab("individual")}
          className={`flex-1 py-2 text-sm font-medium ${
            tab === "individual"
              ? "bg-white shadow-md border border-gray-300 rounded-lg text-emerald-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Individual Payment
        </button>

        <button
          onClick={() => setTab("bulk")}
          className={`flex-1 py-2 text-sm font-medium ${
            tab === "bulk"
              ? "bg-white shadow-md border border-gray-300 rounded-lg text-emerald-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Bulk Payment
        </button>

        <button
          onClick={() => setTab("summary")}
          className={`flex-1 py-2 text-sm font-medium ${
            tab === "summary"
              ? "bg-white shadow-md border border-gray-300 rounded-lg text-emerald-700"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Payment Summary
        </button>
      </div>

      {/* TAB CONTENT */}
      {currentTabContent}

      {/* MODALS */}
      <ProcessPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        employee={selectedEmployee}
        onConfirmPayment={handleConfirmPayment}
      />

      <AddSalaryModal
        isOpen={isAddSalaryOpen}
        onClose={() => setIsAddSalaryOpen(false)}
        employee={selectedEmployee}
        onSaved={handleSalarySaved}
      />
    </div>
  );

}
