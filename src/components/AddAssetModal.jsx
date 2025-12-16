// src/components/AddAssetModal.jsx
import React, { useState, useEffect } from "react";

/**
 * AddAssetModal
 * - purchasePrice: number (float) — stored as string "NNN AED" in backend
 * - warranty: integer (years)
 * - depreciationRate: number (percent)
 *
 * Changes made:
 * - make handleSave async and await onSave
 * - add `saving` state to disable button while request runs
 * - better parsing of initialData numeric fields
 * - keep form data when save fails so user can retry
 */

export default function AddAssetModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    name: "",
    serial: "",
    assetCode: "",
    vendor: "",
    model: "",
    branch: "",
    category: "",
    location: "",
    purchasePrice: "", // number or empty string
    warranty: "", // integer or empty string
    purchaseDate: "",
    depreciationRate: "", // number or empty string
    status: "In Use",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      const parsePrice = (v) => {
        if (v === null || v === undefined || v === "") return "";
        try {
          const n = Number(String(v).replace(/[^0-9.-]/g, ""));
          return isNaN(n) ? "" : n;
        } catch {
          return "";
        }
      };

      const parseNumberString = (v) => {
        if (v === null || v === undefined || v === "") return "";
        const n = String(v).replace(/[^0-9.-]/g, "");
        return n === "" ? "" : n;
      };

      setForm({
        name: initialData.name || "",
        serial: initialData.serial || "",
        assetCode: initialData.id || initialData.assetCode || `AST-${Date.now()}`,
        vendor: initialData.vendor || "",
        model: initialData.model || "",
        branch: initialData.branch || "",
        category: initialData.category || "",
        location: initialData.location || "",
        purchasePrice: parsePrice(initialData.cost || initialData.purchasePrice),
        warranty: parseNumberString(initialData.warrantyExpiry || initialData.warranty || ""),
        purchaseDate: initialData.purchaseDate || "",
        depreciationRate:
          initialData.depreciationRate !== undefined && initialData.depreciationRate !== null
            ? String(initialData.depreciationRate)
            : "",
        status: initialData.status || "In Use",
        notes: initialData.notes || "",
      });
    } else {
      setForm((f) => ({ ...f, assetCode: `AST-${Date.now()}` }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "purchasePrice") {
      // allow blank or numeric
      if (value === "") {
        setForm((p) => ({ ...p, [name]: "" }));
        return;
      }
      // keep value as-is (input[type=number] will give sanitized values)
      setForm((p) => ({ ...p, [name]: value }));
      return;
    }

    if (name === "warranty") {
      if (value === "") {
        setForm((p) => ({ ...p, [name]: "" }));
        return;
      }
      const digits = value.replace(/[^\d]/g, "");
      setForm((p) => ({ ...p, [name]: digits }));
      return;
    }

    if (name === "depreciationRate") {
      if (value === "") {
        setForm((p) => ({ ...p, [name]: "" }));
        return;
      }
      const numeric = value.replace(/[^0-9.]/g, "");
      setForm((p) => ({ ...p, [name]: numeric }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  // Make handleSave async and await the parent's onSave.
  const handleSave = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    // basic validation
    if (!form.assetCode || !form.name) {
      alert("Please provide at least Asset Code and Asset Name.");
      return;
    }

    // Build payload as before
    const asset = {
      id: form.assetCode,
      name: form.name,
      serial: form.serial,
      model: form.model,
      vendor: form.vendor,
      branch: form.branch,
      category: form.category,
      location: form.location,
      cost:
        form.purchasePrice === "" || form.purchasePrice === null
          ? undefined
          : `${Number(form.purchasePrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} AED`,
      currentValue:
        form.purchasePrice === "" || form.purchasePrice === null
          ? undefined
          : `${Number(form.purchasePrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} AED`,
      purchaseDate: form.purchaseDate || undefined,
      warrantyExpiry: form.warranty ? `${form.warranty} years` : undefined,
      depreciationRate: form.depreciationRate === "" ? undefined : parseFloat(form.depreciationRate),
      status: form.status || "In Use",
      notes: form.notes || "",
    };

    try {
      setSaving(true);
      // IMPORTANT: await parent's onSave which should perform API call.
      // Parent (ManageAssetsPage) will update list on success.
      await onSave(asset);
      // If onSave resolves, close modal
      setSaving(false);
      // parent likely closes modal (ManageAssetsPage hides the modal via state)
      // But we keep safe behavior and call onClose only if parent doesn't close
      // (you can remove this if parent closes modal reliably)
      onClose?.();
    } catch (err) {
      console.error("Save failed in modal:", err);
      // keep modal open and let user correct — show a friendly message
      alert("Save failed. See console for details. Make sure you are authenticated and server is reachable.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[620px] rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-semibold">{initialData ? "Edit Asset" : "Add New Asset"}</h2>
            <p className="text-sm text-gray-500">Register a new asset in the system with complete details</p>
          </div>
          <button onClick={onClose} aria-label="close" className="text-gray-500 hover:bg-gray-100 p-1 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <label className="text-xs text-gray-600">Asset Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Enter asset name" className="w-full px-3 py-1.5 border rounded" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Serial Number</label>
              <input name="serial" value={form.serial} onChange={handleChange} placeholder="Enter serial number" className="w-full px-3 py-1.5 border rounded" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Asset Code</label>
              <input name="assetCode" value={form.assetCode} onChange={handleChange} className="w-full px-3 py-1.5 border rounded" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Vendor</label>
              <input name="vendor" value={form.vendor} onChange={handleChange} placeholder="Enter vendor name" className="w-full px-3 py-1.5 border rounded" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Model</label>
              <input name="model" value={form.model} onChange={handleChange} placeholder="Enter model/brand" className="w-full px-3 py-1.5 border rounded" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Branch</label>
              <select name="branch" value={form.branch} onChange={handleChange} className="w-full px-3 py-1.5 border rounded">
                <option value="">Select branch</option>
                <option>Dubai Branch</option>
                <option>Marina Branch</option>
                <option>Downtown Dubai</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-1.5 border rounded">
                <option value="">Select category</option>
                <option>Equipment</option>
                <option>IT</option>
                <option>Furniture</option>
                <option>Facilities</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Specific location within branch" className="w-full px-3 py-1.5 border rounded" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Purchase Price (AED)</label>
              <input
                name="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                value={form.purchasePrice}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-1.5 border rounded"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Warranty Period (Years)</label>
              <input
                name="warranty"
                type="number"
                min="0"
                step="1"
                value={form.warranty}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-1.5 border rounded"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Purchase Date</label>
              <input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} className="w-full px-3 py-1.5 border rounded" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Depreciation Rate (%)</label>
              <input
                name="depreciationRate"
                type="number"
                min="0"
                step="0.1"
                value={form.depreciationRate}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-1.5 border rounded"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-600">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full px-3 py-1.5 border rounded" rows={2} placeholder="Optional notes" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button type="button" onClick={onClose} className="px-4 py-1.5 border rounded text-gray-700" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 bg-emerald-700 text-white rounded" disabled={saving}>
              {saving ? "Saving…" : initialData ? "Save" : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
