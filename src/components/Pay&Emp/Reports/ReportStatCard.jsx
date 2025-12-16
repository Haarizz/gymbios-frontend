import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/solid"; 

export default function ReportStatCard({ title, value, trend }) {
  // Default values for trend visualization
  const trendValue = trend?.value || "+2.1%";
  const isPositive = trend?.isPositive !== false;
  const trendText = trend?.text || "Monthly retention rate"; // Example text from reference UI

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {isPositive ? (
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
        ) : (
          <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              isPositive 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}
          >
            {trendValue}
          </span>
          <span className="text-xs text-gray-400">{trendText}</span>
        </div>
      </div>
    </div>
  );
}