// src/pages/Financials/ReceiptVoucherList.jsx
import { useEffect, useState } from "react";
import { getMembers } from "../api/member";
import {
  getReceiptVouchers,
  createReceiptVoucher,
  deleteReceiptVoucher,
} from "../api/receiptVoucherApi";
import toast from "react-hot-toast";

const paymentModes = ["Cash", "Card", "Bank Transfer", "UPI"];

const ReceiptVoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initialForm());

  function initialForm() {
    return {
      voucherDate: new Date().toISOString().slice(0, 10),
      branchName: "",
      memberId: "",
      memberName: "",
      incomeSourceName: "",
      amount: "0.00",
      paymentMode: "",
      reference: "",
      notes: "",
      attachmentUrl: "",
    };
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getReceiptVouchers();
      setVouchers(data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load members");
    }
  };

  useEffect(() => {
    loadData();
    loadMembers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.voucherDate || !form.amount || !form.paymentMode || !form.memberId) {
      toast.error("Voucher date, member, amount & payment mode are required");
      return;
    }

    try {
      setSaving(true);
      await createReceiptVoucher({
        ...form,
        amount: Number(form.amount),
      });
      toast.success("Receipt created");
      setModalOpen(false);
      setForm(initialForm());
      loadData();
    } catch (err) {
      console.log(err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this receipt?")) return;

    try {
      await deleteReceiptVoucher(id);
      toast.success("Deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const totalAmount = vouchers.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0
  );
  const todayAmount = vouchers
    .filter((v) => v.voucherDate === new Date().toISOString().slice(0, 10))
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Receipt Vouchers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Record and manage all money received from members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 font-medium shadow-sm transition-all">
            <DownloadIcon className="w-4 h-4" />
            Export Excel
          </button>
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 font-medium shadow-sm transition-all">
            <PrinterIcon className="w-4 h-4" />
            Export PDF
          </button>

          <button
            onClick={() => {
              setForm(initialForm());
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0f5132] text-white rounded-lg text-sm font-medium hover:bg-[#0c4128] shadow-lg shadow-emerald-900/10 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            Add Receipt
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="z-10">
            <p className="text-blue-600 text-sm font-medium mb-1">
              Today&apos;s Receipts
            </p>
            <h3 className="text-2xl font-bold text-blue-900">
              AED {todayAmount.toFixed(0)}
            </h3>
            <p className="text-blue-500 text-xs mt-1">0 transactions</p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] bg-blue-100 w-24 h-24 rounded-full opacity-50 z-0" />
          <div className="absolute right-4 top-4 p-2 bg-white/60 rounded-lg text-blue-600">
            <DollarSignIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="z-10">
            <p className="text-emerald-600 text-sm font-medium mb-1">
              Total Receipts
            </p>
            <h3 className="text-2xl font-bold text-emerald-900">
              AED {totalAmount.toFixed(0)}
            </h3>
            <p className="text-emerald-500 text-xs mt-1">This period</p>
          </div>
          <div className="absolute right-4 top-4 p-2 bg-white/60 rounded-lg text-emerald-600">
            <WalletIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="z-10">
            <p className="text-amber-600 text-sm font-medium mb-1">
              Pending Approval
            </p>
            <h3 className="text-2xl font-bold text-amber-900">AED 104</h3>
            <p className="text-amber-500 text-xs mt-1">Requires action</p>
          </div>
          <div className="absolute right-4 top-4 p-2 bg-white/60 rounded-lg text-amber-600">
            <ClockIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="z-10">
            <p className="text-purple-600 text-sm font-medium mb-1">
              Total Period
            </p>
            <h3 className="text-2xl font-bold text-purple-900">8</h3>
            <p className="text-purple-500 text-xs mt-1">Receipts</p>
          </div>
          <div className="absolute right-4 top-4 p-2 bg-white/60 rounded-lg text-purple-600">
            <FileTextIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="font-semibold text-gray-700 text-sm">
            Recent Transactions
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search..."
              className="text-xs bg-gray-50 border border-gray-200 rounded px-3 py-1.5 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 text-sm animate-pulse">
            Loading receipts...
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
              <FileTextIcon className="w-6 h-6" />
            </div>
            No receipts found. Create your first receipt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <Th>Voucher #</Th>
                  <Th>Date</Th>
                  <Th>Member</Th>
                  <Th>Income Source</Th>
                  <Th>Branch</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {vouchers.map((v, index) => (
                  <tr
                    key={v.id || index}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <Td className="font-medium text-gray-800">
                      #{1000 + index}
                    </Td>
                    <Td className="text-gray-500">{v.voucherDate}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                          {(v.memberName || "U").charAt(0)}
                        </div>
                        {v.memberName || "-"}
                      </div>
                    </Td>
                    <Td>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[11px] font-medium border border-gray-200">
                        {v.incomeSourceName || "General"}
                      </span>
                    </Td>
                    <Td>{v.branchName || "-"}</Td>
                    <Td className="text-right font-bold text-gray-700">
                      <span className="text-xs text-gray-400 font-normal mr-1">
                        AED
                      </span>
                      {Number(v.amount).toFixed(2)}
                    </Td>
                    <Td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                        Completed
                      </span>
                    </Td>

                    <Td className="text-right">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Receipt"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end gap-2 text-xs text-gray-500">
          <span>Showing {vouchers.length} records</span>
        </div>
      </div>

      {modalOpen && (
        <AddReceiptModal
          form={form}
          onChange={handleChange}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          saving={saving}
          members={members}
        />
      )}
    </div>
  );
};

const Th = ({ children, className = "" }) => (
  <th
    className={`px-4 py-3 text-xs font-semibold text-gray-500 tracking-wide uppercase ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 text-sm text-gray-700 whitespace-nowrap ${className}`}>
    {children}
  </td>
);

/* MODAL */
const AddReceiptModal = ({
  form,
  onChange,
  onClose,
  onSave,
  saving,
  members,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSignIcon className="w-5 h-5 text-gray-800 border-2 border-gray-800 rounded p-0.5" />
              Add New Receipt
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Record a new income receipt and voucher entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <Field label="Voucher Date *">
              <input
                type="date"
                name="voucherDate"
                value={form.voucherDate}
                onChange={onChange}
                className="input-field"
              />
            </Field>

            <Field label="Branch">
              <select
                name="branchName"
                value={form.branchName}
                onChange={onChange}
                className="input-field"
              >
                <option value="">Select Branch</option>
                <option value="Dubai Branch">Dubai Branch</option>
                <option value="Abu Dhabi Branch">Abu Dhabi Branch</option>
              </select>
            </Field>

            {/* Member select with list */}
            <Field label="Member Name *">
              <select
                name="memberId"
                value={form.memberId}
                onChange={(e) => {
                  const memberId = e.target.value;

                  const selected = members.find(
                    (m) => String(m.id) === String(memberId)
                  );

                  if (selected) {
                    onChange({
                      target: {
                        name: "memberId",
                        value: selected.id,
                      },
                    });

                    onChange({
                      target: {
                        name: "memberName",
                        value:
                          `${selected.firstname} ${selected.lastname}`.trim(),
                      },
                    });
                  }
                }}
                className="input-field"
              >
                <option value="">Select member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {`${m.firstname} ${m.lastname}`.trim()}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Income Source Category *">
              <select
                name="incomeSourceName"
                value={form.incomeSourceName}
                onChange={onChange}
                className="input-field"
              >
                <option value="">Select income source</option>
                <option value="Membership">Membership</option>
                <option value="Personal Training">Personal Training</option>
                <option value="Products">Products</option>
              </select>
            </Field>

            <Field label="Amount (AED) *">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                name="amount"
                value={form.amount}
                onChange={onChange}
                className="input-field font-mono"
              />
            </Field>

            <Field label="Payment Mode *">
              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={onChange}
                className="input-field"
              >
                <option value="">Select payment mode</option>
                {paymentModes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Reference / Description *">
                <input
                  type="text"
                  name="reference"
                  value={form.reference}
                  onChange={onChange}
                  placeholder="e.g., Monthly membership fee, Personal training session"
                  className="input-field"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Notes">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={onChange}
                  className="input-field min-h-[70px] resize-none"
                  placeholder="Additional notes about this receipt..."
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-gray-400 group-hover:text-emerald-500 transition-colors">
                    <UploadIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">
                      Attach Receipt or Invoice
                    </p>
                    <p className="text-[10px] text-gray-400">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                  <button className="mt-2 px-4 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-gray-600 font-medium shadow-sm group-hover:border-emerald-200 transition-colors">
                    Choose File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <PrinterIcon className="w-4 h-4" />
            Save &amp; Print
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#0f5132] text-white rounded-lg text-sm font-medium hover:bg-[#0c4128] shadow-lg shadow-emerald-900/10 disabled:opacity-70 transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Receipt"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-semibold text-gray-500 tracking-wide ml-0.5">
      {label}
    </label>
    {children}
  </div>
);

/* Icons */
const PlusIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
const PrinterIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);
const DownloadIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const TrashIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
const XIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const DollarSignIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const FileTextIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);
const WalletIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
const ClockIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const UploadIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

export default ReceiptVoucherList;
