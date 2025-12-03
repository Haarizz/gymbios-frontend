// src/pages/Ledgers/components/CostCentersGrid.jsx
export default function CostCentersGrid({ costCenters, loading }) {
  if (loading) {
    return (
      <div className="mt-4 text-sm text-slate-400">Loading cost centers...</div>
    );
  }

  if (!loading && costCenters.length === 0) {
    return (
      <div className="mt-4 text-sm text-slate-400">
        No cost centers available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {costCenters.map((cc) => (
        <div
          key={cc.id}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-3"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {cc.name}
              </div>
              <div className="text-[11px] text-slate-400">
                {cc.code || "CC-000"}
              </div>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              {cc.active === false ? "inactive" : "active"}
            </span>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <div>Branch: {cc.branch || "All Branches"}</div>
            <div>Manager: {cc.manager || "-"}</div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Budget Amount</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-800">
              AED{" "}
              {(cc.budgetAmount || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            {/* Description or placeholder */}
            {cc.description || "Departmental budget allocation and tracking."}
          </div>
        </div>
      ))}
    </div>
  );
}
