import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ReportChart({ data, xKey, yKey, label }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{label}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey={xKey} 
            tickLine={false} 
            axisLine={{ stroke: "#e5e7eb" }}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />
          <Tooltip 
            contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            labelStyle={{ fontWeight: 600, color: '#1f2937' }}
          />
          <Bar dataKey={yKey} fill="#0d9488" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}