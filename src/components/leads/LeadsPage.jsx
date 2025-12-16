import { useEffect, useMemo, useState } from "react";
// Replace these with your actual API paths
import {
  getLeads,
  getLeadStats,
  createLead,
  updateLead,
  deleteLead,
} from "../../api/leads";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [staffFilter, setStaffFilter] = useState("All Staff");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [viewMode, setViewMode] = useState("table");

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [leadsRes, statsRes] = await Promise.all([
        getLeads(),
        getLeadStats(),
      ]);
      setLeads(leadsRes || []);
      setStats(statsRes || null);
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const fullName = `${l.firstName || ""} ${l.lastName || ""}`.toLowerCase();
      const s = search.toLowerCase();

      const matchesSearch =
        !s ||
        fullName.includes(s) ||
        (l.email || "").toLowerCase().includes(s) ||
        (l.phone || "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "All Status" ||
        !l.status ||
        l.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesSource =
        sourceFilter === "All Sources" ||
        !l.source ||
        l.source.toLowerCase() === sourceFilter.toLowerCase();

      const matchesPriority =
        priorityFilter === "All Priority" ||
        !l.priority ||
        l.priority.toLowerCase() === priorityFilter.toLowerCase();

      // Note: Add staff filter logic here if your API returns assignedTo data matching the filter
      
      return (
        matchesSearch && matchesStatus && matchesSource && matchesPriority
      );
    });
  }, [leads, search, statusFilter, sourceFilter, priorityFilter]);

  const handleSaveLead = async (form) => {
    if (editingLead) {
      await updateLead(editingLead.id, form);
    } else {
      await createLead(form);
    }
    await loadData();
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Delete this lead?")) return;
    await deleteLead(leadId);
    await loadData();
  };

  // Removed 'ml-64'. The container is now w-full to fill the space next to the sidebar.
  return (
    <div className="w-full min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track and manage potential member leads through the conversion funnel.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              <ExportIcon className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
              <ImportIcon className="h-4 w-4" /> Import
            </button>
            <button
              onClick={() => {
                setEditingLead(null);
                setShowLeadModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800"
            >
              <span>+</span> Add New Lead
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {loading ? (
            <div className="flex h-64 items-center justify-center text-slate-400">
              Loading...
            </div>
          ) : (
            <>
              {/* Stat cards */}
              {stats && (
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                  <StatCard
                    label="Total Leads"
                    value={stats.totalLeads}
                    icon={<UsersIcon />}
                    color="blue"
                  />
                  <StatCard
                    label="Converted"
                    value={stats.convertedLeads}
                    icon={<CheckCircleIcon />}
                    color="green"
                    valueColor="text-green-600"
                  />
                  <StatCard
                    label="Conversion Rate"
                    value={`${stats.conversionRate.toFixed(1)}%`}
                    icon={<TrendUpIcon />}
                    color="purple"
                    valueColor="text-purple-600"
                  />
                  <StatCard
                    label="Follow-ups Due"
                    value={stats.followUpsDue}
                    icon={<ClockIcon />}
                    color="orange"
                    valueColor="text-orange-600"
                  />
                  <StatCard
                    label="Hot Leads"
                    value={stats.hotLeads}
                    icon={<FlagIcon />}
                    color="red"
                    valueColor="text-rose-600"
                  />
                  <StatCard
                    label="Avg Score"
                    value={stats.avgScore.toFixed(0)}
                    icon={<TargetIcon />}
                    color="indigo"
                    valueColor="text-indigo-600"
                  />
                </div>
              )}

              {/* Toolbar */}
              <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search leads by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border-none bg-transparent py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:ring-0"
                  />
                </div>

                {/* Filters & View Toggle */}
                <div className="flex flex-wrap items-center gap-3">
                  <FilterDropdown
                    label="All Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={["All Status", "new", "contacted", "follow-up", "converted", "lost"]}
                  />
                  <FilterDropdown
                    label="All Sources"
                    value={sourceFilter}
                    onChange={setSourceFilter}
                    options={["All Sources", "Website", "Referral", "Walk In", "Social Media", "Google Ads"]}
                  />
                  <FilterDropdown
                    label="All Staff"
                    value={staffFilter}
                    onChange={setStaffFilter}
                    options={["All Staff", "Sarah Johnson", "Ahmed Hassan", "Maria Rodriguez"]}
                  />
                  <FilterDropdown
                    label="All Priority"
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    options={["All Priority", "low", "medium", "high"]}
                  />
                  
                  {/* Divider */}
                  <div className="mx-1 h-6 w-px bg-slate-200 hidden sm:block"></div>

                  {/* View Mode */}
                  <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                        viewMode === "table"
                          ? "bg-teal-700 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <ListIcon className="h-4 w-4" /> Table
                    </button>
                    <button
                      onClick={() => setViewMode("kanban")}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                        viewMode === "kanban"
                          ? "bg-teal-700 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <KanbanIcon className="h-4 w-4" /> Kanban
                    </button>
                  </div>
                </div>
              </div>

              {/* View Content */}
              {viewMode === "table" ? (
                <LeadsTable
                  leads={filteredLeads}
                  onEdit={(l) => {
                    setEditingLead(l);
                    setShowLeadModal(true);
                  }}
                  onDelete={handleDeleteLead}
                />
              ) : (
                <KanbanView leads={filteredLeads} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      {showLeadModal && (
        <LeadModal
          lead={editingLead}
          onClose={() => setShowLeadModal(false)}
          onSaved={async (data) => {
            await handleSaveLead(data);
            setShowLeadModal(false);
          }}
        />
      )}
    </div>
  );
}

// ---------------- Sub-Components ----------------

function StatCard({ label, value, icon, color, valueColor }) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-rose-50 text-rose-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className={`mt-2 text-2xl font-bold ${valueColor || "text-slate-900"}`}>
            {value}
          </div>
        </div>
        <div className={`rounded-full p-2 ${colorStyles[color] || "bg-slate-100"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({ value, onChange, options }) {
  return (
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-lg border-none bg-transparent py-0 pl-2 pr-8 text-sm font-medium text-slate-600 hover:text-slate-900 focus:ring-0"
      >
        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-slate-400">
        <ChevronDownIcon className="h-3 w-3" />
      </div>
    </div>
  );
}

function LeadsTable({ leads, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="font-semibold text-slate-900">Leads List <span className="ml-1 font-normal text-slate-400">({leads.length})</span></h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4"></th> {/* Checkbox col */}
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">Assigned</th>
              <th className="px-6 py-4">Next Follow-up</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50/80">
                <td className="px-6 py-4">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {`${l.firstName?.[0] || ""}${l.lastName?.[0] || ""}`}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {l.firstName} {l.lastName}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {l.tags && l.tags.split(",").map((t) => (
                          <span key={t} className="inline-block rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-600">{l.email}</span>
                    <span className="text-xs text-slate-400">{l.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-slate-600">
                    <GlobeIcon className="h-4 w-4 text-slate-400" />
                    <span>{l.source}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={l.priority} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 font-medium text-slate-700">{l.score || 0}</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div 
                        className="h-full rounded-full bg-teal-600" 
                        style={{ width: `${Math.min(l.score || 0, 100)}%` }} 
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-slate-600">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                       {(l.assignedTo || "SJ").split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <span className="text-xs">{l.assignedTo || "Unassigned"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className={`text-xs font-medium ${l.nextFollowUpDate ? "text-rose-600" : "text-slate-400"}`}>
                      {l.nextFollowUpDate || "Not scheduled"}
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-slate-400 hover:text-slate-600"><PhoneIcon className="h-4 w-4" /></button>
                    <button className="text-slate-400 hover:text-slate-600"><EnvelopeIcon className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={10} className="py-8 text-center text-slate-400">No leads found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KanbanView({ leads }) {
  const columns = ["new", "contacted", "follow-up", "converted", "lost"];
  const grouped = columns.map((status) => ({
    status,
    items: leads.filter((l) => (l.status || "new").toLowerCase() === status.replace(' ', '-')), // handle follow-up mapping
  }));

  // Helper to map status to simple display
  const getStatusDisplay = (st) => st === 'follow-up' ? 'Follow Up' : st;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5 items-start">
      {grouped.map((col) => (
        <div key={col.status} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
             <StatusBadge status={col.status} />
             <span className="text-xs text-slate-400">({col.items.length})</span>
          </div>
          
          <div className="flex flex-col gap-3">
            {col.items.map((l) => (
              <div key={l.id} className="group relative flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                
                {/* Header: Avatar + Name + Priority */}
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {`${l.firstName?.[0] || ""}${l.lastName?.[0] || ""}`}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 leading-tight">{l.firstName}<br/>{l.lastName}</h4>
                      </div>
                   </div>
                   <PriorityBadge priority={l.priority} />
                </div>

                {/* Contact & Info */}
                <div className="text-xs text-slate-500">
                  <p>{l.email}</p>
                  <p className="mt-0.5">{l.phone}</p>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-3 text-xs">
                   <div className="flex items-center gap-1.5 text-slate-600">
                      <GlobeIcon className="h-3.5 w-3.5 text-slate-400" />
                      <span>{l.source}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="font-medium">{l.score}</span>
                      <div className="h-1 w-8 rounded-full bg-slate-100">
                         <div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.min(l.score || 0, 100)}%` }} />
                      </div>
                   </div>
                </div>

                {/* Footer: Date & Actions */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-rose-500">
                      Next: {l.nextFollowUpDate ? l.nextFollowUpDate : 'No Date'}
                    </span>
                    <div className="flex items-center gap-3">
                       <div className="flex gap-2 text-slate-400">
                          <button className="hover:text-slate-600"><PhoneIcon className="h-3.5 w-3.5" /></button>
                          <button className="hover:text-slate-600"><EnvelopeIcon className="h-3.5 w-3.5" /></button>
                          <button className="hover:text-slate-600"><ChatIcon className="h-3.5 w-3.5" /></button>
                       </div>
                       <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500">
                         {(l.assignedTo || "SJ").split(' ').map(n=>n[0]).join('').slice(0,2)}
                       </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Lead Modal ----------------

// ---------------- Lead Modal ----------------

// ---------------- Lead Modal (FINAL SCROLL FIX & LAYOUT ADJUSTMENT) ----------------
function LeadModal({ lead, onClose, onSaved }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    firstName: lead?.firstName || "",
    lastName: lead?.lastName || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    source: lead?.source || "",
    priority: lead?.priority || "medium",
    status: lead?.status || "new",
    score: lead?.score ?? 72,
    tags: lead?.tags || "",
    assignedTo: lead?.assignedTo || "",
    visitDate: lead?.visitDate || today,
    nextFollowUpDate: lead?.nextFollowUpDate || "",
    notes: lead?.notes || "",
    photoUrl: lead?.photoUrl || "",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    // OUTER WRAPPER (Handles Backdrop and global scroll for tiny screens)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm overflow-y-auto p-4">
      
      {/* MODAL CONTAINER (Uses flex-col to stack header, scrollable body, and footer) */}
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl my-10 flex flex-col max-h-[90vh]">
        
        {/* HEADER (Fixed Top) */}
        <div className="p-6 pb-3 flex items-start justify-between border-b border-slate-100 flex-shrink-0"> 
          <div>
            <h2 className="text-xl font-bold text-slate-900">{lead ? "Edit Lead" : "Add New Lead"}</h2>
            <p className="mt-1 text-sm text-slate-500">Create a new lead entry in the system</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        {/* SCROLLABLE FORM BODY (Flex-1 to take remaining space, handles scroll) */}
        <div className="flex-1 overflow-y-auto p-6 pt-3">

          <form onSubmit={(e) => { e.preventDefault(); onSaved({...form, score: Number(form.score)}); }} className="space-y-5">
            
            {/* 1. Name & Contact Fields (Standard grid-cols-2) */}
            <div className="grid grid-cols-2 gap-5">
               <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
               <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
            </div>
            <div className="grid grid-cols-2 gap-5 -mt-4">
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Enter first name" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-0" />
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Enter last name" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-0" />
            </div>
            <div className="grid grid-cols-2 gap-5">
               <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
               <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            </div>
            <div className="grid grid-cols-2 gap-5 -mt-4">
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email address" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-0" />
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-0" />
            </div>

            {/* 2. Source, Priority, Status, Score (Adjusted from mixed grid/rows to simpler 2 columns) */}
            <div className="grid grid-cols-2 gap-5">
               <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Lead Source</label>
                  <select name="source" value={form.source} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-teal-500 focus:ring-0">
                     <option value="">Select source</option>
                     <option>Website</option>
                     <option>Referral</option>
                     <option>Walk In</option>
                     <option>Social Media</option>
                  </select>
                </div>
               <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
                  <select name="priority" value={form.priority} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-teal-500 focus:ring-0">
                     <option value="">Select priority</option>
                     <option value="low">Low</option>
                     <option value="medium">Medium</option>
                     <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-teal-500 focus:ring-0">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Score (0-100)</label>
                  <input type="number" name="score" min="0" max="100" value={form.score} onChange={handleChange} placeholder="72" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-0" />
                </div>
            </div>
          
            {/* 3. Assignment and Tags (Standard grid-cols-2) */}
            <div className="grid grid-cols-2 gap-5">
               <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Assigned To (Staff Name)</label>
                  <input type="text" name="assignedTo" value={form.assignedTo} onChange={handleChange} placeholder="e.g., Sarah Johnson" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-0" />
                </div>
               <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Tags (comma separated)</label>
                  <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="e.g., personal-training, premium" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-0" />
                </div>
            </div>

            {/* 4. Photo Action Buttons (Full width) */}
            <div>
               <label className="mb-1.5 block text-sm font-medium text-slate-700">Visitor Photo (For Access Control)</label>
               <p className="mb-3 text-xs text-slate-500">Capture or upload a photo for gym access verification</p>
               <div className="grid grid-cols-2 gap-4">
                 <button type="button" className="flex items-center justify-center gap-2 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-800">
                   <CameraIcon className="h-4 w-4" /> Capture Photo
                 </button>
                 <button type="button" className="flex items-center justify-center gap-2 rounded-lg bg-teal-700 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-800">
                   <UploadIcon className="h-4 w-4" /> Upload Photo
                 </button>
               </div>
            </div>
          
            {/* 5. Date Fields (Combined and simplified) */}
            <div className="grid grid-cols-2 gap-5">
               <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Visit Date</label>
                  <input type="date" name="visitDate" value={form.visitDate} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-teal-500 focus:ring-0" />
                  <p className="mt-1 text-xs text-slate-500">Date when the visitor will access the gym</p>
                </div>
               <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Next Follow-up Date</label>
                  <input type="date" name="nextFollowUpDate" value={form.nextFollowUpDate} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-600 focus:border-teal-500 focus:ring-0" />
                </div>
            </div>

            {/* 6. Notes (Full width) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
              <textarea name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="Enter any additional notes about this lead" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-0" />
            </div>
          
          </form>
        </div>
        
        {/* ACTION BUTTONS (Fixed Bottom) */}
        <div className="p-6 pt-4 flex justify-end gap-3 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" onClick={(e) => { e.preventDefault(); onSaved({...form, score: Number(form.score)}); }} className="rounded-lg bg-teal-700 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-800">
            {lead ? "Save Changes" : "Add Lead"}
          </button>
        </div>
        
      </div>
    </div>
  );
}

// ---------------- Badges & Icons ----------------

function StatusBadge({ status }) {
  const styles = {
    new: "bg-blue-50 text-blue-600",
    contacted: "bg-amber-50 text-amber-700", // Used for 'contacted'
    "follow-up": "bg-orange-50 text-orange-600",
    converted: "bg-emerald-50 text-emerald-600",
    lost: "bg-rose-50 text-rose-600",
  };
  const s = (status || "new").toLowerCase().replace(' ', '-'); // handle 'follow up' vs 'follow-up'
  
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium capitalize ${styles[s] || styles.new}`}>
      {status || "new"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    high: "bg-rose-50 text-rose-600",
    medium: "bg-amber-50 text-amber-600",
    low: "bg-emerald-50 text-emerald-600",
  };
  const p = (priority || "medium").toLowerCase();
  
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium capitalize ${styles[p] || styles.medium}`}>
      {priority || "medium"}
    </span>
  );
}

// Icons
const SearchIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>);
const ChevronDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);
const ExportIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>);
const ImportIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" transform="rotate(180 12 12)" /></svg>);
const ListIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>);
const KanbanIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" /></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const TrendUpIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" /></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const FlagIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" /></svg>);
const TargetIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834 1.666-.992.893M17.834 17.834l-.991-.893M2.25 12h2.25m3.584-5.584.992.893m-4.576 4.576L3.166 12m14.668 5.834.992-.893" /></svg>);
const PhoneIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>);
const EnvelopeIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>);
const ChatIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>);
const GlobeIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>);
const CameraIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>);
const UploadIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>);