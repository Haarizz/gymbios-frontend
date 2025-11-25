// /mnt/data/CategoriesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getCategories, deleteCategory } from "../api/category";

/**
 * Minimal CategoriesPage:
 * - Left fixed Sidebar (same pattern as ProductsPage)
 * - Right content area with ml-64
 * - Search by number/name
 * - List: Category No | Category Name | Description | Actions (Edit/Delete)
 * - Delete uses modal confirmation (no alert())
 * - Clicking a row opens the sidebar (via window.openSidebar() if available)
 *
 * This file purposely excludes product-like stats/cards/tabs/filters.
 */

function DeleteConfirmModal({ open, onClose, onConfirm, category }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-2">Confirm delete</h2>
        <p className="text-sm text-gray-700 mb-4">
          Are you sure you want to delete <strong>{category?.name ?? "this category"}</strong>?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
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

  // delete modal state
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
    // ensure sidebar visible when landing on this page (best-effort via API)
    if (typeof window !== "undefined" && typeof window.openSidebar === "function") {
      window.openSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = (query || "").toString().trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const num = (c.categoryNumber ?? "").toString().toLowerCase();
      return name.includes(q) || num.includes(q);
    });
  }, [categories, query]);

  const openDeleteModal = (category) => {
    setToDeleteCategory(category);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setToDeleteCategory(null);
    setDeleteModalOpen(false);
  };
  const confirmDelete = async () => {
    if (!toDeleteCategory) return;
    try {
      await deleteCategory(toDeleteCategory.id);
      await loadAll();
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      closeDeleteModal();
    }
  };

  const onCategoryClick = (category) => {
    // open the sidebar via its API (preferred to DOM hacks)
    if (typeof window !== "undefined" && typeof window.openSidebar === "function") {
      window.openSidebar();
    }

    // dispatch showCategory event so Sidebar (if listening) can display details
    try {
      if (typeof window !== "undefined" && typeof window.CustomEvent === "function") {
        window.dispatchEvent(new CustomEvent("showCategory", { detail: { category } }));
      }
    } catch (e) {
      // ignore if CustomEvent unsupported
    }
  };

  return (
    <div className="flex">
      {/* LEFT FIXED SIDEBAR */}
      <div className="w-64 h-screen fixed left-0 top-0 bg-white shadow">
        <Sidebar />
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="ml-64 w-full p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-gray-500 text-sm mt-1">Manage category list. Click a row to view details in the sidebar.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/categories/new")} className="px-4 py-2 bg-teal-600 text-white rounded-lg">+ Add Category</button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-3">
          <input
            placeholder="Search by number or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border rounded-lg px-3 py-2 w-80"
          />
          <button className="border rounded px-3 py-2" onClick={() => setQuery("")}>Clear</button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border p-4">
          <DeleteConfirmModal open={deleteModalOpen} onClose={closeDeleteModal} onConfirm={confirmDelete} category={toDeleteCategory} />

          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left">Category No</th>
                <th className="py-3 text-left">Category Name</th>
                <th className="py-3 text-left">Description</th>
                <th className="py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">No categories found.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => onCategoryClick(c)}>
                    <td className="py-3">{c.categoryNumber ?? "-"}</td>

                    <td
                      className="py-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryClick(c);
                      }}
                    >
                     <div className="font-medium">{c.name}</div>

                    </td>

                    <td className="py-3">{c.description}</td>

                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="text-teal-600 mr-4"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          navigate(`/categories/${c.id}/edit`);
                          // ensure sidebar visible after navigation
                          setTimeout(() => {
                            if (typeof window !== "undefined" && typeof window.openSidebar === "function") {
                              window.openSidebar();
                            }
                          }, 30);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="text-red-600"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openDeleteModal(c);
                        }}
                      >
                        Delete
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
}
