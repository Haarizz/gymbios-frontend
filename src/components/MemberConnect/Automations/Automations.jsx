// src/pages/automations/Automations.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BarChart2,
  CheckCircle,
  Eye,
  Clock,
  AlertTriangle,
  Search,
  List,
  Grid3x3,
  Download,
  ChevronDown,
  Monitor, // Placeholder for Active
  HeartHandshake, // Placeholder for Conversion
  Send, // Placeholder for Open Rate
} from "lucide-react";

import {
  listAutomations,
  listTemplates,
  recentRuns,
  analytics,
} from "../../../api/automationsApi";

import WorkflowCard from "./WorkflowCard";
import TemplateCard from "./TemplateCard";
import CreateAutomationModal from "./CreateAutomationModal";

// Reusable Metric Card component matching the UI style
const MetricCard = ({ title, value, Icon, valueClass = "text-gray-900", iconBg = "bg-gray-100", iconClass = "text-gray-600" }) => (
  <div className="flex flex-col p-4 bg-white rounded-lg border">
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{title}</span>
      <div className={`p-1.5 rounded-full ${iconBg}`}>
        {Icon && <Icon size={16} className={iconClass} />}
      </div>
    </div>
    <div className={`text-2xl font-semibold mt-1 ${valueClass}`}>{value}</div>
  </div>
);

// Reusable Status Badge component
const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = String(status).toLowerCase();
  if (s === "active") return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">active</span>;
  if (s === "paused") return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">paused</span>;
  if (s === "error") return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">error</span>;
  return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{s}</span>;
};

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [recent, setRecent] = useState([]);
  const [upcoming, setUpcoming] = useState([]); // Array for upcoming runs
  const [meta, setMeta] = useState({});
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState("Grid");
  const navigate = useNavigate();

  // Load automations list
  const loadAutomations = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.q = query;
      const res = await listAutomations(params);
      if (Array.isArray(res)) setAutomations(res);
      else setAutomations(res?.items ?? []);
    } catch (e) {
      console.error("Failed to load automations", e);
      setAutomations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load templates
  const loadTemplates = useCallback(async () => {
    try {
      const res = await listTemplates();
      setTemplates(res || []);
    } catch (e) {
      console.error("Failed to load templates", e);
      setTemplates([]);
    }
  }, []);

  // Load recent runs
  const loadRecentRuns = useCallback(async () => {
    try {
      const res = await recentRuns();
      setRecent(res || []);
    } catch (e) {
      console.error("Failed to load recent runs", e);
      setRecent([]);
    }
  }, []);

  // Try to load upcoming runs (if available in API)
  const loadUpcomingRuns = useCallback(async () => {
    setUpcoming([]); // Default to empty array as API is not guaranteed
    // NOTE: If `upcomingRuns` is added to `automationsApi`, this function will load it.
    // For now, we manually set to empty to strictly avoid mock data.
    // If you intend to use it, you must export it from automationsApi.js.
    try {
        // Checking for a globally exposed upcomingRuns function if available
        // NOTE: In a standard React setup, you should just import it: import { ..., upcomingRuns } from "...";
        // Since we don't have that guarantee, we'll keep it simple and assume it's not available for now.
        if (typeof upcomingRuns === 'function') {
            const res = await upcomingRuns();
            setUpcoming(res || []);
            return;
        }
    } catch (err) {
      // not available or failed -> leave upcoming empty
    }
  }, []);

  // Load metrics / analytics
  const loadAnalytics = useCallback(async () => {
    setLoadingMeta(true);
    try {
      const res = await analytics();
      setMeta(res || {});
    } catch (e) {
      console.error("Failed to load analytics", e);
      setMeta({});
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  // Combined initial load
  useEffect(() => {
    (async () => {
      // Ensuring all data loading is handled, including the optional upcoming runs
      await Promise.all([loadAutomations(q), loadTemplates(), loadRecentRuns(), loadUpcomingRuns(), loadAnalytics()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run search when q changes
  useEffect(() => {
    const id = setTimeout(() => loadAutomations(q), 250);
    return () => clearTimeout(id);
  }, [q, loadAutomations]);

  // Helpers for display
  const formatDateTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };
  
  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold">Automations</h1>
          <p className="text-gray-500">Set up automated workflows for member communication and engagement</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border rounded px-3 py-2 text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 border rounded px-3 py-2 text-gray-700 hover:bg-gray-50">
            Templates
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:bg-emerald-800 transition-colors"
          >
            + Create Automation
          </button>
        </div>
      </div>

      {/* Metric cards (8 in total) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <MetricCard title="Active" value={loadingMeta ? "—" : (meta.active ?? 0)} Icon={Monitor} iconBg="bg-blue-100" iconClass="text-blue-600" />
        <MetricCard title="Members Engaged" value={loadingMeta ? "—" : (meta.membersEngaged ?? 0)} Icon={Users} iconBg="bg-blue-100" iconClass="text-blue-600" />
        <MetricCard title="Total Runs" value={loadingMeta ? "—" : (meta.totalRuns ?? 0)} Icon={BarChart2} iconBg="bg-blue-100" iconClass="text-blue-600" />
        <MetricCard title="Success Rate" value={loadingMeta ? "—" : `${meta.successRate ?? 0}%`} Icon={CheckCircle} valueClass="text-emerald-600" iconBg="bg-emerald-100" iconClass="text-emerald-600" />
        <MetricCard title="Open Rate" value={loadingMeta ? "—" : `${meta.openRate ?? 0}%`} Icon={Send} iconBg="bg-purple-100" iconClass="text-purple-600" />
        <MetricCard title="Conversion" value={loadingMeta ? "—" : `${meta.conversion ?? 0}%`} Icon={HeartHandshake} iconBg="bg-orange-100" iconClass="text-orange-600" />
        <MetricCard title="Pending" value={loadingMeta ? "—" : (meta.pending ?? 0)} Icon={Clock} iconBg="bg-orange-100" iconClass="text-orange-600" />
        <MetricCard title="Errors" value={loadingMeta ? "—" : (meta.errors ?? 0)} Icon={AlertTriangle} valueClass="text-red-600" iconBg="bg-red-100" iconClass="text-red-600" />
      </div>

      {/* Search + Filters + Toggle */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search automations..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {["All Status", "All Triggers", "All Actions"].map((label) => (
          <button key={label} className="flex items-center gap-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            {label}
            <ChevronDown size={14} />
          </button>
        ))}

        <div className="flex border border-gray-300 rounded-lg p-0.5 bg-gray-50">
          <button onClick={() => setViewMode("Grid")} className={`p-1.5 rounded-l-lg transition-colors ${viewMode === "Grid" ? "bg-white shadow" : "text-gray-500"}`}>
            <Grid3x3 size={20} />
          </button>
          <button onClick={() => setViewMode("Table")} className={`p-1.5 rounded-r-lg transition-colors ${viewMode === "Table" ? "bg-white shadow" : "text-gray-500"}`}>
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b pb-2">
        <button className="pb-2 border-b-2 border-emerald-600 font-medium text-gray-900">Overview</button>
        <button onClick={() => navigate("/automations/workflows")} className="pb-2 text-gray-500 hover:text-gray-900 transition-colors">Workflows</button>
        <button onClick={() => navigate("/automations/templates")} className="pb-2 text-gray-500 hover:text-gray-900 transition-colors">Templates</button>
        <button onClick={() => navigate("/automations/analytics")} className="pb-2 text-gray-500 hover:text-gray-900 transition-colors">Analytics</button>
      </div>

      {/* Main content: Recent / Upcoming (Two columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Workflow Activity</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading recent runs…</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-gray-500">No recent runs</div>
          ) : (
            recent.map((run) => (
              <div key={run.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div>
                  <div className="font-medium flex items-center gap-2">
                        {/* Placeholder dot */}
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true"></div>
                        {run.automationName ?? run.name ?? "Unnamed automation"}
                    </div>
                  <div className="text-xs text-gray-500">
                    {(run.membersTargeted ?? 0) + " members • " + formatDate(run.executedAt)}
                  </div>
                </div>
                <div>
                  <StatusBadge status={run.status} />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-lg mb-4">Upcoming Scheduled Runs</h3>
          {upcoming.length === 0 ? (
            <div className="text-sm text-gray-500">No upcoming runs</div>
          ) : (
            upcoming.map((r) => (
              <div key={r.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div>
                  <div className="font-medium">{r.automationName ?? r.name}</div>
                  <div className="text-xs text-gray-500">{r.scheduledAt ? formatDateTime(r.scheduledAt) : ""}</div>
                </div>
                <Eye size={18} className="text-gray-400" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Performing Automations (Full width) */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-lg mb-4">Top Performing Automations</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Loading automations…</div>
        ) : automations.length === 0 ? (
          <div className="text-sm text-gray-500">No automations found</div>
        ) : (
          <div className="space-y-4">
            {automations.map((a) => (
              <div key={a.id} className="flex justify-between items-start py-3 border-b last:border-b-0">
                <div>
                  <div className="font-medium flex items-center gap-2 mb-1">
                        <div className="text-xs text-gray-500">A → B → C</div> 
                        <span className="font-semibold text-gray-800">{a.name}</span>
                    </div>
                  <div className="text-xs text-gray-500">{(a.membersEngaged ?? 0) + " members engaged"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-emerald-600 font-semibold">{(a.conversionRate ?? 0) + "% conversion"}</div>
                  <div className="text-xs text-gray-500">{(a.openRate ?? meta.openRate ?? 0) + "% open rate"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflows grid */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Workflows</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Loading workflows…</div>
        ) : automations.length === 0 ? (
          <div className="text-sm text-gray-500">No workflows</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations.map((a) => <WorkflowCard key={a.id} data={a} />)}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && <CreateAutomationModal onClose={() => { setShowCreate(false); loadAutomations(q); loadRecentRuns(); loadAnalytics(); }} />}
    </div>
  );
}