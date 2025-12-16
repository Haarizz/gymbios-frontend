import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  Zap,
  CreditCard,
  FileText,
  RefreshCw,
  Calendar,
  AlertCircle,
  Search,
  Loader2,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#0F5156", "#2dd4bf", "#facc15", "#4ade80", "#f87171", "#a855f7"];

// --- MOCK DATA GENERATORS (Dynamic for Current Year) ---
const getMockData = () => {
  const year = new Date().getFullYear();
  
  // 1. Receipts (Income)
  const receipts = [
    { id: 101, voucher_date: `${year}-01-05`, income_source_name: "Membership", amount: 2500, member_name: "Ahmed Al-Farsi", status: "Paid" },
    { id: 102, voucher_date: `${year}-01-12`, income_source_name: "Personal Training", amount: 1200, member_name: "Sarah Jones", status: "Paid" },
    { id: 103, voucher_date: `${year}-02-03`, income_source_name: "Membership", amount: 1800, member_name: "Mike Chen", status: "Paid" },
    { id: 104, voucher_date: `${year}-02-20`, income_source_name: "Merchandise", amount: 450, member_name: "Walk-in", status: "Paid" },
    { id: 105, voucher_date: `${year}-03-15`, income_source_name: "Membership", amount: 3200, member_name: "Emma Wilson", status: "Paid" },
    { id: 106, voucher_date: `${year}-03-22`, income_source_name: "Personal Training", amount: 2000, member_name: "John Doe", status: "Pending" },
    { id: 107, voucher_date: `${year}-04-05`, income_source_name: "Membership", amount: 2100, member_name: "Lisa Wong", status: "Paid" },
    { id: 108, voucher_date: `${year}-04-18`, income_source_name: "Classes", amount: 800, member_name: "Group Booking", status: "Paid" },
    { id: 109, voucher_date: `${year}-05-10`, income_source_name: "Membership", amount: 2900, member_name: "Omar Khalid", status: "Paid" },
    { id: 110, voucher_date: `${year}-05-25`, income_source_name: "Personal Training", amount: 1500, member_name: "Sarah Jones", status: "Paid" },
    { id: 111, voucher_date: `${year}-06-02`, income_source_name: "Membership", amount: 3100, member_name: "New Member Signup", status: "Paid" },
    { id: 112, voucher_date: `${year}-06-15`, income_source_name: "Merchandise", amount: 300, member_name: "Walk-in", status: "Paid" },
  ];

  // 2. Expenses
  const expenses = [
    { id: 201, date: `${year}-01-28`, category: "Rent", amount: 5000, vendor_payee: "Mall Management", status: "Paid" },
    { id: 202, date: `${year}-02-05`, category: "Utilities", amount: 800, vendor_payee: "DEWA", status: "Paid" },
    { id: 203, date: `${year}-02-28`, category: "Maintenance", amount: 450, vendor_payee: "GymFix Pro", status: "Paid" },
    { id: 204, date: `${year}-03-10`, category: "Marketing", amount: 1200, vendor_payee: "Facebook Ads", status: "Paid" },
    { id: 205, date: `${year}-04-01`, category: "Rent", amount: 5000, vendor_payee: "Mall Management", status: "Paid" },
    { id: 206, date: `${year}-05-15`, category: "Utilities", amount: 950, vendor_payee: "DEWA", status: "Paid" },
    { id: 207, date: `${year}-06-05`, category: "Cleaning", amount: 600, vendor_payee: "CleanCo", status: "Paid" },
  ];

  // 3. Purchases (Inventory/Assets)
  const purchases = [
    { id: 301, purchase_date: `${year}-01-15`, total_amount: 2000, supplier_name: "Technogym", payment_status: "Paid" },
    { id: 302, purchase_date: `${year}-03-20`, total_amount: 500, supplier_name: "Supplement World", payment_status: "Paid" },
    { id: 303, purchase_date: `${year}-05-10`, total_amount: 150, supplier_name: "Office Depot", payment_status: "Paid" },
  ];

  // 4. Payroll
  const payroll = [
    { id: 401, created_at: `${year}-01-30`, total_amount: 4500, status: "Paid" },
    { id: 402, created_at: `${year}-02-28`, total_amount: 4500, status: "Paid" },
    { id: 403, created_at: `${year}-03-30`, total_amount: 4800, status: "Paid" },
    { id: 404, created_at: `${year}-04-30`, total_amount: 4800, status: "Paid" },
    { id: 405, created_at: `${year}-05-30`, total_amount: 4800, status: "Paid" },
  ];

  // 5. Payment Vouchers (Misc Outgoing)
  const paymentVouchers = [
    { id: 501, payment_date: `${year}-03-12`, amount: 200, type: "Petty Cash", party: "Reception" }
  ];

  return { receipts, expenses, purchases, payroll, paymentVouchers };
};

export default function FinancialAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- DATE FILTER STATE ---
  // Default: Current Year
  const [dateFilter, setDateFilter] = useState({
    start: `${new Date().getFullYear()}-01-01`,
    end: `${new Date().getFullYear()}-12-31`
  });

  // --- RAW DATA STATE ---
  const [dbData, setDbData] = useState({
    receipts: [],
    expenses: [],
    paymentVouchers: [],
    purchases: [],
    payroll: [],
  });

  // --- 1. FETCH ALL DATA (MOCKED) ---
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // SIMULATE API DELAY
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData = getMockData();

      setDbData({
        receipts: mockData.receipts,
        expenses: mockData.expenses,
        paymentVouchers: mockData.paymentVouchers,
        purchases: mockData.purchases,
        payroll: mockData.payroll,
      });

    } catch (err) {
      console.error("Analytics Load Error:", err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- 2. FILTERING ENGINE ---
  const filteredData = useMemo(() => {
    const start = new Date(dateFilter.start);
    const end = new Date(dateFilter.end);
    // Ensure end date includes the full day
    end.setHours(23, 59, 59, 999);

    const isInRange = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    return {
      receipts: dbData.receipts.filter(i => isInRange(i.voucher_date)),
      expenses: dbData.expenses.filter(i => isInRange(i.date)),
      paymentVouchers: dbData.paymentVouchers.filter(i => isInRange(i.payment_date)),
      purchases: dbData.purchases.filter(i => isInRange(i.purchase_date)),
      payroll: dbData.payroll.filter(i => isInRange(i.created_at)),
    };
  }, [dbData, dateFilter]);

  // --- 3. KPI CALCULATIONS ---
  const kpis = useMemo(() => {
    const d = filteredData;
    
    // Revenue
    const revenue = d.receipts.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    
    // Expenses
    const expTotal = d.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const pvTotal = d.paymentVouchers.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const purTotal = d.purchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    const prTotal = d.payroll.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    
    const totalExpenses = expTotal + pvTotal + purTotal + prTotal;
    const profit = revenue - totalExpenses;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    // Outstanding (Pending)
    const outstanding = d.receipts
      .filter(r => (r.status || '').toLowerCase() === 'pending')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // Trainer Revenue
    const trainerRev = d.receipts
      .filter(r => (r.income_source_name || '').toLowerCase().includes('training'))
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return { 
      revenue, 
      totalExpenses, 
      profit, 
      margin, 
      outstanding, 
      trainerRev, 
      activeVal: revenue * 0.65 // Estimate
    };
  }, [filteredData]);

  // --- 4. CHART DATA ---
  const trendData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Initialize months based on data present or generic 12 months
    const grouped = months.map(m => ({ name: m, revenue: 0, expenses: 0 }));

    const add = (dateStr, val, key) => {
      if(!dateStr) return;
      const d = new Date(dateStr);
      if(!isNaN(d.getTime())) grouped[d.getMonth()][key] += Number(val || 0);
    };

    filteredData.receipts.forEach(r => add(r.voucher_date, r.amount, 'revenue'));
    filteredData.expenses.forEach(e => add(e.date, e.amount, 'expenses'));
    filteredData.paymentVouchers.forEach(p => add(p.payment_date, p.amount, 'expenses'));
    filteredData.purchases.forEach(p => add(p.purchase_date, p.total_amount, 'expenses'));
    filteredData.payroll.forEach(p => add(p.created_at, p.total_amount, 'expenses'));

    return grouped;
  }, [filteredData]);

  // --- 5. INCOME DISTRIBUTION ---
  const incomeDistribution = useMemo(() => {
    const map = {};
    filteredData.receipts.forEach(r => {
      const cat = r.income_source_name || "General";
      map[cat] = (map[cat] || 0) + Number(r.amount || 0);
    });
    return Object.keys(map).map((name, i) => ({ 
      name, 
      value: map[name], 
      color: COLORS[i % COLORS.length] 
    }));
  }, [filteredData]);

  // --- 6. TRANSACTION HISTORY ---
  const transactionHistory = useMemo(() => {
    const combined = [
      ...filteredData.receipts.map(r => ({
        id: `R-${r.id}`, 
        date: r.voucher_date, 
        category: r.income_source_name || "Income", 
        amount: r.amount, 
        type: 'Income', 
        party: r.member_name, 
        status: r.status || 'Completed'
      })),
      ...filteredData.expenses.map(e => ({
        id: `E-${e.id}`, 
        date: e.date, 
        category: e.category || "Expense", 
        amount: e.amount, 
        type: 'Expense', 
        party: e.vendor_payee, 
        status: e.status
      })),
      ...filteredData.purchases.map(p => ({
        id: `P-${p.id}`,
        date: p.purchase_date,
        category: "Purchase",
        amount: p.total_amount,
        type: 'Expense',
        party: p.supplier_name,
        status: p.payment_status
      }))
    ];

    return combined
      .filter(t => t.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#0F5156] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Crunching Financial Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-teal-800 rounded-lg shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Financial Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time financial intelligence from GymBios Ledger</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <FileText className="w-4 h-4" /> Export
          </button>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-[#0F5156] text-white rounded-lg text-sm font-medium hover:bg-[#0a3f42] transition-all shadow-md active:scale-95">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Dashboard Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FilterSelect label="Branch / Entity" options={["All Branches"]} />
          <FilterSelect label="Analysis Type" options={["Standard View"]} />
          
          {/* CUSTOM DATE RANGE */}
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Custom Date Range</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0F5156] transition-all" 
                  />
              </div>
              <span className="text-gray-400 text-sm">to</span>
              <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#0F5156] transition-all" 
                  />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        <KpiCard title="Total Revenue" value={kpis.revenue} icon={DollarSign} change="+12.5%" isPositive={true} />
        <KpiCard title="Profit Margin" value={kpis.margin} suffix="%" icon={TrendingUp} change="+2.4%" isPositive={true} />
        <KpiCard title="Outstanding" value={kpis.outstanding} icon={AlertCircle} change="Alert" isPositive={false} alert={kpis.outstanding > 0} />
        <KpiCard title="Active Mem. Value" value={kpis.activeVal} icon={Users} change="+5.1%" isPositive={true} />
        <KpiCard title="Trainer Revenue" value={kpis.trainerRev} icon={Zap} change="+8.3%" isPositive={true} />
        <KpiCard title="Total Expenses" value={kpis.totalExpenses} icon={CreditCard} change="+4.2%" isPositive={false} />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg">Revenue vs Expenses</h3>
            </div>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                        <Tooltip contentStyle={{borderRadius: '8px'}} formatter={(value) => [`${Number(value).toLocaleString()} AED`, '']} />
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0F5156" strokeWidth={3} dot={{r: 4}} />
                        <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Income Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Income Sources</h3>
            <div className="h-64 w-full relative flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={incomeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {incomeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                        </Pie>
                        <Tooltip formatter={(value) => `${Number(value).toLocaleString()} AED`} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="text-xs text-gray-400 font-medium block">Total</span>
                        <span className="text-xl font-bold text-gray-800">{(kpis.revenue / 1000).toFixed(1)}k</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
                {incomeDistribution.slice(0,6).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></span>
                        <span className="text-xs text-gray-600 truncate">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Unified Transaction History</h3>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none" />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Party</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {transactionHistory.length > 0 ? transactionHistory.map((txn, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{txn.date}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {txn.type}
                                </span>
                            </td>
                            <td className="px-6 py-4">{txn.category}</td>
                            <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">{txn.party}</td>
                            <td className={`px-6 py-4 text-right font-bold ${txn.type === 'Income' ? 'text-gray-800' : 'text-red-600'}`}>
                                {txn.type === 'Expense' ? '-' : '+'}{Number(txn.amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="px-2 py-1 rounded text-xs font-medium border bg-green-50 text-green-700 border-green-100">
                                    {txn.status}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">No transactions found within this date range.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function FilterSelect({ label, options }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
            <div className="relative">
                <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg pl-3 pr-8 py-2.5 outline-none">
                    {options.map(opt => <option key={opt}>{opt}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"><ChevronDown className="w-4 h-4" /></div>
            </div>
        </div>
    )
}

function KpiCard({ title, value, change, isPositive, alert, suffix, icon: Icon }) {
    return (
        <div className={`relative p-5 rounded-xl border shadow-sm ${alert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${alert ? 'bg-red-100' : 'bg-teal-50'}`}>
                    <Icon className={`w-5 h-5 ${alert ? 'text-red-600' : 'text-teal-700'}`} />
                </div>
                <span className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}{change}
                </span>
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
                <h2 className={`text-2xl font-extrabold ${alert ? 'text-red-700' : 'text-gray-900'}`}>
                    {Number(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} 
                    <span className="text-sm font-medium text-gray-400 ml-1">{suffix || "AED"}</span>
                </h2>
            </div>
        </div>
    )
}