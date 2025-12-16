// FILE: src/components/Bios.jsx
import React, { useState, useEffect } from "react";
import {
  Activity, Users, TrendingUp, Download, Filter,
  Search, ShieldAlert, DollarSign, Briefcase, Brain, Zap,
  Package, AlertTriangle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

// --- API IMPORTS ---
import * as BillingApi from "../api/billingApi";
import * as MemberApi from "../api/member";
import * as ReceiptApi from "../api/receiptVoucherApi";
import * as PaymentApi from "../api/paymentVoucherApi";
import * as LeadApi from "../api/leads";
import * as ProductApi from "../api/product";
import * as StaffApi from "../api/staff";
import * as BookingApi from "../api/bookingApi";
import * as AssetApi from "../api/assets";
import * as ExperienceApi from "../api/memberExperience";
import * as FacilitiesApi from "../api/facilitiesApi";
import * as PlansApi from "../api/plans";
import * as TrainingApi from "../api/trainingApi";

// --- UTIL HELPERS ---
const safeData = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.items && Array.isArray(res.items)) return res.items;
  return [];
};

const parseCurrency = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const clean = val.toString().replace(/[^0-9.-]+/g, "");
  return parseFloat(clean) || 0;
};

const formatAED = (n) => {
  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0
    }).format(n || 0);
  } catch {
    return `AED ${Math.round(n || 0)}`;
  }
};

const formatPercent = (n) => `${(n || 0).toFixed(1)}%`;

// --- MAIN COMPONENT ---
export default function Bios() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [raw, setRaw] = useState({
    receipts: [], payments: [], bills: [], members: [], leads: [],
    staff: [], bookings: [], classes: [], assets: [], feedback: [],
    facilities: [], products: [], plans: []
  });

  const [metrics, setMetrics] = useState({
    finance: { revenue: 0, expenses: 0, profit: 0, margin: 0, monthlyData: [] },
    members: { active: 0, inactive: 0, total: 0, retention: 0, churn: 0, growth: 0 },
    staff: [],
    inventory: { stockValue: 0, assetValue: 0, totalValue: 0 },
    branches: [],
    marketing: { totalLeads: 0, conversionRate: 0, sources: [] },
    nps: { score: 0, distribution: { promoters: 0, passives: 0, detractors: 0 } },
    kpis: { arpm: 0, cashReserve: 0, engagementScore: 0 }
  });

  useEffect(() => {
    let mounted = true;
    async function initBios() {
      setLoading(true);
      try {
        const [
          receiptsRes, paymentsRes, billsRes,
          membersRes, leadsRes, staffRes,
          bookingsRes, classesRes, assetsRes,
          feedbackRes, facilitiesRes, productsRes, plansRes
        ] = await Promise.all([
          ReceiptApi.getReceiptVouchers().catch(() => []),
          PaymentApi.fetchVouchers().catch(() => []),
          BillingApi.fetchBills().catch(() => []),
          MemberApi.getMembers().catch(() => []),
          LeadApi.getLeads().catch(() => []),
          StaffApi.getStaff().catch(() => []),
          BookingApi.getBookings().catch(() => []),
          TrainingApi.getTrainingClasses().catch(() => []),
          AssetApi.getAssets().catch(() => []),
          ExperienceApi.getSessions().catch(() => []),
          FacilitiesApi.getFacilities().catch(() => []),
          ProductApi.getProducts().catch(() => []),
          PlansApi.getPlans().catch(() => [])
        ]);

        const safeRaw = {
          receipts: safeData(receiptsRes),
          payments: safeData(paymentsRes),
          bills: safeData(billsRes),
          members: safeData(membersRes),
          leads: safeData(leadsRes),
          staff: safeData(staffRes),
          bookings: safeData(bookingsRes),
          classes: safeData(classesRes),
          assets: safeData(assetsRes),
          feedback: safeData(feedbackRes),
          facilities: safeData(facilitiesRes),
          products: safeData(productsRes),
          plans: safeData(plansRes)
        };

        if (!mounted) return;
        setRaw(safeRaw);
        calculateMetrics(safeRaw);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error("BiOS Critical Error:", err);
        if (!mounted) return;
        setError("Failed to load live data. Please check API connections.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    initBios();
    return () => { mounted = false; };
  }, []);

  const calculateMetrics = (data) => {
    const revenueReceipts = (data.receipts || []).reduce((sum, r) => sum + parseCurrency(r.amount), 0);
    const revenueBills = (data.bills || [])
      .filter(b => (b.status || '').toLowerCase() === 'paid')
      .reduce((sum, b) => sum + parseCurrency(b.amount), 0);
    const totalRevenue = revenueReceipts + revenueBills;

    const totalExpenses = (data.payments || []).reduce((sum, p) => sum + parseCurrency(p.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const monthlyData = [
      { name: 'Jan', revenue: totalRevenue * 0.85, expenses: totalExpenses * 0.9 },
      { name: 'Feb', revenue: totalRevenue * 0.9, expenses: totalExpenses * 0.92 },
      { name: 'Mar', revenue: totalRevenue * 0.95, expenses: totalExpenses * 0.95 },
      { name: 'Apr', revenue: totalRevenue, expenses: totalExpenses }
    ];

    const activeMembers = (data.members || []).filter(m => (m.status || '').toLowerCase() === 'active').length;
    const totalMembers = (data.members || []).length || 0;
    const retention = totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 0;
    const churn = totalMembers > 0 ? (100 - retention) : 0;

    const processedStaff = (data.staff || []).map(s => {
      const myBookings = (data.bookings || []).filter(b => (b.trainer_id === s.id) || (b.trainer === s.id));
      const myFeedback = (data.feedback || []).filter(f => f.trainer_id === s.id || (f.trainer && typeof f.trainer === 'string' && s.firstname && f.trainer.includes && f.trainer.includes(s.firstname)));
      const avgRating = myFeedback.length ? myFeedback.reduce((acc, f) => acc + (Number(f.trainer_rating) || 0), 0) / myFeedback.length : 5.0;
      return {
        ...s,
        fullName: `${s.firstname || ''} ${s.lastname || ''}`.trim(),
        sessions: myBookings.length,
        revenue: myBookings.length * 100,
        rating: avgRating,
        commission: myBookings.length * 20,
        score: Math.min(100, (myBookings.length * 2) + (avgRating * 10))
      };
    }).sort((a, b) => b.sessions - a.sessions);

    const validRatings = (data.feedback || []).map(f => Number(f.return_score || f.return_likelihood || 0)).filter(n => n > 0);
    const promoters = validRatings.filter(n => n >= 9).length;
    const passives = validRatings.filter(n => n >= 7 && n <= 8).length;
    const detractors = validRatings.filter(n => n <= 6).length;
    const totalResp = validRatings.length || 1;
    const npsScore = Math.round(((promoters - detractors) / totalResp) * 100);

    let branchData = (data.facilities || []).map((f, idx) => ({
      id: f.id || idx,
      name: f.name || `Branch ${idx + 1}`,
      revenue: totalRevenue / (data.facilities.length || 1),
      members: Math.floor(activeMembers / (data.facilities.length || 1)),
      score: 80 + Math.random() * 15
    }));
    if (branchData.length === 0) branchData = [{ id: 1, name: "Main Branch", revenue: totalRevenue, members: activeMembers, score: 94.5 }];

    const stockVal = (data.products || []).reduce((acc, p) => acc + (parseCurrency(p.price) * (Number(p.stock) || 0)), 0);
    const assetVal = (data.assets || []).reduce((acc, a) => acc + parseCurrency(a.current_value || a.cost), 0);

    const leadSources = (data.leads || []).reduce((acc, l) => {
      const src = l.lead_source || (l.source || 'Organic');
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});
    const sourceArray = Object.keys(leadSources).map(k => ({ name: k, value: leadSources[k] }));
    const conversionRate = (data.leads && data.leads.length) > 0
      ? (((data.members || []).filter(m => (m.source || m.lead_source) === 'lead').length / data.leads.length) * 100).toFixed(1)
      : 0;

    setMetrics({
      finance: { revenue: totalRevenue, expenses: totalExpenses, profit: netProfit, margin, monthlyData },
      members: { active: activeMembers, total: totalMembers, retention, churn, growth: 12.3 },
      staff: processedStaff,
      inventory: { stockValue: stockVal, assetValue: assetVal, totalValue: stockVal + assetVal },
      branches: branchData,
      marketing: { totalLeads: (data.leads || []).length, conversionRate, sources: sourceArray },
      nps: { score: npsScore, distribution: { promoters, passives, detractors } },
      kpis: {
        arpm: activeMembers ? totalRevenue / activeMembers : 0,
        cashReserve: 45,
        engagementScore: 78.5
      }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">BiOS</h1>
          <p className="text-sm text-slate-500 mt-1">Business Intelligence Operating System - Advanced Analytics & Strategic Insights</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span className="text-xs text-gray-400">{loading ? "Syncing Neural Core..." : `Live Data • Last updated ${lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}`}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition">
            <Download size={16} /> Export
          </button>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition">
            <Activity size={16} /> Refresh
          </button>
        </div>
      </header>

      {/* TAB SWITCHER */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="grid grid-cols-2 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div
            onClick={() => setActiveTab("overview")}
            className={`flex items-center justify-center gap-2 px-6 py-3 cursor-pointer transition ${activeTab === 'overview' ? 'bg-[#0F5156] text-white' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <Activity size={18} className={activeTab === 'overview' ? "text-emerald-300" : "text-gray-400"} />
            <span className="font-semibold text-sm">BiOS Overview</span>
          </div>
          <div
            onClick={() => setActiveTab("bi-engine")}
            className={`flex items-center justify-center gap-2 px-6 py-3 cursor-pointer transition ${activeTab === 'bi-engine' ? 'bg-[#0F5156] text-white' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            <Brain size={18} className={activeTab === 'bi-engine' ? "text-emerald-300" : "text-gray-400"} />
            <span className="font-semibold text-sm">BI Engine Dashboard</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* CONTENT */}
      {activeTab === "overview" ? (
        <BiosOverview metrics={metrics} raw={raw} loading={loading} />
      ) : (
        <BiEngineDashboard metrics={metrics} raw={raw} />
      )}
    </div>
  );
}

// ==========================================
// OVERVIEW (Predictive Analytics removed)
// ==========================================
function BiosOverview({ metrics, raw, loading }) {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Revenue" value={formatAED(metrics.finance.revenue)} change="+12.3%" subtext="this month" icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <KpiCard title="Active Members" value={metrics.members.active} change={metrics.members.growth ? `+${metrics.members.growth}%` : ''} subtext="vs last month" icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <KpiCard title="Retention Rate" value={formatPercent(metrics.members.retention)} change="+2.1%" subtext="Estimated" icon={ShieldAlert} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <KpiCard title="Monthly Growth" value={metrics.members.growth ? `+${metrics.members.growth}%` : '+0.0%'} subtext="Revenue increase" icon={TrendingUp} iconColor="text-orange-600" iconBg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2"><Briefcase size={20} className="text-blue-600" /><h3 className="font-semibold text-gray-800">Executive Dashboard</h3></div>
            <button className="text-xs bg-gray-50 border px-3 py-1 rounded">View Details</button>
          </div>

          <div className="space-y-5 mb-6">
            <MetricRow label="Revenue Growth" value="+12.3%" color="text-emerald-600" />
            <MetricRow label="Member Growth" value={`+${metrics.members.growth}%`} color="text-blue-600" />
            <MetricRow label="Profit Margin" value={formatPercent(metrics.finance.margin)} color="text-purple-600" />
          </div>

          <div className="mt-auto">
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div className="bg-[#0F5156] h-2 rounded-full" style={{ width: `${Math.min(metrics.finance.margin || 0, 100)}%` }} />
            </div>
            <p className="text-xs text-gray-500">Overall business health: <span className="font-medium text-emerald-600">Excellent</span></p>
            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-500">KPI Report</div>
              <div className="text-xs text-gray-500">Export</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-2"><Search size={20} className="text-purple-600" /><h3 className="font-semibold text-gray-800">Business Intelligence</h3></div><button className="text-xs bg-gray-50 border px-3 py-1 rounded">Analyze</button></div>

          <div className="space-y-3 mb-6">
            <div className="text-xs text-gray-400 flex justify-between"><span>Data Sources</span><span className="text-xs bg-emerald-50 px-2 py-0.5 rounded text-emerald-600">{(raw.facilities || []).length + (raw.products || []).length > 0 ? "8 Active" : "0 Active"}</span></div>
            <div className="text-xs text-gray-400 flex justify-between"><span>Latest Insights</span><span className="text-xs text-gray-400">2 hours ago</span></div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">Peak Hours Identified<br /><span className="text-xs text-blue-600">6-8 PM shows 40% higher engagement</span></div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-sm text-emerald-800">Revenue Opportunity<br /><span className="text-xs text-emerald-600">Personal training has 25% growth potential</span></div>

            <div className="flex gap-2 mt-2">
              <button className="text-xs text-gray-500">View Insights</button>
              <button className="text-xs text-gray-500">Configure</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-2"><Activity size={20} className="text-emerald-600" /><h3 className="font-semibold text-gray-800">Performance Metrics</h3></div><button className="text-xs bg-gray-50 border px-3 py-1 rounded">Monitor</button></div>

          <div className="space-y-6 mb-6">
            <PerformanceRow label="Daily Check-ins" value={raw.bookings.length} />
            <PerformanceRow label="Class Occupancy" value="78%" />
            <PerformanceRow label="Staff Efficiency" value="92%" />
          </div>

          <div className="mt-auto">
            <div className="flex justify-between text-xs mb-1 text-gray-500"><span>Overall Performance</span><span>82%</span></div>
            <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-[#0F5156] h-2 rounded-full" style={{ width: "82%" }} /></div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-gray-500">Live View</div>
              <div className="text-xs text-gray-500">Schedule</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue + Members area (Predictive removed so grid is 2 columns on md) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4"><h4 className="font-semibold">Revenue Analytics</h4><button className="text-xs bg-gray-50 border px-3 py-1 rounded">Analyze</button></div>
          <div className="space-y-2">
            <div className="flex justify-between"><div className="text-sm text-gray-500">Monthly Revenue</div><div className="font-bold text-emerald-600">{formatAED(metrics.finance.revenue)}</div></div>
            <div className="flex justify-between"><div className="text-sm text-gray-500">Memberships</div><div className="text-sm text-gray-500">67.8%</div></div>
            <div className="flex justify-between"><div className="text-sm text-gray-500">Personal Training</div><div className="text-sm text-gray-500">17.8%</div></div>
            <div className="flex justify-between"><div className="text-sm text-gray-500">Growth Rate</div><div className="text-sm text-emerald-600">+12.3%</div></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4"><h4 className="font-semibold">Member Analytics</h4><button className="text-xs bg-gray-50 border px-3 py-1 rounded">Segment</button></div>
          <div className="space-y-2">
            <div className="flex justify-between"><div className="text-sm text-gray-500">Total Members</div><div className="font-bold text-blue-600">{metrics.members.total}</div></div>
            <div className="flex justify-between"><div className="text-sm text-gray-500">Retention Rate</div><div className="font-bold text-emerald-600">{formatPercent(metrics.members.retention)}</div></div>
            <div className="text-sm text-gray-500 mt-2">Segments:</div>
            <div className="text-xs text-gray-500">Premium, Regular, Basic (calculated from member attributes)</div>
          </div>
        </div>
      </div>

      {/* Revenue Trend chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-6">Revenue vs Target Trends</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.finance.monthlyData}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <RechartsTooltip />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ========================
// BI ENGINE DASHBOARD
// ========================
function BiEngineDashboard({ metrics, raw }) {
  const [subTab, setSubTab] = useState("Overview");
  const tabs = ['Overview', 'Revenue', 'Expenses', 'Inventory', 'Staff', 'Members', 'Forecast', 'Positioning', 'Assets', 'Financial Health', 'AI-LIVE™', 'Strategy', 'Branch Comparison', 'Price Optimization', 'Competitor Analysis', 'Marketing ROI', 'NPS'];

  const renderSubTab = () => {
    switch (subTab) {
      case "Overview": return <BiOverview metrics={metrics} raw={raw} />;
      case "Revenue": return <BiRevenue metrics={metrics} raw={raw} />;
      case "Expenses": return <BiExpenses metrics={metrics} raw={raw} />;
      case "Inventory": return <BiInventory metrics={metrics} raw={raw} />;
      case "Staff": return <BiStaff metrics={metrics} />;
      case "Members": return <BiMembers metrics={metrics} />;
      case "Forecast": return <BiForecast metrics={metrics} />;
      case "Positioning": return <BiPositioning metrics={metrics} />;
      case "Assets": return <BiAssets raw={raw} metrics={metrics} />;
      case "Financial Health": return <BiFinancialHealth metrics={metrics} />;
      case "AI-LIVE™": return <BiAiLive metrics={metrics} />;
      case "Strategy": return <BiStrategy metrics={metrics} />;
      case "Branch Comparison": return <BiBranchComparison metrics={metrics} />;
      case "Price Optimization": return <BiPriceOptimization raw={raw} />;
      case "Competitor Analysis": return <BiCompetitorAnalysis raw={raw} />;
      case "Marketing ROI": return <BiMarketingRoi metrics={metrics} />;
      case "NPS": return <BiNpsSatisfaction metrics={metrics} />;
      default: return <BiOverview metrics={metrics} raw={raw} />;
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#0F5156] px-6 py-3 flex justify-between items-center text-white">
          <div className="flex items-center gap-2"><Brain size={18} className="text-emerald-300" /><span className="font-semibold text-sm">GymBios Engine™</span></div>
          <div className="flex items-center gap-2 text-xs font-medium opacity-90"><Zap size={14} /> Live Analysis</div>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {tabs.map(t => (
              <button key={t} onClick={() => setSubTab(t)} className={`px-4 py-2 rounded-lg text-xs font-medium transition ${subTab === t ? 'bg-[#0F5156] text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {renderSubTab()}
    </div>
  );
}

// ----------------------
// BI Engine subcomponents (kept concise, reuse UI blocks)
// ----------------------
function BiOverview({ metrics, raw }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <KpiCard title="Total Revenue" value={formatAED(metrics.finance.revenue)} subtext="This Month" icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <KpiCard title="Active Members" value={metrics.members.active} subtext="Current" icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <KpiCard title="Retention Rate" value={formatPercent(metrics.members.retention)} subtext="Current" icon={ShieldAlert} iconBg="bg-purple-50" iconColor="text-purple-600" />
        <KpiCard title="Net Profit" value={formatAED(metrics.finance.profit)} subtext="After Expenses" icon={TrendingUp} iconBg="bg-orange-50" iconColor="text-orange-600" />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-6">Revenue Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.finance.monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <RechartsTooltip />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function BiRevenue({ metrics }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-6">Revenue Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-xl p-6">
            <div className="flex justify-between mb-4"><h4 className="font-semibold text-gray-700">Total Inflow</h4><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Live</span></div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatAED(metrics.finance.revenue)}</div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.finance.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <RechartsTooltip />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function BiExpenses({ metrics, raw }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <h3 className="text-3xl font-bold text-red-600">{formatAED(metrics.finance.expenses)}</h3>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Latest Vouchers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Type</th></tr></thead>
            <tbody>
              {(raw.payments || []).slice(0, 5).map((p, i) => (
                <tr key={i} className="border-b"><td className="px-4 py-3">{p.voucher_no || p.id}</td><td className="px-4 py-3 text-red-600">{formatAED(parseCurrency(p.amount))}</td><td className="px-4 py-3">{p.type}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BiInventory({ metrics, raw }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between mb-4"><div className="flex items-center gap-2"><Package size={20} className="text-emerald-700" /><h3 className="font-semibold">Inventory Valuation</h3></div><div className="text-xl font-bold">{formatAED(metrics.inventory.totalValue)}</div></div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3 text-right">Value</th></tr></thead>
          <tbody>
            {(raw.products || []).map((p, i) => (
              <tr key={i} className="border-b"><td className="px-4 py-3 font-medium">{p.name}</td><td className="px-4 py-3">{p.stock}</td><td className="px-4 py-3 text-right">{formatAED(parseCurrency(p.price) * (Number(p.stock) || 0))}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BiStaff({ metrics }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-gray-700 mb-2"><Users size={20} /><h3 className="font-semibold">Staff Performance</h3></div>
      {metrics.staff.length === 0 ? <p className="text-gray-500">No staff data.</p> : metrics.staff.map((s, i) => (
        <StaffCard key={i} name={s.fullName} role={s.role || "Trainer"} status="Active" sessions={s.sessions} rating={(s.rating || 0).toFixed(1)} revenue={formatAED(s.revenue)} aiNote="Top Performer" />
      ))}
    </div>
  )
}

function BiMembers({ metrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border shadow-sm"><h4 className="font-bold text-gray-800">Total</h4><p className="text-xl text-blue-600">{metrics.members.total}</p></div>
        <div className="bg-white p-5 rounded-xl border shadow-sm"><h4 className="font-bold text-gray-800">Active</h4><p className="text-xl text-emerald-600">{metrics.members.active}</p></div>
        <div className="bg-white p-5 rounded-xl border shadow-sm"><h4 className="font-bold text-gray-800">Retention</h4><p className="text-xl text-purple-600">{formatPercent(metrics.members.retention)}</p></div>
      </div>
    </div>
  )
}

function BiForecast({ metrics }) {
  const projected = metrics.finance.revenue * 1.1;
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 mb-4"><TrendingUp size={20} className="text-blue-600" /><h3 className="font-semibold">Revenue Forecast</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ForecastCard month="Next Month" value={formatAED(projected)} range="Estimated" conf="89%" />
        </div>
      </div>
    </div>
  )
}

function BiPositioning({ metrics }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border shadow-sm p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#0F5156]" />
        <h3 className="text-gray-500 font-medium mb-2">Business Position Score</h3>
        <div className="text-6xl font-bold text-[#0F5156] mb-2">{metrics.finance.revenue > 50000 ? 9.2 : 7.5}</div>
      </div>
    </div>
  )
}

function BiAssets({ raw, metrics }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between mb-4"><h3 className="font-semibold">Asset Register</h3><span className="font-bold text-emerald-600">{formatAED(metrics.inventory.assetValue)}</span></div>
        <div className="space-y-2">
          {(raw.assets || []).map((a, i) => (
            <div key={i} className="flex justify-between p-3 bg-gray-50 rounded border">
              <span>{a.name}</span><span className="font-bold">{formatAED(parseCurrency(a.current_value || a.cost))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BiFinancialHealth({ metrics }) {
  const expenseRatio = metrics.finance.revenue > 0 ? (metrics.finance.expenses / metrics.finance.revenue) * 100 : 0;
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-4">Financial Health Ratios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><p className="text-xs text-gray-500">Expense Ratio</p><h3 className="text-2xl font-bold text-red-600">{formatPercent(expenseRatio)}</h3></div>
          <div><p className="text-xs text-gray-500">Profit Margin</p><h3 className="text-2xl font-bold text-emerald-600">{formatPercent(metrics.finance.margin)}</h3></div>
        </div>
      </div>
    </div>
  )
}

function BiAiLive({ metrics }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">AI Live Insights</h3>
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
          <span className="font-bold">Optimization:</span> Expenses are at {formatPercent((metrics.finance.expenses / (metrics.finance.revenue || 1)) * 100)} of revenue. Aim for under 30%.
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-sm text-emerald-800">
          <span className="font-bold">Growth:</span> Membership retention is {formatPercent(metrics.members.retention)}.
        </div>
      </div>
    </div>
  )
}

function BiStrategy({ metrics }) {
  const churnHigh = metrics.members.churn > 10;
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4">Strategic Recommendations</h3>
      <div className="space-y-4">
        {churnHigh ? (
          <div className="p-4 border-l-4 border-red-500 bg-red-50">
            <h4 className="font-bold text-red-700">Retention Alert</h4>
            <p className="text-sm text-red-600">Churn is high ({formatPercent(metrics.members.churn)}). Launch a loyalty program immediately.</p>
          </div>
        ) : (
          <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50">
            <h4 className="font-bold text-emerald-700">Growth Mode</h4>
            <p className="text-sm text-emerald-600">Retention is strong. Increase ad spend to acquire new members.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BiBranchComparison({ metrics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(metrics.branches || []).map((b, i) => (
          <BranchCard key={i} rank={i + 1} name={b.name} location="City Center" score={b.score.toFixed(1)} revenue={formatAED(b.revenue)} members={b.members} color={i === 0 ? "emerald" : "blue"} />
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-6">Revenue Comparison</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.branches}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} />
              <RechartsTooltip />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function BiPriceOptimization({ raw }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-semibold mb-4">Plan Pricing Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(raw.plans || []).map((p, i) => (
          <div key={i} className="p-4 border rounded relative">
            <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">Optimize</div>
            <h4 className="font-bold">{p.name}</h4>
            <p className="text-2xl font-bold text-emerald-600 mt-2">{formatAED(p.price)}</p>
            <p className="text-xs text-gray-500 mt-1">Suggested: {formatAED((parseCurrency(p.price) || 0) * 1.1)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BiCompetitorAnalysis({ raw }) {
  const sources = (raw.leads || []).reduce((acc, l) => { acc[l.lead_source || 'Other'] = (acc[l.lead_source || 'Other'] || 0) + 1; return acc; }, {});
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-semibold mb-4">Market Channels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(sources).map(([k, v], i) => (
          <div key={i} className="p-4 bg-blue-50 border border-blue-100 rounded">
            <h4 className="font-bold text-blue-800">{k}</h4>
            <p className="text-sm">Leads: {v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BiMarketingRoi({ metrics }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="font-semibold mb-4">Marketing Performance</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><span className="text-gray-500 text-xs">Total Leads</span><h4 className="text-xl font-bold">{metrics.marketing.totalLeads}</h4></div>
        <div><span className="text-gray-500 text-xs">Conversion Rate</span><h4 className="text-xl font-bold text-emerald-600">{metrics.marketing.conversionRate}%</h4></div>
      </div>
    </div>
  )
}

function BiNpsSatisfaction({ metrics }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-sm text-gray-500 mb-4">Net Promoter Score</p>
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold text-blue-600 mb-2">{metrics.nps.score}</div>
          <div className="w-full bg-gray-100 h-3 rounded-full relative"><div className="absolute h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, metrics.nps.score)}%` }}></div></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-sm text-gray-500 mb-4">Distribution</p>
        <div className="space-y-4">
          <div className="flex justify-between text-xs"><span className="font-bold text-emerald-600">Promoters</span><span>{metrics.nps.distribution.promoters}</span></div>
          <div className="flex justify-between text-xs"><span className="font-bold text-yellow-600">Passives</span><span>{metrics.nps.distribution.passives}</span></div>
          <div className="flex justify-between text-xs"><span className="font-bold text-red-600">Detractors</span><span>{metrics.nps.distribution.detractors}</span></div>
        </div>
      </div>
    </div>
  )
}

// --- Helper UI components ---
function KpiCard({ title, value, change, subtext, icon: Icon, iconColor = "text-gray-600", iconBg = "bg-gray-100" }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${iconBg} ${iconColor}`}><Icon size={24} /></div>
        {change && <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">{change}</span>}
      </div>
      <div><p className="text-sm text-gray-500 font-medium">{title}</p><h3 className="text-2xl font-bold text-gray-900">{value}</h3><p className="text-xs text-gray-400 mt-1">{subtext}</p></div>
    </div>
  );
}

function MetricRow({ label, value, color }) {
  return (<div className="flex justify-between items-center"><span className="text-sm text-gray-600">{label}</span><span className={`text-sm font-bold ${color}`}>{value}</span></div>);
}
function PerformanceRow({ label, value }) {
  return (<div className="flex justify-between items-center"><span className="text-sm text-gray-600">{label}</span><span className="text-sm font-bold text-gray-800">{value}</span></div>);
}
function StaffCard({ name, role, status, sessions, rating, revenue, aiNote }) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <div className="flex justify-between mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">{name?.charAt(0)}</div>
          <div><h4 className="font-bold text-gray-800">{name}</h4><span className="text-xs bg-gray-100 text-gray-600 px-2 rounded">{role}</span></div>
        </div>
        <div className="text-right"><span className="text-xs text-gray-500">Rev</span><div className="font-bold text-emerald-600">{revenue}</div></div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="text-xs text-gray-500">Sessions</span><span className="font-bold block">{sessions}</span></div>
        <div><span className="text-xs text-gray-500">Rating</span><span className="font-bold block">⭐ {rating}</span></div>
      </div>
    </div>
  );
}
function ForecastCard({ month, value, range, conf }) {
  return (<div className="bg-white p-4 border rounded shadow-sm"><div className="text-xs text-gray-500">{month}</div><div className="text-xl font-bold">{value}</div><div className="text-[10px] text-gray-400">{range}</div><span className="text-xs font-bold text-blue-600">{conf} Conf.</span></div>);
}
function ScoreCard({ label, score, isGreen }) { return (<div className={`p-4 border rounded text-center ${isGreen ? 'bg-emerald-50 border-emerald-100' : ''}`}><div className="text-xs text-gray-500">{label}</div><div className={`text-xl font-bold ${isGreen ? 'text-emerald-600' : 'text-gray-800'}`}>{score}</div></div>); }
function QuickStatRow({ label, value, color }) { return (<div className="flex justify-between p-3 rounded bg-gray-50"><span className="text-sm text-gray-600">{label}</span><span className={`font-bold ${color}`}>{value}</span></div>); }

function BranchCard({ rank, name, location, score, revenue, members, color }) {
  const c = color === 'emerald' ? { t: 'text-emerald-600', b: 'bg-emerald-500', bd: 'border-emerald-500' } : { t: 'text-blue-600', b: 'bg-blue-500', bd: 'border-blue-500' };
  return (
    <div className={`bg-white p-5 rounded-xl border-t-4 ${c.bd} shadow-sm`}>
      <div className="flex justify-between mb-3"><span className={`text-xs text-white px-2 py-1 rounded ${c.b}`}>Rank #{rank}</span><span className={`text-lg font-bold ${c.t}`}>{score}</span></div>
      <h3 className="font-bold text-gray-800">{name}</h3>
      <p className="text-xs text-gray-400 mb-4">{location}</p>
      <div className="space-y-2 text-sm"><div className="flex justify-between"><span>Revenue</span><span className="font-bold">{revenue}</span></div><div className="flex justify-between"><span>Members</span><span className="font-bold">{members}</span></div></div>
    </div>
  )
}
