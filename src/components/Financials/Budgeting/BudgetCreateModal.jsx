// src/pages/budgeting/components/BudgetCreateModal.jsx
import React, { useState } from "react";
import { X, ChevronDown, Save } from "lucide-react";

export default function BudgetCreateModal({ categories, staff, onClose, onCreate }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState("Monthly");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");
  const [responsible, setResponsible] = useState("");
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState(10);
  const [notes, setNotes] = useState("");

  function handleSubmit() {
    if (!code || !category || !amount) {
      alert("Code, Category and Amount are required");
      return;
    }

    const payload = {
      code,
      type,
      category,
      department,
      branch,
      responsible,
      amount,
      alertThresholdPct: threshold,
      notes,
      status: "Active"
    };

    onCreate(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">New Budget Allocation</h2>
            <p className="text-sm text-slate-500">Define parameters for the new financial period.</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <InputField 
              label="Budget Code" 
              placeholder="e.g. FY24-MK-001" 
              value={code} 
              onChange={e => setCode(e.target.value)} 
              required
            />

            <SelectField 
              label="Frequency" 
              value={type} 
              onChange={e => setType(e.target.value)}
              options={["Monthly", "Quarterly", "Yearly"]}
            />

            <SelectField 
              label="Expense Category" 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </SelectField>

            <SelectField 
              label="Budget Owner" 
              value={responsible} 
              onChange={e => setResponsible(e.target.value)}
            >
              <option value="">Assign Responsible...</option>
              {staff.map((s) => (
                <option key={s.id} value={`${s.firstname} ${s.lastname}`}>{`${s.firstname} ${s.lastname}`}</option>
              ))}
            </SelectField>

            <InputField 
              label="Department" 
              placeholder="Sales / HR / Marketing" 
              value={department} 
              onChange={e => setDepartment(e.target.value)} 
            />

            <InputField 
              label="Branch / Location" 
              placeholder="Main Branch / Remote" 
              value={branch} 
              onChange={e => setBranch(e.target.value)} 
            />

            <InputField 
              label="Allocated Amount" 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              required 
              prefix="$"
            />

            <InputField 
              label="Alert Threshold (%)" 
              type="number" 
              value={threshold} 
              onChange={e => setThreshold(e.target.value)}
              suffix="%"
            />

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 tracking-wide">
                Notes & Justification
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                placeholder="Optional details regarding this budget..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all"
          >
            <Save size={18} />
            Create Budget
          </button>
        </div>
      </div>
    </div>
  );
}

// UI Helper Components
function InputField({ label, type = "text", value, onChange, placeholder, required, prefix, suffix }) {
  return (
    <div className="col-span-1">
      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {prefix && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{prefix}</div>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full border border-gray-300 rounded-lg py-2.5 ${prefix ? 'pl-7' : 'pl-3'} ${suffix ? 'pr-8' : 'pr-3'} text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{suffix}</div>}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options, children, required }) {
  return (
    <div className="col-span-1">
      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5 tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-lg py-2.5 pl-3 pr-8 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white"
        >
          {children ? children : options.map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}