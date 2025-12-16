import { useEffect, useState } from "react";
import { getSales } from "../../../api/reportsApi";
import ReportStatCard from "./ReportStatCard";
import ReportFilters from "./ReportFilters";
import ReportTable from "./ReportTable";
import ReportChart from "./ReportChart";
import { CURRENCY } from "../../../api/utils/currency";

export default function SalesReport() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    invoices: 0,
    cash: 0,
    card: 0,
  });
  const [chartData, setChartData] = useState([]);

  const fetchSales = async (filters = {}) => {
    try {
      const res = await getSales(filters);
      const data = res.data || [];

      setSales(data);

      // ---- KPI calculations (frontend aggregation for now) ----
      let total = 0;
      let cash = 0;
      let card = 0;
      const chartMap = {};

      data.forEach((s) => {
        const amount = Number(s.amount) || 0;
        total += amount;

        if (s.paymentMode === "CASH") cash += amount;
        if (s.paymentMode === "CARD") card += amount;

        const dateKey = s.date;
        chartMap[dateKey] = (chartMap[dateKey] || 0) + amount;
      });

      setSummary({
        total,
        invoices: data.length,
        cash,
        card,
      });

      setChartData(
        Object.keys(chartMap).map((d) => ({
          date: d,
          total: chartMap[d],
        }))
      );
    } catch (err) {
      console.error("Failed to load sales report", err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ReportStatCard
          title="Total Sales"
          value={`${CURRENCY} ${summary.total}`}
        />
        <ReportStatCard
          title="Invoices"
          value={summary.invoices}
        />
        <ReportStatCard
          title="Cash Sales"
          value={`${CURRENCY} ${summary.cash}`}
        />
        <ReportStatCard
          title="Card Sales"
          value={`${CURRENCY} ${summary.card}`}
        />
      </div>

      {/* Chart */}
      <ReportChart
        data={chartData}
        xKey="date"
        yKey="total"
        label="Sales Trend"
      />

      {/* Filters */}
      <ReportFilters onFilter={fetchSales} />

      {/* Table */}
      <ReportTable
        columns={["Date", "Invoice", "Amount", "Payment Mode"]}
        data={sales.map((s) => ({
          date: s.date,
          invoice: s.invoiceNo,
          amount: `${CURRENCY} ${s.amount}`,
          paymentMode: s.paymentMode,
        }))}
      />
    </div>
  );
}
