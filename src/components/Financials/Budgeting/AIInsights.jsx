import React from "react";
export default function AIInsights(){
  return (
    <div className="space-y-4">
      <div className="bg-white rounded shadow p-6">
        <div className="font-semibold mb-2">AI Budget Intelligence Engine</div>
        <div className="p-4 bg-indigo-50 rounded">Predictive Budget Forecasting: projected electricity cost will exceed budget by 17% next month.</div>
        <div className="p-4 bg-yellow-50 rounded mt-3">Spike Detection: Electricity bill spike caused by increased treadmill hours.</div>
      </div>
      <div className="bg-white rounded shadow p-6">
        <div className="font-semibold">Cost Optimization Opportunities</div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-green-50 rounded">Bulk Purchase Savings: Save AED 650/mo</div>
          <div className="p-4 bg-blue-50 rounded">Scheduling Efficiency: Save AED 890/mo</div>
        </div>
      </div>
    </div>
  );
}
