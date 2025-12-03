// src/pages/Ledgers/components/TransactionsTable.jsx
export default function TransactionsTable({ title, transactions, loading }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-4">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {title || "General Ledger Entries"}
          </h2>
          <p className="text-xs text-slate-400">
            All journal entries and transactions ({transactions.length} entries)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Voucher No.</th>
              <th className="px-4 py-2 text-left">Account</th>
              <th className="px-4 py-2 text-left">Particulars</th>
              <th className="px-4 py-2 text-right">Debit</th>
              <th className="px-4 py-2 text-right">Credit</th>
              <th className="px-4 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Loading transactions...
                </td>
              </tr>
            )}
            {!loading && transactions.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No transactions available.
                </td>
              </tr>
            )}
            {!loading &&
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-2 text-slate-600">{tx.txnDate}</td>
                  <td className="px-4 py-2 text-slate-600">{tx.voucherNo}</td>
                  <td className="px-4 py-2 text-slate-800">
                    {tx.account?.name || "-"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {tx.particulars}
                  </td>
                  <td className="px-4 py-2 text-right text-emerald-700">
                    {tx.debit != null ? tx.debit.toFixed(2) : "-"}
                  </td>
                  <td className="px-4 py-2 text-right text-rose-700">
                    {tx.credit != null ? tx.credit.toFixed(2) : "-"}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-800">
                    {tx.balance != null ? tx.balance.toFixed(2) : "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
