import React, { useEffect, useState } from "react";
import { getConfig, saveConfig } from "../../api/gymosApi";
import { Settings, RefreshCw, AlertCircle, Check, Save } from "lucide-react";

export default function Configuration() {
  // We maintain the "config" string state for API compatibility, 
  // but we use discrete state for the UI form controls.
  const [transferPolicy, setTransferPolicy] = useState({
    allowTransfer: true,
    feeType: "Flat Fee",
    feeAmount: 100,
    minDays: 15,
    adminApproval: true
  });
  
  const [deactivationPolicy, setDeactivationPolicy] = useState({
    allowDeactivation: true,
    allowRefund: true,
    refundMethod: "Pro-Rated (Days Remaining)",
    approvalRequired: true
  });

  const [saving, setSaving] = useState(false);

  // In a real app, you would parse the incoming config string to JSON
  // Here we just mock the load for the UI demo
  useEffect(() => {
    getConfig().then((c) => {
      // Logic to parse c.payload would go here
      console.log("Config loaded:", c);
    });
  }, []);

  async function save() {
    setSaving(true);
    try {
      // We package our form state back into the config object expected by the API
      const newConfigPayload = JSON.stringify({ transferPolicy, deactivationPolicy });
      await saveConfig({ config: newConfigPayload });
      alert("Configuration policies updated successfully");
    } catch (err) {
      alert("Save failed");
    }
    setSaving(false);
  }

  // --- Helper Components ---
  const PolicyHeader = ({ icon: Icon, title, description, active }) => (
    <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-4">
      <div className={`p-2 rounded-lg ${active ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );

  const ToggleRow = ({ label, desc, value, onChange, badge }) => (
    <div className="flex justify-between items-center py-4">
      <div>
        <div className="font-medium text-gray-800 text-sm">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
      <div className="flex items-center gap-3">
        {badge && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{badge}</span>}
        <button 
          onClick={() => onChange(!value)}
          className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${value ? 'left-7' : 'left-1'}`}></div>
        </button>
        <span className={`text-xs font-medium ${value ? 'text-green-600' : 'text-gray-400'}`}>
          {value ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center gap-3 text-gray-800 mb-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <h2 className="font-semibold">GymOS Configuration & Policies</h2>
        </div>
        <p className="text-sm text-gray-500 ml-8">Manage system-wide operational policies and member management rules.</p>
      </div>

      {/* Transfer Policy Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <PolicyHeader 
          icon={RefreshCw} 
          title="Transfer Policy" 
          description="Configure rules for transferring memberships between members" 
          active={true}
        />

        <div className="space-y-2 divide-y divide-gray-50">
          <ToggleRow 
            label="Allow Transfer" 
            desc="Enable or disable membership transfer feature" 
            value={transferPolicy.allowTransfer}
            onChange={(v) => setTransferPolicy({...transferPolicy, allowTransfer: v})}
          />
          
          <div className="grid grid-cols-2 gap-4 py-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure</label>
                <select 
                  className="w-full border-gray-200 border rounded-lg p-2 text-sm bg-gray-50"
                  value={transferPolicy.feeType}
                  onChange={(e) => setTransferPolicy({...transferPolicy, feeType: e.target.value})}
                >
                  <option>Flat Fee</option>
                  <option>Percentage</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Transfer Fee</label>
                <div className="relative">
                   <span className="absolute left-3 top-2 text-gray-500 text-sm">AED</span>
                   <input 
                      type="number" 
                      className="w-full border-gray-200 border rounded-lg p-2 pl-12 text-sm"
                      value={transferPolicy.feeAmount}
                      onChange={(e) => setTransferPolicy({...transferPolicy, feeAmount: e.target.value})}
                   />
                </div>
             </div>
          </div>

          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Window</label>
            <p className="text-xs text-gray-500 mb-2">Restrict when transfers can be initiated after member joins</p>
            <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 inline-block w-20 text-center text-sm font-semibold">
               {transferPolicy.minDays}
            </div>
            <p className="text-xs text-gray-400 mt-1">e.g., Transfer allowed only after 15 days of joining</p>
          </div>

          <ToggleRow 
            label="Require Admin Approval" 
            desc="All transfer requests need manager approval" 
            value={transferPolicy.adminApproval}
            onChange={(v) => setTransferPolicy({...transferPolicy, adminApproval: v})}
            badge="Optional"
          />
        </div>
      </div>

      {/* Deactivation Policy Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <PolicyHeader 
          icon={AlertCircle} 
          title="Member Deactivation Policy" 
          description="Control conditions for membership deactivation and refunds" 
          active={true}
        />

        <div className="space-y-2 divide-y divide-gray-50">
          <ToggleRow 
            label="Allow Deactivation" 
            desc="Global toggle for membership deactivation feature" 
            value={deactivationPolicy.allowDeactivation}
            onChange={(v) => setDeactivationPolicy({...deactivationPolicy, allowDeactivation: v})}
          />
           <ToggleRow 
            label="Allow Refund" 
            desc="Enable refund processing during deactivation" 
            value={deactivationPolicy.allowRefund}
            onChange={(v) => setDeactivationPolicy({...deactivationPolicy, allowRefund: v})}
          />
          
          <div className="py-4">
             <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method</label>
             <p className="text-xs text-gray-500 mb-2">Determines how refund amounts are calculated</p>
             <select 
                className="w-full border-gray-200 border rounded-lg p-2 text-sm bg-gray-50"
                value={deactivationPolicy.refundMethod}
                onChange={(e) => setDeactivationPolicy({...deactivationPolicy, refundMethod: e.target.value})}
              >
                <option>Pro-Rated (Days Remaining)</option>
                <option>Full Refund</option>
                <option>No Refund</option>
              </select>
          </div>
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-3 z-10 shadow-lg">
         <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded hover:bg-gray-50">
           Reset to Defaults
         </button>
         <button 
           onClick={save} 
           disabled={saving}
           className="px-4 py-2 text-sm font-medium text-white bg-teal-700 rounded hover:bg-teal-800 flex items-center gap-2"
         >
           {saving ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>}
           {saving ? "Saving..." : "Save Configuration"}
         </button>
      </div>
    </div>
  );
}