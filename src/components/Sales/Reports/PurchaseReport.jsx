// src/pages/reports/PurchaseReport.jsx
import { useEffect, useState } from "react";
import { getPurchases } from "../../../api/reportsApi";
import ReportStatCard from "./ReportStatCard";
import ReportTable from "./ReportTable";
import ReportChart from "./ReportChart";
import { CURRENCY } from "../../../api/utils/currency";

export default function PurchaseReport() {
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    suppliers: 0,
    invoices: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const res = await getPurchases();
        const data = res.data || [];

        setPurchases(data);

        let total = 0;
        const supplierSet = new Set();
        const chartMap = {};

        data.forEach((p) => {
          const amount = Number(p.totalAmount) || 0;
          total += amount;
          supplierSet.add(p.supplierName);

          const dateKey = p.purchaseDate;
          chartMap[dateKey] = (chartMap[dateKey] || 0) + amount;
        });

        setSummary({
          total,
          suppliers: supplierSet.size,
          invoices: data.length,
        });

        setChartData(
          Object.keys(chartMap).map((d) => ({
            date: d,
            total: chartMap[d],
          }))
        );
      } catch (err) {
        console.error("Failed to load purchase report", err);
      }
    }

    fetchPurchases();
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportStatCard
          title="Total Purchase"
          value={`${CURRENCY} ${summary.total}`}
        />
        <ReportStatCard title="Suppliers" value={summary.suppliers} />
        <ReportStatCard title="Invoices" value={summary.invoices} />
      </div>

      {/* Chart */}
      <ReportChart
        data={chartData}
        xKey="date"
        yKey="total"
        label="Purchase Trend"
      />

      {/* Table */}
      <ReportTable
        columns={["Date", "Supplier", "Amount"]}
        data={purchases.map((p) => ({
          date: p.purchaseDate,
          supplier: p.supplierName,
          amount: `${CURRENCY} ${p.totalAmount}`,
        }))}
      />
    </div>
  );
}
