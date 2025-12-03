import { useState } from "react";
import { createCostCenter } from "../api/ledgerApi";

export default function CostCenterModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    branch: "",
    manager: "",
    budgetAmount: 0,
    description: "",
    active: true,
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const submit = async () => {
    try {
      const payload = {
        name: form.name,
        code: form.code || null,
        branch: form.branch,
        manager: form.manager,
        budgetAmount: Number(form.budgetAmount),
        active: form.active,
      };

      await createCostCenter(payload);
      onCreated();
      onClose();
      alert("Cost center created");
    } catch (e) {
      console.error(e);
      alert("Failed to create cost center");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Cost Center</h2>
          <button onClick={onClose} className="text-slate-500">✕</button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Create a new cost center for budgeting and allocation
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4">

          {/* Name */}
          <div>
            <label className="text-sm text-slate-600">
              Cost Center Name *
            </label>
            <input
              className="w-full border rounded-md px-3 py-2 mt-1"
              placeholder="Enter cost center name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Code */}
          <div>
            <label className="text-sm text-slate-600">Cost Center Code</label>
            <input
              className="w-full border rounded-md px-3 py-2 mt-1 bg-slate-100"
              placeholder="Auto-generated"
              disabled
            />
          </div>

          {/* Branch */}
          <div>
            <label className="text-sm text-slate-600">Branch *</label>
            <select
              className="w-full border rounded-md px-3 py-2 mt-1"
              value={form.branch}
              onChange={(e) => handleChange("branch", e.target.value)}
            >
              <option value="">Select branch</option>
              <option>Kollam</option>
              <option>Trivandrum</option>
            </select>
          </div>

          {/* Manager */}
          <div>
            <label className="text-sm text-slate-600">Manager</label>
            <input
              className="w-full border rounded-md px-3 py-2 mt-1"
              value={form.manager}
              onChange={(e) => handleChange("manager", e.target.value)}
              placeholder="Select manager"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="text-sm text-slate-600">
              Budget Amount (AED)
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2 mt-1"
              value={form.budgetAmount}
              onChange={(e) =>
                handleChange("budgetAmount", e.target.value)
              }
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-sm text-slate-600">Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 mt-1"
            rows={3}
            value={form.description}
            onChange={(e) =>
              handleChange("description", e.target.value)
            }
            placeholder="Describe purpose and scope"
          />
        </div>

        {/* Active */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => handleChange("active", e.target.checked)}
          />
          <span className="text-sm text-slate-700">Cost Center is Active</span>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-emerald-700 text-white rounded-md"
          >
            Create Cost Center
          </button>
        </div>
      </div>
    </div>
  );
}
