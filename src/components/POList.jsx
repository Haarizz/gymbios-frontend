import Layout from "./Layout";
import { useEffect, useState } from "react";
import { getPOs } from "../api/purchaseOrderApi";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  DollarSign,
  Building2,
  AlertTriangle,
  Truck,
  Download,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit3,
  Columns
} from "lucide-react";

export default function POList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getPOs()
      .then((res) => setList(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Status badge styles
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Ordered":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Received":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Priority badge styles
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-600 border border-red-100";
      case "Medium":
        return "bg-blue-50 text-blue-600 border border-blue-100";
      case "Low":
        return "bg-gray-50 text-gray-600 border border-gray-100";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  // Format date safely
  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return d;
    }
  };

  return (
    
      <div className="p-6 w-full bg-gray-50 min-h-screen">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-500 mt-1">
              Create and manage purchase orders for inventory restocking and equipment procurement
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition">
              <Download size={18} />
              Export
            </button>

            <Link
              to="/purchase-orders/add"
              className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 font-medium shadow-sm transition"
            >
              <Plus size={18} />
              Create New PO
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

          {/* Total POs */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total POs</p>
              <h2 className="text-2xl font-bold text-gray-800">{list.length}</h2>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ClipboardList size={20} />
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending Approvals</p>
              <h2 className="text-2xl font-bold text-yellow-600">
                {list.filter((po) => po.status === "Pending" || po.status === "Pending Approval").length}
              </h2>
              <p className="text-xs text-gray-400 mt-1">Need approval</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Clock size={20} />
            </div>
          </div>

          {/* Monthly Spend */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Monthly Spend</p>
              <h2 className="text-2xl font-bold text-green-600">
                AED {list.reduce((a, b) => a + (b.totalAmount || 0), 0).toLocaleString()}
              </h2>
              <p className="text-xs text-gray-400 mt-1">This month</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
          </div>

          {/* Top Supplier – Placeholder */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Top Supplier</p>
              <h2 className="text-sm font-bold text-purple-700 truncate">Supplier</h2>
              <p className="text-xs text-gray-400 mt-1">Most orders</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Building2 size={20} />
            </div>
          </div>

          {/* Urgent */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Urgent Orders</p>
              <h2 className="text-2xl font-bold text-red-600">
                {list.filter((po) => po.priority === "High").length}
              </h2>
              <p className="text-xs text-gray-400 mt-1">High priority</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle size={20} />
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Overdue</p>
              <h2 className="text-2xl font-bold text-orange-600">0</h2>
              <p className="text-xs text-gray-400 mt-1">Past due date</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Truck size={20} />
            </div>
          </div>

        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by PO number, supplier, or status..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-4 w-full lg:w-auto overflow-x-auto">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white">
              <option>All Status</option>
              <option>Pending</option>
              <option>Ordered</option>
              <option>Received</option>
            </select>

            <select className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white">
              <option>All Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              <Filter size={18} />
              Advanced
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Table Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Purchase Orders</h3>
              <p className="text-sm text-gray-500">
                {list.length} of {list.length} orders
              </p>
            </div>
            <button className="flex items-center gap-2 text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
              <Columns size={16} />
              Columns
            </button>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PO Number</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Date</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Delivery</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {list.length > 0 ? (
                  list.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50 transition">

                      <td className="p-4 text-center">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-gray-900">{po.poNumber}</div>
                      </td>

                      <td className="p-4 text-gray-800">
                        {po.supplierName}
                      </td>

                      <td className="p-4 text-gray-800">
                        {formatDate(po.orderDate)}
                      </td>

                      <td className="p-4 text-gray-800">
                        {formatDate(po.expectedDelivery)}
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(po.status)}`}>
                          {po.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(po.priority)}`}>
                          {po.priority}
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-gray-900">
                        AED {po.totalAmount}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/purchase-orders/view/${po.id}`}
                            className="p-1 text-gray-500 hover:text-teal-600"
                          >
                            <Eye size={18} />
                          </Link>

                          <Link
                            to={`/purchase-orders/edit/${po.id}`}
                            className="p-1 text-gray-500 hover:text-blue-600"
                          >
                            <Edit3 size={18} />
                          </Link>

                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-gray-500">
                      No Purchase Orders found. Click <b>Create New PO</b> to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">Showing 1–{list.length} of {list.length}</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50">Prev</button>
              <button className="px-3 py-1 bg-teal-600 text-white rounded text-sm">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600">Next</button>
            </div>
          </div>
        </div>
      </div>
    
  );
}
