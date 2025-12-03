import React, { useEffect, useState, useMemo } from "react";
// Assuming these API calls are correctly implemented and updated
import {
  getWastageReturns,
  deleteWastageReturn,
  getWastageReturnById,
  updateWastageReturn,
} from "../api/wastageReturnApi";
import Layout from "./Layout";
import toast from "react-hot-toast";

// Import the refactored form modal (VoucherFormModal)
import VoucherFormModal from "../components/VoucherFormModal";

// --- Helper Functions ---

const processVouchers = (vouchers) => {
  // This function formats backend data for the list view
  return vouchers.map((v) => {
    let itemsCount = 0;
    try {
      const productsArray = JSON.parse(v.products);
      if (Array.isArray(productsArray)) {
        itemsCount = productsArray.reduce((sum, p) => sum + (p.qty || 0), 0);
      }
    } catch (e) {
      console.error("Failed to parse products JSON:", e);
    }

    return {
      ...v,
      items: itemsCount,
      voucherType: v.voucherType === "WASTAGE" ? "Wastage" : "Goods Return",
    };
  });
};

const calculateKPIs = (list) => {
  // Calculates summary statistics for the dashboard cards
  const totalVouchers = list.length;
  const pendingApproval = list.filter(
    (x) => x.status === "Pending Approval"
  ).length;

  const wastageValue = list
    .filter((v) => v.voucherType === "Wastage" || v.voucherType === "WASTAGE")
    .reduce((sum, v) => sum + (v.totalValue || 0), 0);

  const returnsValue = list
    .filter(
      (v) => v.voucherType === "Goods Return" || v.voucherType === "RETURN"
    )
    .reduce((sum, v) => sum + (v.totalValue || 0), 0);

  return { totalVouchers, pendingApproval, wastageValue, returnsValue };
};

// --- Main Component ---

export default function WastageReturnList() {
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState("Vouchers");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("date-desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const load = async () => {
    try {
      const res = await getWastageReturns();
      setList(processVouchers(res.data));
    } catch (error) {
      toast.error("Failed to load vouchers.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- HANDLERS ---

  const handleEdit = async (id) => {
    try {
      const res = await getWastageReturnById(id);

      let products = [];
      try {
        products = JSON.parse(res.data.products);
      } catch (e) {
        console.error("Failed to parse products on edit load.", e);
      }

      const data = {
        ...res.data,
        products: products,
      };
      setEditData(data);
      setModalOpen(true);
    } catch (error) {
      toast.error("Failed to load voucher details for editing.");
    }
  };

  const handleNewVoucher = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditData(null);
    load(); // Reload data after save/cancel to update the list view
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voucher?"))
      return;

    try {
      await deleteWastageReturn(id);
      toast.success("Voucher deleted.");
      load();
    } catch {
      toast.error("Failed to delete voucher.");
    }
  };

  const handleStatusChange = async (voucherId, newStatus) => {
    const currentVoucher = list.find((v) => v.id === voucherId);
    const displayVoucherNumber = currentVoucher?.voucherNumber || voucherId;

    if (
      !window.confirm(
        `Are you sure you want to change the status to ${newStatus} for VOUCHER #${displayVoucherNumber}?`
      )
    ) {
      return;
    }

    try {
      const res = await getWastageReturnById(voucherId);
      const existingVoucher = res.data;

      const payload = {
        ...existingVoucher,
        status: newStatus,
        products: existingVoucher.products,
      };

      await updateWastageReturn(voucherId, payload);
      toast.success(
        `Status updated to ${newStatus} for Voucher #${displayVoucherNumber}!`
      );
      load();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to change status. Check console.");
    }
  };

  // --- MEMOIZED DATA & FILTERS ---

  const kpis = useMemo(() => calculateKPIs(list), [list]);

  const filteredList = useMemo(() => {
    let filtered = list;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          String(v.id).includes(q) ||
          String(v.voucherNumber).toLowerCase().includes(q) ||
          v.reason.toLowerCase().includes(q) ||
          v.location.toLowerCase().includes(q)
      );
    }

    if (filterType !== "All Types") {
      filtered = filtered.filter((v) => v.voucherType === filterType);
    }

    if (filterStatus !== "All Status") {
      filtered = filtered.filter((v) => v.status === filterStatus);
    }

    if (sortBy === "date-desc") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "date-asc") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    return filtered;
  }, [list, searchQuery, filterType, filterStatus, sortBy]);

  // --- TAB CONTENT RENDERERS ---

  const renderVouchersTab = () => (
    <>
      {/* SEARCH & FILTER BAR */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search vouchers by number, reason, or user..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="All Types">All Types</option>
          <option value="Wastage">Wastage</option>
          <option value="Goods Return">Return</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="All Status">All Status</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
          <option value="Draft">Draft</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
        </select>
      </div>

      {/* VOUCHERS TABLE */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Voucher #</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Reason</th>
              <th className="px-6 py-3 text-left">Items</th>
              <th className="px-6 py-3 text-left">Value</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y bg-white text-gray-700">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No vouchers found matching filters.
                </td>
              </tr>
            ) : (
              filteredList.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {v.voucherNumber || v.id || "N/A"}
                  </td>
                  <td className="px-6 py-4">{v.date}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        v.voucherType === "Wastage"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {v.voucherType}
                    </span>
                  </td>

                  <td className="px-6 py-4 truncate max-w-[180px]">
                    {v.reason}
                  </td>
                  <td className="px-6 py-4">{v.items}</td>
                  <td className="px-6 py-4 font-medium">
                    AED {parseFloat(v.totalValue).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{v.status}</td>

                  <td className="px-6 py-4 flex items-center gap-3 text-sm">
                    {/* Status Change Dropdown */}
                    <select
                      value={v.status}
                      onChange={(e) => handleStatusChange(v.id, e.target.value)}
                      className="p-1 border border-gray-300 rounded text-xs bg-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      onClick={() => handleEdit(v.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Voucher Details"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Voucher"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-6 py-3 bg-gray-50 text-xs text-gray-600 border-t border-gray-200">
          Showing {filteredList.length} of {list.length} vouchers.
        </div>
      </div>
    </>
  );

  const renderAnalyticsTab = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Top Wastage Products
        </h3>
        {/* Dummy data matching screenshot */}
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-dashed">
            <div>
              <div className="font-medium">BCAA Energy Drink</div>
              <div className="text-xs text-gray-500">15 items</div>
            </div>
            <div className="font-semibold text-red-600">AED 130.00</div>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-dashed">
            <div>
              <div className="font-medium">Premium Gym T-Shirt</div>
              <div className="text-xs text-gray-500">5 items</div>
            </div>
            <div className="font-semibold text-red-600">AED 175.00</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Return Reasons Analysis
        </h3>
        {/* Dummy data matching screenshot */}
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-dashed">
            <div>
              <div className="font-medium">
                Returned to Supplier - Defective
              </div>
              <div className="text-xs text-gray-500">1 cases</div>
            </div>
            <div className="font-semibold text-blue-600">AED 1600.00</div>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-dashed">
            <div>
              <div className="font-medium">Expired</div>
              <div className="text-xs text-gray-500">1 cases</div>
            </div>
            <div className="font-semibold text-blue-600">AED 330.00</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="grid grid-cols-3 gap-6">
      {/* Wastage Report */}
      <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center border border-gray-200">
        <h3 className="font-semibold mb-2 text-gray-800">Wastage Report</h3>
        <p className="text-sm text-gray-500 mb-4">
          Detailed wastage analysis and trends
        </p>
        <button className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Generate Report
        </button>
      </div>

      {/* Returns Report */}
      <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center border border-gray-200">
        <h3 className="font-semibold mb-2 text-gray-800">Returns Report</h3>
        <p className="text-sm text-gray-500 mb-4">
          Goods return tracking and analysis
        </p>
        <button className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Generate Report
        </button>
      </div>

      {/* Audit Trail */}
      <div className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center border border-gray-200">
        <h3 className="font-semibold mb-2 text-gray-800">Audit Trail</h3>
        <p className="text-sm text-gray-500 mb-4">
          Complete voucher activity log
        </p>
        <button className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Generate Report
        </button>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="bg-white rounded-xl shadow p-5 border border-gray-200 grid grid-cols-2 gap-6">
      {/* Approval Settings */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-800 border-b pb-2">
          Approval Settings
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Approval Threshold (AED)
          </label>
          <input
            type="number"
            defaultValue="500"
            className="mt-1 p-2 border border-gray-300 rounded-md w-24 text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Vouchers above this value require manager approval
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Auto-approve Wastage Below
          </label>
          <input
            type="number"
            defaultValue="100"
            className="mt-1 p-2 border border-gray-300 rounded-md w-24 text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Automatically approve wastage vouchers below this amount
          </p>
        </div>
      </div>

      {/* Default Locations */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-800 border-b pb-2">
          Default Locations
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="mr-2" /> Main Store
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="mr-2" /> Warehouse
            A
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="mr-2" /> Warehouse
            B
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="mr-2" /> Retail
            Floor
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="mr-2" /> Cafe
            Storage
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="mr-2" /> Equipment
            Room
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="mr-2" /> Reception
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" /> Other
          </label>
        </div>
      </div>
    </div>
  );

  return (
    
      <div className="p-6">
        {/* PAGE HEADER: Wastage / Returns */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Wastage / Returns
            </h1>
            <p className="text-gray-500 text-sm">
              Document product wastage and goods returns with inventory
              integration and approval workflows
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm">
              Export
            </button>
            <button
              onClick={handleNewVoucher}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              + New Voucher
            </button>
          </div>
        </div>

        {/* TOP SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">Total Vouchers</p>
            <p className="text-3xl font-bold mt-1">{kpis.totalVouchers}</p>
            <p className="text-xs text-gray-400 mt-1">
              {kpis.pendingApproval} pending approval
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">Wastage Value</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              AED {kpis.wastageValue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">AED 505.00 this month</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">Returns Value</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              AED {kpis.returnsValue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">AED 1600.00 this month</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
            <p className="text-gray-500 text-sm">Pending Approval</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {kpis.pendingApproval}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Requires manager approval
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center space-x-10 border-b border-gray-200 mb-6 text-sm">
          {["Vouchers", "Analytics", "Reports", "Settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${
                activeTab === tab
                  ? "border-b-2 border-teal-600 text-teal-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="flex-grow"></div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "Vouchers" && renderVouchersTab()}
        {activeTab === "Analytics" && renderAnalyticsTab()}
        {activeTab === "Reports" && renderReportsTab()}
        {activeTab === "Settings" && renderSettingsTab()}
         {/* MODAL RENDER */}
      { modalOpen && (
        <VoucherFormModal onClose={handleModalClose} initialData={editData} />
      )}
      </div>

     
  
  );
}
