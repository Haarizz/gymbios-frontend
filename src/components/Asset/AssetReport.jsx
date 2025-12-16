// FILE: src/components/AssetReport.jsx

import React, { useEffect, useState, useMemo } from "react";
import { 
  FileText, Download, RefreshCw, TrendingUp, AlertTriangle, 
  DollarSign, Package, Wrench, MapPin, Calendar, CheckCircle, 
  Clock, ShieldAlert, BarChart3, PieChart as PieIcon, Activity
} from "lucide-react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area,
  LineChart, Line
} from "recharts";

// API Imports
import { getAssets } from "../../api/assets"; 
import { getAllTransactions } from "../../api/AssetTransactionApi"; 

// --- Utilities ---

const parseCurrency = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const clean = val.toString().replace(/[^0-9.]/g, '');
  return parseFloat(clean) || 0;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; 
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
};

const getDaysUntil = (dateString) => {
  if (!dateString) return null;
  const target = new Date(dateString);
  const today = new Date();
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

const COLORS = {
  primary: '#0F5156',
  secondary: '#2DD4BF',
  accent: '#FFBB28',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  chart: ['#0F5156', '#2DD4BF', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1']
};

// --- Main Component ---

export default function AssetReport() {
  const [activeTab, setActiveTab] = useState("overview"); // overview, financials, maintenance
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsData, transactionsData] = await Promise.all([
        getAssets(),
        getAllTransactions()
      ]);
      setAssets(assetsData || []);
      setTransactions(transactionsData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to sync with asset database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Calculations ---

  const stats = useMemo(() => {
    const totalValue = assets.reduce((sum, a) => sum + parseCurrency(a.current_value || a.cost), 0);
    const originalCost = assets.reduce((sum, a) => sum + parseCurrency(a.cost), 0);
    const depreciation = originalCost - totalValue;
    
    const maintTransactions = transactions.filter(t => 
      t.transaction_type?.toLowerCase().includes('maintenance') || 
      t.transaction_type?.toLowerCase().includes('repair')
    );
    const totalMaintCost = maintTransactions.reduce((sum, t) => sum + (Number(t.value) || 0), 0);

    // Alerts
    const criticalWarranties = assets.filter(a => {
      const days = getDaysUntil(a.warranty_expiry);
      return days !== null && days <= 30 && days > 0;
    });

    const overdueMaintenance = assets.filter(a => {
      const days = getDaysUntil(a.maintenance_date);
      return days !== null && days < 0;
    });

    return { 
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.status?.toLowerCase() === 'active').length,
      totalValue,
      originalCost,
      depreciation,
      totalMaintCost,
      criticalWarranties,
      overdueMaintenance,
      avgHealth: 88 // Placeholder or calculated based on condition_desc
    };
  }, [assets, transactions]);

  // Chart Data Generators
  const charts = useMemo(() => {
    // 1. Condition Breakdown
    const conditionMap = {};
    assets.forEach(a => {
      const cond = a.condition_desc || "Unknown";
      conditionMap[cond] = (conditionMap[cond] || 0) + 1;
    });
    const conditionData = Object.entries(conditionMap).map(([name, value]) => ({ name, value }));

    // 2. Value by Location
    const locationMap = {};
    assets.forEach(a => {
      const loc = a.location || "Unassigned";
      const val = parseCurrency(a.current_value || a.cost);
      locationMap[loc] = (locationMap[loc] || 0) + val;
    });
    const locationData = Object.entries(locationMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 5); // Top 5 locations

    // 3. Vendor Spend Analysis
    const vendorMap = {};
    transactions.forEach(t => {
      if (!t.vendor) return;
      vendorMap[t.vendor] = (vendorMap[t.vendor] || 0) + (Number(t.value) || 0);
    });
    const vendorData = Object.entries(vendorMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 5);

    // 4. Monthly Spending Trend
    const trendMap = {};
    transactions.forEach(t => {
      if(!t.date) return;
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if(!trendMap[key]) trendMap[key] = { name: label, value: 0, sort: d.getTime() };
      trendMap[key].value += (Number(t.value) || 0);
    });
    const trendData = Object.values(trendMap).sort((a,b) => a.sort - b.sort);

    return { conditionData, locationData, vendorData, trendData };
  }, [assets, transactions]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      
      {/* --- Top Bar --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F5156] flex items-center gap-3">
            <Package size={32} /> Asset Intelligence
          </h1>
          <p className="text-gray-500 mt-1">Comprehensive tracking, valuation, and maintenance analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-medium"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Sync Data
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0F5156] text-white rounded-xl hover:bg-[#0b3d41] transition-all shadow-md shadow-teal-900/10 font-medium">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </header>

      {/* --- KPI Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          label="Total Asset Valuation" 
          value={`AED ${stats.totalValue.toLocaleString()}`} 
          trend="-2.4% vs last month"
          icon={<DollarSign className="text-white" size={24} />}
          color="bg-emerald-500"
        />
        <KPICard 
          label="Total Inventory" 
          value={stats.totalAssets} 
          subValue={`${stats.activeAssets} Active`}
          icon={<Package className="text-white" size={24} />}
          color="bg-blue-500"
        />
        <KPICard 
          label="Maintenance Spend" 
          value={`AED ${stats.totalMaintCost.toLocaleString()}`} 
          icon={<Wrench className="text-white" size={24} />}
          color="bg-orange-500"
        />
        <KPICard 
          label="Critical Alerts" 
          value={stats.criticalWarranties.length + stats.overdueMaintenance.length} 
          subValue="Action Required"
          icon={<ShieldAlert className="text-white" size={24} />}
          color="bg-red-500"
          isAlert={true}
        />
      </div>

      {/* --- Tabs Navigation --- */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          <TabButton id="overview" label="Overview" icon={<Activity size={18} />} active={activeTab} set={setActiveTab} />
          <TabButton id="financials" label="Financials" icon={<BarChart3 size={18} />} active={activeTab} set={setActiveTab} />
          <TabButton id="maintenance" label="Maintenance & Health" icon={<Wrench size={18} />} active={activeTab} set={setActiveTab} />
        </nav>
      </div>

      {/* --- Tab Content --- */}
      
      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Asset Condition Pie */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-[#0F5156]" /> Asset Condition
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.conditionData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts.conditionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Value by Location Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-[#0F5156]" /> Value by Location
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.locationData} layout="vertical" margin={{left: 20}}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'8px'}} />
                    <Bar dataKey="value" fill="#0F5156" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock size={20} className="text-[#0F5156]" /> Recent Activity Feed
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Asset / Description</th>
                    <th className="px-6 py-3 font-medium">Assigned To</th>
                    <th className="px-6 py-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((t, i) => (
                    <tr key={t.id || i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500">{formatDate(t.date)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {t.asset_name || "Unknown Asset"}
                        <div className="text-xs text-gray-400 font-normal mt-0.5">{t.description}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{t.assigned_to || "-"}</td>
                      <td className="px-6 py-4 text-right font-mono font-medium">
                        {t.value ? `AED ${Number(t.value).toLocaleString()}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. FINANCIALS TAB */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spending Trend */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6">CapEx & Maintenance Trends</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.trendData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                    <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#6B7280'}} tickFormatter={(v)=>`AED ${v/1000}k`} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="value" stroke="#0F5156" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vendor Analysis */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-6">Top Vendors by Spend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.vendorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Depreciation Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Asset Valuation & Depreciation</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Asset Name</th>
                    <th className="px-6 py-3 text-right">Original Cost</th>
                    <th className="px-6 py-3 text-right">Current Value</th>
                    <th className="px-6 py-3 text-right">Depreciation</th>
                    <th className="px-6 py-3 text-center">ROI Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assets.slice(0, 10).map((a, i) => {
                    const cost = parseCurrency(a.cost);
                    const current = parseCurrency(a.current_value || a.cost);
                    const dep = cost - current;
                    const depPercent = cost > 0 ? (dep / cost) * 100 : 0;
                    
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{a.name}</td>
                        <td className="px-6 py-4 text-right">AED {cost.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-gray-800">AED {current.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-red-500">
                          - AED {dep.toLocaleString()} ({depPercent.toFixed(1)}%)
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-[#0F5156] h-1.5 rounded-full" 
                              style={{width: `${100 - depPercent}%`}}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAINTENANCE TAB */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          
          {/* Action Required Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
              <h3 className="font-bold text-red-800 flex items-center gap-2 mb-4">
                <AlertTriangle size={20} /> Expiring Warranties
              </h3>
              {stats.criticalWarranties.length === 0 ? (
                <p className="text-red-600 text-sm">No critical warranty expirations.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.criticalWarranties.map((a, i) => (
                    <li key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <div>
                        <div className="font-medium text-gray-800">{a.name}</div>
                        <div className="text-xs text-gray-500">Expires: {formatDate(a.warranty_expiry)}</div>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-bold">
                        {getDaysUntil(a.warranty_expiry)} Days
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
              <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-4">
                <Wrench size={20} /> Maintenance Overdue
              </h3>
              {stats.overdueMaintenance.length === 0 ? (
                <p className="text-orange-600 text-sm">All maintenance schedules are on track.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.overdueMaintenance.map((a, i) => (
                    <li key={i} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <div>
                        <div className="font-medium text-gray-800">{a.name}</div>
                        <div className="text-xs text-gray-500">Due: {formatDate(a.maintenance_date)}</div>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-bold">
                        OVERDUE
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Asset Health List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
             <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Asset Health & Maintenance Status</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Asset</th>
                    <th className="px-6 py-3">Last Service</th>
                    <th className="px-6 py-3">Next Due</th>
                    <th className="px-6 py-3">Condition</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assets.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{a.name}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(a.purchase_date)}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(a.maintenance_date)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                          ${a.condition_desc?.toLowerCase() === 'good' || a.condition_desc?.toLowerCase() === 'excellent' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'}`}>
                          {a.condition_desc || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Helper Components ---

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#0F5156]"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-[#0F5156] opacity-20 animate-pulse"></div>
      </div>
      <p className="mt-4 text-gray-500 font-medium">Synchronizing Asset Database...</p>
    </div>
  );
}

function TabButton({ id, label, icon, active, set }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => set(id)}
      className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors font-medium text-sm
        ${isActive ? 'border-[#0F5156] text-[#0F5156]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
      {icon} {label}
    </button>
  );
}

function KPICard({ label, value, subValue, icon, color, isAlert }) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm border ${isAlert ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-sm font-medium ${isAlert ? 'text-red-600' : 'text-gray-500'}`}>{label}</p>
          <h3 className={`text-2xl font-bold mt-1 ${isAlert ? 'text-red-700' : 'text-gray-800'}`}>{value}</h3>
          {subValue && <p className={`text-xs mt-1 ${isAlert ? 'text-red-500 font-bold' : 'text-emerald-600'}`}>{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl shadow-md ${color} transform -rotate-6`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase() || "";
  let styles = "bg-gray-100 text-gray-600";
  if (['active', 'in use'].includes(s)) styles = "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (['maintenance', 'repair'].includes(s)) styles = "bg-orange-100 text-orange-700 border border-orange-200";
  if (['retired', 'disposed'].includes(s)) styles = "bg-red-100 text-red-700 border border-red-200";

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide ${styles}`}>
      {status || "Unknown"}
    </span>
  );
}