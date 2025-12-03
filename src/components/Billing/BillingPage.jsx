// src/pages/Billing/BillingPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchBills,
  deleteBill,
} from "../../api/billingApi";
import toast from "react-hot-toast";
import {
  Download,
  FileDown,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Trash2,
  FileText,
  ChevronDown,
  Plus,
} from "lucide-react";

export default function BillingPage() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchBills();
      setBills(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---------- Stats (all computed from real data, no mock) ----------
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  const isSameMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === month && d.getFullYear() === year;
  };

  const monthlyBills = bills.filter((b) => isSameMonth(b.billDate));

  const monthlyCollection = monthlyBills
    .filter((b) => b.status === "PAID" || b.status === "PARTIAL")
    .reduce((acc, b) => acc + Number(b.paidAmount || 0), 0);

  const monthlyPotential = monthlyBills.reduce(
    (acc, b) => acc + Number(b.amount || 0),
    0
  );

  const collectionRate =
    monthlyPotential === 0
      ? 0
      : (monthlyCollection / monthlyPotential) * 100;

  const overdueBills = bills.filter((b) => {
    if (b.status === "PAID") return false;
    if (!b.dueDate) return false;
    const d = new Date(b.dueDate);
    return d < today;
  });

  const dueSoonBills = bills.filter((b) => {
    if (b.status === "PAID") return false;
    if (!b.dueDate) return false;
    const d = new Date(b.dueDate);
    const diff =
      (d.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000;
    return diff >= 0 && diff <= 7;
  });

  // ---------- Filtering for table ----------
  const filteredBills = useMemo(() => {
    return bills
      .filter((b) => {
        if (statusFilter === "ALL") return true;
        return b.status === statusFilter;
      })
      .filter((b) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (b.invoiceNumber || "").toLowerCase().includes(q) ||
          (b.memberName || "").toLowerCase().includes(q) ||
          (b.service || "").toLowerCase().includes(q)
        );
      });
  }, [bills, statusFilter, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await deleteBill(id);
      toast.success("Bill deleted");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Billing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage member receipts, dues, and payment collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button
            onClick={() => navigate("/billing/create")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Receipt
          </button>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Monthly Collection */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Monthly Collection
            </p>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-semibold text-gray-900">
              AED {monthlyCollection.toFixed(2)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Target: AED {monthlyPotential.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Overdue Payments
            </p>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-semibold text-gray-900">
              {overdueBills.length}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {overdueBills.length > 0
                ? "Follow up required"
                : "All good for now"}
            </p>
          </div>
        </div>

        {/* Due soon */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Due Soon
            </p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-semibold text-gray-900">
              {dueSoonBills.length}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              In next 7 days
            </p>
          </div>
        </div>

        {/* Collection rate */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Collection Rate
            </p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <p className="text-2xl font-semibold text-gray-900">
              {collectionRate.toFixed(0)}%
            </p>
            <p className="text-[11px] text-gray-400 mt-1">This month</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex items-center gap-3 text-sm">
        <button className="px-4 py-2 rounded-full bg-emerald-600 text-white font-medium shadow-sm">
          Member Receipts
        </button>
        <button className="px-4 py-2 rounded-full text-gray-500 hover:bg-gray-100">
          Member Due
        </button>
        <button className="px-4 py-2 rounded-full text-gray-500 hover:bg-gray-100">
          Total Collection
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Table header / filters */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Member Receipts
            </p>
            <p className="text-xs text-gray-400">
              All payment receipts and transaction history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search receipts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Status filter */}
            <div className="relative">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600">
                All Status
                <ChevronDown className="w-3 h-3" />
              </button>
              {/* Simple status pills below instead of dropdown */}
            </div>
          </div>
        </div>

        {/* Status pills row */}
        <div className="px-4 py-2 border-b border-gray-100 flex gap-2 text-xs">
          {["ALL", "PAID", "PENDING", "PARTIAL"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full border ${
                statusFilter === s
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {s === "ALL" ? "All Transactions" : s}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-sm text-gray-500">
            <FileText className="w-8 h-8 text-gray-300 mb-2" />
            No receipts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Receipt #</th>
                  <th className="px-4 py-3 text-left">Member</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Payment Method</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBills.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {b.invoiceNumber || `INV-${String(b.id).padStart(4, "0")}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
                          {(b.memberName || "M").charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {b.memberName || "Unknown"}
                          </div>
                          {b.memberEmail && (
                            <div className="text-[11px] text-gray-400">
                              {b.memberEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {b.service}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {b.type || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      AED {Number(b.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {b.billDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {b.paymentMethod || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50">
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
          <span>Showing {filteredBills.length} receipts</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status || "PENDING";
  if (s === "PAID")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Paid
      </span>
    );
  if (s === "PARTIAL")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-100">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Partially Paid
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Pending
    </span>
  );
}
