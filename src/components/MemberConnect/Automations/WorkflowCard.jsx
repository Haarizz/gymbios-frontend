// src/pages/automations/components/WorkflowCard.jsx
import React from "react";
import { User, Send, CheckCircle, BarChart2 } from 'lucide-react'; // Assuming lucide-react for icons

// Helper function for date formatting (kept as is)
function fmtDate(d) { 
    if (!d) return "—"; 
    try { 
        // Formatting date to a simpler display like "Mar 10, 2024" or just "Mar 10" based on typical UI patterns
        return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); 
    } catch { 
        return d; 
    } 
}

// Helper component for small Trigger/Action badges with icons (based on screenshot style)
const Badge = ({ label, icon: Icon, colorClass = "bg-gray-100 text-gray-700" }) => (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {Icon && <Icon size={12} />}
        {label}
    </div>
);

// Map common trigger/action IDs to icons (placeholders)
const iconMap = {
    // Triggers
    "MEMBERSHIP_EXPIRY": BarChart2,
    "NEW_MEMBER_SIGNUP": User,
    "MISSED_WORKOUT": User, // Using generic user icon for engagement
    "MEMBER_BIRTHDAY": User,
    // Actions
    "SEND_EMAIL": Send,
    "SEND_SMS": Send,
    "SEND_WHATSAPP": Send,
    "PUSH_NOTIFICATION": Send,
    "IN_APP": Send,
    "CREATE_TASK": CheckCircle,
};

export default function WorkflowCard({ data = {} }) {
  const {
    name, active, trigger, actions, totalRuns, successRate, conversionRate, membersEngaged, lastRun, nextRun
  } = data;

  // Determine the primary status (Active/Paused)
  const statusText = active ? "Active" : "Paused";
  const statusClasses = active ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-800";
    
  // Format trigger and action labels for display
  const triggerLabel = trigger ? trigger.replace(/_/g, ' ') : 'No Trigger';
  const primaryAction = actions && actions.length > 0 ? actions[0].replace(/_/g, ' ') : 'No Action';
  const TriggerIcon = iconMap[trigger] || null;
  const ActionIcon = iconMap[actions?.[0]] || null;


  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[220px]">
        {/* Header: Status and Name */}
        <div className="flex justify-between items-start mb-3">
            {/* Status Badge */}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses}`}>
                {statusText}
            </span>
            
            {/* Success/Conversion Rates (Placed on top right in the screenshot's style) */}
            <div className="text-right space-y-0.5">
                <div className="text-sm text-emerald-600 font-semibold">{successRate ?? 0}%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
            </div>
        </div>

        {/* Workflow Title */}
        <div className="flex-grow">
            <h4 className="text-base font-semibold text-gray-800">{name}</h4>
            {/* Trigger & Action Badges */}
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {/* Trigger Badge */}
                <Badge 
                    label={triggerLabel} 
                    icon={TriggerIcon} 
                    colorClass="bg-blue-100 text-blue-700" 
                />
                
                {/* Action Badge (showing only the first one for brevity) */}
                {actions && actions.length > 0 && (
                    <Badge 
                        label={primaryAction} 
                        icon={ActionIcon} 
                        colorClass="bg-purple-100 text-purple-700" 
                    />
                )}
            </div>
        </div>

        {/* Footer: Stats and Dates */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs">
            {/* Total Runs, Members Engaged, Conversion Rate */}
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="flex flex-col items-center">
                    <div className="text-gray-500">Total Runs</div>
                    <div className="font-semibold text-gray-800">{totalRuns ?? 0}</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-gray-500">Members Engaged</div>
                    <div className="font-semibold text-gray-800">{membersEngaged ?? 0}</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="text-gray-500">Conversion Rate</div>
                    <div className="font-semibold text-emerald-600">{conversionRate ?? 0}%</div>
                </div>
            </div>

            {/* Last Run & Next Run Dates */}
            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                <div>
                    <div>Last Run</div>
                    <div className="font-medium text-gray-800">{fmtDate(lastRun)}</div>
                </div>
                <div className="text-right">
                    <div>Next Run</div>
                    <div className="font-medium text-gray-800">{fmtDate(nextRun)}</div>
                </div>
            </div>
        </div>
    </div>
  );
}