import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCategories, deleteCategory } from "../api/category";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  List,
  Folder,
  X,
  AlertTriangle
} from "lucide-react";

function DeleteConfirmModal({ open, onClose, onConfirm, category }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">

        <div className="flex items-center mb-4">
          <AlertTriangle className="text-red-500 mr-3" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Confirm Deletion</h2>
        </div>

        <p className="text-sm text-gray-700 mb-6">
          Are you sure you want to delete category
          <strong className="text-red-600"> "{category?.name}"</strong>?  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 size={18} className="inline mr-1" /> Delete
          </button>
        </div>

      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDeleteCategory, setToDeleteCategory] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res?.data || []);
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((c) => {
      const name = c.name?.toLowerCase() || "";
      const num = c.categoryNumber?.toString().toLowerCase() || "";
      return name.includes(q) || num.includes(q);
    });
  }, [categories, query]);

  const openDeleteModal = (cat) => {
    setToDeleteCategory(cat);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setToDeleteCategory(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(toDeleteCategory.id);
      await loadAll();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Folder size={30} className="text-teal-600" /> Categories
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your inventory classification. Click a row to view details.
          </p>
        </div>

        <button
          onClick={() => navigate("/categories/new")}
          className="flex items-center gap-2 px-5 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 shadow"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            placeholder="Search by number or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          onClick={() => setQuery("")}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
        >
          <X size={16} className="inline mr-1" /> Clear
        </button>
      </div>

      {/* MAIN TABLE CARD */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">

        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          category={toDeleteCategory}
        />

        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Category No</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Category Name</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</th>
              <th className="py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-teal-600">Loading categories...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">No categories found.</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-teal-50 transition cursor-pointer"
                >
                  <td className="py-3 px-6 font-medium">{c.categoryNumber}</td>
                  <td className="py-3 px-6 font-semibold text-teal-700">{c.name}</td>
                  <td className="py-3 px-6 text-gray-600">{c.description}</td>

                  <td className="py-3 px-6 text-center">
                    <div className="flex justify-center gap-4">

                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/categories/${c.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => openDeleteModal(c)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* FOOTER */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
            <List size={16} className="inline mr-1" />
            Showing {filtered.length} of {categories.length} total categories
          </div>
        </div>

      </div>
    </div>
  );
}
