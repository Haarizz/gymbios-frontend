import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  HiPrinter,
  HiDownload,
  HiDuplicate,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlinePencil,
  HiPlus,
} from "react-icons/hi";
import api from "../api/axiosConfig";

const ACCOUNT_LEDGERS = [
  "Cash", "Bank - Main Account", "Accounts Receivable", "Inventory",
  "Inventory Adjustments", "Prepaid Rent", "Equipment", "Accumulated Depreciation",
  "Accounts Payable", "Revenue", "Cost of Goods Sold", "Rent Expense",
  "Depreciation Expense", "Salaries Expense", "Utilities Expense",
  "Marketing Expense", "Miscellaneous Expense"
];

const COST_CENTRES = ["Main Branch", "Cafe", "Training Center", "Admin", "Marketing"];

const fmt = (n) =>
  typeof n === "number"
    ? Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : (n ?? "");

function getAccountOwner() {
  try {
    const stored = localStorage.getItem("accountOwner");
    if (stored) return stored;
  } catch {}
  return "Gym Manager";
}

function totalFromLines(lines = [], field = "debit") {
  return (lines || []).reduce((s, l) => s + (Number(l[field]) || 0), 0);
}

/* ===========================
    VIEW VOUCHER
============================= */
function ViewJournalVoucher({ voucher, onBack, onDelete, onEdit }) {
  if (!voucher) return null;

  const details = {
    journalDate: voucher.journalDate,
    reference: voucher.reference,
    narration: voucher.narration,
    preparedBy: voucher.preparedBy || getAccountOwner(),
    postedBy: voucher.postedBy,
    postedAt: voucher.postedAt,
    created: voucher.createdAt,
    updated: voucher.updatedAt,
    breakdown: voucher.lines || [],
  };

  const lines = details.breakdown || [];
  const totalDebitVal = totalFromLines(lines, "debit");
  const totalCreditVal = totalFromLines(lines, "credit");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          ← Back
        </button>

        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-3 py-1.5 border rounded">
            <HiPrinter />
          </button>
          <button onClick={() => alert("PDF Export")} className="px-3 py-1.5 border rounded">
            <HiDownload />
          </button>
          <button onClick={() => alert("Clone")} className="px-3 py-1.5 border rounded">
            <HiDuplicate />
          </button>
          <button
            onClick={() => onDelete(voucher.id)}
            className="px-3 py-1.5 bg-red-600 text-white rounded"
          >
            <HiOutlineTrash />
          </button>
          <button
            onClick={() => onEdit(voucher.id)}
            className="px-3 py-1.5 bg-teal-600 text-white rounded"
          >
            <HiOutlinePencil />
          </button>
        </div>
      </div>

      {/* Voucher Details */}
      <div className="bg-white border rounded-lg p-6 shadow mb-6">
        <h3 className="font-bold text-lg mb-4">Journal Details</h3>

        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <label className="text-gray-500">Journal Date</label>
            <div className="font-medium">{details.journalDate}</div>
          </div>

          <div>
            <label className="text-gray-500">Reference</label>
            <div className="font-medium">{details.reference}</div>
          </div>

          <div>
            <label className="text-gray-500">Prepared By</label>
            <div className="font-medium">{details.preparedBy}</div>
          </div>

          <div>
            <label className="text-gray-500">Posted By</label>
            <div className="font-medium">{details.postedBy || "—"}</div>
          </div>

          <div>
            <label className="text-gray-500">Posted At</label>
            <div className="font-medium">{details.postedAt || "—"}</div>
          </div>

          <div>
            <label className="text-gray-500">Created</label>
            <div className="font-medium">{details.created || "—"}</div>
          </div>

          <div className="col-span-3">
            <label className="text-gray-500">Narration</label>
            <div className="font-medium bg-gray-50 p-2 rounded">
              {details.narration}
            </div>
          </div>
        </div>
      </div>

      {/* Lines Table */}
      <div className="bg-white border rounded-lg p-6 shadow">
        <h3 className="font-bold text-lg mb-4">Ledger Breakdown</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-gray-600">
              <th className="py-3 text-left">Account Ledger</th>
              <th className="py-3 text-left">Description</th>
              <th className="py-3 text-right">Debit</th>
              <th className="py-3 text-right">Credit</th>
            </tr>
          </thead>

          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{l.ledger}</td>
                <td>{l.description}</td>
                <td className="text-right">{fmt(l.debit)}</td>
                <td className="text-right">{fmt(l.credit)}</td>
              </tr>
            ))}

            <tr className="font-bold bg-gray-100">
              <td className="py-2">Total</td>
              <td></td>
              <td className="text-right">{fmt(totalDebitVal)}</td>
              <td className="text-right">{fmt(totalCreditVal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===========================
    CREATE / EDIT VOUCHER
============================= */
function CreateJournalVoucher({ initialData, onCancel, onSave }) {
  const makeInitialForm = (data) => ({
    id: data?.id || null,
    journalDate: data?.journalDate || new Date().toISOString().slice(0, 10),
    reference: data?.reference || "",
    narration: data?.narration || "",
    status: data?.status || "Draft",
    preparedBy: data?.preparedBy || getAccountOwner(),
  });

  const makeInitialLines = (data) => {
    const src = data?.lines || [];
    if (!src.length)
      return [{ id: 1, ledger: "", description: "", debit: "", credit: "", costCentre: "" }];

    return src.map((l, index) => ({
      id: index + 1,
      ledger: l.ledger,
      description: l.description,
      debit: String(l.debit),
      credit: String(l.credit),
      costCentre: l.costCentre,
    }));
  };

  const [form, setForm] = useState(makeInitialForm(initialData));
  const [lines, setLines] = useState(makeInitialLines(initialData));
  const [nextId, setNextId] = useState(lines.length + 1);
  const [saving, setSaving] = useState(false);

  const totalDebitVal = totalFromLines(lines, "debit");
  const totalCreditVal = totalFromLines(lines, "credit");
  const isBalanced = totalDebitVal === totalCreditVal && totalDebitVal > 0;

  const updateLine = (idx, field, value) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));

  const addLine = () => {
    setLines((prev) => [...prev, { id: nextId, ledger: "", description: "", debit: "", credit: "", costCentre: "" }]);
    setNextId((x) => x + 1);
  };

  const deleteLine = (id) =>
    setLines((prev) => prev.filter((l) => l.id !== id));

  const saveToServer = async (action) => {
    setSaving(true);

    const payload = {
      ...form,
      status: action === "post" ? "Posted" : "Draft",
      lines: lines.map((l) => ({
        ledger: l.ledger,
        description: l.description,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        costCentre: l.costCentre,
      })),
    };

    try {
      let res;
      if (form.id) res = await api.put(`/api/journals/${form.id}`, payload);
      else res = await api.post(`/api/journals`, payload);

      onSave(res.data);
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">
          {form.id ? "Edit Journal Voucher" : "Create Journal Voucher"}
        </h1>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
            onClick={() => saveToServer("draft")}
            disabled={saving}
          >
            Save as Draft
          </button>

          <button
            className={`px-4 py-2 rounded text-sm text-white ${
              isBalanced ? "bg-teal-600" : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={() => isBalanced && saveToServer("post")}
            disabled={!isBalanced || saving}
          >
            Post Journal
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left side */}
        <div className="col-span-8 space-y-6">
          <div className="bg-white border rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-4">Journal Details</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-gray-500 text-sm">Journal Date</label>
                <input
                  type="date"
                  value={form.journalDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, journalDate: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-gray-500 text-sm">Reference No.</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reference: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-2 mt-1"
                />
              </div>

              <div className="col-span-2">
                <label className="text-gray-500 text-sm">Narration</label>
                <textarea
                  rows="2"
                  value={form.narration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, narration: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-2 mt-1"
                ></textarea>
              </div>

              <div>
                <label className="text-gray-500 text-sm">Prepared By</label>
                <input
                  type="text"
                  value={form.preparedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, preparedBy: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-2 mt-1"
                />
              </div>

              <div>
                <label className="text-gray-500 text-sm">Status</label>
                <p className="mt-1 bg-gray-100 inline-block px-3 py-1 rounded">
                  {form.status}
                </p>
              </div>
            </div>
          </div>

          {/* Lines Editor */}
          <div className="bg-white border rounded-lg shadow p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Journal Lines</h3>
              <button
                onClick={addLine}
                className="bg-teal-600 text-white px-3 py-1.5 rounded"
              >
                <HiPlus className="inline-block mr-1" /> Add Line
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-600">
                  <th className="py-2 text-left">Account Ledger</th>
                  <th className="py-2 text-left">Description</th>
                  <th className="py-2 text-right">Debit</th>
                  <th className="py-2 text-right">Credit</th>
                  <th className="py-2 text-left">Cost Centre</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {lines.map((ln, idx) => (
                  <tr key={ln.id} className="border-b">
                    <td className="py-2">
                      <select
                        value={ln.ledger}
                        onChange={(e) =>
                          updateLine(idx, "ledger", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option>Select account</option>
                        {ACCOUNT_LEDGERS.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2">
                      <input
                        type="text"
                        value={ln.description}
                        onChange={(e) =>
                          updateLine(idx, "description", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>

                    <td className="py-2 text-right">
                      <input
                        type="number"
                        value={ln.debit}
                        onChange={(e) =>
                          updateLine(idx, "debit", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full text-right"
                      />
                    </td>

                    <td className="py-2 text-right">
                      <input
                        type="number"
                        value={ln.credit}
                        onChange={(e) =>
                          updateLine(idx, "credit", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full text-right"
                      />
                    </td>

                    <td className="py-2">
                      <select
                        value={ln.costCentre}
                        onChange={(e) =>
                          updateLine(idx, "costCentre", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option>Cost</option>
                        {COST_CENTRES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 text-center">
                      <button
                        onClick={() => deleteLine(ln.id)}
                        className="text-red-500"
                      >
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="col-span-4">
          <div className="bg-white border rounded-lg shadow p-6 sticky top-24">
            <h3 className="font-bold mb-4">Summary</h3>

            <div className="flex justify-between border-b pb-2 mb-2 text-sm">
              <span>Total Debit</span>
              <span>{fmt(totalDebitVal)}</span>
            </div>

            <div className="flex justify-between border-b pb-2 mb-2 text-sm">
              <span>Total Credit</span>
              <span>{fmt(totalCreditVal)}</span>
            </div>

            <div className="flex justify-between text-base font-bold">
              <span>Difference</span>
              <span className={isBalanced ? "text-green-600" : "text-red-600"}>
                {isBalanced ? "Balanced" : fmt(Math.abs(totalDebitVal - totalCreditVal))}
              </span>
            </div>

            <p className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 border rounded">
              You can only post a journal when the entry is balanced.
            </p>

            <button
              className="mt-4 w-full border px-4 py-2 rounded"
              onClick={() => saveToServer("draft")}
              disabled={saving}
            >
              Save as Draft
            </button>

            <button
              className={`mt-2 w-full px-4 py-2 rounded text-white ${
                isBalanced ? "bg-teal-600" : "bg-gray-400"
              }`}
              onClick={() => isBalanced && saveToServer("post")}
              disabled={!isBalanced || saving}
            >
              Post Journal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================
    JOURNAL LIST
============================= */
function JournalList({ vouchers, loading, onView, onEdit, onCreate, onDelete }) {
  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Journal Vouchers</h1>
          <p className="text-gray-600 text-sm">Adjustments, corrections & non-cash entries</p>
        </div>

        <button
          onClick={onCreate}
          className="px-4 py-2 bg-teal-600 text-white rounded"
        >
          <HiPlus className="inline-block mr-1" /> Create Journal Voucher
        </button>
      </div>

      <div className="bg-white border rounded shadow">
        <div className="p-4 border-b flex justify-between bg-gray-50">
          <h2 className="font-semibold">Journal Voucher List</h2>
          <span className="text-gray-500 text-sm">Total: {vouchers.length}</span>
        </div>

        {loading ? (
          <div className="p-6">Loading...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-6 text-gray-500">No vouchers found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 uppercase text-xs">
                <th className="py-3 px-4 text-left">JV No.</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Reference</th>
                <th className="py-3 px-4 text-left">Narration</th>
                <th className="py-3 px-4 text-right">Debit</th>
                <th className="py-3 px-4 text-right">Credit</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>

            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-teal-600 font-medium">{v.voucherNo}</td>
                  <td className="py-3 px-4">{v.journalDate}</td>
                  <td className="py-3 px-4">{v.reference}</td>
                  <td className="py-3 px-4">{v.narration}</td>
                  <td className="py-3 px-4 text-right">{fmt(v.totalDebit)}</td>
                  <td className="py-3 px-4 text-right">{fmt(v.totalCredit)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        v.status === "Posted"
                          ? "bg-green-100 text-green-700"
                          : v.status === "Draft"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 flex gap-3">
                    <button onClick={() => onView(v.id)} className="text-gray-600">
                      <HiOutlineEye />
                    </button>

                    <button onClick={() => onEdit(v.id)} className="text-teal-600">
                      <HiOutlinePencil />
                    </button>

                    <button onClick={() => onDelete(v.id)} className="text-red-500">
                      <HiOutlineTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ===========================
    MAIN WRAPPER
============================= */
export default function JournalVoucherPage() {
  const [mode, setMode] = useState("list");
  const [vouchers, setVouchers] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/journals");
      setVouchers(res.data || []);
    } catch {
      alert("Failed to load journals");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openView = (id) => {
    setActiveId(id);
    setMode("view");
  };

  const openCreate = async (id) => {
    if (id) {
      try {
        const res = await api.get(`/api/journals/${id}`);
        setEditingVoucher(res.data);
      } catch {
        alert("Failed to load voucher");
        return;
      }
    } else {
      setEditingVoucher(null);
    }
    setMode("create");
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete voucher?")) return;
    await api.delete(`/api/journals/${id}`);
    fetchList();
    setMode("list");
  };

  const handleSave = async () => {
    await fetchList();
    setMode("list");
  };

  return (
    <div className="flex-1">
      {mode === "list" && (
        <JournalList
          vouchers={vouchers}
          loading={loading}
          onView={openView}
          onEdit={openCreate}
          onCreate={() => openCreate(null)}
          onDelete={handleDelete}
        />
      )}

      {mode === "view" && (
        <ViewJournalVoucher
          voucher={vouchers.find((v) => v.id === activeId)}
          onBack={() => setMode("list")}
          onDelete={handleDelete}
          onEdit={openCreate}
        />
      )}

      {mode === "create" && (
        <CreateJournalVoucher
          initialData={editingVoucher}
          onCancel={() => setMode("list")}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
