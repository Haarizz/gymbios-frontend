// src/pages/automations/Workflows.jsx
import React, { useEffect, useState } from "react";
import { fetchAutomations, runAutomation, updateAutomation } from "../../../api/automationsApi";
import WorkflowCard from "./WorkflowCard";

export default function Workflows() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAutomations();
      setItems(Array.isArray(data) ? data : (data.items || []));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRun = async (id) => {
    await runAutomation(id);
    await load();
  };

  const handleToggle = async (automation) => {
    await updateAutomation(automation.id, { ...automation, active: !automation.active });
    await load();
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!items.length) return <div className="p-6">No workflows</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <div className="text-sm text-gray-500">Manage automation workflows</div>
        </div>
        <button className="bg-emerald-700 text-white px-4 py-2 rounded">+ Create Workflow</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {items.map(it => (
          <WorkflowCard
            key={it.id}
            data={it}
            onRun={() => handleRun(it.id)}
            onToggle={() => handleToggle(it)}
            onEdit={() => window.location.href = `/automations/${it.id}/edit`}
          />
        ))}
      </div>
    </div>
  );
}
