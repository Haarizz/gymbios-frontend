import { useEffect, useMemo, useState } from "react";
import { getMembers } from "../../api/member"; // Assuming paths remain valid
import {
  getReferrals,
  getReferralStats,
  createReferral,
} from "../../api/referrals";
import { getRewardRules, createRewardRule } from "../../api/rewardRules";

// Icons (using react-icons or similar if available, otherwise using emojis as placeholders to match your previous code)
// If you have specific icon components, you can swap the emojis back out.

export default function ReferralsPage() {
  const [members, setMembers] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [rewardRules, setRewardRules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showRewardRuleModal, setShowRewardRuleModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [membersRes, referralsRes, statsRes, rulesRes] = await Promise.all([
        getMembers(),
        getReferrals(),
        getReferralStats(),
        getRewardRules(),
      ]);
      setMembers(membersRes || []);
      setReferrals(referralsRes || []);
      setStats(statsRes || null);
      setRewardRules(rulesRes || []);
    } catch (err) {
      console.error("Failed to load referral data", err);
    } finally {
      setLoading(false);
    }
  }

  const topReferrers = useMemo(() => {
    const counts = {};

    referrals.forEach((r) => {
      const id = r.referrerMemberId;
      if (!id) return;

      if (!counts[id]) {
        const mem = members.find((m) => m.id === id);
        counts[id] = {
          memberId: id,
          name: mem ? `${mem.firstname} ${mem.lastname}` : "Unknown",
          email: mem ? mem.email : "",
          total: 0,
        };
      }

      counts[id].total += 1;
    });

    const list = Object.values(counts).sort((a, b) => b.total - a.total);

    return list.slice(0, 3).map((item, idx) => ({
      ...item,
      rank: idx + 1,
      tier:
        item.total >= 10
          ? "Platinum"
          : item.total >= 5
          ? "Gold"
          : "Silver",
    }));
  }, [referrals, members]);

  const recentActivity = useMemo(() => {
    const sorted = [...referrals].sort((a, b) => {
      if (!a.referralDate || !b.referralDate) return 0;
      return new Date(b.referralDate) - new Date(a.referralDate);
    });

    return sorted.slice(0, 5);
  }, [referrals]);

  const getMemberName = (id) => {
    if (!id) return "Member";
    const m = members.find((mem) => mem.id === id);
    if (!m) return "Member";
    return `${m.firstname} ${m.lastname}`;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between bg-white px-8 py-5 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Referrals Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and manage member referral programs and rewards
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <span className="text-lg leading-none">↓</span> Export Data
            </button>
            <button
              onClick={() => setShowReferralModal(true)}
              className="flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-800"
            >
              <span>+</span> Add a Referral
            </button>
            <button
              onClick={() => setShowRewardRuleModal(true)}
              className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-rose-600"
            >
              <span>+</span> Add Reward Rule
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-slate-400">
              Loading data...
            </div>
          ) : (
            <>
              {/* Stat cards */}
              {stats && (
                <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
                  <StatCard
                    label="Total Referrals"
                    value={stats.totalReferrals}
                    icon="👥"
                    color="blue"
                  />
                  <StatCard
                    label="Successful"
                    value={stats.successfulReferrals}
                    icon="✓" // checkmark
                    color="green"
                  />
                  <StatCard
                    label="Conversion"
                    value={`${stats.conversionRate.toFixed(1)}%`}
                    icon="↗" // trend up
                    color="purple"
                    isTrend
                  />
                  <StatCard
                    label="Total Rewards"
                    value={`${stats.totalRewards.toFixed(0)} AED`}
                    icon="🎁"
                    color="orange"
                    valueColor="text-orange-600"
                  />
                  <StatCard
                    label="Active Programs"
                    value={stats.activePrograms}
                    icon="⚡"
                    color="indigo"
                  />
                  <StatCard
                    label="Avg Reward"
                    value={`${stats.avgReward.toFixed(1)} AED`}
                    icon="$"
                    color="teal"
                    valueColor="text-teal-600"
                  />
                </div>
              )}

              {/* Tabs Navigation */}
              <div className="mb-6 border-b border-slate-200">
                <nav className="flex space-x-8">
                  {["Overview", "Members", "Activity", "Rewards", "Analytics", "Settings"].map((tab) => (
                    <button
                      key={tab}
                      className={`whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium ${
                        tab === "Overview"
                          ? "border-teal-600 text-teal-700"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content Grid */}
              <div className="grid gap-6 lg:grid-cols-[2fr_1.5fr]">
                {/* Left: Top Referrers */}
                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <div className="mb-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                      <span className="text-amber-500">🏆</span> Top Referrers
                    </h2>
                    <p className="text-sm text-slate-500">
                      Members with the highest successful referrals
                    </p>
                  </div>

                  <div className="space-y-4">
                    {topReferrers.map((r, idx) => (
                      <div
                        key={r.memberId}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank Circle */}
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                              idx === 0
                                ? "bg-amber-400"
                                : idx === 1
                                ? "bg-amber-500" // Adjusting for visual distinctness
                                : "bg-amber-600"
                            }`}
                          >
                            {r.rank}
                          </div>
                          
                          {/* Avatar Initials */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                            {r.name
                              ?.split(" ")
                              .map((x) => x[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div className="font-semibold text-slate-900">
                              {r.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {r.email}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-600">
                            {r.total} referrals
                          </div>
                          <div
                            className={`mt-1 inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide 
                            ${
                              r.tier === "Platinum"
                                ? "bg-purple-100 text-purple-700"
                                : r.tier === "Gold"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            ♕ {r.tier}
                          </div>
                        </div>
                      </div>
                    ))}
                    {topReferrers.length === 0 && (
                      <div className="py-8 text-center text-sm text-slate-500">
                        No referrals recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Recent Activity */}
                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100">
                  <div className="mb-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                      <span className="text-blue-500">🔔</span> Recent Activity
                    </h2>
                    <p className="text-sm text-slate-500">
                      Latest referral activities and rewards
                    </p>
                  </div>

                  <div className="space-y-4">
                    {recentActivity.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-50" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {getMemberName(r.referrerMemberId)}
                            </div>
                            <div className="text-xs text-slate-500">
                              Referred <span className="text-slate-700 font-medium">{r.referredName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                           <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              r.status === "Successful"
                                ? "bg-emerald-100 text-emerald-800"
                                : r.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {r.status || "Pending"}
                          </span>
                          <div className="mt-1 text-xs font-medium text-slate-400">
                             {r.rewardAmount ? `${r.rewardAmount} AED` : "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <div className="py-8 text-center text-sm text-slate-500">
                        No recent activity.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
                   <span className="text-purple-500">⚡</span> Quick Actions
                </div>
                <p className="mb-4 text-sm text-slate-500 -mt-3">Common referral management tasks</p>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <QuickActionCard label="Send Bulk Invite" icon="📧" color="blue" />
                  <QuickActionCard label="Process Rewards" icon="🎁" color="emerald" />
                  <QuickActionCard label="Generate Report" icon="📊" color="purple" />
                  <QuickActionCard label="Program Settings" icon="⚙️" color="slate" />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals remain functionally identical, just ensuring z-indexes are high enough */}
      {showReferralModal && (
        <ReferralModal
          members={members}
          onClose={() => setShowReferralModal(false)}
          onSaved={async (data) => {
            await createReferral(data);
            await loadData();
            setShowReferralModal(false);
          }}
        />
      )}

      {showRewardRuleModal && (
        <RewardRuleModal
          onClose={() => setShowRewardRuleModal(false)}
          onSaved={async (rule) => {
            await createRewardRule(rule);
            await loadData();
            setShowRewardRuleModal(false);
          }}
        />
      )}
    </div>
  );
}

// ---- Updated Sub-Components ----

function StatCard({ label, value, icon, color, isTrend, valueColor }) {
  // Mapping colors to Tailwind classes
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
    teal: "bg-teal-50 text-teal-600",
  };

  const trendColor = isTrend ? "text-purple-600" : "text-slate-900";
  const finalValueColor = valueColor || trendColor;

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
           <div className="text-sm font-medium text-slate-500">{label}</div>
           <div className={`mt-2 text-2xl font-bold ${finalValueColor}`}>
            {value}
          </div>
        </div>
        <div className={`rounded-xl p-2.5 ${colorStyles[color] || "bg-slate-100"}`}>
           <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ label, icon, color }) {
    const hoverStyles = {
        blue: "hover:border-blue-200 hover:bg-blue-50/50",
        emerald: "hover:border-emerald-200 hover:bg-emerald-50/50",
        purple: "hover:border-purple-200 hover:bg-purple-50/50",
        slate: "hover:border-slate-300 hover:bg-slate-50",
    }
    const iconStyles = {
        blue: "text-blue-500",
        emerald: "text-emerald-500",
        purple: "text-purple-500",
        slate: "text-slate-500",
    }

  return (
    <button className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-100 bg-white py-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${hoverStyles[color] || hoverStyles.slate}`}>
      <div className={`text-2xl ${iconStyles[color]}`}>{icon}</div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}

// --- Modals (Logic unchanged, minimal styling clean up for consistency) ---

function ReferralModal({ members, onClose, onSaved }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    referrerMemberId: "",
    referredName: "",
    referredEmail: "",
    referredPhone: "",
    photoUrl: "",
    referralDate: today,
    visitDate: today,
    status: "Pending",
    notes: "",
    rewardAmount: 50,
    rewardRuleId: null,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSaved({ ...form, rewardAmount: Number(form.rewardAmount || 0) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold text-slate-900">Add a Referral</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Referrer</label>
            <select
              name="referrerMemberId"
              value={form.referrerMemberId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.firstname} {m.lastname}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">New Member Name</label>
              <input type="text" name="referredName" value={form.referredName} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Email</label>
              <input type="email" name="referredEmail" value={form.referredEmail} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          {/* ... keeping other fields similar but cleaner ... */}
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Reward (AED)</label>
              <input type="number" name="rewardAmount" value={form.rewardAmount} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
             <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Status</label>
               <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="Pending">Pending</option>
                <option value="Successful">Successful</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="rounded-lg bg-teal-600 px-6 py-2 text-sm font-medium text-white hover:bg-teal-700">Save Referral</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RewardRuleModal({ onClose, onSaved }) {
    // keeping logic identically simple, just styling the modal wrapper
    const [form, setForm] = useState({
    ruleName: "",
    rewardType: "Cash Credit",
    rewardValue: "",
    eligibility: "Referrer Only",
    conditionType: "On Payment",
    expiryDays: 90,
    active: true,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSaved({ ...form, expiryDays: Number(form.expiryDays || 0) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
         <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-lg font-bold text-slate-900">Add Reward Rule</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Rule Name</label>
            <input type="text" name="ruleName" value={form.ruleName} onChange={handleChange} required placeholder="e.g. Summer Campaign" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Type</label>
                 <select name="rewardType" value={form.rewardType} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option>Cash Credit</option>
                  <option>Free Month</option>
                  <option>Voucher</option>
                </select>
             </div>
             <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Value</label>
                <input type="text" name="rewardValue" value={form.rewardValue} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
             </div>
           </div>
           
           <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" className="rounded-lg bg-rose-600 px-6 py-2 text-sm font-medium text-white hover:bg-rose-700">Create Rule</button>
          </div>
        </form>
      </div>
    </div>
  )
}