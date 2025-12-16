// src/pages/budgeting/BudgetingPage.jsx
import React, { useEffect, useState } from "react";
import {
  getOverview,
  getMaster,
  createBudget,
  getCategories,
  getStaff,
  getBva
} from "../../../api/budgetingApi";
import BudgetCreateModal from "./BudgetCreateModal";
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  MoreHorizontal, 
  PieChart, 
  List, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function BudgetingPage() {
  // Data State
  const [overview, setOverview] = useState(null);
  const [master, setMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [staff, setStaff] = useState([]);
  const [bva, setBva] = useState([]);

  // UI State
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState("master"); // 'overview', 'master', 'bva'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [ov, ms, cats, st, analytics] = await Promise.allSettled([
        getOverview(),
        getMaster(),
        getCategories(),
        getStaff(),
        getBva()
      ]);

      if (ov.status === "fulfilled") setOverview(ov.value);
      else setOverview({ totalBudget: 0, totalSpent: 0, remaining: 0, rulesCount: 0 });

      if (ms.status === "fulfilled") setMaster(ms.value);
      else setMaster([]);

      if (cats.status === "fulfilled") setCategories(cats.value);
      else setCategories([]);

      if (st.status === "fulfilled") setStaff(st.value);
      else setStaff([]);

      if (analytics.status === "fulfilled") setBva(analytics.value);
      else setBva([]);
    } catch (err) {
      console.error("Failed to load budgeting", err);
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(payload) {
    try {
      await createBudget(payload);
      setShowCreate(false);
      await fetchAll();
      // Optional: Add a toast notification here
    } catch (err) {
      console.error(err);
      alert("Create failed");
    }
  }

  // Filter Logic
  const filteredMaster = master.filter(item => {
    const matchesSearch = item.category?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "All" || item.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Calculate Utilization for Progress Bar
  const getUtilization = (spent, budget) => {
    if (!budget || budget === 0) return 0;
    const pct = (spent / budget) * 100;
    return Math.min(pct, 100);
  };

  const getUtilizationColor = (pct) => {
    if (pct > 90) return "bg-red-500";
    if (pct > 75) return "bg-orange-500";
    return "bg-emerald-500";
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-2"></div>
      Loading Financial Data...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-800">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budget Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track allocation, spending, and variances across departments.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
            <Download size={16} />
            Export Report
          </button>
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Plus size={16} />
            Create Budget
          </button>
        </div>
      </div>

      {/* --- Overview Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Budget" 
          value={overview?.totalBudget} 
          icon={<PieChart size={20} className="text-blue-600"/>} 
          trend="Annual"
        />
        <StatCard 
          label="Total Spent" 
          value={overview?.totalSpent} 
          icon={<TrendingUp size={20} className="text-orange-600"/>} 
          trend="+12% vs last month"
          trendColor="text-red-500"
        />
        <StatCard 
          label="Remaining" 
          value={overview?.remaining} 
          icon={<ArrowDownRight size={20} className="text-emerald-600"/>} 
          trend="Healthy"
          trendColor="text-emerald-600"
        />
        <StatCard 
          label="Active Rules" 
          value={overview?.rulesCount} 
          icon={<List size={20} className="text-purple-600"/>} 
          trend="Automated"
        />
      </div>

      {/* --- Main Content Area --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Tabs & Toolbar */}
        <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          
          {/* Tabs */}
          <div className="flex space-x-6 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === "master"} onClick={() => setActiveTab("master")} label="Budget Master" />
            <TabButton active={activeTab === "bva"} onClick={() => setActiveTab("bva")} label="BVA Analysis" />
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Overview" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600" size={16} />
              <input 
                type="text" 
                placeholder="Search budgets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              />
            </div>
            
            <div className="relative">
              <select 
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white cursor-pointer hover:bg-gray-50"
              >
                <option value="All">All Depts</option>
                {/* Extract unique departments from master data */}
                {[...new Set(master.map(m => m.department))].filter(Boolean).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        {/* --- Tab Content: Budget Master --- */}
        {activeTab === "master" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">
                  <th className="px-6 py-4">Budget Code</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Dept / Branch</th>
                  <th className="px-6 py-4 text-right">Allocated</th>
                  <th className="px-6 py-4 text-right">Spent</th>
                  <th className="px-6 py-4 w-48">Utilization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMaster.map((row) => {
                  const util = getUtilization(row.spent, row.budget);
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">{row.code || row.id}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex flex-col">
                          <span>{row.department}</span>
                          <span className="text-xs text-gray-400">{row.branch}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 text-right">
                        ${Number(row.budget).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 text-right">
                        ${Number(row.spent).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${getUtilizationColor(util)}`} 
                              style={{ width: `${util}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium text-gray-500 w-8 text-right">{Math.round(util)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {row.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredMaster.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={32} className="opacity-20" />
                        <p>No budgets found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- Tab Content: BVA (Budget vs Actual) --- */}
        {activeTab === "bva" && (
          <div className="p-6">
            {bva.length > 0 ? (
               <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b">
                   <th className="px-4 py-3">Category</th>
                   <th className="px-4 py-3 text-right">Budget</th>
                   <th className="px-4 py-3 text-right">Actual</th>
                   <th className="px-4 py-3 text-right">Variance</th>
                 </tr>
               </thead>
               <tbody>
                 {bva.map((item, idx) => (
                   <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                     <td className="px-4 py-3 text-sm text-slate-700">{item.category || item.name || `Item ${idx+1}`}</td>
                     <td className="px-4 py-3 text-sm text-right font-medium">${Number(item.budget).toLocaleString()}</td>
                     <td className="px-4 py-3 text-sm text-right">${Number(item.actual || item.spent).toLocaleString()}</td>
                     <td className={`px-4 py-3 text-sm text-right font-medium ${item.variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                       {Number(item.variance).toLocaleString()}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                 No BVA Analytics data available for this period.
              </div>
            )}
          </div>
        )}
        
        {/* --- Tab Content: Detailed Overview (Just raw data dump if needed or generic view) --- */}
        {activeTab === "overview" && (
          <div className="p-8 text-center text-gray-500">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Dashboard Overview</h3>
            <p>Select "Budget Master" to view detailed line items.</p>
          </div>
        )}

      </div>

      {/* --- Footer Pagination (Static for UI) --- */}
      <div className="flex items-center justify-between mt-4 px-2">
        <p className="text-sm text-gray-500">Showing <span className="font-medium">{filteredMaster.length}</span> results</p>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-white disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-white">Next</button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <BudgetCreateModal
          categories={categories}
          staff={staff}
          onClose={() => setShowCreate(false)}
          onCreate={onCreate}
        />
      )}
    </div>
  );
}

// --- Sub-components for cleaner code ---

function StatCard({ label, value, icon, trend, trendColor = "text-gray-500" }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        {trend && <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">
           {typeof value === 'number' && label !== 'Active Rules' ? `$${value.toLocaleString()}` : value ?? 0}
        </h3>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-2 text-sm font-medium transition-all relative
        ${active ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-t-full" />
      )}
    </button>
  );
}