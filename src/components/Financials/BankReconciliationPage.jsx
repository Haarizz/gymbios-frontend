import { useEffect, useState } from "react";
import {
  getBankReconciliation,
  finalizeReconciliation
} from "../../api/bankReconciliationApi";

export default function BankReconciliation() {
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2025-12-10");

  const [bankBalance, setBankBalance] = useState(0);
  const [ledgerBalance, setLedgerBalance] = useState(0);
  const [difference, setDifference] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Load summary on date change
  useEffect(() => {
  if (!fromDate || !toDate) return;

  const loadData = async () => {
    try {
      const res = await getBankReconciliation(fromDate, toDate);
      setSummary(res.data);
    } catch (err) {
      console.error("Failed to load bank reconciliation", err);
    }
  };

  loadData();
}, [fromDate, toDate]);


  // ✅ Finalize Handler
  const handleFinalize = async () => {
    try {
      setLoading(true);

      await finalizeReconciliation(fromDate, toDate);

      alert("✅ Reconciliation Finalized Successfully");

      const res = await getReconciliationSummary(fromDate, toDate);
      setBankBalance(res.data.bankBalance || 0);
      setLedgerBalance(res.data.ledgerBalance || 0);
      setDifference(res.data.difference || 0);
    } catch (err) {
      console.error("Finalize error:", err);
      alert(err.response?.data || "❌ Finalization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-1">Bank Reconciliation</h2>
      <p className="text-gray-500 mb-4">
        Match bank statements with accounting ledger entries.
      </p>

      {/* DATE FILTER */}
      <div className="border rounded p-4 mb-6 flex gap-4">
        <div>
          <label className="block text-sm mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* SUMMARY BOXES */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="border rounded p-4">
          <p className="text-sm font-medium">BANK BALANCE</p>
          <p className="font-bold">AED {bankBalance.toLocaleString()}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm font-medium">LEDGER BALANCE</p>
          <p className="font-bold">AED {ledgerBalance.toLocaleString()}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm font-medium">DIFFERENCE</p>
          <p className="font-bold text-red-600">
            AED {difference.toLocaleString()}
          </p>
        </div>
      </div>

      {/* FINALIZE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={handleFinalize}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Finalizing..." : "Finalize Reconciliation"}
        </button>
      </div>
    </div>
  );
}
