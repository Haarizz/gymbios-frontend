import { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";
import { getTrainingClasses } from "../../../api/trainingApi";
import { getBookings } from "../../../api/bookingApi";
import ReportStatCard from "./ReportStatCard";
import ReportTable from "./ReportTable";
import ReportChart from "./ReportChart";

export default function TrainerReport() {
  const [summary, setSummary] = useState({
    trainers: 0,
    classes: 0,
    bookings: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const staffRes = await api.get("/salary/employees");
        const staff = staffRes.data || [];

        const trainers = staff.filter(
          (s) =>
            (s.role && s.role.toLowerCase() === "trainer") ||
            (s.designation && s.designation.toLowerCase() === "trainer")
        );

        const trainingRes = await getTrainingClasses();
        const classes = trainingRes.data || [];

        const bookingRes = await getBookings();
        const bookings = bookingRes.data || [];

        setSummary({
          trainers: trainers.length,
          classes: classes.length,
          bookings: bookings.length,
        });
      } catch (err) {
        console.error("Trainer report load failed", err);
      }
    }

    load();
  }, []);

  const chartData = [
    { metric: "Trainers", value: summary.trainers },
    { metric: "Classes", value: summary.classes },
    { metric: "Bookings", value: summary.bookings },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <ReportStatCard title="Total Trainers" value={summary.trainers} />
        <ReportStatCard title="Training Classes" value={summary.classes} />
        <ReportStatCard title="Bookings" value={summary.bookings} />
      </div>

      {/* Chart */}
      <ReportChart
        data={chartData}
        xKey="metric"
        yKey="value"
        label="Trainer Activity Overview"
      />

      <ReportTable
        columns={["Metric", "Value"]}
        data={chartData}
      />
    </div>
  );
}