// src/components/FollowUpsPage.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Flag,
  TrendingUp,
  Plus,
  Search,
  ChevronDown,
  Filter,
  Phone,
  Mail,
  MessageCircle,
  Settings,
  Download,
  Zap,
  LayoutGrid,
  List,
  X,
  FileText,
  Play,
  Pause,
  MoreHorizontal,
  ArrowUpRight,
  RefreshCw,
  BarChart2,
  ArrowUp,
  ArrowDown,
  FilePlus,
  Bell,
  Smartphone,
  CreditCard,
  UserPlus,
  Activity,
  Gift,
  AlertOctagon,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Award,
  Trash2,
  Eye,
  Send,
  Power,
  Copy,
  Edit,
} from "lucide-react";


// 🔌 API IMPORTS – adjust paths if needed
import {
  listFollowUps,
  createFollowUp,
  deleteFollowUp,
} from "../api/followUpsApi";
import {
  listWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from "../api/followUpWorkflowsApi";
import { getMembers } from "../api/member";
import { getStaff } from "../api/staff";
import api from "../api/axiosConfig";

/* ================================== HELPERS ================================== */

// Normalize member from /api/members
function normalizeMember(m) {
  if (!m) return { id: null, name: "Unknown Member", email: "", phone: "" };

  const firstName = m.firstName || m.firstname || "";
  const lastName = m.lastName || m.lastname || "";
  const fullName =
    m.fullName ||
    m.name ||
    `${firstName} ${lastName}`.trim() ||
    m.memberName ||
    "Unknown Member";

  return {
    id: m.id || m.memberId || m.member_id || m.code || null,
    name: fullName,
    email:
      m.email ||
      m.mail ||
      m.emailId ||
      m.contactEmail ||
      m.email_id ||
      "",
    phone:
      m.phone ||
      m.mobile ||
      m.contactNumber ||
      m.phoneNumber ||
      m.phone_no ||
      "",
  };
}

// Normalize staff from /api/staff
function normalizeStaff(s) {
  if (!s) return { id: null, name: "Unassigned", role: "" };

  const firstName = s.firstName || s.firstname || "";
  const lastName = s.lastName || s.lastname || "";
  const fullName =
    s.fullName ||
    s.name ||
    `${firstName} ${lastName}`.trim() ||
    s.staffName ||
    "Unknown Staff";

  return {
    id: s.id || s.staffId || s.employeeId || null,
    name: fullName,
    role: s.role || s.designation || "",
  };
}

// Map backend FollowUp JSON → UI shape used by table / kanban / eye modal
function mapApiFollowUpToUi(f) {
  if (!f) return null;

  // MEMBER NAME, EMAIL, PHONE
  let memberName = "";
  let email = "";
  let phone = "";

  if (f.member && typeof f.member === "object") {
    const m = normalizeMember(f.member);
    memberName = m.name;
    email = m.email;
    phone = m.phone;
  }

  memberName =
    memberName ||
    f.memberName ||
    f.member_full_name ||
    f.member_name ||
    f.member ||
    "Unknown Member";

  email =
    email ||
    f.memberEmail ||
    f.member_email ||
    f.email ||
    f.contactEmail ||
    "";
  phone =
    phone ||
    f.memberPhone ||
    f.member_phone ||
    f.phone ||
    f.contactPhone ||
    f.mobile ||
    "";

  const type = f.type || f.channel || "Call";
  const status = f.status || "Pending";
  const priority = f.priority || "Medium";

  // DATE/TIME
  let dueDate = f.dueDate || "";
  let dueTime = f.dueTime || "";

  if (!dueDate && typeof f.dueDateTime === "string") {
    dueDate = f.dueDateTime.substring(0, 10);
    dueTime = f.dueDateTime.substring(11, 16);
  }

  if (!dueDate) dueDate = "No Date";
  if (!dueTime) dueTime = "--:--";

  // COLUMN (for Kanban)
  let column = "Pending";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("overdue")) column = "Overdue";
  else if (lowerStatus.includes("complete")) column = "Completed";
  else if (lowerStatus.includes("cancel")) column = "Cancelled";
  else if (lowerStatus.includes("resched")) column = "Rescheduled";

  // ASSIGNED / STAFF
  let assigned = "";

  // 1) nested staff object
  if (f.staff && typeof f.staff === "object") {
    const s = normalizeStaff(f.staff);
    assigned = s.name;
  }

  // 2) common flat fields
  assigned =
    assigned ||
    f.staffName ||
    f.staff_full_name ||
    f.assignedStaff ||
    f.assignedTo ||
    f.ownerName ||
    f.owner ||
    f.followupOwner ||
    "";

  // 3) generic detection – first string field that looks like staff/owner
  if (!assigned) {
    const keys = Object.keys(f || {});
    const candidateKey = keys.find((k) => {
      const v = f[k];
      const lk = k.toLowerCase();
      return (
        typeof v === "string" &&
        (lk.includes("staff") || lk.includes("owner") || lk.includes("assigned"))
      );
    });
    if (candidateKey) {
      assigned = f[candidateKey];
    }
  }

  // Final fallback (only if nothing else)
  if (!assigned) assigned = "Unassigned";

  const initials =
    memberName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 3)
      .toUpperCase() || "NA";

  const tags = Array.isArray(f.tags) ? f.tags : [];

  return {
    id: f.id,
    member: memberName,
    tags,
    contact: { email, phone },
    subject: f.subject || "",
    subtext: f.reason || f.notes || "",
    type,
    status,
    priority,
    dueDate,
    dueTime,
    assigned,
    initials,
    column,
    avatarColor: "bg-emerald-100 text-emerald-700",
    reason: f.reason || "",
    notes: f.notes || "",
    outcome: f.outcome || "",
    memberInfo: {
      status: f.memberStatus || "Active",
      plan: f.membershipPlan || "Standard",
      lastVisit: f.lastVisit || "N/A",
      nextBilling: f.nextBilling || "N/A",
    },
    raw: f,
  };
}

// Build stats (replaces static STATS)
function buildStats(items) {
  const total = items.length;

  const pending = items.filter((i) =>
    (i.status || "").toLowerCase().includes("pending")
  ).length;

  const overdue = items.filter((i) =>
    (i.status || "").toLowerCase().includes("overdue")
  ).length;

  const completed = items.filter((i) =>
    (i.status || "").toLowerCase().includes("complete")
  ).length;

  const todayStr = new Date().toISOString().substring(0, 10);
  const dueToday = items.filter((i) =>
    (i.dueDate || "").includes(todayStr)
  ).length;

  const completedToday = items.filter(
    (i) =>
      (i.status || "").toLowerCase().includes("complete") &&
      (i.raw?.completedDate || "").startsWith(todayStr)
  ).length;

  const thisWeek = total; // simple approximation

  const highPriority = items.filter((i) =>
    (i.priority || "").toLowerCase().includes("high")
  ).length;

  const successRate =
    total === 0 ? "0.0%" : `${((completed / total) * 100).toFixed(1)}%`;

  return [
    { label: "Total", value: String(total), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: String(pending), icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Overdue", value: String(overdue), icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Due Today", value: String(dueToday), icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completed Today", value: String(completedToday), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "This Week", value: String(thisWeek), icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "High Priority", value: String(highPriority), icon: Flag, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Success Rate", value: successRate, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];
}

const COLUMNS = [
  { id: "Pending", label: "Pending", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "Overdue", label: "Overdue", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  { id: "Completed", label: "Completed", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "Cancelled", label: "Cancelled", icon: X, color: "text-slate-500", bg: "bg-slate-100" },
  { id: "Rescheduled", label: "Rescheduled", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
];

/* ================================== MAIN PAGE COMPONENT ================================== */

export default function FollowUpsPage() {
  // Items now come from DB → start empty
  const [items, setItems] = useState([]);
  const [viewMode, setViewMode] = useState("table");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
  
  const [editingWorkflowData, setEditingWorkflowData] = useState(null); // For edit/view
  const [isWorkflowViewOnly, setIsWorkflowViewOnly] = useState(false); // To distinguish View vs Edit

  const [viewDetailsModal, setViewDetailsModal] = useState({
    open: false,
    item: null,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    id: null,
  });

  const [savedWorkflows, setSavedWorkflows] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");

  // 🔄 Load follow-ups from backend on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await listFollowUps();
        const mapped = (data || []).map(mapApiFollowUpToUi).filter(Boolean);
        setItems(mapped);
      } catch (err) {
        console.error("Failed to load follow-ups", err);
      }
    };
    fetchItems();
  }, []);

  // 🔄 Load workflows from backend on mount
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await listWorkflows();
        setSavedWorkflows(data || []);
      } catch (err) {
        console.error("Failed to load workflows", err);
      }
    };
    loadWorkflows();
  }, []);

  // Dynamic stats instead of STATS constant
  const stats = useMemo(() => buildStats(items), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const s = search.toLowerCase();
      const matchesSearch =
        (item.member || "").toLowerCase().includes(s) ||
        (item.subject || "").toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "All Status" || item.status === statusFilter;

      const matchesType =
        typeFilter === "All Types" || item.type === typeFilter;

      const matchesPriority =
        priorityFilter === "All Priority" ||
        item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }, [items, search, statusFilter, typeFilter, priorityFilter]);

  // ✅ Create follow-up → call backend, then update list
  const handleAddFollowUp = async ({ formData, selectedMember, selectedStaff }) => {
    try {
      const member = selectedMember
        ? normalizeMember(selectedMember)
        : { id: null, name: formData.member, email: "", phone: "" };

      const staff =
        selectedStaff ||
        (formData.staff && formData.staff !== "Select staff member"
          ? { id: null, name: formData.staff }
          : null);

      const payload = {
        memberId: member.id,
        memberName: member.name,
        memberEmail: member.email,
        memberPhone: member.phone,
        subject: formData.subject,
        type: formData.type === "Select type" ? "Call" : formData.type,
        priority:
          formData.priority === "Select priority"
            ? "Medium"
            : formData.priority,
        dueDate: formData.dueDate,
        dueTime: formData.scheduledTime,
        staffId: staff?.id || null,
        staffName: staff?.name || null,
        notes: formData.notes,
        status: "Pending",
      };

      const created = await createFollowUp(payload);
      const newItem = mapApiFollowUpToUi(created) || {
        // fallback if backend doesn't echo
        id: created?.id,
        member: member.name,
        tags: [],
        contact: { email: member.email, phone: member.phone },
        subject: formData.subject,
        subtext: formData.notes,
        type: payload.type,
        status: "Pending",
        priority: payload.priority,
        dueDate: payload.dueDate || "No Date",
        dueTime: payload.dueTime || "--:--",
        assigned: staff?.name || "Unassigned",
        initials:
          member.name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .substring(0, 3)
            .toUpperCase() || "NA",
        column: "Pending",
        avatarColor: "bg-emerald-100 text-emerald-700",
        reason: "",
        notes: formData.notes,
        outcome: "",
        memberInfo: {
          status: "Active",
          plan: "Standard",
          lastVisit: "N/A",
          nextBilling: "N/A",
        },
        raw: created,
      };

      setItems((prev) => [newItem, ...prev]);
    } catch (err) {
      console.error("Failed to create follow-up", err);
      alert("Failed to create follow-up. Check backend logs.");
    }
  };

  // ✅ Save/Update workflow → call backend, then update workflows list
  const handleSaveWorkflow = async (workflow) => {
    try {
      const payload = {
        name: workflow.name,
        description: workflow.description,
        frequency: workflow.frequency,
        triggerTitle: workflow.trigger?.title || null,
        triggerTag: workflow.trigger?.tag || null,
        triggerId: workflow.trigger?.id || null,
        actionTitle: workflow.action?.title || null,
        actionId: workflow.action?.id || null,
        inAppMessage: workflow.message || "",
        status: workflow.status || "Active",
      };

      if (workflow.id && !String(workflow.id).startsWith("temp_")) {
        // Update existing
        const updated = await updateWorkflow(workflow.id, payload);
        setSavedWorkflows((prev) =>
          prev.map((w) => (w.id === workflow.id ? updated : w))
        );
      } else {
        // Create new
        const saved = await createWorkflow(payload);
        setSavedWorkflows((prev) => [...prev, saved]);
      }
    } catch (err) {
      console.error("Failed to save workflow", err);
      alert("Failed to save workflow. Please check backend.");
    }
  };

  const handleDeleteWorkflow = async (id) => {
    if(!window.confirm("Are you sure you want to delete this workflow?")) return;
    try {
      await deleteWorkflow(id);
      setSavedWorkflows((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Failed to delete workflow", err);
      alert("Failed to delete workflow.");
    }
  };

  const handleToggleWorkflowStatus = async (wf) => {
    try {
      const newStatus = wf.status === "Active" ? "Inactive" : "Active";
      const updated = await updateWorkflow(wf.id, { ...wf, status: newStatus });
      setSavedWorkflows((prev) =>
        prev.map((w) => (w.id === wf.id ? updated : w))
      );
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  // ✅ Delete follow up → call backend then remove from list
  const handleDeleteItem = async () => {
    if (!deleteConfirmation.id) return;
    try {
      await deleteFollowUp(deleteConfirmation.id);
      setItems((prev) =>
        prev.filter((item) => item.id !== deleteConfirmation.id)
      );
    } catch (err) {
      console.error("Failed to delete follow-up", err);
      alert("Failed to delete follow-up. Check backend logs.");
    } finally {
      setDeleteConfirmation({ open: false, id: null });
    }
  };

  // Actions (WhatsApp / Email / Call / Meeting)
  const handleAction = (type, contact) => {
    if (!contact) return;

    if (type === "Whatsapp" || type === "WhatsApp") {
      if (!contact.phone) return;
      window.open(
        `https://wa.me/${String(contact.phone).replace(/\s+/g, "")}`,
        "_blank"
      );
    } else if (type === "Email") {
      if (!contact.email) return;
      window.location.href = `mailto:${contact.email}`;
    } else if (type === "Call") {
      if (!contact.phone) return;
      window.location.href = `tel:${contact.phone}`;
    } else if (type === "Meeting") {
      alert("Opening calendar to schedule meeting...");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans ">


      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 w-100">
        {/* Sticky Header */}
        <header className="px-8 py-6 bg-white border-b sticky top-0 z-40 shadow-sm shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Follow-ups Management
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Schedule, track, and manage follow-up communications with
                members and prospects
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <Download size={16} /> Export
              </button>

              <button
                onClick={() => setShowAutomationModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Zap size={16} /> Automation
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1f4d4a] rounded-lg hover:bg-[#163836] shadow-sm transition-colors"
              >
                <Plus size={16} /> Add Follow-up
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-24 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p
                      className={`text-xl font-bold mt-1 ${
                        i === stats.length - 1
                          ? "text-emerald-600"
                          : "text-slate-800"
                      }`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <div className="relative flex-1 max-w-md ml-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by member name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border-0 bg-transparent focus:ring-0 text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3 pr-1">
              <FilterDropdown label="All Dates" />
              <FilterDropdown
                label={statusFilter}
                onChange={setStatusFilter}
                options={["All Status", "Pending", "Overdue", "Completed"]}
              />
              <FilterDropdown
                label={typeFilter}
                onChange={setTypeFilter}
                options={["All Types", "Call", "Email", "Whatsapp", "Meeting"]}
              />
              <FilterDropdown label="All Staff" />
              <FilterDropdown
                label={priorityFilter}
                onChange={setPriorityFilter}
                options={["All Priority", "High", "Medium", "Low"]}
              />

              <div className="flex bg-white p-1 rounded-lg border border-slate-200 ml-2 shadow-sm">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === "table"
                      ? "bg-[#1f4d4a] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <List size={14} /> Table
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === "kanban"
                      ? "bg-[#1f4d4a] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid size={14} /> Kanban
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="p-8 flex-1 overflow-auto bg-slate-50">
          {viewMode === "table" ? (
            <TableView
              items={filteredItems}
              onView={(item) =>
                setViewDetailsModal({ open: true, item })
              }
              onDelete={(id) =>
                setDeleteConfirmation({ open: true, id })
              }
              onAction={handleAction}
            />
          ) : (
            <KanbanView
              items={filteredItems}
              onView={(item) =>
                setViewDetailsModal({ open: true, item })
              }
              onDelete={(id) =>
                setDeleteConfirmation({ open: true, id })
              }
              onAction={handleAction}
            />
          )}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. Add Follow Up */}
      {showAddModal && (
        <AddFollowUpModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddFollowUp}
        />
      )}

      {/* 2. Automation Manager */}
      {showAutomationModal && (
        <AutomationModal
          onClose={() => setShowAutomationModal(false)}
          onCreateWorkflow={() => {
            setEditingWorkflowData(null);
            setIsWorkflowViewOnly(false);
            setShowAutomationModal(false);
            setShowCreateWorkflowModal(true);
          }}
          onEditWorkflow={(wf) => {
            setEditingWorkflowData(wf);
            setIsWorkflowViewOnly(false);
            setShowAutomationModal(false);
            setShowCreateWorkflowModal(true);
          }}
          onViewWorkflow={(wf) => {
            setEditingWorkflowData(wf);
            setIsWorkflowViewOnly(true);
            setShowAutomationModal(false);
            setShowCreateWorkflowModal(true);
          }}
          onDeleteWorkflow={handleDeleteWorkflow}
          onToggleStatus={handleToggleWorkflowStatus}
          onDuplicateWorkflow={(wf) => {
            const copy = { ...wf, id: null, name: `${wf.name} (Copy)` };
            handleSaveWorkflow(copy);
          }}
          workflows={savedWorkflows}
        />
      )}

      {/* 3. Create/Edit/View Workflow Wizard */}
      {showCreateWorkflowModal && (
        <CreateWorkflowModal
          initialData={editingWorkflowData}
          isViewOnly={isWorkflowViewOnly}
          onClose={() => setShowCreateWorkflowModal(false)}
          onSave={(workflow) => {
            handleSaveWorkflow(workflow);
            setShowCreateWorkflowModal(false);
            setShowAutomationModal(true);
          }}
        />
      )}

      {/* 4. View Details Modal */}
      {viewDetailsModal.open && (
        <FollowUpDetailsModal
          item={viewDetailsModal.item}
          onClose={() =>
            setViewDetailsModal({ open: false, item: null })
          }
          onAction={handleAction}
        />
      )}

      {/* 5. Delete Confirmation */}
      {deleteConfirmation.open && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Delete Follow-up?
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete this item? This action
                cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() =>
                    setDeleteConfirmation({ open: false, id: null })
                  }
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg_white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================== VIEW DETAILS MODAL (Eye button) ================== */

function FollowUpDetailsModal({ item, onClose, onAction }) {
  if (!item) return null;

  const safeTags = Array.isArray(item.tags) ? item.tags : [];

  return (
    <div className="fixed inset-0 bg-black/50 z-[80] flex justify-end backdrop-blur-sm animate-in slide-in-from-right duration-300">
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify_between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                {item.initials}
              </span>
              <h2 className="text-xl font-bold text-slate-800">
                {item.member}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={item.status} />
              <PriorityBadge priority={item.priority} small />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Follow-up Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Follow-up Details
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Type
                </p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mt-0.5">
                  {item.type === "Whatsapp" && <MessageCircle size={14} />}
                  {item.type === "Email" && <Mail size={14} />}
                  {item.type === "Call" && <Phone size={14} />}
                  {item.type}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Due Date
                </p>
                <p className="text-sm font-medium text-emerald-600 mt-0.5">
                  {item.dueDate}{" "}
                  <span className="text-slate-400 text-xs font-normal block">
                    {item.dueTime}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Assigned To
                </p>
                <p className="text-sm text-slate-700 mt-0.5">
                  {item.assigned}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Estimated Duration
                </p>
                <p className="text-sm text-slate-700 mt-0.5">
                  5 minutes
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Subject
                </p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">
                  {item.subject}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Reason
                </p>
                <p className="text-sm text-slate-700 mt-0.5">
                  {item.reason || "Engagement"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {safeTags.length === 0 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded">
                      No tags
                    </span>
                  )}
                  {safeTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase mb-1">
                  Notes
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
                  {item.notes || item.subtext || "No notes"}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Outcome
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 border border-slate-200 rounded text-xs text-slate-600 bg-white">
                  {item.outcome || "Pending"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Member Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Member Information
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Email
                </p>
                <p className="text-sm text-slate-700 mt-0.5">
                  {item.contact?.email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Phone
                </p>
                <p className="text-sm text-slate-700 mt-0.5">
                  {item.contact?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Membership Status
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                  {item.memberInfo?.status || "Active"}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Plan
                </p>
                <p className="text-sm font-medium text-slate-800 mt-0.5">
                  {item.memberInfo?.plan || "Standard"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Last Visit
                </p>
                <p className="text-sm text-slate-700 mt-0.5">
                  {item.memberInfo?.lastVisit || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  Next Billing
                </p>
                <p className="text-sm text-slate-700 mt-0.5">
                  {item.memberInfo?.nextBilling || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onAction("Call", item.contact)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1f4d4a] text-white text-xs font-medium rounded-lg hover:bg-[#163836] flex-1 justify-center"
              >
                <Phone size={14} /> Call Member
              </button>
              <button
                onClick={() => onAction("Email", item.contact)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1f4d4a] text-white text-xs font-medium rounded-lg hover:bg-[#163836] flex-1 justify-center"
              >
                <Mail size={14} /> Send Email
              </button>
              <button
                onClick={() => onAction("Whatsapp", item.contact)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1f4d4a] text-white text-xs font-medium rounded-lg hover:bg-[#163836] w-full justify-center"
              >
                <MessageCircle size={14} /> Whatsapp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== AUTOMATION MODAL (Updated with Menu) ================== */

function AutomationModal({
  onClose,
  onCreateWorkflow,
  onEditWorkflow,
  onViewWorkflow,
  onDeleteWorkflow,
  onToggleStatus,
  onDuplicateWorkflow,
  workflows
}) {
  const [activeTab, setActiveTab] = useState("Templates");
  const [modalViewMode, setModalViewMode] = useState("grid");
  const [openMenuId, setOpenMenuId] = useState(null); // Track which menu is open

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const kpiData = [
    { label: "Active", value: "4", color: "text-slate-800" },
    { label: "Members Engaged", value: "547", color: "text-blue-600" },
    { label: "Total Runs", value: "547", color: "text-indigo-600" },
    { label: "Success Rate", value: "98.2%", color: "text-emerald-500" },
    { label: "Open Rate", value: "92.3%", color: "text-blue-600" },
    { label: "Conversion", value: "51.4%", color: "text-orange-500" },
    { label: "Pending", value: "1", color: "text-amber-500" },
    { label: "Errors", value: "0", color: "text-rose-500" },
  ];

  const templatesData = [
    {
      id: 1,
      title: "Welcome Email",
      desc: "Standard welcome email for new members",
      type: "Onboarding",
      status: "Active",
    },
    {
      id: 2,
      title: "Renewal Reminder",
      desc: "Membership renewal reminder email",
      type: "Retention",
      status: "Active",
    },
    {
      id: 3,
      title: "Comeback Message",
      desc: "SMS to re-engage inactive members",
      type: "Re-engagement",
      status: "Active",
    },
  ];

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 shrink-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Automations
              </h2>
              <p className="text-slate-500 text-sm mt-1 max-w-md">
                Set up automated workflows for member communication and
                engagement
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">
                <Download size={14} /> Export
              </button>
              <button
                onClick={() => setActiveTab("Templates")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
              >
                <FileText size={14} /> Templates
              </button>
              <button
                onClick={onCreateWorkflow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1f4d4a] rounded-md hover:bg-[#163836]"
              >
                <Plus size={14} /> Create
              </button>
              <button
                onClick={onClose}
                className="ml-2 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="flex gap-3 mt-6 pb-2 overflow-x-auto no-scrollbar">
            {kpiData.map((kpi, idx) => (
              <div
                key={idx}
                className="min-w-[100px] bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex-1"
              >
                <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap leading-tight">
                  {kpi.label}
                </p>
                <p className={`text-xl font-bold mt-1 ${kpi.color}`}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="mt-6 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search automations..."
                className="w-full pl-10 py-2 text-sm border-0 focus:ring-0 placeholder:text-slate-400 text-slate-700"
              />
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <div className="flex gap-4">
                <DropdownMinimal label="All Status" />
                <DropdownMinimal label="All Triggers" />
                <DropdownMinimal label="All Actions" />
              </div>

              {/* GRID / TABLE TOGGLE */}
              <div className="flex bg-slate-100 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setModalViewMode("grid")}
                  className={`px-3 py-1.5 flex items-center gap-1 rounded-md transition-all ${
                    modalViewMode === "grid"
                      ? "bg-[#1f4d4a] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <LayoutGrid size={14} /> Grid
                </button>
                <button
                  onClick={() => setModalViewMode("table")}
                  className={`px-3 py-1.5 flex items-center gap-1 rounded-md transition-all ${
                    modalViewMode === "table"
                      ? "bg-[#1f4d4a] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <List size={14} /> Table
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-8 mt-6 border-b border-slate-200 text-sm font-medium text-slate-500">
            {["Overview", "Workflows", "Templates", "Analytics"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-[#1f4d4a] text-[#1f4d4a]"
                      : "hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 bg-slate-50">
          {/* OVERVIEW TAB */}
          {activeTab === "Overview" && (
            <div className="space-y-6 mt-6">
              {/* Placeholder */}
            </div>
          )}

          {/* WORKFLOWS TAB – uses workflows from state */}
          {activeTab === "Workflows" && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">
                  Active Workflows
                </h3>
                <button
                  onClick={onCreateWorkflow}
                  className="text-xs font-medium text_white bg-[#1f4d4a] px-3 py-1.5 rounded-lg flex items-center gap-1 text-white"
                >
                  <Plus size={12} /> New Workflow
                </button>
              </div>

              {workflows && workflows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {workflows.map((wf, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            wf.status === "Inactive"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {wf.status === "Inactive" ? (
                            <Pause size={10} fill="currentColor" />
                          ) : (
                            <Play size={10} fill="currentColor" />
                          )}
                          {wf.status || "Active"}
                        </span>

                        {/* Three Dots Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => handleMenuClick(e, wf.id)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenuId === wf.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 text-xs font-medium text-slate-700 animate-in fade-in zoom-in duration-150 origin-top-right">
                              <button
                                onClick={() => onEditWorkflow(wf)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Edit size={14} className="text-blue-500" /> Edit
                              </button>
                              <button
                                onClick={() => onViewWorkflow(wf)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Eye size={14} className="text-slate-500" /> View
                              </button>
                              <button
                                onClick={() => onToggleStatus(wf)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Power size={14} className="text-orange-500" />
                                {wf.status === "Active" ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => onDuplicateWorkflow(wf)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Copy size={14} className="text-indigo-500" /> Duplicate
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button
                                onClick={() => onDeleteWorkflow(wf.id)}
                                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">
                        {wf.name}
                      </h4>
                      <p className="text-slate-500 text-xs mb-3 h-8 line-clamp-2">
                        {wf.description ||
                          "Automated member engagement workflow"}
                      </p>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {wf.triggerTag || wf.triggerTitle || "General"}
                        </span>
                        {wf.frequency && (
                          <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">
                            {wf.frequency}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Zap size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    No Active Workflows
                  </h3>
                  <p className="text-slate-500 text-sm max-w-xs mt-1">
                    You haven't set up any automated workflows yet. Get
                    started by creating a new one.
                  </p>
                  <button
                    onClick={onCreateWorkflow}
                    className="mt-6 px-4 py-2 bg-[#1f4d4a] text-white rounded-lg text-sm font_medium hover:bg-[#163836]"
                  >
                    Create Workflow
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATES & ANALYTICS TABS */}
          {activeTab === "Templates" && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-3">
                Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templatesData.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {tpl.type}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {tpl.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {tpl.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Analytics" && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-3">
                Analytics
              </h3>
              <p className="text-sm text-slate-500">
                You can plug charts and metrics here later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================== CREATE WORKFLOW MODAL (With Validation) ================== */

function CreateWorkflowModal({ onClose, onSave, initialData, isViewOnly }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [workflowId, setWorkflowId] = useState(null); // For updates
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("Once per member");
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [inAppMessage, setInAppMessage] = useState("");
  const [status, setStatus] = useState("Active");

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setWorkflowId(initialData.id);
      setWorkflowName(initialData.name || "");
      setDescription(initialData.description || "");
      setFrequency(initialData.frequency || "Once per member");
      setStatus(initialData.status || "Active");
      setInAppMessage(initialData.inAppMessage || initialData.message || "");

      if (initialData.triggerTitle || initialData.triggerId) {
        // Reconstruct trigger object approximately
        setSelectedTrigger({
          id: initialData.triggerId,
          title: initialData.triggerTitle,
          tag: initialData.triggerTag,
          desc: "", // Optional, not stored in flat table
          icon: Activity // Default icon
        });
      }

      if (initialData.actionTitle || initialData.actionId) {
        setSelectedAction({
          id: initialData.actionId,
          title: initialData.actionTitle,
          icon: Mail // Default icon
        });
      }
    }
  }, [initialData]);

  const triggers = [
    {
      id: 1,
      title: "Membership Expiry",
      desc: "Trigger when membership is about to expire",
      tag: "Membership",
      icon: AlertTriangle,
    },
    {
      id: 2,
      title: "New Member Signup",
      desc: "Trigger when a new member joins",
      tag: "Membership",
      icon: UserPlus,
    },
    {
      id: 3,
      title: "Missed Workout",
      desc: "Trigger when member misses scheduled workouts",
      tag: "Engagement",
      icon: Activity,
    },
    {
      id: 4,
      title: "Member Birthday",
      desc: "Trigger on member's birthday",
      tag: "Birthday",
      icon: Gift,
    },
    {
      id: 5,
      title: "Payment Failed",
      desc: "Trigger when payment fails",
      tag: "Billing",
      icon: CreditCard,
    },
    {
      id: 6,
      title: "Low Attendance",
      desc: "Trigger when member attendance drops",
      tag: "Engagement",
      icon: TrendingUp,
    },
    {
      id: 7,
      title: "Class Reminder",
      desc: "Remind members about upcoming classes",
      tag: "Classes",
      icon: Clock,
    },
    {
      id: 8,
      title: "Goal Achievement",
      desc: "Celebrate when member achieves fitness goals",
      tag: "Wellness",
      icon: Award,
    },
  ];

  const actions = [
    { id: 1, title: "Send Email", icon: Mail },
    { id: 2, title: "Send SMS", icon: Smartphone },
    { id: 3, title: "Send WhatsApp", icon: MessageCircle },
    { id: 4, title: "Push Notification", icon: Bell },
    { id: 5, title: "In-App Notification", icon: Bell },
    { id: 6, title: "Create Task", icon: CheckSquare },
  ];

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!workflowName.trim()) newErrors.workflowName = "Workflow Name is required";
      if (!frequency) newErrors.frequency = "Frequency is required";
    }
    if (currentStep === 2) {
      if (!selectedTrigger) newErrors.trigger = "Please select a trigger";
    }
    if (currentStep === 3) {
      if (!selectedAction) newErrors.action = "Please select an action";
      if (!inAppMessage.trim()) newErrors.message = "Message content is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    if (validateStep(step)) { // Validate current step (usually step 4 or 3)
      const newWorkflow = {
        id: workflowId || Date.now(), // Use existing ID if edit
        name: workflowName,
        description,
        trigger: selectedTrigger,
        action: selectedAction,
        frequency,
        message: inAppMessage,
        status,
      };
      onSave(newWorkflow);
    }
  };

  const steps = [
    "Basic Information",
    "Select Trigger",
    "Define Action",
    "Review & Save",
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isViewOnly ? "View Workflow" : initialData ? "Edit Workflow" : "Create Automation Workflow"}
            </h2>
            <p className="text-xs text-slate-500">
              {isViewOnly ? "View details of this automated workflow" : "Set up an automated workflow to engage with your members"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="px-6 pt-4 pb-3 border-b bg-slate-50">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            {steps.map((label, index) => {
              const num = index + 1;
              const isActive = step === num;
              const isCompleted = step > num;
              return (
                <div key={label} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-[#1f4d4a] text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {num}
                    </div>
                    <span
                      className={`hidden sm:inline ${
                        isActive
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-slate-200 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Step 1: Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Workflow Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={workflowName}
                    onChange={(e) => {
                      setWorkflowName(e.target.value);
                      if(errors.workflowName) setErrors({...errors, workflowName: null});
                    }}
                    disabled={isViewOnly}
                    type="text"
                    className={`w-full px-3 py-2 text-sm border ${errors.workflowName ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] disabled:bg-slate-50 disabled:text-slate-500`}
                    placeholder="Enter workflow name"
                  />
                  {errors.workflowName && <p className="text-xs text-red-500 mt-1">{errors.workflowName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isViewOnly}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] resize-none disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Describe what this automation does"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    disabled={isViewOnly}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] bg-white text-slate-600 disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option>Once per member</option>
                    <option>Every time trigger happens</option>
                    <option>Once per day</option>
                    <option>Once per week</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Step 2: Select Trigger <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-slate-500 mb-2">
                Choose what event will start this automation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {triggers.map((t) => {
                  const Icon = t.icon;
                  const selected = selectedTrigger?.id === t.id || selectedTrigger?.title === t.title;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={isViewOnly}
                      onClick={() => {
                        setSelectedTrigger(t);
                        if(errors.trigger) setErrors({...errors, trigger: null});
                      }}
                      className={`text-left border rounded-xl p-3 text-xs shadow-sm hover:shadow-md transition-all flex flex-col gap-1 ${
                        selected
                          ? "border-[#1f4d4a] bg-emerald-50/40"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      } ${isViewOnly ? "opacity-70 cursor-not-allowed hover:shadow-sm" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <Icon size={14} />
                        </div>
                        <span className="font-semibold text-slate-800 text-sm">
                          {t.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {t.desc}
                      </p>
                      <span className="mt-1 inline-flex text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 w-max">
                        {t.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.trigger && <p className="text-xs text-red-500 font-medium">{errors.trigger}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Step 3: Define Action <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-slate-500 mb-2">
                Choose what happens when the trigger fires.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {actions.map((a) => {
                  const Icon = a.icon;
                  const selected = selectedAction?.id === a.id || selectedAction?.title === a.title;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      disabled={isViewOnly}
                      onClick={() => {
                        setSelectedAction(a);
                        if(errors.action) setErrors({...errors, action: null});
                      }}
                      className={`border rounded-xl p-3 text-xs shadow-sm hover:shadow-md transition-all flex flex-col items-start gap-2 ${
                        selected
                          ? "border-[#1f4d4a] bg-emerald-50/40"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      } ${isViewOnly ? "opacity-70 cursor-not-allowed hover:shadow-sm" : ""}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-1">
                        <Icon size={14} />
                      </div>
                      <span className="font-semibold text-slate-800 text-xs">
                        {a.title}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.action && <p className="text-xs text-red-500 font-medium">{errors.action}</p>}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Content / Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={inAppMessage}
                  onChange={(e) => {
                    setInAppMessage(e.target.value);
                    if(errors.message) setErrors({...errors, message: null});
                  }}
                  disabled={isViewOnly}
                  className={`w-full px-3 py-2 text-sm border ${errors.message ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] resize-none disabled:bg-slate-50 disabled:text-slate-500`}
                  placeholder="Write the message that will be sent to the member"
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Step 4: Review &amp; {isViewOnly ? "Close" : "Save"}
              </h3>
              <p className="text-xs text-slate-500 mb-2">
                {isViewOnly ? "Review the workflow details." : "Review your automation workflow before saving."}
              </p>
              <div className="border border-slate-200 rounded-xl bg-white p-4 text-xs space-y-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">
                    Workflow Name
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {workflowName || "Untitled Workflow"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">
                    Description
                  </p>
                  <p className="text-sm text-slate-700">
                    {description || "No description added"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Trigger
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedTrigger?.title || "Not selected"}
                    </p>
                    {selectedTrigger?.tag && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600">
                        {selectedTrigger.tag}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Action
                    </p>
                    <p className="text-sm text-slate-700">
                      {selectedAction?.title || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Timing
                    </p>
                    <p className="text-sm text-slate-700">
                      Send immediately
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">
                      Frequency
                    </p>
                    <p className="text-sm text-slate-700">
                      {frequency}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">
                    Content
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {inAppMessage || "No message content defined"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t flex justify-between items-center">
          <span className="text-[11px] text-slate-400">
            Step {step} of 4
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {isViewOnly ? "Close" : "Cancel"}
            </button>
            {step > 1 && (
              <button
                onClick={handlePrevious}
                className="px-3 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Previous
              </button>
            )}
            {step < 4 && (
              <button
                onClick={handleNext}
                className="px-3 py-2 text-xs font-medium text-white bg-[#1f4d4a] rounded-lg hover:bg-[#163836]"
              >
                Next
              </button>
            )}
            {step === 4 && (
              <button
                onClick={isViewOnly ? onClose : handleSave}
                className={`px-3 py-2 text-xs font-medium text-white rounded-lg flex items-center gap-1 ${isViewOnly ? "bg-slate-600 hover:bg-slate-700" : "bg-[#1f4d4a] hover:bg-[#163836]"}`}
              >
                {isViewOnly ? "Close" : <><Play size={14} /> Save Workflow</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== ADD FOLLOW UP MODAL (With Validation) ================== */

function AddFollowUpModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    member: "",
    type: "Select type",
    subject: "",
    priority: "Select priority",
    dueDate: "",
    scheduledTime: "",
    staff: "Select staff member",
    duration: "15",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Members for dropdown (from DB)
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Staff from DB
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Load members + staff on mount
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const data = await getMembers();
        const normalized = (data || []).map(normalizeMember);
        setMembers(normalized);
        setFilteredMembers(normalized);
      } catch (err) {
        console.error("Failed to load members", err);
      }
    };

    const loadStaff = async () => {
      try {
        const data = await getStaff();
        const normalized = (data || []).map(normalizeStaff);
        setStaffList(normalized);
      } catch (err) {
        console.error("Failed to load staff", err);
      }
    };

    loadMembers();
    loadStaff();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if(errors[name]) setErrors(prev => ({...prev, [name]: null}));

    if (name === "member") {
      const query = value.toLowerCase();
      const filtered = members.filter((m) =>
        m.name.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
      setShowMemberDropdown(true);
      setSelectedMember(null);
    }
  };

  const handleMemberFocus = () => {
    setShowMemberDropdown(true);
    setFilteredMembers(members);
  };

  const handleSelectMember = (m) => {
    setSelectedMember(m);
    setFormData((prev) => ({
      ...prev,
      member: m.name,
    }));
    setShowMemberDropdown(false);
    if(errors.member) setErrors(prev => ({...prev, member: null}));
  };

  const handleSelectStaff = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, staff: name }));
    const s = staffList.find((st) => st.name === name) || null;
    setSelectedStaff(s);
    if(errors.staff) setErrors(prev => ({...prev, staff: null}));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.member.trim()) newErrors.member = "Member is required";
    if (formData.type === "Select type") newErrors.type = "Type is required";
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (formData.priority === "Select priority") newErrors.priority = "Priority is required";
    if (!formData.dueDate) newErrors.dueDate = "Due Date is required";
    if (!formData.scheduledTime) newErrors.scheduledTime = "Time is required";
    if (formData.staff === "Select staff member") newErrors.staff = "Staff is required";
    if (!formData.duration) newErrors.duration = "Duration is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Pass raw form + selected member/staff to parent; parent calls API
      onSave({ formData, selectedMember, selectedStaff });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              Add New Follow-up
            </h3>
            <p className="text-xs text-slate-500">
              Schedule a new follow-up communication with a member
            </p>
          </div>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 bg-white">
          {/* Row 1: Member & Type */}
          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Member Name <span className="text-red-500">*</span>
              </label>
              <input
                name="member"
                value={formData.member}
                onChange={handleChange}
                onFocus={handleMemberFocus}
                type="text"
                className={`w-full px-3 py-2 text-sm border ${errors.member ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] placeholder:text-slate-400`}
                placeholder="Select or enter member name"
              />
              {errors.member && <p className="text-xs text-red-500 mt-1">{errors.member}</p>}

              {showMemberDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto text-sm">
                  {filteredMembers.length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-500">
                      No members found
                    </div>
                  )}
                  {filteredMembers.map((m) => (
                    <button
                      key={m.id || m.name}
                      type="button"
                      onClick={() => handleSelectMember(m)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 flex flex-col"
                    >
                      <span className="font-medium text-slate-800">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {m.email}
                        {m.phone && ` • ${m.phone}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Follow-up Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border ${errors.type ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] appearance-none bg-white text-slate-600`}
                >
                  <option>Select type</option>
                  <option>Call</option>
                  <option>Email</option>
                  <option>Whatsapp</option>
                  <option>Meeting</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
            </div>
          </div>

          {/* Row 2: Subject & Priority */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                type="text"
                className={`w-full px-3 py-2 text-sm border ${errors.subject ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a]`}
                placeholder="Enter follow-up subject"
              />
              {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Priority <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border ${errors.priority ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] appearance-none bg-white text-slate-600`}
                >
                  <option>Select priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.priority && <p className="text-xs text-red-500 mt-1">{errors.priority}</p>}
            </div>
          </div>

          {/* Row 3: Due Date & Time */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                type="date"
                className={`w-full px-3 py-2 text-sm border ${errors.dueDate ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] text-slate-500`}
                placeholder="dd-mm-yyyy"
              />
              {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Scheduled Time <span className="text-red-500">*</span>
              </label>
              <input
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                type="time"
                className={`w-full px-3 py-2 text-sm border ${errors.scheduledTime ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] text-slate-500`}
                placeholder="--:-- --"
              />
              {errors.scheduledTime && <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>}
            </div>
          </div>

          {/* Row 4: Assigned Staff & Duration */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Staff <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="staff"
                  value={formData.staff}
                  onChange={handleSelectStaff}
                  className={`w-full px-3 py-2 text-sm border ${errors.staff ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] appearance-none bg-white text-slate-600`}
                >
                  <option>Select staff member</option>
                  {staffList.map((s) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.staff && <p className="text-xs text-red-500 mt-1">{errors.staff}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                type="number"
                className={`w-full px-3 py-2 text-sm border ${errors.duration ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a]`}
              />
              {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1f4d4a] resize-none"
              placeholder="Enter any additional notes about this follow-up"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1f4d4a] rounded-lg hover:bg-[#163836] shadow-sm"
          >
            Schedule Follow-up
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Helper Components (unchanged) --- */

function DropdownMinimal({ label }) {
  return (
    <div className="flex items-center gap-1 text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900">
      {label} <ChevronDown size={12} />
    </div>
  );
}

function FilterDropdown({ label, onChange, options = [] }) {
  return (
    <div className="relative group">
      <div className="relative">
        <select
          className="appearance-none flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white pl-3 pr-7 py-1.5 rounded border border-transparent hover:border-slate-200 focus:outline-none cursor-pointer"
          onChange={(e) => onChange && onChange(e.target.value)}
          value={label}
        >
          <option disabled>{label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Overdue: "bg-rose-50 text-rose-700 border-rose-100",
    Pending: "bg-blue-50 text-blue-700 border-blue-100",
  };

  const icons = {
    Completed: <CheckCircle size={12} />,
    Overdue: <AlertTriangle size={12} />,
    Pending: <Clock size={12} />,
  };

  const key = status || "Pending";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        styles[key] || styles.Pending
      }`}
    >
      {icons[key] || icons.Pending} {key}
    </span>
  );
}

function PriorityBadge({ priority, small }) {
  const styles = {
    High: "bg-rose-50 text-rose-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-emerald-50 text-emerald-700",
  };
  const key = priority || "Medium";
  return (
    <span
      className={`${
        small ? "px-1.5 py-[1px] text-[10px]" : "px-2 py-0.5 text-xs"
      } rounded font-medium uppercase tracking-wide ${
        styles[key] || styles.Medium
      }`}
    >
      {key}
    </span>
  );
}

/* ================== TABLE & KANBAN VIEWS (unchanged UI, now fed from DB) ================== */

function TableView({ items, onView, onDelete, onAction }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          Follow-ups List{" "}
          <span className="text-slate-400 font-normal">
            ({items.length})
          </span>
        </h3>
        <button className="text-slate-400 hover:text-slate-600">
          <Settings size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 w-10">
                <input
                  type="checkbox"
                  className="rounded text-[#1f4d4a] focus:ring-[#1f4d4a]"
                />
              </th>
              <th className="px-6 py-3">Member</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3">Assigned</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No follow-ups found matching your filters.
                </td>
              </tr>
            )}
            {items.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50 group transition-colors"
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded text-[#1f4d4a] focus:ring-[#1f4d4a]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-emerald-100 text-emerald-700`}
                    >
                      {row.member
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {row.member}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {(row.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p>{row.contact?.email}</p>
                    <p>{row.contact?.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-slate-800">
                      {row.subject}
                    </p>
                    <p className="text-xs text-slate-500">{row.subtext}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600 text-xs">
                    {row.type === "Whatsapp" && <MessageCircle size={14} />}
                    {row.type === "Call" && <Phone size={14} />}
                    {row.type === "Email" && <Mail size={14} />}
                    {row.type === "Meeting" && <Users size={14} />}
                    {row.type}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={row.priority} />
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`text-sm font-medium ${
                      row.status === "Overdue"
                        ? "text-rose-600"
                        : row.dueDate === "Today"
                        ? "text-orange-600"
                        : "text-slate-700"
                    }`}
                  >
                    {row.dueDate}
                  </div>
                  <div className="text-xs text-slate-500">
                    {row.dueTime}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium bg-slate-100 text-slate-600">
                      {row.initials}
                    </div>
                    {row.assigned}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onAction(row.type, row.contact)}
                      className="hover:text-[#1f4d4a] p-1"
                      title={`Action: ${row.type}`}
                    >
                      {row.type === "Whatsapp" ? (
                        <MessageCircle size={16} />
                      ) : row.type === "Email" ? (
                        <Mail size={16} />
                      ) : row.type === "Call" ? (
                        <Phone size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => onView(row)}
                      className="hover:text-[#1f4d4a] p-1"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(row.id)}
                      className="hover:text-rose-600 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KanbanView({ items, onView, onDelete, onAction }) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-full items-start">
      {COLUMNS.map((col) => {
        const colItems = items.filter((i) => i.column === col.id);
        return (
          <div
            key={col.id}
            className="min-w-[280px] w-full max-w-xs flex flex-col h-full shrink-0"
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <col.icon size={14} className={col.color} />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {col.label}
              </span>
              <span className="text-xs px-1.5 py-0.5 bg-slate-200 rounded-full text-slate-600 font-medium">
                {colItems.length}
              </span>
            </div>

            <div className="flex-1 bg-slate-100/50 rounded-xl border border-slate-200 p-2 space-y-3 min-h-[200px]">
              {colItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-medium bg-emerald-100 text-emerald-700`}
                      >
                        {item.member
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.member}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate w-32">
                          {item.subject}
                        </p>
                      </div>
                    </div>
                    <PriorityBadge priority={item.priority} small />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 pl-1">
                    {item.type === "Whatsapp" && <MessageCircle size={14} />}
                    {item.type === "Call" && <Phone size={14} />}
                    {item.type === "Email" && <Mail size={14} />}
                    {item.type === "Meeting" && <Users size={14} />}
                    <span>{item.type}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <div className="flex gap-1 text-slate-300">
                      <button
                        onClick={() => onAction(item.type, item.contact)}
                        className="hover:text-[#1f4d4a] p-1"
                      >
                        {item.type === "Whatsapp" ? (
                          <MessageCircle size={14} />
                        ) : item.type === "Email" ? (
                          <Mail size={14} />
                        ) : (
                          <Phone size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => onView(item)}
                        className="hover:text-[#1f4d4a] p-1"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="hover:text-rose-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold block ${
                            item.status === "Overdue"
                              ? "text-rose-600"
                              : "text-slate-600"
                          }`}
                        >
                          {item.dueDate}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {item.dueTime}
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-slate-600 bg-slate-100 font-medium border border-slate-200">
                        {item.initials}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {colItems.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                  No Items
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}