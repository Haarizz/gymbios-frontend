// src/components/PaymentVoucherPage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "react-icons/hi";
import SidebarRaw from "./Sidebar";
import paymentApi from "../api/paymentVoucherApi";

/* SAFE ICON HELPER */
function safeIcon(name) {
  const C = Icons[name];
  return C ? (props) => <C {...props} /> : () => null;
}

/* guarded icons */
const HiFilter = safeIcon("HiFilter");
const HiDownload = safeIcon("HiDownload");
const HiOutlineDotsVertical = safeIcon("HiOutlineDotsVertical");
const HiChevronLeft = safeIcon("HiChevronLeft");
const HiChevronRight = safeIcon("HiChevronRight");
const HiOutlineDocumentReport = safeIcon("HiOutlineDocumentReport");
const HiOutlineClock = safeIcon("HiOutlineClock");
const HiOutlineCurrencyDollar = safeIcon("HiOutlineCurrencyDollar");
const HiOutlineExclamationTriangle = safeIcon("HiOutlineExclamationTriangle");
const HiOutlineUserGroup = safeIcon("HiOutlineUserGroup");
const HiOutlineTrash = safeIcon("HiOutlineTrash");
const HiOutlinePencil = safeIcon("HiOutlinePencil");
const HiOutlineEye = safeIcon("HiOutlineEye");
const HiPlus = safeIcon("HiPlus");
const HiArrowSmallUp = safeIcon("HiArrowSmallUp");
const HiArrowSmallDown = safeIcon("HiArrowSmallDown");

/* guard Sidebar */
const Sidebar = SidebarRaw
  ? SidebarRaw
  : () => {
      console.error("Sidebar component not found at ./Sidebar — rendering placeholder.");
      return <div className="p-4 text-sm text-gray-500">Sidebar missing — check ./Sidebar import.</div>;
    };

/* Ledger categories */
const LedgerCategories = [
  { key: "all", label: "All Payments", icon: "HiOutlineDocumentReport" },
  { key: "pending", label: "Pending Payments", icon: "HiOutlineClock" },
  { key: "paid", label: "Paid", icon: "HiOutlineCurrencyDollar" },
  { key: "overdue", label: "Overdue", icon: "HiOutlineExclamationTriangle" },
  { key: "supplier", label: "Supplier-wise Ledger", icon: "HiOutlineUserGroup" },
];

const fmtAED = (n) =>
  typeof n === "number"
    ? `AED ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : n && typeof n === "string" && !Number.isNaN(Number(n))
    ? `AED ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `AED 0.00`;

const getStatusClasses = (status) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Overdue":
      return "bg-red-100 text-red-800";
    case "Draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function parseDateSafe(d) {
  if (!d) return 0;
  const t = Date.parse(d);
  if (!Number.isNaN(t)) return t;
  try {
    const replaced = d.replace(/(\d+)\/(\d+)\/(\d+)/, (m, a, b, c) => `${c}-${a.padStart(2, "0")}-${b.padStart(2, "0")}`);
    const t2 = Date.parse(replaced);
    if (!Number.isNaN(t2)) return t2;
  } catch (e) {}
  return 0;
}

/* MetricCard */
function MetricCard({ title, value, iconName, borderClass = "border-gray-200" }) {
  const IconC = safeIcon(iconName);
  return (
    <div className={`p-4 border rounded-xl bg-white ${borderClass}`}>
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <IconC className="w-5 h-5 mr-2" />
        {title}
      </div>
      <div className="text-xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

/* LedgerMetricsSidebar */
function LedgerMetricsSidebar({ activeCategory, onCategorySelect, counts, totals = {} }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Ledger Categories</h3>
        <ul className="space-y-1 text-sm">
          {LedgerCategories.map((cat) => {
            const isActive = cat.key === activeCategory;
            const IconC = safeIcon(cat.icon);
            return (
              <li key={cat.key}>
                <button
                  onClick={() => onCategorySelect(cat.key)}
                  className={`w-full text-left flex justify-between items-center px-3 py-2 rounded-lg transition ${
                    isActive ? "bg-teal-50 text-teal-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <IconC className="w-4 h-4" />
                    {cat.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {counts[cat.key] ?? 0}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <MetricCard title="Paid This Month" value={fmtAED(totals.paidThisMonth ?? 0)} iconName="HiOutlineCurrencyDollar" />
      <MetricCard title="Total Pending" value={fmtAED(totals.totalPending ?? 0)} iconName="HiOutlineClock" />
      <MetricCard title="Overdue Payments" value={fmtAED(totals.totalOverdue ?? 0)} iconName="HiOutlineExclamationTriangle" borderClass="border-red-300" />

      <div className="p-4 border border-blue-300 rounded-xl bg-white space-y-2">
        <div className="flex items-center text-sm text-gray-500"><HiOutlineClock className="w-5 h-5 mr-2" /> Upcoming (7 days)</div>
        <div className="text-xl font-semibold text-gray-900">{totals.upcomingCount ?? 0}</div>
      </div>
    </div>
  );
}

/* PaymentVoucherTable */
function PaymentVoucherTable({ vouchers, onView, onEdit, onDelete }) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(vouchers.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [vouchers.length, totalPages, currentPage]);

  const paginated = useMemo(() => {
    const s = (currentPage - 1) * itemsPerPage;
    return vouchers.slice(s, s + itemsPerPage);
  }, [vouchers, currentPage]);

  return (
    <div className="bg-white rounded-xl border">
      <div className="p-4 border-b flex justify-between items-center text-sm">
        <h3 className="font-semibold text-base text-gray-700">Payment Vouchers ({vouchers.length})</h3>
        <div className="text-gray-500 flex items-center">
          <span>
            Show: <span className="font-semibold text-gray-900 ml-1 mr-4">10</span>
          </span>
          <span className="flex items-center gap-1">
            Actions
            <HiOutlineDotsVertical className="w-5 h-5" />
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-medium">Voucher No.</th>
              <th className="py-3 px-4 font-medium">Supplier/Vendor</th>
              <th className="py-3 px-4 font-medium">Bill No.</th>
              <th className="py-3 px-4 font-medium">Payment Date</th>
              <th className="py-3 px-4 text-right font-medium">Amount</th>
              <th className="py-3 px-4 font-medium">Payment Method</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginated.length > 0 ? (
              paginated.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-teal-600 font-medium">{v.voucherNo}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-800">{v.party}</div>
                    <div className="text-xs text-gray-500">{v.type}</div>
                  </td>
                  <td className="py-3 px-4">{v.billNo || "—"}</td>
                  <td className="py-3 px-4">{v.paymentDate || "—"}</td>
                  <td className="py-3 px-4 text-right font-semibold">{(fmtAED(Number(v.amount || 0)) || "AED 0.00").replace("AED ", "")}</td>
                  <td className="py-3 px-4">{v.method || "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(v.status)}`}>{v.status}</span>
                    {v.paidAmount ? <div className="text-xs text-gray-500 mt-1">Paid: {fmtAED(Number(v.paidAmount || 0))}</div> : null}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button title="View" onClick={() => onView(v)} className="text-gray-500 hover:text-teal-600 transition transform hover:-translate-y-0.5">
                      <HiOutlineEye className="w-5 h-5" />
                    </button>
                    <button title="Edit" onClick={() => onEdit(v)} className="text-teal-600 hover:text-teal-700 transition transform hover:-translate-y-0.5">
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button title="Delete" onClick={() => onDelete(v.id)} className="text-red-500 hover:text-red-700">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">No vouchers yet. Create a new payment to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="p-4 border-t flex justify-between items-center text-sm text-gray-600">
        <span>Showing {paginated.length === 0 ? 0 : 1} to {paginated.length} of {vouchers.length} results</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg ${currentPage === 1 || vouchers.length === 0 ? "text-gray-400 cursor-not-allowed bg-gray-50" : "hover:bg-gray-50"}`}>
            <HiChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="font-semibold text-gray-900">{currentPage}</span>
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || vouchers.length === 0} className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg ${currentPage === totalPages || vouchers.length === 0 ? "text-gray-400 cursor-not-allowed bg-gray-50" : "hover:bg-gray-50"}`}>
            <span>Next</span>
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* New Payment Modal (same as your previous, unchanged logic) */
function PaymentVoucherModal({ open, onClose, onSave }) {
  const emptyForm = {
    voucherNo: "",
    party: "",
    type: "Supplier",
    billNo: "",
    paymentDate: "",
    amount: "",
    method: "Cash",
    status: "Pending",
    description: "",
    paidAmount: 0,
  };

  const [form, setForm] = useState(emptyForm);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setMounted(true);
      requestAnimationFrame(() => setTimeout(() => setActive(true), 10));
    } else {
      setActive(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleCloseAnimated = () => {
    setActive(false);
    setTimeout(() => onClose(), 220);
  };

  const handleSubmit = (markPaid = false) => {
    const data = {
      ...form,
      amount: Number(form.amount) || 0,
      status: markPaid ? "Paid" : form.status || "Pending",
      paidAmount: markPaid ? Number(form.amount) || 0 : (form.paidAmount || 0),
    };
    onSave(data);
    handleCloseAnimated();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-opacity ${active ? "opacity-100" : "opacity-0"}`}>
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-xl transform transition-all duration-200 ${active ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-400">New Payment Voucher</div>
            <div className="text-sm font-semibold text-gray-900">Create and record a new payment</div>
          </div>
          <button onClick={handleCloseAnimated} className="text-gray-500 hover:text-gray-800 text-lg leading-none">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Voucher Number</label>
              <input className="mt-1 block w-full border rounded-lg px-2 py-1.5 focus:ring-teal-500 focus:border-teal-500" value={form.voucherNo} onChange={(e) => handleChange("voucherNo", e.target.value)} placeholder="PV-2025-0006" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Supplier / Vendor</label>
              <input className="mt-1 block w-full border rounded-lg px-2 py-1.5 focus:ring-teal-500 focus:border-teal-500" value={form.party} onChange={(e) => handleChange("party", e.target.value)} placeholder="Supplier / Vendor name" />
            </div>

            <div>
              <label className="text-xs text-gray-500">Party Type</label>
              <select className="mt-1 block w-full border rounded-lg px-2 py-1.5 text-sm" value={form.type} onChange={(e) => handleChange("type", e.target.value)}>
                <option value="Supplier">Supplier</option>
                <option value="Vendor">Vendor</option>
                <option value="Employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Bill No.</label>
              <input className="mt-1 block w-full border rounded-lg px-2 py-1.5 focus:ring-teal-500 focus:border-teal-500" value={form.billNo} onChange={(e) => handleChange("billNo", e.target.value)} placeholder="Invoice / Bill number" />
            </div>

            <div>
              <label className="text-xs text-gray-500">Payment Date</label>
              <input type="date" className="mt-1 block w-full border rounded-lg px-2 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500" value={form.paymentDate} onChange={(e) => handleChange("paymentDate", e.target.value)} />
            </div>

            <div>
              <label className="text-xs text-gray-500">Amount</label>
              <input type="number" className="mt-1 block w-full border rounded-lg px-2 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} placeholder="0.00" />
            </div>

            <div>
              <label className="text-xs text-gray-500">Payment Method</label>
              <select className="mt-1 block w-full border rounded-lg px-2 py-1.5 text-sm" value={form.method} onChange={(e) => handleChange("method", e.target.value)}>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Digital Wallet">Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 flex items-center justify-between">
                <span>Status</span>
                <button type="button" onClick={() => handleChange("status", "Paid")} className="text-xs text-teal-600 hover:text-teal-700 underline">Mark as Paid</button>
              </label>
              <select className="mt-1 block w-full border rounded-lg px-2 py-1.5 text-sm" value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Description / Narration</label>
            <textarea rows="3" className="mt-1 block w-full border rounded-lg px-2 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500" value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Purpose of payment" />
          </div>

          <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 text-xs">
            <span className="text-gray-700">Payment option: <span className="font-semibold">Save as draft / pending or mark as paid.</span></span>
            <span className="text-teal-700 font-semibold">{form.status === "Paid" ? "Paid" : "Not Paid"}</span>
          </div>
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
          <button onClick={handleCloseAnimated} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={() => handleSubmit(false)} className="px-4 py-2 text-sm border rounded-lg bg-white hover:bg-gray-100">Save (Pending)</button>
          <button onClick={() => handleSubmit(true)} className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700">Save & Mark as Paid</button>
        </div>
      </div>
    </div>
  );
}

/* VoucherDrawer - mostly same as your earlier one with addPayment using API callback */
function VoucherDrawer({ voucher, onClose, onSave, onDelete, startInEdit = false, onAddPayment }) {
  const [mounted, setMounted] = useState(Boolean(voucher));
  const [active, setActive] = useState(false);
  const [editMode, setEditMode] = useState(startInEdit);
  const [form, setForm] = useState(voucher || {});
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "Cash", date: "", note: "" });

  useEffect(() => {
    if (voucher) {
      setForm(voucher || {});
      setEditMode(startInEdit);
      setMounted(true);
      requestAnimationFrame(() => setTimeout(() => setActive(true), 10));
    } else {
      setActive(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [voucher, startInEdit]);

  if (!mounted) return null;

  const closeAnimated = () => {
    setActive(false);
    setTimeout(() => {
      setMounted(false);
      onClose();
    }, 220);
  };

  const saveAndClose = () => {
    onSave({ ...form });
    closeAnimated();
  };

  const saveEdit = () => {
    onSave({ ...form });
    setEditMode(false);
  };

  const openAddPayment = () => {
    setPaymentForm({ amount: "", method: "Cash", date: new Date().toISOString().slice(0, 10), note: "" });
    setShowAddPayment(true);
  };

  const submitAddPayment = () => {
    const amt = Number(paymentForm.amount) || 0;
    const p = {
      amount: amt,
      method: paymentForm.method,
      date: paymentForm.date || new Date().toISOString().slice(0, 10),
      note: paymentForm.note || "",
    };
    onAddPayment(voucher.id, p);
    setShowAddPayment(false);
  };

  return (
    <div className="fixed top-0 right-0 h-full z-50 pointer-events-none">
      <div onClick={closeAnimated} className={`fixed inset-0 bg-black/20 transition-opacity ${active ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />

      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-200 ${active ? "translate-x-0" : "translate-x-full"} pointer-events-auto flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">{voucher.voucherNo} • {voucher.party}</div>
          </div>
          <div className="flex items-center gap-2">
            {!editMode ? <div className={`text-xs px-2 py-1 rounded-full ${getStatusClasses(voucher.status)}`}>{voucher.status}</div> : null}
            <button onClick={closeAnimated} className="text-gray-500 hover:text-gray-800">✕</button>
          </div>
        </div>

        <div className="p-4 overflow-auto flex-1">
          {!editMode ? (
            <>
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="text-lg font-semibold mb-3">Voucher Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-gray-500">Payment Date</div>
                    <div className="font-medium">{voucher.paymentDate || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="font-medium">{fmtAED(Number(voucher.amount || 0))}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Payment Method</div>
                    <div className="font-medium">{voucher.method || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Created By</div>
                    <div className="font-medium">{voucher.createdBy || "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Bank Account</div>
                    <div className="font-medium">{voucher.bankAccount || "—"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Bill No</div>
                    <div className="font-medium">{voucher.billNo || "—"}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Description</div>
                    <div className="font-medium">{voucher.description || voucher.narration || "—"}</div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Payments</div>
                    {voucher.transactions && voucher.transactions.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-sm">
                        {voucher.transactions.map((p) => (
                          <li key={p.id} className="p-2 border rounded">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium">{fmtAED(Number(p.amount || 0))}</div>
                                <div className="text-xs text-gray-500">{p.method} • {p.date}</div>
                              </div>
                              <div className="text-xs text-gray-500">{p.note}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2 text-xs text-gray-500">No payments recorded</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <button onClick={openAddPayment} className="w-full px-4 py-2 bg-teal-600 text-white rounded-md flex items-center justify-center gap-2"><HiPlus className="w-4 h-4" /> Add Payment</button>

                <div className="flex gap-2">
                  <button onClick={() => setEditMode(true)} className="flex-1 px-3 py-2 border rounded-md">Edit Voucher</button>
                  <button onClick={() => { alert('Export PDF placeholder'); }} className="flex-1 px-3 py-2 border rounded-md">Export PDF</button>
                </div>

                <button onClick={() => window.print()} className="w-full px-3 py-2 border rounded-md">Print Voucher</button>

                <button onClick={() => { if (!window.confirm("Delete this voucher?")) return; onDelete(voucher.id); closeAnimated(); }} className="w-full px-3 py-2 text-white bg-red-600 rounded-md">Delete Voucher</button>
              </div>
            </>
          ) : (
            <>
              <h4 className="text-lg font-semibold mb-3">Edit Voucher</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Party</label>
                  <input className="mt-1 block w-full border rounded px-2 py-1" value={form.party || ""} onChange={(e) => setForm({ ...form, party: e.target.value })} />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Payment Date</label>
                  <input type="date" className="mt-1 block w-full border rounded px-2 py-1" value={form.paymentDate ? new Date(form.paymentDate).toISOString().slice(0,10) : ""} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Amount</label>
                  <input type="number" className="mt-1 block w-full border rounded px-2 py-1" value={form.amount || 0} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <select className="mt-1 block w-full border rounded px-2 py-1" value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Draft</option>
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Description</label>
                  <textarea className="mt-1 block w-full border rounded px-2 py-1" rows="3" value={form.description || form.narration || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { onSave(form); setEditMode(false); }} className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-md">Save</button>
                  <button onClick={() => setEditMode(false)} className="flex-1 px-3 py-2 border rounded-md">Cancel</button>
                </div>
              </div>
            </>
          )}

          {/* Add Payment inline modal (small) */}
          {showAddPayment && (
            <div className="fixed inset-0 z-60 flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-black/20" onClick={() => setShowAddPayment(false)} />
              <div className="relative pointer-events-auto bg-white rounded-lg shadow-lg w-full max-w-md p-4 z-70">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Add Payment</div>
                  <button onClick={() => setShowAddPayment(false)} className="text-gray-500">✕</button>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <label className="text-xs text-gray-500">Amount</label>
                    <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm(p => ({ ...p, amount: e.target.value }))} className="mt-1 block w-full border rounded px-2 py-1" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Method</label>
                    <select value={paymentForm.method} onChange={(e) => setPaymentForm(p => ({ ...p, method: e.target.value }))} className="mt-1 block w-full border rounded px-2 py-1">
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Cheque</option>
                      <option>Digital Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Date</label>
                    <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm(p => ({ ...p, date: e.target.value }))} className="mt-1 block w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Note</label>
                    <input value={paymentForm.note} onChange={(e) => setPaymentForm(p => ({ ...p, note: e.target.value }))} className="mt-1 block w-full border rounded px-2 py-1" placeholder="Optional note" />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setShowAddPayment(false)} className="px-3 py-2 border rounded">Cancel</button>
                    <button onClick={submitAddPayment} className="px-3 py-2 bg-teal-600 text-white rounded">Add Payment</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ErrorBoundary */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8">
          <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded">
            <div className="font-semibold">Something went wrong rendering PaymentVoucherPage</div>
            <div className="mt-2 text-sm whitespace-pre-wrap">{String(this.state.error)}</div>
            <div className="mt-3">
              <button onClick={() => this.setState({ error: null })} className="px-3 py-1 bg-white border rounded">Try again</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* Main component */
export default function PaymentVoucherPage() {
  const navigate = useNavigate?.() ?? (() => {});
  const [allVouchers, setAllVouchers] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [methodFilter, setMethodFilter] = useState("All Methods");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("desc");

  // menu state
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);
  const sortButtonRef = useRef(null);

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [drawerStartInEdit, setDrawerStartInEdit] = useState(false);

  const [isNewVoucherOpen, setIsNewVoucherOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { all: allVouchers.length, pending: 0, paid: 0, overdue: 0, supplier: 0 };
    allVouchers.forEach(v => {
      if (v.status === "Pending") c.pending++;
      if (v.status === "Paid") c.paid++;
      if (v.status === "Overdue") c.overdue++;
      if (v.type === "Supplier" || v.type === "Vendor") c.supplier++;
    });
    return c;
  }, [allVouchers]);

  const totals = useMemo(() => {
    const totalAmount = allVouchers.reduce((s, v) => s + Number(v.amount || 0), 0);
    const totalPaid = allVouchers.reduce((s, v) => s + Number(v.paidAmount || 0), 0);
    const totalPending = allVouchers
      .filter(v => v.status === "Pending" || v.status === "Draft")
      .reduce((s, v) => s + (Number(v.amount || 0) - Number(v.paidAmount || 0)), 0);
    const totalOverdue = allVouchers
      .filter(v => v.status === "Overdue")
      .reduce((s, v) => s + Number(v.amount || 0), 0);

    // Paid this month (simple approach: payments with paymentDate in current month)
    const now = new Date();
    const thisMonthPaid = allVouchers.reduce((s, v) => {
      try {
        const pd = v.paymentDate ? new Date(v.paymentDate) : null;
        if (pd && pd.getMonth() === now.getMonth() && pd.getFullYear() === now.getFullYear()) {
          return s + Number(v.paidAmount || 0);
        }
      } catch (e) {}
      return s;
    }, 0);

    // upcoming count (within next 7 days)
    const upcomingCount = allVouchers.reduce((acc, v) => {
      const pd = v.paymentDate ? new Date(v.paymentDate) : null;
      if (!pd) return acc;
      const diff = (pd.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7 ? acc + 1 : acc;
    }, 0);

    return {
      totalAmount,
      totalPaid,
      totalPending,
      totalOverdue,
      paidThisMonth: thisMonthPaid,
      upcomingCount,
    };
  }, [allVouchers]);

  useEffect(() => {
    // close menu on outside click
    function onDocClick(e) {
      if (!sortMenuOpen) return;
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target) && sortButtonRef.current && !sortButtonRef.current.contains(e.target)) {
        setSortMenuOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setSortMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortMenuOpen]);

  // load vouchers from API on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    paymentApi.fetchVouchers()
      .then((data) => {
        if (!mounted) return;
        setAllVouchers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load vouchers from API", err);
        alert("Failed to load payment vouchers from server.");
        setAllVouchers([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filteredVouchers = useMemo(() => {
    let items = allVouchers.slice();

    // Category filters
    switch (activeCategory) {
      case "pending": items = items.filter(v => v.status === "Pending"); break;
      case "paid": items = items.filter(v => v.status === "Paid"); break;
      case "overdue": items = items.filter(v => v.status === "Overdue"); break;
      case "supplier": items = items.filter(v => v.type === "Supplier" || v.type === "Vendor"); break;
      default: break;
    }

    // Search
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(v =>
        (v.voucherNo || "").toLowerCase().includes(q) ||
        (v.party || "").toLowerCase().includes(q) ||
        (v.billNo || "").toLowerCase().includes(q) ||
        (v.narration || "").toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q)
      );
    }

    // Status/method filters
    if (statusFilter !== "All Status") items = items.filter(v => v.status === statusFilter);
    if (methodFilter !== "All Methods") items = items.filter(v => v.method === methodFilter);

    // Sorting
    if (sortBy === "date") {
      items.sort((a, b) => {
        const ta = parseDateSafe(a.paymentDate);
        const tb = parseDateSafe(b.paymentDate);
        if (ta === tb) return 0;
        if (sortDir === "desc") return tb - ta;
        return ta - tb;
      });
    } else if (sortBy === "amount") {
      items.sort((a, b) => {
        const aa = Number(a.amount || 0);
        const bb = Number(b.amount || 0);
        if (aa === bb) return 0;
        if (sortDir === "desc") return bb - aa;
        return aa - bb;
      });
    }

    return items;
  }, [allVouchers, activeCategory, query, statusFilter, methodFilter, sortBy, sortDir]);

  const allStatuses = useMemo(() => {
    const s = Array.from(new Set(allVouchers.map(v => v.status).filter(Boolean)));
    return ["All Status", ...s];
  }, [allVouchers]);

  const allMethods = useMemo(() => {
    const m = Array.from(new Set(allVouchers.map(v => v.method).filter(Boolean)));
    return ["All Methods", ...m];
  }, [allVouchers]);

  const handleFilterClick = () => setSortMenuOpen(prev => !prev);
  const selectSort = (by, dir) => { setSortBy(by); setSortDir(dir); setSortMenuOpen(false); };
  const clearSort = () => { setSortBy(null); setSortDir("desc"); setSortMenuOpen(false); };

  const handleView = (v) => { setSelectedVoucher(v); setDrawerStartInEdit(false); };
  const handleEditFromTable = (v) => { setSelectedVoucher(v); setDrawerStartInEdit(true); };

  // delete -> call backend and update UI (no local-only remove)
  const handleDelete = async (id) => {
    if (!window.confirm("Delete voucher? This cannot be undone.")) return;
    try {
      setLoading(true);
      await paymentApi.deleteVoucher(id);
      // re-fetch to ensure server state
      const fresh = await paymentApi.fetchVouchers();
      setAllVouchers(fresh);
      if (selectedVoucher?.id === id) setSelectedVoucher(null);
    } catch (e) {
      console.error("deleteVoucher failed", e);
      const serverMsg = e.response?.data || e.message || "Delete failed";
      alert("Delete failed: " + serverMsg);
      try {
        const fresh = await paymentApi.fetchVouchers();
        setAllVouchers(fresh);
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  // update -> call backend
  const handleSaveVoucher = async (updated) => {
    try {
      setLoading(true);
      await paymentApi.updateVoucher(updated.id, updated);
      const fresh = await paymentApi.fetchVouchers();
      setAllVouchers(fresh);
      setSelectedVoucher(updated);
    } catch (e) {
      console.error("updateVoucher failed", e);
      alert("Failed to update voucher: " + (e.response?.data || e.message));
    } finally {
      setLoading(false);
    }
  };

  // create -> call backend
  const handleCreateVoucher = async (data) => {
    try {
      setLoading(true);
      await paymentApi.createVoucher(data);
      const fresh = await paymentApi.fetchVouchers();
      setAllVouchers(fresh);
    } catch (e) {
      console.error("createVoucher failed", e);
      alert("Failed to create voucher: " + (e.response?.data || e.message));
    } finally {
      setLoading(false);
      setIsNewVoucherOpen(false);
    }
  };

  // add payment -> call backend endpoint and update
  const handleAddPaymentToVoucher = async (voucherId, payment) => {
    try {
      setLoading(true);
      await paymentApi.addPaymentToVoucher(voucherId, payment);
      const fresh = await paymentApi.fetchVouchers();
      setAllVouchers(fresh);
      setSelectedVoucher(prev => (prev && prev.id === voucherId ? fresh.find(x => x.id === voucherId) : prev));
    } catch (e) {
      console.error("addPayment failed", e);
      alert("Failed to add payment: " + (e.response?.data || e.message));
    } finally {
      setLoading(false);
    }
  };

  const sortLabel = (() => {
    if (!sortBy) return "Sort";
    if (sortBy === "date") return sortDir === "desc" ? "Date: Newest" : "Date: Oldest";
    if (sortBy === "amount") return sortDir === "desc" ? "Amount: High → Low" : "Amount: Low → High";
    return "Sort";
  })();

  return (
    <ErrorBoundary>
      <div className="flex bg-gray-50 min-h-screen">

        <div className="flex-1 p-8 pb-24">

          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-900">
              <h1 className="text-xl font-semibold">Payment Voucher / Ledger Management</h1>
              <p className="text-gray-500 text-sm mt-1">Manage and track all payment vouchers, supplier ledgers, and financial transactions</p>
            </div>
            <div className="flex gap-3 items-center relative">
              <button
                ref={sortButtonRef}
                onClick={handleFilterClick}
                className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                aria-haspopup="menu"
                aria-expanded={sortMenuOpen}
                aria-controls="sort-menu"
              >
                <HiFilter className="w-4 h-4" />
                <span>{sortLabel}</span>
                {sortBy === "date" ? (
                  sortDir === "desc" ? <HiArrowSmallDown className="w-4 h-4 text-gray-600" /> : <HiArrowSmallUp className="w-4 h-4 text-gray-600" />
                ) : sortBy === "amount" ? (
                  sortDir === "desc" ? <HiArrowSmallDown className="w-4 h-4 text-gray-600" /> : <HiArrowSmallUp className="w-4 h-4 text-gray-600" />
                ) : null}
              </button>

              {/* Sort menu */}
              {sortMenuOpen && (
                <div
                  ref={sortMenuRef}
                  id="sort-menu"
                  className="absolute right-0 top-12 z-40 w-56 bg-white border rounded-md shadow-lg py-2 text-sm"
                  role="menu"
                >
                  <div className="px-3 py-2 text-xs text-gray-500 border-b">Sort Options</div>
                  <button onClick={() => selectSort("date", "desc")} className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${sortBy === "date" && sortDir === "desc" ? "bg-gray-100 font-semibold" : ""}`}>Date — Newest first</button>
                  <button onClick={() => selectSort("date", "asc")} className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${sortBy === "date" && sortDir === "asc" ? "bg-gray-100 font-semibold" : ""}`}>Date — Oldest first</button>
                  <div className="my-1 border-t" />
                  <button onClick={() => selectSort("amount", "desc")} className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${sortBy === "amount" && sortDir === "desc" ? "bg-gray-100 font-semibold" : ""}`}>Amount — High → Low</button>
                  <button onClick={() => selectSort("amount", "asc")} className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${sortBy === "amount" && sortDir === "asc" ? "bg-gray-100 font-semibold" : ""}`}>Amount — Low → High</button>
                  <div className="my-1 border-t" />
                  <button onClick={clearSort} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-600">Clear sort</button>
                </div>
              )}

              <button className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"><HiDownload className="w-4 h-4" /> Export</button>
              <button onClick={() => setIsNewVoucherOpen(true)} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 font-semibold">+ New Payment</button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl border">
            <input placeholder="Search by voucher number, supplier, bill number, or description..." value={query} onChange={(e) => setQuery(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-full max-w-lg focus:ring-teal-500 focus:border-teal-500" />
            <div className="flex gap-3 ml-4">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                {allMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-72 flex-shrink-0">
              <LedgerMetricsSidebar activeCategory={activeCategory} onCategorySelect={setActiveCategory} counts={counts} totals={totals} />
            </div>

            <div className="flex-1">
              {loading ? <div className="p-6 text-gray-500">Loading...</div> : (
                <PaymentVoucherTable
                  vouchers={filteredVouchers}
                  onView={handleView}
                  onEdit={handleEditFromTable}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </div>

          {/* Footer uses dynamic `totals` */}
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-70 py-3 flex justify-start gap-12 text-sm shadow-lg">
            <div className="text-gray-700">Total Paid: <span className="font-bold text-teal-600 ml-2">{fmtAED(totals.totalPaid)}</span></div>
            <div className="text-gray-700">Total Pending: <span className="font-bold text-yellow-600 ml-2">{fmtAED(totals.totalPending)}</span></div>
            <div className="text-gray-700">Total Amount: <span className="font-bold text-gray-900 ml-2">{fmtAED(totals.totalAmount)}</span></div>
            <div className="ml-auto text-xs text-gray-500 self-end">Last updated: {new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Drawer */}
        {selectedVoucher && (
          <VoucherDrawer
            voucher={selectedVoucher}
            startInEdit={drawerStartInEdit}
            onClose={() => { setSelectedVoucher(null); setDrawerStartInEdit(false); }}
            onSave={(u) => { handleSaveVoucher(u); setSelectedVoucher(u); }}
            onDelete={handleDelete}
            onAddPayment={handleAddPaymentToVoucher}
          />
        )}

        {/* New Payment Modal */}
        <PaymentVoucherModal
          open={isNewVoucherOpen}
          onClose={() => setIsNewVoucherOpen(false)}
          onSave={handleCreateVoucher}
        />
      </div>
    </ErrorBoundary>
  );
}
