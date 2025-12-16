// src/components/MessagingPage.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Users,
  MessageSquare,
  Send,
  Clock,
  Eye,
  MousePointer,
  CreditCard,
  Plus,
  Search,
  ChevronDown,
  FileText,
  Smartphone,
  Bell,
  Paperclip,
  Smile,
  X,
  Check,
  Calendar,
  Copy,
  MoreHorizontal,
  Trash2,
  Edit2,
} from "lucide-react";

import api from "../api/axiosConfig";

/* ---------- Helpers ---------- */

function formatDate(d) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameDay(a, b) {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor,
  valueClass = "text-slate-800",
}) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <h3 className={`text-2xl font-bold ${valueClass}`}>{value}</h3>
      </div>
      <div className={`p-2 rounded-full bg-slate-50 ${iconColor}`}>
        <Icon size={18} />
      </div>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </div>
);

const Modal = ({ title, subtitle, children, onClose, onSave, saveLabel = "Save" }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
      <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>
      <div className="p-6">{children}</div>
      <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
        >
          Cancel
        </button>
        {onSave && (
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1f4d4a] hover:bg-[#163836] rounded-lg"
          >
            {saveLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);

/* ---------- Page ---------- */

export default function MessagingPage() {
  /* tabs & data state */
  const [activeTab, setActiveTab] = useState("Compose");

  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);

  /* real members from /api/members */
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersError, setMembersError] = useState(null);

  /* filters / selections */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState([]); // array of member IDs

  /* compose form state */
  const [messageType, setMessageType] = useState("Email");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  /* personalization + emoji + attachments */
  const [personalizationEnabled, setPersonalizationEnabled] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]); // simple UI only
  const composeContentRef = useRef(null);

  /* modals state */
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [viewHistoryItem, setViewHistoryItem] = useState(null);

  /* template create / edit state */
  const [templateMode, setTemplateMode] = useState("create"); // "create" | "edit"
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const [tplName, setTplName] = useState("");
  const [tplCategory, setTplCategory] = useState("");
  const [tplType, setTplType] = useState("Email");
  const [tplSubject, setTplSubject] = useState("");
  const [tplContent, setTplContent] = useState("");
  const templateContentRef = useRef(null);

  /* load data from backend on mount */
  useEffect(() => {
    loadMembers();
    loadTemplates();
    loadHistory();
  }, []);

  async function loadMembers() {
    try {
      setLoadingMembers(true);
      setMembersError(null);
      const res = await api.get("/api/members");
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to load members", err);
      setMembersError("Failed to load members");
    } finally {
      setLoadingMembers(false);
    }
  }

  async function loadTemplates() {
    try {
      const res = await api.get("/api/messaging/templates");
      setTemplates(res.data || []);
    } catch (err) {
      console.error("Failed to load templates", err);
    }
  }

  async function loadHistory() {
    try {
      const res = await api.get("/api/messaging/messages");
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  }

  /* recipients derived list (REAL MEMBERS) */
  const activeRecipients = useMemo(() => {
    if (!members || !members.length) return [];

    const q = (searchTerm || "").toLowerCase();

    return members
      .map((m) => {
        let fullName = "";

        if (m.firstname || m.lastname) {
          fullName = `${m.firstname || ""} ${m.lastname || ""}`.trim();
        } else if (m.firstName || m.lastName) {
          fullName = `${m.firstName || ""} ${m.lastName || ""}`.trim();
        } else if (m.name) {
          fullName = m.name;
        } else if (m.fullName) {
          fullName = m.fullName;
        } else if (m.memberName) {
          fullName = m.memberName;
        } else if (m.first_name || m.last_name) {
          fullName = `${m.first_name || ""} ${m.last_name || ""}`.trim();
        } else if (m.fname || m.lname) {
          fullName = `${m.fname || ""} ${m.lname || ""}`.trim();
        } else {
          fullName = `Member #${m.id}`;
        }

        return {
          ...m,
          _displayName: (fullName || "").trim(),
          _status: m.status || m.membership_status || m.membership_type || "",
          _isVip: m.vip || m.isVip || false,
        };
      })
      .filter((m) =>
        q
          ? m._displayName.toLowerCase().includes(q) ||
            (m.email || "").toLowerCase().includes(q) ||
            (m.phone || "").toLowerCase().includes(q)
          : true
      );
  }, [members, searchTerm]);

  const totalSelected = selectedRecipients.length;

  const toggleRecipient = (id) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = activeRecipients.map((r) => r.id);
    const allVisibleSelected = visibleIds.every((id) => selectedRecipients.includes(id));

    setSelectedRecipients((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      } else {
        const set = new Set(prev);
        visibleIds.forEach((id) => set.add(id));
        return Array.from(set);
      }
    });
  };

  /* analytics from REAL history */

  const analytics = useMemo(() => {
    if (!history.length) {
      return {
        totalMessages: 0,
        avgOpen: 0,
        avgClick: 0,
        totalCost: 0,
        sentToday: 0,
        scheduled: 0,
      };
    }

    const today = new Date();
    let sumOpen = 0;
    let sumClick = 0;
    let sumCost = 0;
    let sentToday = 0;
    let scheduled = 0;

    history.forEach((h) => {
      const openRate = h.openRate || 0;
      const clickRate = h.clickRate || 0;
      const cost = h.cost || 0;
      sumOpen += openRate;
      sumClick += clickRate;
      sumCost += cost;

      if (h.status === "Scheduled") {
        scheduled++;
      } else if (h.sentAt && isSameDay(h.sentAt, today)) {
        sentToday++;
      }
    });

    const totalMessages = history.length;
    return {
      totalMessages,
      avgOpen: totalMessages ? sumOpen / totalMessages : 0,
      avgClick: totalMessages ? sumClick / totalMessages : 0,
      totalCost: sumCost,
      sentToday,
      scheduled,
    };
  }, [history]);

  /* --------- personalization helpers --------- */

  const previewMember = useMemo(() => {
    const selected =
      members.find((m) => selectedRecipients.includes(m.id)) ||
      (members.length ? members[0] : null);
    return selected || null;
  }, [members, selectedRecipients]);

  const selectedMembersInfo = useMemo(() => {
    const list = activeRecipients.filter((r) => selectedRecipients.includes(r.id));
    const names = list.map((m) => m._displayName);
    return {
      count: list.length,
      names,
      primaryName: names[0] || "",
      othersCount: list.length > 1 ? list.length - 1 : 0,
    };
  }, [activeRecipients, selectedRecipients]);

  function applyPersonalization(text, member) {
    if (!personalizationEnabled || !member || !text) return text;

    const firstName =
      member.firstname ||
      member.firstName ||
      (member.name ? String(member.name).split(" ")[0] : "") ||
      "";
    const lastName =
      member.lastname ||
      member.lastName ||
      (member.name ? String(member.name).split(" ").slice(1).join(" ") : "") ||
      "";
    const plan =
      member.membership_plan ||
      member.membership_type ||
      member.planName ||
      member.membershipPlan ||
      "";

    let result = text;
    result = result.replaceAll("{FirstName}", firstName);
    result = result.replaceAll("{LastName}", lastName);
    result = result.replaceAll("{MembershipPlan}", plan);

    return result;
  }

  const previewSubject = applyPersonalization(subject, previewMember);
  const previewContent = applyPersonalization(content, previewMember);

  /* --------- emoji / attachments handlers --------- */

  const handleEmojiClick = (emoji) => {
    setShowEmojiPicker(false);
    const textarea = composeContentRef.current;
    if (textarea && textarea.selectionStart != null) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const updated = `${before}${emoji}${after}`;
      setContent(updated);
      setTimeout(() => {
        textarea.focus();
        const pos = start + emoji.length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    } else {
      setContent((prev) => `${prev}${emoji}`);
    }
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(files);
  };

  /* --------- handlers --------- */

  const resetCompose = () => {
    setActiveTab("Compose");
    setMessageType("Email");
    setSelectedTemplateId("");
    setSubject("");
    setContent("");
    setAttachments([]);
    setShowEmojiPicker(false);
  };

  const handleUseTemplate = (tpl) => {
    setActiveTab("Compose");
    setMessageType(tpl.messageType || tpl.type || "Email");
    setSelectedTemplateId(tpl.id);
    setSubject(tpl.subject || "");
    setContent(tpl.content || "");
  };

  const handleTemplateSelectChange = (e) => {
    const id = e.target.value;
    setSelectedTemplateId(id);
    const tpl = templates.find((t) => String(t.id) === String(id));
    if (tpl) {
      setMessageType(tpl.messageType || tpl.type || "Email");
      setSubject(tpl.subject || "");
      setContent(tpl.content || "");
    }
  };

  async function handleSendNow() {
    if (!subject && !content) return;
    if (!totalSelected) return;

    const memberForPreview = previewMember;
    const finalSubject =
      personalizationEnabled && memberForPreview
        ? applyPersonalization(subject, memberForPreview)
        : subject;
    const finalContent =
      personalizationEnabled && memberForPreview
        ? applyPersonalization(content, memberForPreview)
        : content;

    try {
      await api.post("/api/messaging/messages", {
        messageType,
        status: "Sent",
        recipientsCount: totalSelected,
        recipientIds: selectedRecipients.join(","),
        subject: finalSubject,
        content: finalContent,
        sentAt: new Date().toISOString(),
        openRate: 0,
        clickRate: 0,
        cost: 0,
        title: finalSubject || "(No subject)",
        personalizationEnabled,
      });

      await loadHistory();
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }

  async function handleScheduleConfirm() {
    if (!subject && !content) return;
    if (!totalSelected) return;
    if (!scheduleDate) return;

    const [hour, minute] = scheduleTime ? scheduleTime.split(":") : ["09", "00"];
    const dt = new Date(scheduleDate);
    dt.setHours(parseInt(hour || "9", 10), parseInt(minute || "0", 10), 0, 0);

    const memberForPreview = previewMember;
    const finalSubject =
      personalizationEnabled && memberForPreview
        ? applyPersonalization(subject, memberForPreview)
        : subject;
    const finalContent =
      personalizationEnabled && memberForPreview
        ? applyPersonalization(content, memberForPreview)
        : content;

    try {
      await api.post("/api/messaging/messages", {
        messageType,
        status: "Scheduled",
        recipientsCount: totalSelected,
        recipientIds: selectedRecipients.join(","),
        subject: finalSubject,
        content: finalContent,
        sentAt: dt.toISOString(),
        openRate: 0,
        clickRate: 0,
        cost: 0,
        title: finalSubject || "(No subject)",
        personalizationEnabled,
      });

      await loadHistory();
      setShowScheduleModal(false);
      setScheduleDate("");
      setScheduleTime("");
    } catch (err) {
      console.error("Failed to schedule message", err);
    }
  }

  const handleHistoryCopyToCompose = (item) => {
    setActiveTab("Compose");
    setMessageType(item.messageType || item.type || "Email");
    setSubject(item.subject || item.title || "");
    setContent(item.content || item.preview || "");
  };

  /* --- template modal helpers (using backend) --- */

  const openCreateTemplateModal = () => {
    setTemplateMode("create");
    setEditingTemplateId(null);
    setTplName("");
    setTplCategory("");
    setTplType("Email");
    setTplSubject("");
    setTplContent("");
    setShowTemplateModal(true);
  };

  const openEditTemplateModal = (tpl) => {
    setTemplateMode("edit");
    setEditingTemplateId(tpl.id);
    setTplName(tpl.name || "");
    setTplCategory(tpl.category || tpl.tag || "");
    setTplType(tpl.messageType || tpl.type || "Email");
    setTplSubject(tpl.subject || "");
    setTplContent(tpl.content || "");
    setShowTemplateModal(true);
  };

  async function handleSaveTemplate() {
    if (!tplName || !tplSubject) return;

    const payload = {
      name: tplName,
      category: tplCategory || "General",
      messageType: tplType,
      subject: tplSubject,
      content: tplContent,
      variables: "{FirstName},{MembershipPlan}",
    };

    try {
      if (templateMode === "create") {
        await api.post("/api/messaging/templates", payload);
      } else if (templateMode === "edit" && editingTemplateId != null) {
        await api.put(`/api/messaging/templates/${editingTemplateId}`, payload);
      }

      await loadTemplates();
      setShowTemplateModal(false);
      setEditingTemplateId(null);
      setTemplateMode("create");
      setTplName("");
      setTplCategory("");
      setTplType("Email");
      setTplSubject("");
      setTplContent("");
    } catch (err) {
      console.error("Failed to save template", err);
    }
  }

  async function handleCopyTemplate(tpl) {
    try {
      await api.post("/api/messaging/templates", {
        name: `${tpl.name || "Template"} (Copy)`,
        category: tpl.category || tpl.tag || "General",
        messageType: tpl.messageType || tpl.type || "Email",
        subject: tpl.subject || "",
        content: tpl.content || "",
        variables: tpl.variables || "{FirstName},{MembershipPlan}",
        usageCount: 0,
      });
      await loadTemplates();
    } catch (err) {
      console.error("Failed to copy template", err);
    }
  }

  const handleVariableClick = (variable) => {
    const textarea = templateContentRef.current;
    if (textarea && textarea.selectionStart != null) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = tplContent.slice(0, start);
      const after = tplContent.slice(end);
      const updated = `${before}${variable}${after}`;
      setTplContent(updated);
      setTimeout(() => {
        textarea.focus();
        const pos = start + variable.length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    } else {
      setTplContent((prev) => `${prev}${variable}`);
    }
  };

  /* ---------- JSX ---------- */

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans">

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="px-8 py-5 bg-white border-b flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Messaging Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Send targeted messages and communications to members, prospects, and staff
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openCreateTemplateModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <FileText size={16} /> Templates
            </button>
            <button
              onClick={() => setShowGroupModal(true)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2"
            >
              <Users size={16} /> Groups
            </button>
            <button
              onClick={resetCompose}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1f4d4a] rounded-lg hover:bg-[#163836] shadow-sm flex items-center gap-2"
            >
              <Plus size={16} /> New Message
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {/* Stats based on REAL history */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
              label="Sent Today"
              value={analytics.sentToday}
              icon={Send}
              iconColor="text-blue-600"
            />
            <StatCard
              label="Scheduled"
              value={analytics.scheduled}
              icon={Clock}
              iconColor="text-amber-500"
            />
            <StatCard
              label="Recipients"
              value={totalSelected}
              subtext="Currently selected"
              icon={Users}
              iconColor="text-purple-600"
            />
            <StatCard
              label="Open Rate"
              value={`${analytics.avgOpen.toFixed(1)}%`}
              icon={Eye}
              iconColor="text-emerald-500"
              valueClass="text-emerald-600"
            />
            <StatCard
              label="Click Rate"
              value={`${analytics.avgClick.toFixed(1)}%`}
              icon={MousePointer}
              iconColor="text-indigo-600"
              valueClass="text-indigo-600"
            />
            <StatCard
              label="Cost"
              value={`${analytics.totalCost.toFixed(2)} AED`}
              icon={CreditCard}
              iconColor="text-orange-500"
              valueClass="text-orange-600"
            />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 mb-6 sticky top-0 z-10">
            <div className="flex">
              {["Compose", "History", "Templates", "Analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-medium text-center relative ${
                    activeTab === tab
                      ? "text-[#1f4d4a]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1f4d4a]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ---------- COMPOSE ---------- */}
            {activeTab === "Compose" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-400px)] min-h-[600px]">
                {/* Recipients from /api/members */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-slate-800">
                        Recipients ({totalSelected})
                      </h3>
                      <button
                        onClick={handleSelectAll}
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded"
                      >
                        Select All
                      </button>
                    </div>
                    <div className="relative mb-4">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {loadingMembers && (
                      <div className="p-4 text-xs text-slate-500">Loading members...</div>
                    )}
                    {membersError && (
                      <div className="p-4 text-xs text-rose-500">{membersError}</div>
                    )}
                    {!loadingMembers &&
                      !membersError &&
                      activeRecipients.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                          <div className="mr-3">
                            <input
                              type="checkbox"
                              checked={selectedRecipients.includes(user.id)}
                              onChange={() => toggleRecipient(user.id)}
                              className="rounded border-slate-300 text-[#1f4d4a] focus:ring-[#1f4d4a]"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700">
                                {user._displayName}
                              </span>
                              {user._isVip && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 mt-1">
                              {user._status && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded capitalize bg-slate-100 text-slate-600">
                                  {user._status}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-medium">
                            {(user._displayName || "")
                              .split(" ")
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        </div>
                      ))}
                    {!loadingMembers &&
                      !membersError &&
                      activeRecipients.length === 0 && (
                        <div className="p-4 text-xs text-slate-500">
                          No members found. Check your search.
                        </div>
                      )}
                  </div>
                </div>

                {/* Editor */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-semibold text-slate-800 mb-6">Compose Message</h3>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          Message Type
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                            <Send size={16} />
                          </div>
                          <select
                            value={messageType}
                            onChange={(e) => setMessageType(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          >
                            <option value="Email">Email</option>
                            <option value="SMS">SMS</option>
                            <option value="Whatsapp">Whatsapp</option>
                          </select>
                          <ChevronDown
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={14}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                          Template
                        </label>
                        <div className="relative">
                          <select
                            value={selectedTemplateId}
                            onChange={handleTemplateSelectChange}
                            className="w-full pl-3 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-500"
                          >
                            <option value="">Choose template</option>
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            size={14}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="Enter subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>

                    <div className="flex-1 flex flex-col mb-4">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">
                        Message Content
                      </label>
                      <textarea
                        ref={composeContentRef}
                        className="flex-1 w-full px-3 py-3 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-normal"
                        placeholder="Type your message here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                      <span>Characters: {content.length}</span>
                      <div className="flex gap-2 text-slate-400 items-center">
                        {/* Emoji button */}
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker((v) => !v)}
                          className="p-1 rounded hover:bg-slate-100"
                        >
                          <Smile size={18} className="hover:text-slate-600 cursor-pointer" />
                        </button>

                        {/* Attachment button */}
                        <label className="p-1 rounded hover:bg-slate-100 cursor-pointer">
                          <Paperclip
                            size={18}
                            className="hover:text-slate-600 cursor-pointer"
                          />
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleAttachmentsChange}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Emoji picker */}
                    {showEmojiPicker && (
                      <div className="mb-4 inline-flex flex-wrap gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                        {["😀", "😁", "😂", "😍", "💪", "🔥", "👏", "✅", "📅", "🏋️"].map(
                          (emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleEmojiClick(emoji)}
                              className="px-2 py-1 text-lg hover:bg-slate-100 rounded"
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* Attachments preview */}
                    {attachments.length > 0 && (
                      <div className="mb-4 text-xs text-slate-600">
                        <p className="font-medium mb-1">Attachments:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {attachments.map((f, idx) => (
                            <li key={idx}>{f.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-8">
                      {/* Toggle with state */}
                      <button
                        type="button"
                        onClick={() => setPersonalizationEnabled((v) => !v)}
                        className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${
                          personalizationEnabled ? "bg-[#1f4d4a]" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${
                            personalizationEnabled ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                      <span className="text-sm text-slate-600">
                        Enable personalization (use{" "}
                        <span className="font-mono text-xs bg-slate-100 px-1 rounded">
                          {"{FirstName}"}
                        </span>
                        ,{" "}
                        <span className="font-mono text-xs bg-slate-100 px-1 rounded">
                          {"{MembershipPlan}"}
                        </span>
                        , etc.)
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowPreviewModal(true)}
                          className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Eye size={16} /> Preview
                        </button>
                        <button
                          onClick={() => setShowScheduleModal(true)}
                          className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Calendar size={16} /> Schedule
                        </button>
                      </div>
                      <button
                        onClick={handleSendNow}
                        className="px-6 py-2 text-sm font-medium text-white bg-[#1f4d4a] hover:bg-[#163836] rounded-lg shadow-sm flex items-center gap-2"
                      >
                        <Send size={16} /> Send to {totalSelected} recipients
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------- HISTORY ---------- */}
            {activeTab === "History" && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-slate-800">Message History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-slate-700">Message</th>
                        <th className="px-6 py-3 font-semibold text-slate-700">Type</th>
                        <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
                        <th className="px-6 py-3 font-semibold text-slate-700">Recipients</th>
                        <th className="px-6 py-3 font-semibold text-slate-700">Sent Date</th>
                        <th className="px-6 py-3 font-semibold text-slate-700">Performance</th>
                        <th className="px-6 py-3 font-semibold text-slate-700">Cost</th>
                        <th className="px-6 py-3 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{item.title}</p>
                            <p className="text-xs text-slate-400 truncate w-48">
                              {item.content || ""}
                            </p>
                          </td>
                          <td className="px-6 py-4 flex items-center gap-2">
                            {item.messageType === "Email" && <Send size={14} />}
                            {item.messageType === "SMS" && <Smartphone size={14} />}
                            {item.messageType === "Whatsapp" && <MessageSquare size={14} />}
                            {item.messageType}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === "Delivered"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : item.status === "Scheduled"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{item.recipientsCount}</td>
                          <td className="px-6 py-4 text-xs">{formatDate(item.sentAt)}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Eye size={12} className="text-slate-400" />{" "}
                                {(item.openRate || 0).toFixed(1)}%
                              </span>
                              <span className="flex items-center gap-1">
                                <MousePointer size={12} className="text-slate-400" />{" "}
                                {(item.clickRate || 0).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {(item.cost || 0).toFixed(2)} AED
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-400">
                              <button
                                className="hover:text-[#1f4d4a]"
                                onClick={() => setViewHistoryItem(item)}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="hover:text-[#1f4d4a]"
                                onClick={() => handleHistoryCopyToCompose(item)}
                              >
                                <Copy size={16} />
                              </button>
                              <button className="hover:text-[#1f4d4a]">
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!history.length && (
                        <tr>
                          <td className="px-6 py-4 text-xs text-slate-500" colSpan={8}>
                            No messages yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---------- TEMPLATES ---------- */}
            {activeTab === "Templates" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">Message Templates</h3>
                  <button
                    onClick={openCreateTemplateModal}
                    className="px-4 py-2 text-sm bg-[#1f4d4a] text-white rounded-lg hover:bg-[#163836]"
                  >
                    + New Template
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                            {t.messageType === "Email" || t.type === "Email" ? (
                              <Send size={10} />
                            ) : t.messageType === "SMS" || t.type === "SMS" ? (
                              <Smartphone size={10} />
                            ) : (
                              <MessageSquare size={10} />
                            )}
                            {t.messageType || t.type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (t.category || t.tag) === "Onboarding"
                                ? "bg-blue-50 text-blue-700"
                                : (t.category || t.tag) === "Billing"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {t.category || t.tag || "General"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Used {t.usageCount || t.usage || 0} times
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-800 mb-1">{t.name}</h4>
                      <p className="text-xs text-slate-500 mb-4">
                        <span className="font-medium">Subject:</span>{" "}
                        {t.subject || "(no subject)"}
                      </p>

                      <div className="bg-slate-50 p-3 rounded-lg mb-4 text-xs text-slate-600 leading-relaxed border border-slate-100">
                        {t.content}
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-medium text-slate-700 mb-2">Variables</p>
                        <div className="flex flex-wrap gap-1.5">
                          {((t.variables && t.variables.split(",")) ||
                            ["{FirstName}", "{MembershipPlan}"]).map((v) => (
                            <span
                              key={v}
                              className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono"
                            >
                              {v.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t gap-2">
                        <button
                          className="flex-1 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 rounded hover:bg-slate-50"
                          onClick={() => handleUseTemplate(t)}
                        >
                          Use Template
                        </button>
                        <div className="flex gap-2">
                          <button
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            onClick={() => handleCopyTemplate(t)}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            onClick={() => openEditTemplateModal(t)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            onClick={() => setTemplateToDelete(t)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!templates.length && (
                    <p className="text-xs text-slate-500">
                      No templates yet. Click &quot;+ New Template&quot; to create one.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ---------- ANALYTICS ---------- */}
            {activeTab === "Analytics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Total Messages</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {analytics.totalMessages}
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-2">
                      (Based on history from DB)
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Average Open Rate</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {analytics.avgOpen.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Average Click Rate</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {analytics.avgClick.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">Total Cost</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                      {analytics.totalCost.toFixed(2)} AED
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">
                      Message Performance by Type
                    </h3>
                    <div className="space-y-5">
                      {[{ type: "Email", icon: Send }, { type: "Sms", icon: Smartphone }, { type: "Whatsapp", icon: MessageSquare }, { type: "In-App", icon: Bell }].map(
                        (row, i) => {
                          const items = history.filter(
                            (h) =>
                              (h.messageType || "").toLowerCase() ===
                                row.type.toLowerCase() && h.status !== "Scheduled"
                          );
                          const count = items.length;
                          const avgOpen =
                            count === 0
                              ? 0
                              : items.reduce((s, h) => s + (h.openRate || 0), 0) / count;
                          return (
                            <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <row.icon size={16} className="text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">
                                  {row.type}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-800">
                                  {avgOpen.toFixed(1)}%
                                </p>
                                <p className="text-xs text-slate-400">
                                  {count} {count === 1 ? "sent" : "sent"}
                                </p>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {history.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                        >
                          <div className="flex gap-3">
                            <div className="mt-1 text-slate-400">
                              {item.messageType === "Email" ? (
                                <Send size={14} />
                              ) : item.messageType === "SMS" ? (
                                <Smartphone size={14} />
                              ) : (
                                <MessageSquare size={14} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {item.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {item.recipientsCount} recipients •{" "}
                                {formatDate(item.sentAt).split(",")[0]}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                              item.status === "Delivered"
                                ? "bg-emerald-50 text-emerald-600"
                                : item.status === "Scheduled"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                      {!history.length && (
                        <p className="text-xs text-slate-500">No activity yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ---------- MODALS ---------- */}

      {/* Create group – still simple, not yet wired to backend */}
      {showGroupModal && (
        <Modal
          title="Create Message Group"
          subtitle="Create a custom group of recipients"
          onClose={() => setShowGroupModal(false)}
          onSave={() => setShowGroupModal(false)}
          saveLabel="Create Group"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Group Name
                </label>
                <input
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Group Criteria
              </label>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">
                    Membership Status
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {["Active", "Expired", "Frozen", "Cancelled"].map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-1.5 text-xs text-slate-600"
                      >
                        <input type="checkbox" className="rounded text-[#1f4d4a]" /> {s}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit template */}
      {showTemplateModal && (
        <Modal
          title={
            templateMode === "edit"
              ? "Edit Message Template"
              : "Create Message Template"
          }
          subtitle={
            templateMode === "edit"
              ? "Update this reusable message template"
              : "Create a reusable message template"
          }
          onClose={() => {
            setShowTemplateModal(false);
            setTemplateMode("create");
            setEditingTemplateId(null);
          }}
          onSave={handleSaveTemplate}
          saveLabel={templateMode === "edit" ? "Save Changes" : "Create Template"}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Template Name
                </label>
                <input
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  placeholder="Enter template name"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Billing">Billing</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message Type
                </label>
                <select
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  value={tplType}
                  onChange={(e) => setTplType(e.target.value)}
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Whatsapp">Whatsapp</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  placeholder="Enter subject"
                  value={tplSubject}
                  onChange={(e) => setTplSubject(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Content
              </label>
              <textarea
                ref={templateContentRef}
                rows={4}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none resize-none"
                placeholder="Enter template content..."
                value={tplContent}
                onChange={(e) => setTplContent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Available Variables
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "{FirstName}",
                  "{LastName}",
                  "{Email}",
                  "{MembershipPlan}",
                  "{GymName}",
                  "{Location}",
                ].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleVariableClick(v)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-[10px] text-slate-600 font-mono transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete template confirmation */}
      {templateToDelete && (
        <Modal
          title="Delete Template"
          subtitle={`Are you sure you want to delete "${templateToDelete.name}"?`}
          onClose={() => setTemplateToDelete(null)}
          onSave={async () => {
            try {
              await api.delete(`/api/messaging/templates/${templateToDelete.id}`);
              await loadTemplates();
            } catch (err) {
              console.error("Failed to delete template", err);
            } finally {
              setTemplateToDelete(null);
            }
          }}
          saveLabel="Delete"
        >
          <p className="text-sm text-slate-700">
            This action cannot be undone. The template will be permanently removed from
            your Messaging Center.
          </p>
        </Modal>
      )}

      {/* Preview modal */}
      {showPreviewModal && (
        <Modal
          title="Preview Message"
          onClose={() => setShowPreviewModal(false)}
          onSave={null}
          saveLabel=""
        >
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex gap-4">
              <div className="w-24 text-xs text-slate-500">Type</div>
              <div>{messageType}</div>
            </div>

            <div className="flex gap-4">
              <div className="w-24 text-xs text-slate-500">Recipients</div>
              <div className="text-sm">
                {selectedMembersInfo.count === 0 && "No recipients selected"}
                {selectedMembersInfo.count === 1 && selectedMembersInfo.names[0]}
                {selectedMembersInfo.count > 1 && (
                  <>
                    {selectedMembersInfo.primaryName} +{" "}
                    {selectedMembersInfo.othersCount} others
                  </>
                )}
                {personalizationEnabled && selectedMembersInfo.count > 0 && (
                  <div className="text-[11px] text-slate-400 mt-1">
                    Personalization will use each member&apos;s name and membership plan.
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-24 text-xs text-slate-500">Subject</div>
              <div>{previewSubject || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Content</div>
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-sm whitespace-pre-wrap">
                {previewContent || "(no content)"}
              </div>
              {personalizationEnabled && previewMember && (
                <p className="mt-2 text-[11px] text-slate-400">
                  Preview using member:{" "}
                  <span className="font-medium">
                    {previewMember.firstname ||
                      previewMember.firstName ||
                      previewMember.name}
                  </span>
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule modal */}
      {showScheduleModal && (
        <Modal
          title="Schedule Message"
          subtitle="Choose when this message should be sent"
          onClose={() => setShowScheduleModal(false)}
          onSave={handleScheduleConfirm}
          saveLabel="Schedule"
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              This will create a <span className="font-medium">Scheduled</span> entry in your
              message history.
            </p>
          </div>
        </Modal>
      )}

      {/* History view modal */}
      {viewHistoryItem && (
        <Modal
          title={viewHistoryItem.title}
          subtitle={`${viewHistoryItem.messageType} • ${formatDate(
            viewHistoryItem.sentAt
          )}`}
          onClose={() => setViewHistoryItem(null)}
          onSave={null}
          saveLabel=""
        >
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex gap-4">
              <div className="w-24 text-xs text-slate-500">Status</div>
              <div>{viewHistoryItem.status}</div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 text-xs text-slate-500">Recipients</div>
              <div>{viewHistoryItem.recipientsCount}</div>
            </div>
            <div className="flex gap-4">
              <div className="w-24 text-xs text-slate-500">Subject</div>
              <div>{viewHistoryItem.subject || viewHistoryItem.title}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Content</div>
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-sm whitespace-pre-wrap">
                {viewHistoryItem.content || ""}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
