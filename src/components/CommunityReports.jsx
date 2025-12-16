import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
  Download, RefreshCw, FileText, Calendar, Search, X,
  ChevronDown, Printer, Filter
} from "lucide-react";

// --- API Imports ---
import { getMembers } from "../api/member";
import { fetchBills } from "../api/billingApi";
import { getPlans } from "../api/plans";
import { listStreams } from "../api/TrainingStreamsApi";
import { saveReport, listSavedReports } from "../api/CommunityReports.api";

// --- Configuration & Helpers ---
const COLORS_PIE = ["#8b5cf6", "#34d399", "#f59e0b", "#f43f5e", "#60a5fa"];

const KPICard = ({ title, value, trend, trendValue, sub, positive = true }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
    <div className="flex justify-between items-start">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      {trend && (
        <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trendValue}
        </span>
      )}
    </div>
    <div className="mt-4">
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
    <div className="flex-1 w-full min-h-[300px] relative">
      {children}
    </div>
  </div>
);

// --- Utility Functions ---
function monthKey(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

function safeNumber(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function extractArray(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (result.data && Array.isArray(result.data)) return result.data;
  if (result.value && Array.isArray(result.value)) return result.value;
  // Fallback: check keys for any array if response structure is nested
  const keys = Object.keys(result);
  for (const k of keys) {
    if (Array.isArray(result[k])) return result[k];
  }
  return [];
}

export default function CommunityReports() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // Custom Reports State
  const [dateFilter, setDateFilter] = useState("Today");
  const [showReportSummary, setShowReportSummary] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  // Data State
  const [members, setMembers] = useState([]);
  const [bills, setBills] = useState([]);
  const [plans, setPlans] = useState([]);
  const [streams, setStreams] = useState([]);

  // Persistence State
  const [saving, setSaving] = useState(false);
  const [savedReports, setSavedReports] = useState([]);

  useEffect(() => {
    loadAll();
    fetchSavedReports();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      // Execute all API calls in parallel
      const [mRes, bRes, pRes, sRes] = await Promise.allSettled([
        getMembers(), 
        fetchBills(), 
        getPlans(), 
        listStreams()
      ]);

      // Safely extract arrays from responses
      const membersRaw = extractArray(mRes.status === "fulfilled" ? (mRes.value || mRes) : []);
      const billsRaw = extractArray(bRes.status === "fulfilled" ? (bRes.value || bRes) : []);
      const plansRaw = extractArray(pRes.status === "fulfilled" ? (pRes.value || pRes) : []);
      const streamsRaw = extractArray(sRes.status === "fulfilled" ? (sRes.value || sRes) : []);

      // 1. Normalize Members
      const normMembers = membersRaw.map(m => ({
        ...m,
        id: m.id, // Primary Key (BigInt)
        memberDisplayId: m.memberid || m.memberId || `ID-${m.id}`, // e.g. MBR-1001
        fullName: (m.firstname && m.lastname) 
          ? `${m.firstname} ${m.lastname}` 
          : (m.name || m.firstname || "Unknown"),
        mobile: m.phone || m.phoneNumber || m.mobileNumber || "—",
        membershipPlan: m.membership_plan || m.membershipPlan, // e.g. "premiumAnnual"
        status: m.status || "Active",
        createdAt: m.created_at || m.createdAt || m.join_date || m.joinDate,
        dob: m.birthday || m.dob || m.dateOfBirth
      }));

      // 2. Normalize Bills
      const normBills = billsRaw.map(b => ({
        ...b,
        id: b.id,
        memberId: b.member_id || b.memberId, // Foreign Key
        memberName: b.member_name || b.memberName, 
        amount: safeNumber(b.amount),
        paidAmount: safeNumber(b.paid_amount || b.paidAmount),
        date: b.bill_date || b.billDate || b.date || b.created_at,
        dueDate: b.due_date || b.dueDate,
        paymentMethod: b.payment_method || b.paymentMethod || "Pending",
        service: b.service || b.category || "General",
        type: b.type || "Membership"
      }));

      // 3. Normalize Plans (for price lookup of new members)
      const normPlans = plansRaw.map(p => ({
        id: p.id,
        name: p.name, // e.g. "Premium Annual"
        price: safeNumber(p.price)
      }));

      setMembers(normMembers);
      setBills(normBills);
      setPlans(normPlans);
      setStreams(streamsRaw);

    } catch (err) {
      console.error("Data load failed", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedReports() {
    try {
      const res = await listSavedReports();
      setSavedReports(extractArray(res));
    } catch (err) {
      console.warn("Could not fetch saved reports", err);
    }
  }

  // --- DATA JOINING & MERGING LOGIC ---
  const detailedRows = useMemo(() => {
    // 1. Map Members for O(1) lookup
    const memberMap = new Map();
    members.forEach(m => {
      if (m.id) memberMap.set(String(m.id), m);
    });

    const billedMemberIds = new Set();
    
    // 2. Process Existing Bills (Transactions)
    // FILTER: Only keep bills where the member still exists in our 'members' list
    const validBills = bills.filter(bill => {
        // Check if member exists by ID
        let found = memberMap.has(String(bill.memberId));
        
        // Fallback: Check if member exists by Name (if ID link is broken)
        if (!found && bill.memberName) {
           const match = members.find(m => String(m.fullName).toLowerCase() === String(bill.memberName).toLowerCase());
           if (match) found = true;
        }
        return found;
    });

    const transactionRows = validBills.map((bill, index) => {
      let member = memberMap.get(String(bill.memberId));
      
      // Fallback: If FK missing, match by name
      if (!member && bill.memberName) {
        member = members.find(m => String(m.fullName).toLowerCase() === String(bill.memberName).toLowerCase());
      }

      // Mark this member as having a transaction so we don't duplicate them in "New Members" list
      if (member) billedMemberIds.add(String(member.id));

      const isPaid = bill.status === 'Paid' || bill.paidAmount >= bill.amount;
      const payMode = bill.paymentMethod || "Unpaid";

      return {
        id: `BILL-${bill.id}`,
        idx: index,
        displayMemberId: member ? member.memberDisplayId : (bill.memberId ? `ID-${bill.memberId}` : "N/A"),
        memberName: member ? member.fullName : (bill.memberName || "Unknown"),
        mobile: member ? member.mobile : "—", 
        type: bill.type || "Renew", 
        plan: bill.service || (member ? member.membershipPlan : "General"),
        amount: bill.amount,
        payMode: payMode,
        cash: (payMode.toLowerCase() === "cash" && isPaid) ? bill.paidAmount : 0,
        card: (payMode.toLowerCase() === "card" && isPaid) ? bill.paidAmount : 0,
        due: Math.max(0, bill.amount - bill.paidAmount),
        date: bill.date || new Date().toISOString()
      };
    });

    // 3. Find "New" Members (Members present in DB but have NO bills yet)
    // These are active members who haven't paid yet
    const newMemberRows = members
      .filter(m => !billedMemberIds.has(String(m.id)))
      .map((m, i) => {
        // Try to find plan price
        const mPlanSlug = String(m.membershipPlan || "").toLowerCase().replace(/\s/g, '');
        const planObj = plans.find(p => String(p.name).toLowerCase().replace(/\s/g, '') === mPlanSlug);
        const planPrice = planObj ? planObj.price : 0;

        return {
          id: `NEW-${m.id}`,
          idx: 9999 + i, 
          displayMemberId: m.memberDisplayId,
          memberName: m.fullName,
          mobile: m.mobile,
          type: "New Registration",
          plan: m.membershipPlan || "No Plan",
          amount: planPrice,
          payMode: "Pending",
          cash: 0,
          card: 0,
          due: planPrice, // Full amount due for new members
          date: m.createdAt || new Date().toISOString()
        };
      });

    // 4. Combine and Sort by Date (Newest First)
    const allRows = [...transactionRows, ...newMemberRows];
    return allRows.sort((a, b) => new Date(b.date) - new Date(a.date)).map((row, i) => ({ ...row, idx: i + 1 }));

  }, [bills, members, plans]);

  // Filter Logic
  const filteredDetailedRows = useMemo(() => {
    if (!reportSearch.trim()) return detailedRows;
    const q = reportSearch.toLowerCase();
    return detailedRows.filter(r => 
      String(r.memberName).toLowerCase().includes(q) ||
      String(r.displayMemberId).toLowerCase().includes(q) ||
      String(r.mobile).toLowerCase().includes(q)
    );
  }, [detailedRows, reportSearch]);

  // --- ANALYTICS CALCULATIONS ---
  const membershipMonthly = useMemo(() => {
    const newMap = new Map();
    members.forEach(m => {
      const k1 = monthKey(m.createdAt);
      if (k1) newMap.set(k1, (newMap.get(k1) || 0) + 1);
    });
    
    const months = Array.from(new Set([...newMap.keys()])).sort((a, b) => new Date(a) - new Date(b));
    
    if (!months.length) return [
      { month: "Jan 2025", newCount: 45, churn: 12 }, { month: "Feb 2025", newCount: 52, churn: 8 },
      { month: "Mar 2025", newCount: 38, churn: 15 }, { month: "Apr 2025", newCount: 61, churn: 9 },
      { month: "May 2025", newCount: 45, churn: 19 }, { month: "Jun 2025", newCount: 68, churn: 11 }
    ];

    return months.map(m => ({ month: m, newCount: newMap.get(m)||0, churn: 0 }));
  }, [members]);

  const membershipGrowth = useMemo(() => {
    if (members.length < 5) return [
      { month: "Jan 2025", members: 300 }, { month: "Feb 2025", members: 340 },
      { month: "Mar 2025", members: 360 }, { month: "Apr 2025", members: 420 },
      { month: "May 2025", members: 450 }, { month: "Jun 2025", members: 520 }
    ];
    let total = 0;
    return membershipMonthly.map(m => {
      total += (m.newCount - m.churn);
      return { month: m.month, members: total };
    });
  }, [members, membershipMonthly]);

  const revenueMonthly = useMemo(() => {
    const map = new Map();
    bills.forEach(b => {
      const k = monthKey(b.date);
      if (k) map.set(k, (map.get(k)||0) + b.amount);
    });
    const arr = Array.from(map.entries()).map(([month, total]) => ({ month, total }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
    
    if (!arr.length) return [
      { month: "Jan 2025", total: 90000 }, { month: "Feb 2025", total: 85000 },
      { month: "Mar 2025", total: 88000 }, { month: "Apr 2025", total: 86000 },
      { month: "May 2025", total: 90000 }, { month: "Jun 2025", total: 87000 }
    ];
    return arr;
  }, [bills]);

  const revenueByCategory = useMemo(() => {
    const map = new Map();
    bills.forEach(b => map.set(b.service, (map.get(b.service)||0) + b.amount));
    const arr = Array.from(map.entries()).map(([name, value]) => ({ name, value, pct: 0 }));
    const total = arr.reduce((s, i) => s + i.value, 0) || 1;
    arr.forEach(i => i.pct = Math.round((i.value/total)*100));
    
    if (!arr.length) return [
        { name: "Memberships", value: 325000, pct: 65 }, { name: "Personal Training", value: 100000, pct: 20 },
        { name: "Group Classes", value: 50000, pct: 10 }, { name: "Merchandise", value: 15000, pct: 3 },
        { name: "Other", value: 10000, pct: 2 }
    ];
    return arr;
  }, [bills]);

  const demographics = useMemo(() => {
    const buckets = { "18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "55+": 0 };
    members.forEach(m => {
      if (!m.dob) return;
      const age = Math.floor((Date.now() - new Date(m.dob)) / 31557600000);
      if (age >= 18 && age <= 25) buckets["18-25"]++;
      else if (age <= 35) buckets["26-35"]++;
      else if (age <= 45) buckets["36-45"]++;
      else if (age <= 55) buckets["46-55"]++;
      else if (age > 55) buckets["55+"]++;
    });
    const total = Object.values(buckets).reduce((s,x)=>s+x,0) || 1;
    
    if (Object.values(buckets).every(x=>x===0)) return [
       { label: "18-25", value: 120, pct: 23 }, { label: "26-35", value: 180, pct: 35 },
       { label: "36-45", value: 135, pct: 26 }, { label: "46-55", value: 65, pct: 12 }, { label: "55+", value: 21, pct: 4 }
    ];
    return Object.entries(buckets).map(([label, value]) => ({ label, value, pct: Math.round((value/total)*100) }));
  }, [members]);

  const peakHours = useMemo(() => {
    if (!streams.length) return [
       { hour: "6AM", value: 45 }, { hour: "7AM", value: 85 }, { hour: "8AM", value: 120 }, { hour: "5PM", value: 145 }, { hour: "6PM", value: 165 }
    ];
    const map = new Map();
    streams.forEach(s => {
      const d = new Date(s.startTime || s.createdAt);
      if (isNaN(d)) return;
      const h = d.getHours();
      const label = `${h%12||12}${h>=12?'PM':'AM'}`;
      map.set(label, (map.get(label)||0) + safeNumber(s.enrolledCount || 1));
    });
    return Array.from(map.entries()).map(([hour, value]) => ({ hour, value })).sort((a,b) => b.value - a.value).slice(0, 10);
  }, [streams]);

  const kpis = useMemo(() => {
    const totalRev = bills.reduce((s,b)=>s+b.amount,0);
    const count = members.length || 1;
    return [
      { title: "Member Retention Rate", value: "94.2%", trend: true, trendValue: "+2.1%", sub: "Monthly retention rate" },
      { title: "Average Revenue Per Member", value: `$${Math.round(totalRev/count)}`, trend: true, trendValue: "+8.5%", sub: "Per member monthly" },
      { title: "Class Utilization Rate", value: "78%", trend: true, trendValue: "-3.2%", sub: "Average across all classes", positive: false },
      { title: "Equipment Downtime", value: "2.3%", trend: true, trendValue: "-1.1%", sub: "Equipment availability" }
    ];
  }, [bills, members]);

  // --- Handlers ---
  async function handleSaveReport() {
    setSaving(true);
    try {
      await saveReport({
        name: `Report - ${new Date().toLocaleDateString()} (${activeTab})`,
        filters: { tab: activeTab, dateFilter },
        summary: { kpis, rowCount: detailedRows.length }
      });
      await fetchSavedReports();
      alert("Report saved successfully!");
    } catch (e) {
      alert("Failed to save report.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  // --- Render Content Switcher ---
  function renderContent() {
    switch(activeTab) {
      case "Overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard title="Membership Growth Trend" subtitle="Member acquisition and retention over time">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={membershipGrowth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="members" stroke="#8b5cf6" fill="#f3e8ff" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
              <div className="lg:col-span-1">
                <ChartCard title="Revenue Distribution" subtitle="Revenue breakdown by service type">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revenueByCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                          {revenueByCategory.map((entry, idx) => <Cell key={idx} fill={COLORS_PIE[idx % COLORS_PIE.length]} />)}
                        </Pie>
                        <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>
            </div>
            <ChartCard title="Peak Usage Hours" subtitle="Gym utilization throughout the day">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        );

      case "Membership":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard title="Member Acquisition vs Churn" subtitle="Monthly new members vs cancellations">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={membershipMonthly} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="newCount" name="New" fill="#34d399" />
                      <Bar dataKey="churn" name="Churn" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
            <div className="lg:col-span-1">
              <ChartCard title="Member Demographics" subtitle="Age distribution">
                <div className="space-y-4">
                  {demographics.map((d,i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm">
                        <div>{d.label}</div>
                        <div>{d.value} <span className="text-gray-400">({d.pct}%)</span></div>
                      </div>
                      <div className="w-full bg-gray-100 rounded h-2 mt-2">
                        <div className="bg-blue-500 h-2 rounded" style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>
        );

      case "Revenue":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard title="Revenue Trends" subtitle="Monthly revenue">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueMonthly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                      <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
            <div className="lg:col-span-1">
              <ChartCard title="Revenue Summary" subtitle="This month's performance">
                <div className="space-y-3">
                  {revenueByCategory.map((r, i) => (
                    <div key={i} className="flex justify-between">
                      <div>
                        <div className="text-sm font-medium">{r.name}</div>
                        <div className="text-xs text-gray-400">{r.pct}%</div>
                      </div>
                      <div className="font-semibold">${Math.round(r.value).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </div>
          </div>
        );

      case "Operations":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Class Attendance Trends" subtitle="Attendance rates by class type over time">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                     { month: 'Jan', val: 65 }, { month: 'Feb', val: 72 }, { month: 'Mar', val: 74 },
                     { month: 'Apr', val: 80 }, { month: 'May', val: 82 }, { month: 'Jun', val: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="val" stroke="#f97316" fill="#fff7ed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Operational Metrics" subtitle="Key operational performance indicators">
              <div className="space-y-6">
                {[
                  { label: "Equipment Utilization", val: "87%", color: "bg-green-500", w: "87%" },
                  { label: "Staff Efficiency", val: "92%", color: "bg-blue-600", w: "92%" },
                  { label: "Customer Satisfaction", val: "4.7/5", color: "bg-purple-600", w: "94%" }
                ].map((op, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{op.label}</span>
                      <span className="text-sm font-bold text-gray-900">{op.val}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className={`${op.color} h-3 rounded-full`} style={{ width: op.w }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        );

      case "Custom Reports":
        return (
          <div className="animate-in fade-in duration-300">
             {/* Header */}
             <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Custom Reports</h2>
                <p className="text-sm text-gray-500">Generate detailed membership reports</p>
              </div>
               <button 
                 onClick={handleSaveReport}
                 disabled={saving}
                 className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 disabled:opacity-50"
               >
                 {saving ? "Saving..." : "Save Current View"}
               </button>
            </div>
  
            {/* Date Filter */}
            <div className="bg-teal-50/50 p-6 rounded-xl border border-teal-100 mb-6">
               <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-teal-700" />
                  <span className="font-semibold text-gray-800">Date Range Filter</span>
               </div>
               
               <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
                  <div className="flex gap-2">
                    {['Today', 'Yesterday', 'Custom Range'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => setDateFilter(opt)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          dateFilter === opt 
                            ? 'bg-teal-700 text-white border-teal-700' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                         <Calendar className="w-4 h-4" />
                         {opt}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4 flex-1">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                        <input type="date" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                        <input type="date" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                  </div>
                  <button 
                    onClick={() => setShowReportSummary(true)}
                    className="bg-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-800 flex items-center gap-2 shadow-sm whitespace-nowrap ml-auto"
                  >
                    <RefreshCw className="w-4 h-4" /> Apply & Generate Report
                  </button>
               </div>
            </div>
  
            {/* Summary Cards */}
            {showReportSummary && (
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 relative">
                 <button onClick={() => setShowReportSummary(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                 </button>
                 <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Summary ({dateFilter})</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      { label: "Total Plans Sold", val: filteredDetailedRows.length, bg: "bg-blue-50", txt: "text-blue-600", bold: "text-blue-700" },
                      { label: "Total Revenue", val: `AED ${filteredDetailedRows.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, bg: "bg-green-50", txt: "text-green-600", bold: "text-green-700" },
                      { label: "Cash", val: `AED ${filteredDetailedRows.reduce((acc, curr) => acc + curr.cash, 0).toLocaleString()}`, bg: "bg-purple-50", txt: "text-purple-600", bold: "text-purple-700" },
                      { label: "Card", val: `AED ${filteredDetailedRows.reduce((acc, curr) => acc + curr.card, 0).toLocaleString()}`, bg: "bg-orange-50", txt: "text-orange-600", bold: "text-orange-700" },
                      { label: "Total Dues", val: `AED ${filteredDetailedRows.reduce((acc, curr) => acc + curr.due, 0).toLocaleString()}`, bg: "bg-red-50", txt: "text-red-600", bold: "text-red-700" },
                    ].map((item, i) => (
                      <div key={i} className={`${item.bg} p-4 rounded-lg text-center`}>
                         <div className={`text-xs ${item.txt} font-medium mb-1`}>{item.label}</div>
                         <div className={`text-xl font-bold ${item.bold}`}>{item.val}</div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
  
            {/* Detailed Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
               <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-700" /> Membership Report (Detailed)
                    </h3>
                    <p className="text-sm text-gray-500">Complete transaction history</p>
                  </div>
                  <div className="flex gap-2">
                     <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"><Printer className="w-4 h-4" /> PDF</button>
                     <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"><Download className="w-4 h-4" /> Excel</button>
                  </div>
               </div>
               
               {/* Search Bar */}
               <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                  <div className="relative w-full max-w-md">
                     <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                     <input 
                       type="text" 
                       placeholder="Search by name, member ID, or mobile..." 
                       className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                       value={reportSearch}
                       onChange={(e) => setReportSearch(e.target.value)}
                     />
                  </div>
                  <div className="flex items-center gap-2">
                     <Filter className="w-4 h-4 text-gray-400" />
                     <span className="text-sm text-gray-500">All Types</span>
                     <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
               </div>
  
               {/* Table */}
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                           <th className="px-6 py-3 font-medium">#</th>
                           <th className="px-6 py-3 font-medium">Member ID</th>
                           <th className="px-6 py-3 font-medium">Photo & Name</th>
                           <th className="px-6 py-3 font-medium">Mobile</th>
                           <th className="px-6 py-3 font-medium">Type</th>
                           <th className="px-6 py-3 font-medium">Plan</th>
                           <th className="px-6 py-3 font-medium text-right">Amount (AED)</th>
                           <th className="px-6 py-3 font-medium text-right">Cash</th>
                           <th className="px-6 py-3 font-medium text-right">Card</th>
                           <th className="px-6 py-3 font-medium text-right">Due</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredDetailedRows.length > 0 ? filteredDetailedRows.map((row, i) => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                             <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                             <td className="px-6 py-4 font-medium text-teal-600">
                               {row.displayMemberId}
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                     {row.memberName.charAt(0)}
                                   </div>
                                   <span className="font-medium text-gray-900">{row.memberName}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-gray-500">{row.mobile}</td>
                             <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">{row.type}</span></td>
                             <td className="px-6 py-4 text-gray-700">{row.plan}</td>
                             <td className="px-6 py-4 text-right font-medium">{row.amount.toLocaleString()}</td>
                             <td className="px-6 py-4 text-right text-gray-400">{row.cash > 0 ? row.cash.toLocaleString() : "-"}</td>
                             <td className="px-6 py-4 text-right font-medium">{row.card > 0 ? row.card.toLocaleString() : "-"}</td>
                             <td className={`px-6 py-4 text-right ${row.due > 0 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                {row.due > 0 ? row.due.toLocaleString() : "0"}
                             </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="10" className="px-6 py-12 text-center text-gray-500">No records found.</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
  
            {/* Saved Reports List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Saved Report History</h3>
                  <button onClick={fetchSavedReports} className="text-teal-600 text-sm hover:underline">Refresh List</button>
               </div>
               {savedReports.length > 0 ? (
                  <ul className="space-y-2">
                    {savedReports.map(r => (
                      <li key={r.id} className="flex justify-between items-center border p-3 rounded-lg hover:bg-gray-50">
                        <div>
                          <div className="font-medium text-gray-800">{r.name}</div>
                          <div className="text-xs text-gray-500">Created: {new Date(r.createdAt).toLocaleString()}</div>
                        </div>
                        <button className="px-3 py-1 border rounded text-sm hover:bg-white">Download</button>
                      </li>
                    ))}
                  </ul>
               ) : <div className="text-sm text-gray-500 italic">No saved reports found.</div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans text-gray-800">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive business intelligence.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setActiveTab("Custom Reports")} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"><FileText className="w-4 h-4"/> Custom Reports</button>
           <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/> Refresh Data</button>
           <button className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 shadow-sm"><Download className="w-4 h-4" /> Export Report</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {kpis.map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto">
          {["Overview", "Membership", "Revenue", "Operations", "Custom Reports"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-medium border-b-2 ${activeTab === tab ? "border-teal-600 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{tab}</button>
          ))}
        </div>
      </div>

      {renderContent()}
    </div>
  );
}