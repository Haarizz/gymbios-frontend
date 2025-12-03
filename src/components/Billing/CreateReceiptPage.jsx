// src/pages/Billing/CreateReceiptPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMembers } from "../../api/member";
import { fetchMemberPendingBills, payBill } from "../../api/billingApi";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Search,
  UserCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Loader2,
} from "lucide-react";

export default function CreateReceiptPage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const [pendingBills, setPendingBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // ---------- Load members ----------
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await getMembers();
        setMembers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load members");
      }
    };
    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return [];
    const q = memberSearch.toLowerCase();
    return members.filter((m) => {
      const name = `${m.firstname || ""} ${m.lastname || ""}`.toLowerCase();
      return (
        name.includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        String(m.id || "").includes(q)
      );
    });
  }, [members, memberSearch]);

  const totalOutstanding = pendingBills.reduce(
    (acc, b) => acc + (Number(b.amount || 0) - Number(b.paidAmount || 0)),
    0
  );

  // ---------- Select member & load pending bills ----------
  const handleSelectMember = async (m) => {
    setSelectedMember(m);
    setMemberSearch(
      `${m.firstname || ""} ${m.lastname || ""}`.trim() || "Member"
    );
    setPendingBills([]);
    setAmount("");
    try {
      setLoadingBills(true);
      const data = await fetchMemberPendingBills(m.id);
      setPendingBills(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load pending bills");
    } finally {
      setLoadingBills(false);
    }
  };

  // ---------- Auto Apply (for FIRST bill only – backend pays one bill at a time) ----------
  const handleAutoApply = () => {
    if (!pendingBills.length) return;

    const firstBill = pendingBills[0];
    const outstanding =
      Number(firstBill.amount || 0) - Number(firstBill.paidAmount || 0);

    setAmount(outstanding.toFixed(2));
  };

  // ---------- Pay Now ----------
  const handlePayNow = async () => {
    console.log("PAY NOW CLICKED");

    if (!selectedMember) {
      toast.error("Select a member first");
      return;
    }
    if (pendingBills.length === 0) {
      toast.error("No pending bills for this member");
      return;
    }

    const val = Number(amount);
    if (Number.isNaN(val) || val <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    const firstBill = pendingBills[0]; // simple FIFO: pay oldest bill
    const outstanding =
      Number(firstBill.amount || 0) - Number(firstBill.paidAmount || 0);

    if (val > outstanding) {
      toast.error(
        `Amount exceeds outstanding for selected bill (max AED ${outstanding.toFixed(
          2
        )})`
      );
      return;
    }

    try {
      setSaving(true);
      await payBill(firstBill.id, {
        amount: val,
        paymentMode,
        paymentDate,
      });
      toast.success("Payment recorded");
      navigate("/billing");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8 md:py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/billing")}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Billing
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Create Receipt
            </h1>
            <p className="text-xs text-gray-500">
              Search member, settle payments, and generate receipts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: member + pending bills */}
        <div className="space-y-4">
          {/* Find member */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">
              Find Member
            </p>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setSelectedMember(null);
                  setPendingBills([]);
                }}
                placeholder="Search by Name, Mobile Number, Member ID, or Email"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {filteredMembers.length > 0 && !selectedMember && (
              <div className="mt-3 max-h-56 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMember(m)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
                      {(m.firstname || "M").charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {(m.firstname || "") + " " + (m.lastname || "")}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {m.email || m.mobile || ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected member */}
          {selectedMember && (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-800">
                  Selected Member
                </p>
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setPendingBills([]);
                    setAmount("");
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Clear Selection
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">
                  {(selectedMember.firstname || "M").charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {(selectedMember.firstname || "") +
                      " " +
                      (selectedMember.lastname || "")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedMember.email || selectedMember.mobile || ""}
                  </p>
                  <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-100">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pending bills */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-800">
                Pending Bills / Dues
              </p>
              <p className="text-xs text-gray-500">
                Amount:{" "}
                <span className="font-semibold text-gray-900">
                  AED {totalOutstanding.toFixed(2)}
                </span>
              </p>
            </div>

            {loadingBills ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Loading pending bills...
              </div>
            ) : pendingBills.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                {selectedMember
                  ? "No pending bills for this member."
                  : "Select a member to view pending bills."}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Due No</th>
                        <th className="px-3 py-2 text-left">Service</th>
                        <th className="px-3 py-2 text-left">Due Date</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-right">Paid</th>
                        <th className="px-3 py-2 text-right">Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingBills.map((b) => {
                        const due =
                          Number(b.amount || 0) - Number(b.paidAmount || 0);
                        return (
                          <tr key={b.id} className="bg-white">
                            <td className="px-3 py-2 text-[11px] text-gray-700">
                              {b.invoiceNumber ||
                                `INV-${String(b.id).padStart(4, "0")}`}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-gray-700">
                              {b.service}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-gray-700">
                              {b.dueDate || "-"}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-right text-gray-700">
                              AED {Number(b.amount || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-right text-gray-700">
                              AED {Number(b.paidAmount || 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-[11px] text-right font-semibold text-gray-900">
                              AED {due.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleAutoApply}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Auto-Apply Payment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column: payment */}
        <div className="space-y-4">
          {/* Settle payment */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">
              Settle Payment
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {["Cash", "Card", "Bank Transfer", "Online"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
                    paymentMode === mode
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-3 h-3" />
                  {mode}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="w-24 text-xs text-gray-500">
                  Payment Date
                </label>
                <div className="flex-1 relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="w-24 text-xs text-gray-500">
                  Amount (AED)
                </label>
                <div className="flex-1 relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Finalize */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">
              Finalize Receipt
            </p>

            <div className="border border-gray-100 rounded-lg p-3 mb-3 text-xs bg-gray-50">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Total Outstanding</span>
                <span className="font-semibold text-gray-900">
                  AED {totalOutstanding.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Receipt Total</span>
                <span className="font-semibold text-gray-900">
                  AED {amount || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Balance Remaining</span>
                <span className="font-semibold text-gray-900">
                  AED{" "}
                  {Math.max(totalOutstanding - Number(amount || 0), 0).toFixed(
                    2
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay Now
                  <UserCircle className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
