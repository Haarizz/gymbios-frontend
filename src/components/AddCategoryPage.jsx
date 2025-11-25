// /mnt/data/AddCategoryPage.jsx
import React, { useState } from "react";
import { createCategory, getCategories } from "../api/category";
import { useNavigate } from "react-router-dom";

/**
 * AddCategoryPage
 * - Validates required fields
 * - Checks for duplicate categoryNumber (client-side) and shows modal if exists
 * - Shows "Category added" on success
 */

function DuplicateModal({ open, onClose, existingCategory }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-2">Duplicate category number</h2>
        <p className="text-sm text-gray-700 mb-4">
          The category number <strong>{existingCategory?.categoryNumber}</strong> already
          exists for category <strong>{existingCategory?.name}</strong>.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [categoryNumber, setCategoryNumber] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // validation state
  const [errors, setErrors] = useState({});

  // duplicate modal state
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [existingCategory, setExistingCategory] = useState(null);

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!categoryNumber.toString().trim()) {
      newErrors.categoryNumber = "Category number is required";
    }
    if (!name.trim()) {
      newErrors.name = "Category name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check duplicate category number (trimmed string comparison)
  const checkDuplicate = async (num) => {
    try {
      const res = await getCategories();
      const list = res?.data || [];
      const q = (num ?? "").toString().trim().toLowerCase();
      if (!q) return null;
      return list.find(
        (c) => (c.categoryNumber ?? "").toString().trim().toLowerCase() === q
      );
    } catch (err) {
      // if API fails, assume no duplicate (or you could surface an error)
      console.error("Failed to check duplicate category number", err);
      return null;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // check duplicate
    const dup = await checkDuplicate(categoryNumber);
    if (dup) {
      setExistingCategory(dup);
      setDuplicateOpen(true);
      return; // stop submission
    }

    setSaving(true);
    setSuccessMessage("");
    try {
      await createCategory({
        name,
        categoryNumber,
        description,
      });

      setSuccessMessage("Category added");
      setName("");
      setCategoryNumber("");
      setDescription("");
      setErrors({});
    } catch (err) {
      console.error("Create failed", err);
      // optionally set an error state to show to the user
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMessage(""), 2500);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <DuplicateModal
        open={duplicateOpen}
        onClose={() => {
          setDuplicateOpen(false);
          setExistingCategory(null);
        }}
        existingCategory={existingCategory}
      />

      <h1 className="text-2xl font-bold mb-4">Add Category</h1>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Category Number */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Category No <span className="text-red-600">*</span>
          </label>
          <input
            value={categoryNumber}
            onChange={(e) => setCategoryNumber(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. 101"
          />
          {errors.categoryNumber && (
            <p className="text-red-600 text-sm mt-1">
              {errors.categoryNumber}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Category name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Category"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
