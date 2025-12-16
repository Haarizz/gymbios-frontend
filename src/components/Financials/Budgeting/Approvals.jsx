import React, {useEffect, useState} from "react";
import { getApprovals, actionApproval } from "../../../api/budgetingApi";

export default function Approvals(){
  const [list, setList] = useState([]);
  useEffect(()=>{ load(); },[]);
  function load(){ getApprovals().then(setList).catch(e=>console.error(e)); }

  async function handleAction(id, action){
    try {
      await actionApproval(id, { status: action });
      load();
    } catch(e){ console.error(e); }
  }

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="font-semibold mb-4">Budget Approval Workflow</div>
      <div className="space-y-4">
        {list.map(a=>(
          <div key={a.id} className="border rounded p-4 flex justify-between">
            <div>
              <div className="font-medium">BGT-{a.budget ? a.budget.id : "—"} <span className="text-sm text-yellow-700">{a.status}</span></div>
              <div className="text-sm text-gray-600">Category: {a.budget?.category?.name}</div>
              <div className="text-sm text-gray-600">Amount: AED {a.budget?.amount}</div>
              <div className="text-sm text-gray-600">Submitted By: {a.submittedBy?.name}</div>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={()=>handleAction(a.id,"Approved")} className="bg-green-600 text-white px-4 py-2 rounded">Approve</button>
              <button onClick={()=>handleAction(a.id,"Rejected")} className="bg-red-600 text-white px-4 py-2 rounded">Reject</button>
              <button onClick={()=>handleAction(a.id,"RevisionRequested")} className="px-3 py-2 border rounded">Revise</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
