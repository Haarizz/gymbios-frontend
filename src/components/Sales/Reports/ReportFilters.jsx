export default function ReportFilters({ onFilter }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-center shadow-sm">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">From:</span>
        <input
          type="date"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
          onChange={(e) => onFilter("from", e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">To:</span>
        <input
          type="date"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-teal-500 focus:border-teal-500"
          onChange={(e) => onFilter("to", e.target.value)}
        />
      </div>
      <button className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700 font-medium transition-colors">
        Apply Filter
      </button>
    </div>
  );
}