import React, {useEffect, useState} from "react";
import { getMaster } from "../../../api/budgetingApi";

export default function Master(){
  const [list, setList] = useState([]);
  useEffect(()=>{ getMaster().then(setList).catch(e=>console.error(e)); },[]);
  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-lg">Budget Master - All Categories</div>
        <div className="flex gap-2">
          <input placeholder="Search budgets..." className="border rounded px-3 py-2"/>
          <button className="px-3 py-2 border rounded">Filter</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600">
              <th className="p-3">ID</th><th>Category</th><th>Department</th><th>Type</th><th>Budget</th><th>Spent</th><th>Remaining</th><th>Utilization</th><th>Status</th><th>Responsible</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r)=>(
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.code || `BDG${r.id}`}</td>
                <td>{r.category}</td>
                <td>{r.department}</td>
                <td>{r.type}</td>
                <td>AED {r.budget}</td>
                <td className="text-red-600">AED {r.spent}</td>
                <td className="text-green-600">AED {r.remaining}</td>
                <td> {/* simple utilization */}
                  {r.budget && r.spent ? Math.round((r.spent / r.budget) * 100) + "%" : "—"}
                </td>
                <td>{r.status}</td>
                <td>{r.responsible}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
