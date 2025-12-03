// src/pages/Ledgers/AccountModal.jsx
import { useEffect, useState } from "react";
import { createAccount, getCostCenters } from "../api/ledgerApi";

export default function AccountModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    accountGroup: "",
    subGroup: "",
    branch: "",
    costCenterId: "",
    openingBalance: 0,
    balanceType: "Debit",
    description: "",
    active: true,
  });

  const [costCenters, setCostCenters] = useState([]);
  const [loadingCostCenters, setLoadingCostCenters] = useState(false);

  // ✅ load cost centers when modal opens
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCostCenters(true);
        const res = await getCostCenters();
        setCostCenters(res.data || []);
      } catch (err) {
        console.error("Failed to load cost centers", err);
      } finally {
        setLoadingCostCenters(false);
      }
    };
    load();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        accountGroup: form.accountGroup,
        branch: form.branch,
        costCenterId: form.costCenterId
          ? Number(form.costCenterId)
          : null,
        openingBalance: form.openingBalance
          ? Number(form.openingBalance)
          : 0,
        active: form.active,
        // accountCode is intentionally omitted -> backend auto generates
      };

      await createAccount(payload);
      if (onCreated) onCreated();
      onClose();
      alert("Account created successfully");
    } catch (err) {
      console.error("Failed to create account", err);
      alert("Failed to create account");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-slate-800">
            Add New Account
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Create a new account in your chart of accounts
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Name */}
            <div>
              <label className="text-slate-600">Account Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter account name"
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Account Code (auto) */}
            <div>
              <label className="text-slate-600">Account Code</label>
              <input
                type="text"
                disabled
                value="Auto-generated"
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 bg-slate-50 text-slate-400"
              />
            </div>

            {/* Account Group */}
            <div>
              <label className="text-slate-600">Account Group *</label>
              <select
                required
                value={form.accountGroup}
                onChange={(e) =>
                  handleChange("accountGroup", e.target.value)
                }
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 bg-white"
              >
                <option value="">Select account group</option>
                <option>Assets</option>
                <option>Liabilities</option>
                <option>Income</option>
                <option>Expenses</option>
                <option>Equity</option>
              </select>
            </div>

            {/* Sub Group (UI only) */}
            <div>
              <label className="text-slate-600">Sub Group</label>
              <input
                type="text"
                value={form.subGroup}
                onChange={(e) => handleChange("subGroup", e.target.value)}
                placeholder="e.g., Current Assets"
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2"
              />
            </div>

            {/* Branch */}
            <div>
              <label className="text-slate-600">Branch</label>
              <select
                value={form.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 bg-white"
              >
                <option value="">Select branch</option>
                <option>Kollam</option>
                <option>Trivandrum</option>
              </select>
            </div>

            {/* Cost Center – dropdown list */}
            <div>
              <label className="text-slate-600">Cost Center</label>
              <select
                value={form.costCenterId}
                onChange={(e) =>
                  handleChange("costCenterId", e.target.value)
                }
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 bg-white"
              >
                <option value="">Select cost center</option>
                {loadingCostCenters && (
                  <option disabled>Loading...</option>
                )}
                {!loadingCostCenters &&
                  costCenters.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Opening Balance */}
            <div>
              <label className="text-slate-600">Opening Balance</label>
              <input
                type="number"
                value={form.openingBalance}
                onChange={(e) =>
                  handleChange("openingBalance", e.target.value)
                }
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2"
              />
            </div>

            {/* Balance Type (UI only) */}
            <div>
              <label className="text-slate-600">Balance Type</label>
              <select
                value={form.balanceType}
                onChange={(e) =>
                  handleChange("balanceType", e.target.value)
                }
                className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2 bg-white"
              >
                <option>Debit</option>
                <option>Credit</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-slate-600">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              placeholder="Optional description for this account"
              className="mt-1 w-full border border-slate-200 rounded-md px-3 py-2"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => handleChange("active", e.target.checked)}
            />
            <span className="text-slate-700 text-sm">Account is Active</span>
          </div>

          {/* Buttons */}
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-emerald-700 text-white text-sm font-medium"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
