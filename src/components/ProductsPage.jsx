import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  getProducts,
  deleteProduct,
  getProductsStats,
  getProductCategories,
} from "../api/product";

function StatCard({ title, subtitle, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
}

function CategoryCard({ name, count }) {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2L20 7v10l-8 5-8-5V7z"
            stroke="#6b7280"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-gray-500">{count} products</div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Inventory");

  const loadAll = async () => {
    try {
      const [pRes, sRes, cRes] = await Promise.all([
        getProducts(),
        getProductsStats(),
        getProductCategories(),
      ]);
      setProducts(pRes.data || []);
      setStats(sRes.data || {});
      setCategories(cRes.data || []);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="flex">
      {/* LEFT FIXED SIDEBAR */}
      <div className="w-64 h-screen fixed left-0 top-0 bg-white shadow">
        <Sidebar />
      </div>

      {/* RIGHT CONTENT AREA */}
      <div className="ml-64 w-full p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your gym’s complete product inventory including
              supplements, equipment, merchandise, and café items.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded-lg">Export</button>
            <button
              onClick={() => navigate("/products/new")}
              className="px-5 py-2 bg-teal-600 text-white rounded-lg"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Products"
            value={stats.total || "—"}
            subtitle={`${stats.active || 0} active, ${
              stats.inactive || 0
            } inactive`}
          />
          <StatCard
            title="Inventory Value"
            value={stats.inventoryValue || "—"}
            subtitle="Total stock valuation"
          />
          <StatCard
            title="Stock Alerts"
            value={stats.stockAlerts || "—"}
            subtitle={`${stats.lowStock || 0} low stock • ${
              stats.outOfStock || 0
            } out of stock`}
          />
          <StatCard
            title="Product Variants"
            value={stats.variants || "—"}
            subtitle="with recipes"
          />
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="mb-4 font-medium">Product Categories</h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.length === 0 ? (
              <div className="text-gray-500 col-span-4">No categories yet</div>
            ) : (
              categories.map((c) => (
                <CategoryCard key={c.name} name={c.name} count={c.count} />
              ))
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border p-4 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex gap-5">
              {["Inventory", "Analytics", "Reports", "Settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 ${
                    activeTab === tab
                      ? "border-b-2 border-teal-600 text-teal-600"
                      : "text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                placeholder="Search products by name or SKU..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border rounded-lg px-3 py-2 w-72"
              />
              <select className="border rounded-lg px-3 py-2">
                <option>All Categories</option>
              </select>
              <select className="border rounded-lg px-3 py-2">
                <option>All Status</option>
              </select>
              <button className="border rounded-lg px-3 py-2">Filter</button>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl border p-4">
          {filtered.length === 0 ? (
            <div>No products found.</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Product</th>
                  <th className="py-3 text-left">SKU</th>
                  <th className="py-3 text-left">Category</th>
                  <th className="py-3 text-left">Price</th>
                  <th className="py-3 text-left">Stock</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        {p.description}
                      </div>
                    </td>
                    <td>{p.sku}</td>
                    <td>{p.category || "-"}</td>
                    <td>{p.price}</td>
                    <td>{p.stockQuantity}</td>
                    <td>
                      <span
                        className={
                          p.status === "ACTIVE"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {p.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="text-teal-600 mr-4"
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600"
                        onClick={async () => {
                          if (!window.confirm("Delete product?")) return;
                          await deleteProduct(p.id);
                          loadAll();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
