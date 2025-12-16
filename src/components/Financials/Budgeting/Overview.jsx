import React, {useEffect, useState} from "react";
import { getOverview, getBva } from "../../../api/budgetingApi";

export default function Overview(){
  const [metrics, setMetrics] = useState(null);
  useEffect(()=>{ load(); },[]);
  async function load(){
    try {
      const m = await getOverview();
      setMetrics(m);
    } catch(e){ console.error(e); }
  }
  if(!metrics) return <div>Loading...</div>;
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-6 bg-white rounded shadow">
          <div className="text-sm">Total Budget</div>
          <div className="text-2xl font-bold">AED {metrics.totalBudget}</div>
        </div>
        <div className="p-6 bg-white rounded shadow">
          <div className="text-sm">Total Spent</div>
          <div className="text-2xl font-bold">AED {metrics.totalSpent}</div>
        </div>
        <div className="p-6 bg-white rounded shadow">
          <div className="text-sm">Remaining</div>
          <div className="text-2xl font-bold">AED {metrics.remaining}</div>
        </div>
        <div className="p-6 bg-white rounded shadow">
          <div className="text-sm">Budgets</div>
          <div className="text-2xl font-bold">{metrics.budgetsCount}</div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="text-lg font-semibold mb-4">Budget vs Actual Comparison</div>
        <div style={{height:300}} className="bg-gray-50 rounded border">Chart placeholder (use Recharts/Chart.js and call /budgeting/analytics/bva)</div>
      </div>
    </div>
  );
}
