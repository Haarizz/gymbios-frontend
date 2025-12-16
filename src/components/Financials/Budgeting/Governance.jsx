import React, {useEffect, useState} from "react";
import { getRules, createRule } from "../../../api/budgetingApi";

export default function Governance(){
  const [rules, setRules] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  useEffect(()=>{ load(); },[]);
  function load(){ getRules().then(setRules).catch(e=>console.error(e)); }
  async function add(){
    try {
      await createRule({ title, description: desc, status: "Active" });
      setTitle(""); setDesc("");
      load();
    } catch(e){ console.error(e); }
  }
  return (
    <div>
      <div className="bg-white rounded shadow p-6 mb-4">
        <div className="font-semibold mb-2">Budget Rule Engine</div>
        <div className="space-y-2">
          {rules.map(r=>(
            <div key={r.id} className="p-3 border rounded">
              <div className="font-medium">{r.title} <span className="text-sm text-green-600">{r.status}</span></div>
              <div className="text-sm text-gray-600">{r.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <div className="font-semibold mb-2">Add New Rule</div>
        <input className="w-full border p-2 mb-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Rule title"/>
        <textarea className="w-full border p-2 mb-2" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description"/>
        <button onClick={add} className="px-4 py-2 bg-teal-700 text-white rounded">Add Rule</button>
      </div>
    </div>
  );
}
