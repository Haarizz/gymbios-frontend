import React from "react";
import { CreditCard } from "lucide-react";

export default function POSMode() {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-20 text-center animate-in fade-in zoom-in-95 duration-300">
      
      <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mb-6">
        <CreditCard size={32} />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">POS Mode</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Access Point of Sale functionality for retail and F&B operations. 
        Ensure your shift is opened before proceeding.
      </p>

      <button className="px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
        Launch POS Mode
      </button>
    </div>
  );
}