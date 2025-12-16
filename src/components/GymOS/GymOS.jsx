import React, { useState } from "react";
import SystemOverview from "./SystemOverview";
import POSMode from "./POSMode";
import PerformanceMetrics from "./PerformanceMetrics";
import Configuration from "./Configuration";
import { Info, Filter, Download, RefreshCw } from "lucide-react";

export default function GymOS() {
  const [tab, setTab] = useState("overview");

  const tabButton = (id, label) => (
    <button
      onClick={() => setTab(id)}
      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
        ${
          tab === id
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-800">
      {/* Demo Banner */}
      

      {/* Header Section */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">GymOS</h1>
          <p className="text-gray-500 text-sm">
            Business Operating System - System Configuration & Management for December 2025
          </p>
        </div>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded text-sm font-medium text-gray-600 hover:bg-gray-50">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-100/80 p-1 rounded-full inline-flex gap-1 mb-6 w-full max-w-4xl">
        {tabButton("overview", "System Overview")}
        {tabButton("pos", "POS Mode")}
        {tabButton("metrics", "Performance Metrics")}
        {tabButton("config", "Configuration")}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {tab === "overview" && <SystemOverview />}
        {tab === "pos" && <POSMode />}
        {tab === "metrics" && <PerformanceMetrics />}
        {tab === "config" && <Configuration />}
      </div>
    </div>
  );
}