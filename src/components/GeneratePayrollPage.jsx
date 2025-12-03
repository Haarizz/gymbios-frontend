// src/components/GeneratePayrollPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getStaff } from "../api/staff";        // uses your trainers/staff API. :contentReference[oaicite:2]{index=2}
import { generatePayroll } from "../api/payroll"; // existing payroll API. :contentReference[oaicite:3]{index=3}

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const currency = (n) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(n || 0);

export default function GeneratePayrollPage() {
  const navigate = useNavigate();

  const [month, setMonth] = useState("November");
  const [year, setYear] = useState(new Date().getFullYear());
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    setLoadingStaff(true);
    getStaff()
      .then((data) => {
        // data is expected to be array of staff objects
        setStaff(data || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load staff list");
      })
      .finally(() => setLoadingStaff(false));
  }, []);

  // salary calculation helper
  const computeRow = (s) => {
    // Try common possible salary fields (some projects use different names).
    // Fallback to 0 if nothing found.
    const base =
      Number(s.baseSalary ?? s.salary ?? s.monthlySalary ?? s.monthlyTarget ?? 0) || 0;

    // Allowances / deductions / ot rate if present on staff object; fallback to 0
    const allowances = Number(s.allowances ?? s.allowance ?? 0) || 0;
    const deductions = Number(s.deductions ?? s.deduction ?? 0) || 0;
    const otRate = Number(s.otRate ?? s.overtimeRate ?? 0) || 0;

    // Since you don't have attendance, we assume full working month by default:
    const workingDays = 30;
    const presentDays = s.presentDays ?? workingDays; // if presentDays provided, use it; else assume full
    const overtimeHours = Number(s.overtimeHours ?? 0) || 0;

    // Net formula:
    // Net = (Base ÷ WorkingDays × PresentDays) + Allowances + (OT * otRate) − Deductions
    const proratedBase = (base / workingDays) * presentDays;
    const overtimeAmount = overtimeHours * otRate;
    const gross = proratedBase + allowances + overtimeAmount;
    const net = gross - deductions;

    return {
      staffId: s.id,
      employeeId: s.employeeId ?? s.employeeID ?? s.empId ?? null,
      name: `${s.firstname ?? ""} ${s.lastname ?? ""}`.trim(),
      role: s.role ?? s.title ?? null,
      base,
      proratedBase,
      allowances,
      overtimeHours,
      overtimeAmount,
      deductions,
      grossAmount: gross,
      netAmount: net,
      // formatted strings for UI preview
      grossFormatted: currency(gross),
      deductionsFormatted: currency(deductions),
      netFormatted: currency(net),
    };
  };

  // build preview rows and totals
  const previewRows = staff.map(computeRow);
  const totals = previewRows.reduce(
    (acc, r) => {
      acc.employees += 1;
      acc.gross += r.grossAmount;
      acc.deductions += r.deductions;
      acc.net += r.netAmount;
      return acc;
    },
    { employees: 0, gross: 0, deductions: 0, net: 0 }
  );

  const handleGenerate = async () => {
    if (staff.length === 0) {
      toast.error("No staff members found to generate payroll.");
      return;
    }

    setCalculating(true);
    try {
      // payload structure: month, year, totals, rows
      const payload = {
        month,
        year,
        employeesCount: totals.employees,
        totalGross: Math.round(totals.gross),
        totalDeductions: Math.round(totals.deductions),
        totalNet: Math.round(totals.net),
        rows: previewRows.map((r) => ({
          staffId: r.staffId,
          employeeId: r.employeeId,
          name: r.name,
          role: r.role,
          base: Math.round(r.base),
          proratedBase: Math.round(r.proratedBase),
          allowances: Math.round(r.allowances),
          overtimeHours: r.overtimeHours,
          overtimeAmount: Math.round(r.overtimeAmount),
          deductions: Math.round(r.deductions),
          grossAmount: Math.round(r.grossAmount),
          netAmount: Math.round(r.netAmount),
        })),
      };

      // POST to your existing payroll generate endpoint — backend should accept payload.
      await generatePayroll(payload);

      toast.success("Payroll generated — redirecting to history");
      // navigate to payroll history (or review if you prefer)
      navigate("/payroll/history");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate payroll");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Generate New Payroll</h2>
            <p className="text-sm text-gray-500">Automatically calculate payroll for staff members (attendance not required).</p>
          </div>
          <button onClick={() => navigate(-1)} className="text-gray-600">Close</button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payroll Month *</label>
            <select
              className="w-full border p-2 rounded"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Year *</label>
            <select
              className="w-full border p-2 rounded"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Auto-fetch box (kept UI same) */}
        <div className="bg-gray-50 border rounded-lg p-4 mb-4">
          <p className="font-medium text-teal-700 mb-2">Auto-Fetch from Staff Data</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✔ Uses staff base salary (fallback if missing)</li>
            <li>✔ Applies allowances & deductions if present</li>
            <li>✔ Uses overtime rate & hours when present</li>
            <li>✔ If attendance not present, assumes full month</li>
          </ul>
        </div>

        {/* Totals preview */}
        <div className="p-4 border rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-600">Staff to process</div>
            <div className="text-sm text-gray-600">Employees: <strong>{totals.employees}</strong></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Gross Amount</div>
              <div className="text-lg font-semibold">{currency(totals.gross)}</div>
            </div>
            <div className="p-3 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Deductions</div>
              <div className="text-lg font-semibold text-red-600">{currency(totals.deductions)}</div>
            </div>
            <div className="p-3 bg-white rounded shadow">
              <div className="text-sm text-gray-500">Net Amount</div>
              <div className="text-lg font-semibold text-green-700">{currency(totals.net)}</div>
            </div>
          </div>
        </div>

        {/* Employee breakdown preview (compact) */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Employee breakdown (preview)</h3>
          <div className="space-y-2">
            {previewRows.map((r) => (
              <div key={r.staffId} className="flex justify-between items-center bg-white p-3 border rounded">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.role} • Base: {currency(r.base)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Net</div>
                  <div className="font-semibold">{r.netFormatted}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded border hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleGenerate}
            disabled={calculating}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-60"
          >
            {calculating ? "Generating..." : "Generate & Calculate"}
          </button>
        </div>
      </div>
    </div>
  );
}
