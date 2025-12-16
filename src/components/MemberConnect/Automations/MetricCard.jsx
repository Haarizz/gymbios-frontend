// src/pages/automations/components/MetricCard.jsx
import React from "react";
export default function MetricCard({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}
