export default function StatCard({ title, value, diff, icon }) {
  return (
    <div className="bg-white p-4 rounded shadow flex items-center space-x-4 border border-gray-100">
      <div className="flex-1">
        <p className="text-xs text-gray-400">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      {diff && <div className="text-green-500 text-sm font-medium">{diff}</div>}
      {icon && <div className="bg-green-200 text-green-700 p-2 rounded-full text-sm font-bold">{icon}</div>}
    </div>
  );
}