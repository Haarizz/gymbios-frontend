import React, {useEffect, useState} from "react";
import { getBranches, getMaster } from "../../../api/budgetingApi";

export default function MultiBranch(){
  const [branches, setBranches] = useState([]);
  const [master, setMaster] = useState([]);
  useEffect(()=>{ getBranches().then(setBranches); getMaster().then(setMaster); },[]);
  return (
    <div className="bg-white rounded shadow p-6">
      <div className="font-semibold mb-4">Multi-Branch Budget Comparison</div>
      <table className="min-w-full">
        <thead><tr className="text-left text-sm text-gray-600"><th>Branch</th><th>Budget</th><th>Spent</th><th>Remaining</th><th>Variance</th><th>Status</th></tr></thead>
        <tbody>
          {branches.map(br=>{
            // compute aggregates from master
            const budgetsForBranch = master.filter(m=>m.branch === br.name);
            const budget = budgetsForBranch.reduce((s, b)=> s + Number(b.budget||0), 0);
            const spent = budgetsForBranch.reduce((s,b)=> s + Number(b.spent||0), 0);
            const remaining = budget - spent;
            const variance = budget ? Math.round(((spent - budget)/budget)*100) : 0;
            const status = remaining < 0 ? "Overspent" : "Safe";
            return (
              <tr key={br.id} className="border-t">
                <td className="p-3">{br.name}</td>
                <td>AED {budget}</td>
                <td className="text-red-600">AED {spent}</td>
                <td className="text-green-600">AED {remaining}</td>
                <td>{variance}%</td>
                <td>{status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
