import Sidebar from "./Sidebar";
import { HiMenu } from "react-icons/hi";
import { useState, useEffect } from "react";

import SearchBar from "./SearchBar";
import QuickActions from "./QuickActions";
import StatCard from "./StatCard";
import RevenueOverview from "./RevenueOverview";
import MembershipDistribution from "./MembershipDistribution";
import ClassAttendanceRates from "./ClassAttendanceRates";
import RecentMembers from "./RecentMembers";
import Notifications from "./Notifications";
import StaffStatus from "./StaffStatus";

import { getMembers } from "../api/member";
import { getStaff } from "../api/staff";
import { getPlans } from "../api/plans";

export default function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      try {
        const [m, s, p] = await Promise.all([getMembers(), getStaff(), getPlans()]);
        if (!mounted) return;
        setMembers(Array.isArray(m) ? m : []);
        setStaff(Array.isArray(s) ? s : []);
        setPlans(Array.isArray(p) ? p : []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setMembers([]);
        setStaff([]);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    return () => { mounted = false; };
  }, []);

  // compute stats
  const totalMembers = members.length;
  const totalStaff = staff.length;
  const totalPlans = plans.length;

  const stats = [
    { title: "Total Revenue Today", value: "AED 2,850" }, // dummy
    { title: "Active Members", value: totalMembers },
    { title: "Today's Attendance", value: "—" },
    { title: "Available Staff (On)", value: totalStaff },
  ];

  return (
    <div className="flex h-screen font-medium w-full">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="lg:hidden p-4 bg-white shadow flex items-center">
          <HiMenu
            onClick={() => setSidebarOpen(true)}
            className="text-teal-700 cursor-pointer"
            size={26}
          />
          <h1 className="text-lg font-bold ml-3">Dashboard</h1>
        </div>

        <main className="p-6">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-gray-600 text-sm mb-4">
            Welcome back! Here’s your business overview.
          </p>

          <SearchBar />

          <QuickActions />

          <div className="grid grid-cols-12 gap-6 mb-6">
            {stats.map(({ title, value }, i) => (
              <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3">
                <StatCard title={title} value={loading ? "..." : value} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12 lg:col-span-8">
              <RevenueOverview />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <MembershipDistribution
                members={members}
                plans={plans}
                loading={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12 lg:col-span-6">
              <ClassAttendanceRates />
            </div>
            <div className="col-span-12 lg:col-span-6 bg-white rounded shadow p-4 border border-gray-100 text-sm">
              <p className="text-center pt-16 text-gray-300">
                Attendance by Time Slot <br /> [chart placeholder]
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12 lg:col-span-6">
              <RecentMembers members={members} loading={loading} />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <Notifications />
            </div>
          </div>

          <StaffStatus staff={staff} loading={loading} />
        </main>
      </div>
    </div>
  );
}
