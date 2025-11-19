const classAttendanceRates = [
  { name: "Yoga", rate: 85, count: "18/20" },
  { name: "HIIT", rate: 53, count: "14/15" },
  { name: "Pilates", rate: 83, count: "10/12" },
];

export default function ClassAttendanceRates() {
  return (
    <div className="bg-white p-4 rounded shadow border border-gray-100">
      <p className="font-semibold mb-3 text-sm">Class Attendance Rates</p>
      <p className="text-xs text-gray-400 mb-4">Attendance percentage by class type</p>
      {classAttendanceRates.map(({ name, rate, count }, i) => (
        <div key={i} className="mb-3 last:mb-0">
          <div className="flex justify-between text-xs mb-1">
            <span>{name}</span>
            <span>
              {count} ({rate}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div className="h-3 bg-teal-700" style={{ width: `${rate}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}