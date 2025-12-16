import React, { useEffect, useState } from "react";
import { getApiIntegrations } from "../../api/gymosApi"; // Kept for reference
import { Target, TrendingUp, Users, CheckCircle, Clock, Calculator, ArrowRight } from "lucide-react";

export default function PerformanceMetrics() {
  // Using static data to match the UI screenshot exactly, 
  // as the original API (getApiIntegrations) is for a different purpose.
  const [stats] = useState({
    activeTargets: 5,
    overallProgress: 76.8,
    activeStaff: 5,
    targetsMet: 2,
    inProgress: 3,
    totalCommission: "AED 1,540"
  });

  return (
    <div className="space-y-6">
      
      {/* Top Row: Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Set Targets Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
           <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Target size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">Set Targets</h3>
                    <p className="text-sm text-gray-500">Configure staff revenue and unit-based targets</p>
                 </div>
              </div>
              <button className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                 <Target size={16}/> Configure Targets
              </button>
           </div>
           
           <div className="bg-blue-50/50 rounded-xl p-4 flex items-center justify-between border border-blue-100">
              <div>
                 <div className="text-sm text-blue-600 font-medium">Active Targets</div>
                 <div className="text-3xl font-bold text-blue-900">{stats.activeTargets}</div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm text-blue-500">
                 <TrendingUp size={20} />
              </div>
           </div>
           <p className="text-xs text-gray-400 mt-4">Manage individual staff and institution-wide performance targets.</p>
        </div>

        {/* Targets Overview Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
           <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4">
                 <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <TrendingUp size={24} />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">Targets Overview</h3>
                    <p className="text-sm text-gray-500">Monitor staff performance and target achievement</p>
                 </div>
              </div>
              <button className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                 View Dashboard
              </button>
           </div>

           <div className="bg-green-50/50 rounded-xl p-4 flex items-center justify-between border border-green-100">
              <div>
                 <div className="text-sm text-green-600 font-medium">Overall Progress</div>
                 <div className="text-3xl font-bold text-green-900">{stats.overallProgress}%</div>
              </div>
              <div className="bg-white p-2 rounded shadow-sm text-green-500">
                 <TrendingUp size={20} />
              </div>
           </div>
           <p className="text-xs text-gray-400 mt-4">Real-time performance tracking and analytics dashboard.</p>
        </div>
      </div>

      {/* Performance Summary Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">Performance Summary</h3>
        <p className="text-sm text-gray-500 mb-6">Overview of current staff performance metrics</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-blue-800 font-medium">Active Staff</div>
            <div className="text-2xl font-bold text-blue-900">{stats.activeStaff}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm text-green-800 font-medium">Targets Met</div>
            <div className="text-2xl font-bold text-green-900">{stats.targetsMet}</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 text-center">
            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-sm text-yellow-800 font-medium">In Progress</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.inProgress}</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 text-center">
            <Calculator className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm text-purple-800 font-medium">Total Commission</div>
            <div className="text-2xl font-bold text-purple-900">{stats.totalCommission}</div>
          </div>
        </div>
      </div>

    </div>
  );
}