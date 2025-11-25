// src/components/AddProductPage.jsx
import React, { useState } from "react";
import { createProduct } from "../api/product";
import { useNavigate } from "react-router-dom";

export default function AddProductPage() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    price: "",
    unit: "",
    stockQuantity: "",
    status: "ACTIVE"
  });

  const categoryOptions = [
    "Supplements",
    "Equipment",
    "Merchandise",
    "Café Items",
  ];

  const unitOptions = [
    "Piece",
    "Box",
    "Bottle",
    "Pack",
    "Kg",
    "Gram",
    "Liter",
    "ML",
    "Dozen",
    "Pair",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createProduct({
        ...form,
        price: form.price ? parseFloat(form.price) : 0,
        stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : 0,
      });

      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Add New Product
        </h1>

        <button
          onClick={() => navigate("/products")}
          className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>

      {/* Card Section */}
      <div className="bg-white shadow-md rounded-xl border p-6">
        {/* Section Title */}
        <h2 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">
          Basic Product Information
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* PRODUCT NAME */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="border rounded-lg px-3 py-2 w-full bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              SKU / Product Code *
            </label>
            <input
              name="sku"
              required
              value={form.sku}
              onChange={handleChange}
              placeholder="Enter SKU or product code"
              className="border rounded-lg px-3 py-2 w-full bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Category</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* UNIT */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Unit
            </label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">Select unit</option>
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              className="border rounded-lg px-3 py-2 w-full bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* STOCK */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={form.stockQuantity}
              onChange={handleChange}
              placeholder="0"
              className="border rounded-lg px-3 py-2 w-full bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="4"
              className="border rounded-lg px-3 py-2 w-full bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {/* STATUS */}
          <div className="col-span-2 flex items-center gap-3 mt-2">
            <label className="text-sm font-semibold text-gray-700">
              Active Status
            </label>

            <span
              className={`px-3 py-1 text-sm rounded-full ${
                form.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {form.status === "ACTIVE" ? "Active" : "Inactive"}
            </span>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div className="col-span-2 mt-4 flex gap-4">
            <button
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg shadow"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border rounded-lg hover:bg-red"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
