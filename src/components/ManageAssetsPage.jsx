// src/pages/ManageAssetsPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import AssetsTable from "../components/AssetsTable";
import AddAssetModal from "../components/AddAssetModal";
// <-- use your axios instance that adds the token
import api from "../api/axiosConfig"; // adjust path if your axiosconfig file is elsewhere
import { HiSearch, HiDownload, HiUpload, HiQrcode, HiClock } from "react-icons/hi";
import { X } from "lucide-react";

/** If your backend is at a different origin, set it here: */
const BACKEND = import.meta?.env?.VITE_API_URL || "http://localhost:8080";
const ASSET_PATH = "/api/assets"; // use relative path with api (api.baseURL points to backend)

/* helper functions kept unchanged */
function parseCurrencyNumber(str = "") {
  if (str == null) return 0;
  const digits = String(str).replace(/[^0-9.-]/g, "");
  if (!digits) return 0;
  return Number(digits.replace(/,/g, ""));
}

function parseDateString(v) {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(v + "T00:00:00");
    return isNaN(d) ? null : d;
  }
  const m = String(v).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const month = parseInt(m[1], 10) - 1;
    const day = parseInt(m[2], 10);
    const year = parseInt(m[3], 10);
    const d = new Date(year, month, day);
    return isNaN(d) ? null : d;
  }
  const d = new Date(v);
  return isNaN(d) ? null : d;
}

export default function ManageAssetsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [assets, setAssets] = useState([]);
  const [query, setQuery] = useState("");

  // Filters
  const [branch, setBranch] = useState("All Branches");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");

  // Date range
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const datePopoverRef = useRef(null);

  // Sorting
  const [sortField, setSortField] = useState("Name");
  const [sortAsc, setSortAsc] = useState(true);

  // Drawer and detail
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  const resetFilters = () => {
    setBranch("All Branches");
    setCategory("All Categories");
    setStatus("All Status");
    setQuery("");
    setSortField("Name");
    setSortAsc(true);
    setDateFrom("");
    setDateTo("");
    setDateRangeOpen(false);
  };

  // --- LOAD assets from backend (no dummy data) ---
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Use configured api instance (it has baseURL http://localhost:8080 and attaches token)
        const res = await api.get(ASSET_PATH);
        if (!mounted) return;
        setAssets(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch assets", err);
        setAssets([]); // keep UI empty on failure
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Add or update asset — called by modal save (will persist to backend)
  const handleSaveAsset = async (asset) => {
    if (!asset) return;
    try {
      // detect if asset id already exists on server (local list)
      const exists = assets.find((a) => a.id === asset.id);
      if (exists) {
        // UPDATE via PUT — use api and relative path
        const res = await api.put(
          `${ASSET_PATH}/${encodeURIComponent(asset.id)}`,
          asset
        );
        setAssets((prev) =>
          prev.map((p) => (p.id === res.data.id ? res.data : p))
        );
      } else {
        // CREATE via POST
        const res = await api.post(ASSET_PATH, asset);
        // if backend returns 201 and created object, add it
        setAssets((prev) => [res.data, ...prev]);
      }
      setShowAddModal(false);
      setEditAsset(null);
    } catch (err) {
      console.error("Save asset failed", err);
      // surface helpful message
      if (err.response) {
        console.error(
          "Response status:",
          err.response.status,
          err.response.data
        );
        if (err.response.status === 403) {
          alert("Save failed: Forbidden (403). Check your login/token.");
        } else if (err.response.status === 404) {
          alert("Save failed: API not found (404). Check backend endpoint path.");
        } else {
          alert("Failed to save asset. See console for details.");
        }
      } else {
        alert("Failed to save asset. Server unreachable or network error.");
      }
    }
  };

  // MARK FOR DISPOSAL — persist
  const handleMarkForDisposal = async (asset) => {
    if (!asset || !asset.id) return;
    if ((asset.status || "").toLowerCase() === "disposed") {
      alert("This asset is already disposed.");
      return;
    }
    const ok = window.confirm?.(
      `Mark ${asset.id} (${asset.name}) for disposal?`
    );
    if (!ok) return;

    const prev = assets;
    setAssets((prevA) =>
      prevA.map((a) =>
        a.id === asset.id
          ? { ...a, previousStatus: a.status || "In Use", status: "Disposed" }
          : a
      )
    );
    if (selectedAsset?.id === asset.id)
      setSelectedAsset((s) => ({
        ...s,
        previousStatus: s.status || "In Use",
        status: "Disposed",
      }));

    try {
      await api.patch(
        `${ASSET_PATH}/${encodeURIComponent(asset.id)}/dispose`
      );
    } catch (err) {
      console.error("Dispose API failed", err);
      setAssets(prev);
      if (selectedAsset?.id === asset.id)
        setSelectedAsset(prev.find((a) => a.id === asset.id) || null);
      alert("Failed to mark asset for disposal.");
    }
  };

  // REVERT DISPOSAL — persist
  const handleRevertDisposal = async (asset) => {
    if (!asset || !asset.id) return;
    if ((asset.status || "").toLowerCase() !== "disposed") {
      alert("This asset is not disposed.");
      return;
    }
    const ok = window.confirm?.(`Revert disposal for ${asset.id}?`);
    if (!ok) return;

    const prev = assets;
    setAssets((prevA) =>
      prevA.map((a) =>
        a.id === asset.id ? { ...a, status: "In Use" } : a
      )
    );
    if (selectedAsset?.id === asset.id)
      setSelectedAsset((s) => ({ ...s, status: "In Use" }));

    try {
      await api.patch(`${ASSET_PATH}/${encodeURIComponent(asset.id)}/revert`);
    } catch (err) {
      console.error("Revert API failed", err);
      setAssets(prev);
      if (selectedAsset?.id === asset.id)
        setSelectedAsset(prev.find((a) => a.id === asset.id) || null);
      alert("Failed to revert disposal.");
    }
  };

  // DELETE asset — persist
  const handleDeleteAsset = async (asset) => {
    if (!asset || !asset.id) return;
    const ok = window.confirm?.(
      `Delete ${asset.id} (${asset.name})? This cannot be undone.`
    );
    if (!ok) return;
    try {
      await api.delete(`${ASSET_PATH}/${encodeURIComponent(asset.id)}`);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
        setDrawerOpen(false);
      }
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete asset. See console for details.");
    }
  };

  // Derived KPI values, branches, categories, filtered list — unchanged
  const kpis = useMemo(() => {
    const totalValue = assets.reduce(
      (acc, a) => acc + parseCurrencyNumber(a.currentValue),
      0
    );
    const activeCount = assets.filter((a) => {
      const s = (a.status || "").toLowerCase();
      return s === "active" || s === "in use";
    }).length;
    const now = new Date();
    const in30 = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const maintenanceDue = assets.filter((a) => {
      const candidate =
        a.maintenanceDate ||
        a.nextMaintenance ||
        a.next_maintenance ||
        a.nextMaintenanceDate;
      if (!candidate) return false;
      const d = parseDateString(candidate);
      if (!d) return false;
      return d >= now && d <= in30;
    }).length;
    const disposalCount = assets.filter(
      (a) => (a.status || "").toLowerCase() === "disposed"
    ).length;
    return {
      totalValue,
      activeCount,
      maintenanceDue,
      disposalCount,
    };
  }, [assets]);

  const branches = useMemo(
    () => [
      "All Branches",
      ...Array.from(new Set(assets.map((a) => a.branch).filter(Boolean))),
    ],
    [assets]
  );
  const categories = useMemo(
    () => [
      "All Categories",
      ...Array.from(new Set(assets.map((a) => a.category).filter(Boolean))),
    ],
    [assets]
  );
  const statuses = useMemo(
    () => [
      "All Status",
      ...Array.from(new Set(assets.map((a) => a.status).filter(Boolean))),
    ],
    [assets]
  );

  const filtered = useMemo(() => {
    let list = assets.slice();
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((a) =>
        (a.id +
          " " +
          a.name +
          " " +
          a.model +
          " " +
          (a.location || "")
        )
          .toLowerCase()
          .includes(q)
      );
    }
    if (branch !== "All Branches")
      list = list.filter((a) => a.branch === branch);
    if (category !== "All Categories")
      list = list.filter((a) => a.category === category);
    if (status !== "All Status")
      list = list.filter((a) => a.status === status);

    if (dateFrom) {
      const from = parseDateString(dateFrom);
      if (from)
        list = list.filter((a) => {
          const pd = parseDateString(a.purchaseDate);
          return pd && pd >= from;
        });
    }
    if (dateTo) {
      const to = parseDateString(dateTo);
      if (to) {
        to.setHours(23, 59, 59, 999);
        list = list.filter((a) => {
          const pd = parseDateString(a.purchaseDate);
          return pd && pd <= to;
        });
      }
    }

    list.sort((x, y) => {
      let cmp = 0;
      if (sortField === "Name")
        cmp = (x.name || "").localeCompare(y.name || "");
      else if (sortField === "Date")
        cmp =
          (parseDateString(x.purchaseDate) || 0) -
          (parseDateString(y.purchaseDate) || 0);
      else if (sortField === "Cost")
        cmp =
          parseCurrencyNumber(x.cost) - parseCurrencyNumber(y.cost);
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [
    assets,
    query,
    branch,
    category,
    status,
    dateFrom,
    dateTo,
    sortField,
    sortAsc,
  ]);

  const handleView = (asset) => {
    setSelectedAsset(asset);
    setActiveTab("Overview");
    setDrawerOpen(true);
  };

  const handleEdit = (asset) => {
    setEditAsset(asset);
    setShowAddModal(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedAsset(null), 250);
  };

  const calcDepreciation = (asset) => {
    if (!asset)
      return {
        original: 0,
        current: 0,
        rate: 0,
        totalDep: 0,
        progressPct: 0,
      };
    const original = parseCurrencyNumber(asset.cost);
    const current = parseCurrencyNumber(
      asset.currentValue || asset.cost
    );
    const rate = Number.isFinite(Number(asset.depreciationRate))
      ? Number(asset.depreciationRate)
      : 0;
    const pd =
      parseDateString(asset.purchaseDate) || new Date();
    const years = Math.max(
      0,
      (new Date().getTime() - pd.getTime()) /
        (1000 * 60 * 60 * 24 * 365)
    );
    const totalDep = Math.round(
      original * (rate / 100) * years
    );
    const progressPct = original
      ? Math.min(
          100,
          Math.max(0, Math.round((totalDep / original) * 100))
        )
      : 0;
    return { original, current, rate, totalDep, progressPct };
  };

  const depInfo = calcDepreciation(selectedAsset);
  const progressPctSafe = Number.isFinite(depInfo.progressPct)
    ? Math.max(0, Math.min(100, depInfo.progressPct))
    : 0;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* MAIN CONTENT (no ml-64 here, Layout already has sidebar) */}
      <div className="flex-1 p-6 text-[14px]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Assets Register
            </h1>
            <p className="text-gray-500 text-sm">
              Comprehensive asset management and tracking system
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                placeholder="Global search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border border-gray-300 rounded-full px-4 py-1.5 w-64 text-sm"
              />
            </div>

            <button className="px-3 py-1.5 border border-gray-300 rounded-md flex items-center gap-1 text-sm">
              <HiUpload /> Import
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md flex items-center gap-1 text-sm">
              <HiDownload /> Export
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md flex items-center gap-1 text-sm">
              <HiQrcode /> QR Scan
            </button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md flex items-center gap-1 text-sm">
              <HiClock /> Asset History
            </button>

            <button
              onClick={() => {
                setEditAsset(null);
                setShowAddModal(true);
              }}
              className="px-4 py-1.5 bg-emerald-700 text-white rounded-md text-sm"
            >
              + Add Asset
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="rounded-lg p-4 bg-teal-50 border border-teal-300/50 text-sm flex items-center gap-3">
            <div className="rounded-full h-10 w-10 bg-teal-200/50 flex items-center justify-center text-teal-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-3H8v-2h3V8h2v3h3v2h-3v3z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-600">
                Total Assets Value
              </div>
              <div className="text-xl font-bold text-teal-700">
                {kpis.totalValue.toLocaleString()} AED
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 bg-green-50 border border-green-300/50 text-sm flex items-center gap-3">
            <div className="rounded-full h-10 w-10 bg-green-200/50 flex items-center justify-center text-green-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8.59 10 17z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-600">
                Active Assets
              </div>
              <div className="text-xl font-bold text-green-700">
                {kpis.activeCount}
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 bg-yellow-50 border border-yellow-300/50 text-sm flex items-center gap-3">
            <div className="rounded-full h-10 w-10 bg-yellow-200/50 flex items-center justify-center text-yellow-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11 15h2v2h-2zm0-8h2v6h-2zm0-4h2v2h-2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-600">
                Maintenance Due (30 days)
              </div>
              <div className="text-xl font-bold text-yellow-700">
                {kpis.maintenanceDue}
              </div>
            </div>
          </div>

          <div className="rounded-lg p-4 bg-red-50 border border-red-300/50 text-sm flex items-center gap-3">
            <div className="rounded-full h-10 w-10 bg-red-200/50 flex items-center justify-center text-red-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.71 14.29L12 12.59l-3.71 3.7a1 1 0 01-1.41-1.41L10.59 12l-3.7-3.71a1 1 0 011.41-1.41L12 10.59l3.71-3.7a1 1 0 011.41 1.41L13.41 12l3.7 3.71a1 1 0 01-1.41 1.41z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-600">
                Assets for Disposal
              </div>
              <div className="text-xl font-bold text-red-700">
                {kpis.disposalCount}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and table */}
        <div className="bg-white rounded-lg border p-3 mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-1.5 border rounded text-sm"
            >
              {branches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 border rounded text-sm"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 border rounded text-sm"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <div className="relative" ref={datePopoverRef}>
              <button
                onClick={() => setDateRangeOpen((v) => !v)}
                className="px-3 py-1.5 border rounded text-sm"
              >
                Purchase Date Range ▾
              </button>

              {dateRangeOpen && (
                <div className="absolute z-40 mt-1 p-3 bg-white border rounded shadow w-72">
                  <div className="text-xs text-gray-500 mb-2">
                    Select date range
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="border rounded p-1 text-sm w-1/2"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="border rounded p-1 text-sm w-1/2"
                    />
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                        setDateRangeOpen(false);
                      }}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setDateRangeOpen(false)}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={resetFilters}
              className="px-3 py-1.5 border rounded text-sm"
            >
              Reset Filters
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-gray-500 text-xs mr-1">
              Sort by:
            </div>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="px-3 py-1.5 border rounded text-sm"
            >
              <option value="Name">Name</option>
              <option value="Date">Date</option>
              <option value="Cost">Cost</option>
            </select>
            <button
              onClick={() => setSortAsc((s) => !s)}
              className="px-3 py-1.5 border rounded text-sm"
            >
              {sortAsc ? "↑" : "↓"}
            </button>
          </div>
        </div>

        <AssetsTable
          data={filtered}
          onView={handleView}
          onEdit={handleEdit}
          onMarkForDisposal={handleMarkForDisposal}
          onRevertDisposal={handleRevertDisposal}
          onDelete={handleDeleteAsset}
        />

        {showAddModal && (
          <AddAssetModal
            onClose={() => {
              setShowAddModal(false);
              setEditAsset(null);
            }}
            onSave={handleSaveAsset}
            initialData={editAsset || undefined}
          />
        )}
      </div>

      {/* RIGHT DETAIL DRAWER */}
      <div
        className={`fixed top-0 right-0 h-screen bg-white border-l z-40 shadow-lg overflow-auto transition-transform duration-300 ease-in-out`}
        style={{
          width: "420px",
          transform: drawerOpen ? "translateX(0)" : "translateX(420px)",
        }}
        aria-hidden={!drawerOpen}
      >
        <div className="p-4 border-b flex items-start justify-between sticky top-0 bg-white z-50">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 text-emerald-800 h-10 w-10 flex items-center justify-center font-semibold">
              {selectedAsset?.name
                ?.split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="font-semibold">
                {selectedAsset?.name}
              </div>
              <div className="text-xs text-gray-500">
                {selectedAsset?.id} • {selectedAsset?.model}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeDrawer}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-3 border-b sticky top-[68px] bg-white z-40">
          <div className="flex gap-2">
            {["Overview", "Maintenance", "Depreciation", "Transfers"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    activeTab === tab
                      ? "bg-white border-gray-300 font-semibold shadow-sm"
                      : "bg-white text-gray-600 border-transparent hover:border-gray-200"
                  }`}
                  style={{ minWidth: 86, textAlign: "center" }}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {activeTab === "Overview" && (
            <>
              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Asset Information
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">
                      Category
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.category || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">
                      Subcategory
                    </div>
                    <div className="font-medium">-</div>
                  </div>

                  <div>
                    <div className="text-gray-500 text-xs">
                      Serial Number
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.serial || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">
                      Vendor
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.vendor || "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500 text-xs">
                      Purchase Date
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.purchaseDate || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">
                      Warranty Expiry
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.warrantyExpiry || "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Status & Location
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">
                      Current Status
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.status || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">
                      Condition
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.condition || "-"}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-gray-500 text-xs">
                      Current Location
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.location || "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Financial Summary
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">
                      Purchase Price
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.cost || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">
                      Current Value
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.currentValue || "-"}
                    </div>
                  </div>

                  <div className="col-span-2 text-xs text-rose-600">
                    {depInfo.rate
                      ? `${depInfo.rate}% annually`
                      : ""}
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Notes
                </div>
                <div className="text-sm text-gray-700">
                  {selectedAsset?.notes || "-"}
                </div>
              </div>
            </>
          )}

          {activeTab === "Maintenance" && (
            <>
              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Maintenance Schedule
                </div>
                <div className="text-sm">
                  <div className="p-3 bg-yellow-50 rounded">
                    <div className="text-xs text-gray-500">
                      Next Maintenance Due
                    </div>
                    <div className="font-medium">
                      {selectedAsset?.maintenanceDate ||
                        "Not scheduled"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Maintenance History
                </div>
                <div className="space-y-3">
                  {(selectedAsset?.maintenanceHistory || [])
                    .length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No maintenance records.
                    </div>
                  ) : (
                    selectedAsset.maintenanceHistory.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 border rounded"
                      >
                        <div className="text-sm font-medium">
                          {m.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {m.date} • {m.cost}
                        </div>
                        <div className="text-sm mt-1 text-gray-700">
                          {m.details}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "Depreciation" && (
            <>
              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Depreciation Overview
                </div>
                <div className="p-3 bg-emerald-50 rounded">
                  <div className="text-lg font-semibold">
                    {depInfo.rate ? `${depInfo.rate}%` : "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Depreciation (estimated)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                  <div className="bg-white p-3 border rounded">
                    <div className="text-xs text-gray-500">
                      Original Value
                    </div>
                    <div className="font-medium">
                      {depInfo.original.toLocaleString()} AED
                    </div>
                  </div>
                  <div className="bg-white p-3 border rounded">
                    <div className="text-xs text-gray-500">
                      Current Value
                    </div>
                    <div className="font-medium">
                      {depInfo.current.toLocaleString()} AED
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm">
                  <div className="text-xs text-gray-500">
                    Depreciation Progress
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded mt-2">
                    <div
                      className="h-2 bg-emerald-500 rounded"
                      style={{ width: `${progressPctSafe}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Annual Rate: {depInfo.rate}%
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "Transfers" && (
            <>
              <div className="bg-white border rounded p-3">
                <div className="text-sm text-gray-600 mb-2 font-medium">
                  Transfer History
                </div>
                <div className="space-y-3">
                  {(selectedAsset?.transferHistory || [])
                    .length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No transfer history.
                    </div>
                  ) : (
                    selectedAsset.transferHistory.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 border rounded"
                      >
                        <div className="text-sm font-medium">
                          {t.from} → {t.to}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.date}
                        </div>
                        <div className="text-sm mt-1 text-gray-700">
                          {t.reason}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
