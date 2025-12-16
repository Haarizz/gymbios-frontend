import { useEffect, useState } from "react";
import { getEmployees, getSalaryPayments } from "../../../api/salaryPaymentsApi";
import ReportStatCard from "./ReportStatCard";
import ReportTable from "./ReportTable";
import ReportChart from "./ReportChart";

export default function StaffReport() {
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    staff: 0,
    paid: 0,
    payments: 0,
  });

  useEffect(() => {
    async function load() {
      const employeesRes = await getEmployees();
      const salaryRes = await getSalaryPayments();

      const employees = employeesRes.data || [];
      const salaries = salaryRes.data || [];

      let totalPaid = 0;
      const monthMap = {};

      salaries.forEach((s) => {
        const amt = Number(s.amount || 0);
        totalPaid += amt;

        const m = s.month || "Unknown";
        monthMap[m] = (monthMap[m] || 0) + amt;
      });

      setSummary({
        staff: employees.length,
        paid: totalPaid,
        payments: salaries.length,
      });

      setRows(
        salaries.map((s) => ({
          employee: s.staffName || s.employeeName || "-",
          month: s.month,
          amount: `₹${s.amount}`,
          status: s.status,
        }))
      );

      setChartData(
        Object.keys(monthMap).map((m) => ({
          month: m,
          amount: monthMap[m],
        }))
      );
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4">
        <ReportStatCard title="Total Staff" value={summary.staff} />
        <ReportStatCard title="Salary Paid" value={`₹${summary.paid}`} />
        <ReportStatCard title="Payments" value={summary.payments} />
      </div>

      {/* Chart */}
      <ReportChart
        data={chartData}
        xKey="month"
        yKey="amount"
        label="Salary Paid per Month"
      />

      {/* Table */}
      <ReportTable
        columns={["Employee", "Month", "Amount", "Status"]}
        data={rows}
      />
    </div>
  );
}