import Sidebar from "./Sidebar";
import { HiMenu, HiRefresh, HiDownload, HiFilter } from "react-icons/hi";
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
  const [activeTab, setActiveTab] = useState("overview");

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
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    return () => { mounted = false; };
  }, []);

  // Compute stats
  const totalMembers = members.length;
  const totalStaff = staff.length;

  // Updated stats data to match the screenshot visuals
  // Note: Your StatCard component needs to support 'trend' props to display the percentages
  const stats = [
    { title: "Total Revenue Today", value: "AED 2,850", trend: "+8.5% vs previous period", isPositive: true },
    { title: "Active Members", value: totalMembers, trend: "+3.2% valid memberships", isPositive: true },
    { title: "Today's Attendance", value: "2", trend: "-12.5% members checked in", isPositive: false },
    { title: "Available Staff (Live)", value: totalStaff, subtext: "Clocked In" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Top Bar (Only visible on small screens) */}
        <div className="lg:hidden p-4 bg-white shadow-sm flex items-center justify-between z-20">
          <div className="flex items-center">
            <HiMenu
              onClick={() => setSidebarOpen(true)}
              className="text-teal-700 cursor-pointer"
              size={26}
            />
            <h1 className="text-lg font-bold ml-3 text-gray-800">Dashboard</h1>
          </div>
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scrollbar-hide">
          
          {/* 2. Header Section (Title + Top Right Controls) */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
               <p className="text-gray-500 text-sm mt-1">
                 Welcome back! Here’s your business overview.
               </p>
            </div>

            {/* Top Right Controls from Screenshot */}
            <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
               {/* Connected Status */}
               <div className="hidden md:flex items-center text-xs font-medium text-green-600 mr-2 bg-white px-2 py-1 rounded shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Connected
               </div>
               
               {/* Date Dropdown */}
               <div className="relative">
                 <select className="appearance-none bg-white border border-gray-200 text-xs font-medium text-gray-600 rounded px-3 py-1.5 pr-8 focus:outline-none shadow-sm cursor-pointer hover:bg-gray-50">
                    <option>This Day</option>
                    <option>This Week</option>
                    <option>This Month</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
               </div>

               {/* Action Buttons */}
               <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded text-xs font-medium shadow-sm hover:bg-gray-50 transition-colors">
                  <HiRefresh size={14} /> Refresh
               </button>
               <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded text-xs font-medium shadow-sm hover:bg-gray-50 transition-colors">
                  <HiDownload size={14} /> Export
               </button>
               <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded text-xs font-medium shadow-sm hover:bg-gray-50 transition-colors">
                  <HiFilter size={14} /> Filter
               </button>
            </div>
          </div>

          <div className="mb-6">
            <SearchBar />
          </div>

          {/* 3. Tabs (Overview / Revenue) */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all shadow-sm ${
                activeTab === 'overview' 
                  ? 'bg-white text-gray-800' 
                  : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
               Overview
            </button>
            <button 
              onClick={() => setActiveTab('revenue')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all shadow-sm ${
                activeTab === 'revenue' 
                  ? 'bg-white text-gray-800' 
                  : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
               Revenue Dashboard
            </button>
          </div>

          <QuickActions />

          {/* Stats Grid */}
          <div className="grid grid-cols-12 gap-6 mb-6 mt-6">
            {stats.map((stat, i) => (
              <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-3">
                <StatCard {...stat} loading={loading} />
              </div>
            ))}
          </div>

          {/* Charts Row 1: Revenue & Members */}
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

          {/* Charts Row 2: Attendance & Time Slot */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-12 lg:col-span-6">
              <ClassAttendanceRates />
            </div>
            
            {/* Custom Card for Attendance by Time Slot to match screenshot */}
            <div className="col-span-12 lg:col-span-6 bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="text-gray-900 font-semibold text-sm">Attendance by Time Slot</h3>
                <p className="text-gray-400 text-xs mt-1">Member distribution throughout the day</p>
              </div>
              
              <div className="flex-1 flex items-end justify-center border-l border-b border-gray-100 min-h-[160px] relative mt-4 ml-2">
                 {/* Visual Placeholder Grid */}
                 <div className="absolute inset-0 grid grid-rows-4 gap-4 pointer-events-none">
                    <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
                    <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
                    <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
                    <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
                 </div>
                 {/* Label */}
                 <div className="text-[10px] text-gray-400 mb-8 z-10 bg-white/50 px-2 rounded">
                    Evening (6-10 PM)
                 </div>
              </div>
              
              {/* X-Axis Labels */}
              <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-2 ml-2">
                  <span>0</span><span>0.5</span><span>1</span><span>1.5</span><span>2</span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
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