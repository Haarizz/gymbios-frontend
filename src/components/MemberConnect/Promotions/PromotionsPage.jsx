import React, { useState, useEffect } from "react";
import CreatePromotionModal from "./CreatePromotionModal";
import { getPromotions, deletePromotion } from "../../../api/promotionApi";
import toast from "react-hot-toast";

// StatBox unchanged from your version
const StatBox = ({ title, value, unit, change, colorClass }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[120px] max-w-[calc(100%/8 - 12px)]">
    <div className="text-sm font-medium text-gray-500">{title}</div>
    <div className="flex items-end justify-between mt-1">
      <span className="text-xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-xs font-normal ml-1">{unit}</span>}
      </span>
      {change && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass}`}>{change}</span>
      )}
    </div>
  </div>
);

// PromotionCard updated to format discount properly
const PromotionCard = ({ promotion }) => {
  const typeTagColor = {
    Combo: "bg-purple-600",
    Seasonal: "bg-orange-600",
    Loyalty: "bg-pink-600",
    Discount: "bg-teal-600",
  };
  const statusColor = {
    Active: "bg-green-100 text-green-700",
    Scheduled: "bg-blue-100 text-blue-700",
    Expired: "bg-red-100 text-red-700",
    Draft: "bg-yellow-100 text-yellow-700",
  };

  const typeColor = typeTagColor[promotion.promotionType] || "bg-gray-500";
  const statusBg = statusColor[promotion.status] || "bg-gray-200 text-gray-700";

  // discount formatting: use discountType to decide suffix
  const discountText =
    promotion.discountType === "Percentage"
      ? `${promotion.discountValue ?? 0}% OFF`
      : promotion.discountType === "FixedAmount"
      ? `${promotion.discountValue ?? 0} AED OFF`
      : "View Offer";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex gap-2 mb-3">
          {promotion.promotionType && (
            <span className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${typeColor}`}>{promotion.promotionType}</span>
          )}
          {promotion.status && <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusBg}`}>{promotion.status}</span>}
        </div>

        <h3 className="text-md font-semibold text-gray-800 mb-1">{promotion.promotionName}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{promotion.description}</p>

        <div className="text-center my-4">
          <span className={`inline-block px-4 py-3 text-lg font-bold text-white rounded-xl shadow-md ${typeColor}`}>{discountText}</span>
        </div>
      </div>

      <div className="pt-3 border-t mt-auto">
        <div className="text-xs text-gray-600 mb-2">
          <span>Valid until: <strong>{promotion.endDate || "N/A"}</strong></span>
        </div>

        <div className="mb-3">
          <div className="text-xs flex justify-between text-gray-500">
            <span>Usage Progress</span>
            <span>{promotion.currentUsage ?? 0} / {promotion.usageLimitPerMember ?? (promotion.totalUsageLimit ?? 100)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div className={`h-1 rounded-full ${typeColor}`} style={{ width: `${promotion.currentUsage ? (promotion.currentUsage / (promotion.usageLimitPerMember || (promotion.totalUsageLimit || 100))) * 100 : 0}%` }}></div>
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-2">Code: {promotion.promotionCode || "N/A"}</div>
      </div>
    </div>
  );
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState({ mode: "create", id: null });
  const [viewMode, setViewMode] = useState("Grid");

  const openCreate = () => { setModalMode({ mode: "create", id: null }); setShowModal(true); };
  const openEdit = (id) => { setModalMode({ mode: "edit", id }); setShowModal(true); };

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const data = await getPromotions();
      const enhancedData = (data || []).map(p => ({
        ...p,
        // ensure numeric fields are numbers (backend should send numbers; this is defensive)
        discountValue: p.discountValue != null ? Number(p.discountValue) : null,
        currentUsage: p.currentUsage || 0,
        totalUsageLimit: p.totalUsageLimit || 100,
        usageLimitPerMember: p.usageLimitPerMember || p.totalUsageLimit || 100,
      }));
      setPromotions(enhancedData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPromotions(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this promotion?")) return;
    try {
      await deletePromotion(id);
      toast.success("Promotion deleted");
      loadPromotions();
    } catch {
      toast.error("Delete failed");
    }
  };

  const staticStats = [
    { title: "Total", value: 5 },
    { title: "Active", value: 3 },
    { title: "Expired", value: 1 },
    { title: "Redemptions", value: "538" },
    { title: "Revenue", value: "177,400", unit: "AED" },
    { title: "Savings", value: "65,720", unit: "AED" },
    { title: "Conversion", value: "46.7", unit: "%", change: "+4.5%", colorClass: "bg-green-100 text-green-700" },
    { title: "Growth", value: "12.5", unit: "%", change: "+1.2%", colorClass: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Campaigns</h1>
          <p className="text-sm text-gray-500">Create, manage, and track promotional campaigns to boost member engagement and revenue</p>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 border rounded-lg bg-white shadow-sm">Export</button>
          <button className="px-4 py-2 border rounded-lg bg-white shadow-sm">Import</button>
          <button onClick={openCreate} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-md">+ Create Promotion</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {staticStats.map((stat, idx) => <StatBox key={idx} {...stat} change={stat.change} />)}
      </div>

      <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm mb-6 border border-gray-100">
        <input type="text" placeholder="Search promotions by name, code, or tags..." className="flex-1 p-2 border rounded-lg text-sm" />
        <select className="p-2 border rounded-lg text-sm w-32"><option>All Status</option></select>
        <select className="p-2 border rounded-lg text-sm w-32"><option>All Types</option></select>
        <select className="p-2 border rounded-lg text-sm w-32"><option>All Categories</option></select>
        <select className="p-2 border rounded-lg text-sm w-32"><option>All Dates</option></select>

        <div className="inline-flex border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode('Grid')} className={`px-3 py-2 text-sm ${viewMode === 'Grid' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600'}`}>Grid</button>
          <button onClick={() => setViewMode('Table')} className={`px-3 py-2 text-sm ${viewMode === 'Table' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600'}`}>Table</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        {loading ? (
          <div className="p-10 text-center text-lg text-teal-600">Loading promotions...</div>
        ) : promotions.length === 0 ? (
          <div className="p-10 text-center text-lg text-gray-500">No promotions found.</div>
        ) : viewMode === "Grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {promotions.map((p) => <PromotionCard key={p.id} promotion={p} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{p.promotionName}</div>
                  <div className="text-gray-500 text-sm">{p.description}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p.id)} className="px-3 py-1 border rounded text-sm text-gray-700">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1 border rounded text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreatePromotionModal mode={modalMode.mode} promotionId={modalMode.id} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadPromotions(); }} />
      )}
    </div>
  );
}
