import { useEffect, useState } from "react";
import { getWastageReturns, deleteWastageReturn } from "../api/wastageReturnApi";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function WastageReturnList() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getWastageReturns();
      setList(res.data);
    } catch (error) {
      toast.error("Failed to load vouchers.");
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;

    try {
      await deleteWastageReturn(id);
      toast.success("Voucher deleted.");
      load();
    } catch {
      toast.error("Failed to delete voucher.");
    }
  };

  return (
   
      <div className="p-6">

        {/* PAGE TITLE */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          Wastage / Returns
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          Document product wastage and goods returns with inventory integration and approval workflows
        </p>

        {/* TOP SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Vouchers</p>
            <p className="text-3xl font-bold mt-1">{list.length}</p>
            <p className="text-xs text-gray-400 mt-1">pending approval</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Wastage Value</p>
            <p className="text-3xl font-bold text-red-600 mt-1">AED 0.00</p>
            <p className="text-xs text-gray-400 mt-1">Total wastage value</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Returns Value</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">AED 0.00</p>
            <p className="text-xs text-gray-400 mt-1">Total returns value</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">
              {list.filter((x) => x.status === "Pending").length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Requires approval</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center space-x-10 border-b mb-6 text-sm">
          <button className="pb-2 border-b-2 border-teal-600 text-teal-600 font-medium">
            Vouchers
          </button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">Analytics</button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">Reports</button>
          <button className="pb-2 text-gray-500 hover:text-gray-700">Settings</button>

          <div className="flex-grow"></div>

          <button 
            onClick={() => navigate("/create-wastage-return")}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm"
          >
            + New Voucher
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search vouchers by number, reason, or user..."
            className="flex-grow px-4 py-2 border rounded-lg text-sm"
          />

          <select className="px-3 py-2 border rounded-lg text-sm">
            <option>All Types</option>
            <option>Wastage</option>
            <option>Return</option>
          </select>

          <select className="px-3 py-2 border rounded-lg text-sm">
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
          </select>

          <select className="px-3 py-2 border rounded-lg text-sm">
            <option value="date-desc">date-desc</option>
            <option value="date-asc">date-asc</option>
          </select>
        </div>

        {/* VOUCHERS TABLE */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
              {list.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No vouchers found.
                  </td>
                </tr>
              ) : (
                list.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{v.id}</td>
                    <td className="px-6 py-4">{v.date}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          v.voucherType === "Wastage"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {v.voucherType}
                      </span>
                    </td>

                    <td className="px-6 py-4 truncate max-w-[180px]">{v.reason}</td>

                    <td className="px-6 py-4">{v.items || 0}</td>

                    <td className="px-6 py-4 font-medium">
                      AED {parseFloat(v.totalValue).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          v.status === "Pending"
                            ? "bg-orange-100 text-orange-700"
                            : v.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 flex space-x-4 text-sm">
                      <button
                        onClick={() => navigate(`/edit-wastage-return/${v.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-red-600 hover:text-red-800"
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
   
  );
}
