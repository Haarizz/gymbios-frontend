// src/pages/Ledgers/components/AccountsTable.jsx
export default function AccountsTable({ accounts, loading }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mt-4">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">
          Chart of Accounts
        </h2>
        <p className="text-xs text-slate-400">
          Complete listing of all accounts ({accounts.length})
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Group</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Cost Center</th>
              <th className="px-4 py-2 text-left">Balance</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Loading accounts...
                </td>
              </tr>
            )}
            {!loading && accounts.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No accounts found.
                </td>
              </tr>
            )}
            {!loading &&
              accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-2 text-slate-600">
                    {acc.accountCode || "-"}
                  </td>
                  <td className="px-4 py-2 text-slate-800">{acc.name}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {acc.accountGroup || "-"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {acc.branch || "-"}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {acc.costCenterName || acc.costCenterId || "-"}
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {acc.openingBalance != null
                      ? acc.openingBalance.toFixed(2)
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {acc.active === false ? "inactive" : "active"}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
