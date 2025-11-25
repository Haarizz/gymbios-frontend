// src/components/EditProductPage.jsx
import React, { useEffect, useState } from "react";
import { getProductById, updateProduct } from "../api/product";
import { useNavigate, useParams } from "react-router-dom";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then(res => setForm(res.data))
      .catch(err => {
        console.error(err);
        alert("Failed to load product");
      });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProduct(id, {
        ...form,
        price: form.price ? parseFloat(form.price) : 0,
        stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity, 10) : 0
      });
      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Product Name *</label>
          <input name="name" value={form.name || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block text-sm mb-1">SKU *</label>
          <input name="sku" value={form.sku || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <input name="category" value={form.category || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block text-sm mb-1">Price</label>
          <input name="price" type="number" step="0.01" value={form.price ?? ""} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block text-sm mb-1">Unit</label>
          <input name="unit" value={form.unit || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block text-sm mb-1">Stock Quantity</label>
          <input name="stockQuantity" type="number" value={form.stockQuantity ?? 0} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm mb-1">Description</label>
          <textarea name="description" value={form.description || ""} onChange={handleChange} className="border rounded px-3 py-2 w-full" rows="4"></textarea>
        </div>

        <div className="col-span-2 flex gap-3 mt-2">
          <button disabled={saving} className="bg-teal-600 text-white px-4 py-2 rounded">{saving ? "Saving..." : "Save Changes"}</button>
          <button type="button" onClick={() => navigate("/products")} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
