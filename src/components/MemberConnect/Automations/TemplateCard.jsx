// src/pages/automations/components/TemplateCard.jsx
import React from "react";
export default function TemplateCard({ data }) {
  if (!data) return null;
  return (
    <div className="border-b pb-3 mb-3">
      <div className="font-medium">{data.title}</div>
      <div className="text-xs text-gray-500">{data.type}</div>
    </div>
  );
}
