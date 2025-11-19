import { useNavigate } from "react-router-dom";

const quickActions = [
  { label: "Add Member", subtitle: "Register new member", className: "bg-gradient-to-r from-blue-500 to-blue-700" },
  { label: "Member Receipt", subtitle: "Generate receipt", className: "bg-gradient-to-r from-green-500 to-green-700" },
  { label: "Renew / Upgrade", subtitle: "Member renewals", className: "bg-gradient-to-r from-purple-500 to-purple-700" },
  { label: "POS", subtitle: "Point of Sale", className: "bg-gradient-to-r from-orange-500 to-orange-700" },
  { label: "Schedule Class", subtitle: "Create class schedule", className: "bg-gradient-to-r from-indigo-500 to-indigo-700" },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="space-x-4 my-4 border border-gray-200 rounded-md p-4 bg-white shadow-sm" >
      <h1 className="text-lg font-semibold mb-2">Quick Actions</h1>
    <div className="flex space-x-4 my-4 ">
      
      
      {quickActions.map(({ label, subtitle, className }, i) => (
        <button
          key={i}
          className={`flex-1 py-4 rounded-md text-white font-semibold shadow-md hover:brightness-110 transition ${className}`}
          onClick={() => {
            if (label === "Add Member") navigate("/addmembers");
          }}
        >
          
          <div className="text-md">{label}</div>
          <div className="text-xs mt-1 font-light">{subtitle}</div>
        </button>
      ))}
    </div>
        </div>
  );
}
