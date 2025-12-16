// src/components/TrainingStreams.jsx
import React, { useEffect, useState, useMemo } from "react";


import { 
  listStreams, 
  createStream, 
  updateStream, 
  deleteStream 
} from "../api/TrainingStreamsApi";

import { FiVideo, FiCalendar, FiUsers, FiEye, FiBarChart2, FiX } from "react-icons/fi";

/* ----------------------- Helper UI components (kept same) ----------------------- */

const PlayIcon = ({ className = "h-8 w-8 text-white" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-play ${className}`}
    aria-hidden="true"
  >
    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
  </svg>
);

function getInitials(name) {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function StatCard({ label, value, note, icon: Icon }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-full">
      <div className="text-sm text-gray-500 flex justify-between items-center">
        {label}
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500">
          {Icon && <Icon size={14} />}
        </div>
      </div>

      <div className="mt-1">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </div>
      <div className="text-xs text-gray-400 mt-1">{note}</div>
    </div>
  );
}

function LargeStat({ title, value, note }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-4xl font-extrabold mt-2 text-gray-800">{value}</div>
      <div className="text-sm text-gray-400 mt-2">{note}</div>
    </div>
  );
}

function LibraryCard({ category, count }) {
  const getPillStyle = (cat) => {
    switch (cat) {
      case "HIIT":
        return "bg-red-100 text-red-700";
      case "Yoga":
        return "bg-purple-100 text-purple-700";
      case "Strength":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-lg text-gray-800">{category}</div>
        <div className={`text-xs px-2 py-0.5 rounded-full ${getPillStyle(category)}`}>
          <strong>{count} videos</strong>
        </div>
      </div>
      <button className="w-full py-2.5 mt-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
        Browse {category}
      </button>
    </div>
  );
}

function StreamListItem({ stream, onView, onEdit, onSettings }) {
  const isLive = (stream.status || "").toUpperCase() === "LIVE";
  return (
    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <PlayIcon />
        </div>

        <div>
          <div className="font-semibold text-lg text-gray-800 flex items-center gap-2">
            {stream.title}
            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${isLive ? "bg-red-500 text-white" : "bg-green-100 text-green-700"}`}>
              {isLive ? "Live" : "Scheduled"}
            </span>
            {stream.difficulty && <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">{stream.difficulty}</span>}
          </div>

          <div className="text-sm text-gray-600 my-1 flex items-center gap-4">
            <div className="text-xs font-semibold text-gray-500">{stream.abbreviation || getInitials(stream.instructor)}</div>
            <span>{stream.instructor}</span>
            <span className="text-xs font-light">{stream.completion}</span>
            <span>
              <strong>{stream.date}{stream.time ? `, ${stream.time}` : ""}</strong>
            </span>
          </div>

          {stream.description && <p className="text-xs text-gray-500 mb-2">{stream.description}</p>}

          <div className="text-xs text-gray-400 flex gap-4">
            <span><strong>{stream.views ?? 0} views</strong></span>
            <span><strong>{stream.likes ?? 0} likes</strong></span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <button onClick={() => onView(stream.id)} className={`px-4 py-2 rounded-md font-medium transition-colors ${isLive ? "bg-gray-100 text-gray-700 border border-gray-300" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
          {isLive ? "View Stream" : "Start Stream"}
        </button>
        <button onClick={() => onEdit(stream)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">Edit</button>
        <button onClick={() => onSettings(stream.id)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">Settings</button>
      </div>
    </div>
  );
}

/* ----------------------- Facilities Modal ----------------------- */

function FacilitiesManagementModal({ closeModal, onCreateOrUpdate, onDelete, onToggleActive }) {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | inactive

  const [isFormOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    active: true,
    occupancy: "",
    bookings: 0,
    pricingHour: "",
    pricingHalfDay: "",
    pricingFullDay: "",
    description: "",
  });

  const facilitiesApi = axios.create({ baseURL: "http://localhost:8080/api" });

  const fetchFacilities = async (searchVal = searchTerm, filterVal = filter) => {
    setLoading(true);
    try {
      const params = {};
      if (searchVal) params.search = searchVal;
      if (filterVal && filterVal !== "all") params.filter = filterVal;
      const res = await facilitiesApi.get("/facilities", { params });
      setFacilities(res.data || []);
    } catch (_) {
      alert("Could not load facilities. See server logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      code: `FAC-${Math.floor(100 + Math.random() * 900)}`,
      active: true,
      occupancy: "",
      bookings: 0,
      pricingHour: "",
      pricingHalfDay: "",
      pricingFullDay: "",
      description: "",
    });
    setFormOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      name: f.name || "",
      code: f.code || "",
      active: !!f.active,
      occupancy: f.occupancy || "",
      bookings: f.bookings || 0,
      pricingHour: (f.pricing && f.pricing.hour) || "",
      pricingHalfDay: (f.pricing && (f.pricing.halfDay || f.pricing.halfday)) || "",
      pricingFullDay: (f.pricing && (f.pricing.fullDay || f.pricing.fullday)) || "",
      description: f.description || "",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const saveFacility = async (e) => {
    e.preventDefault();
    const pricingObj = {};
    if (form.pricingHour && form.pricingHour.trim()) pricingObj.hour = form.pricingHour.trim();
    if (form.pricingHalfDay && form.pricingHalfDay.trim()) pricingObj.halfDay = form.pricingHalfDay.trim();
    if (form.pricingFullDay && form.pricingFullDay.trim()) pricingObj.fullDay = form.pricingFullDay.trim();

    const payload = {
      name: form.name,
      code: form.code,
      active: form.active,
      occupancy: form.occupancy,
      bookings: form.bookings,
      pricing: pricingObj,
      description: form.description,
    };

    try {
      if (editing && editing.id) {
        const res = await facilitiesApi.put(`/facilities/${editing.id}`, payload);
        await fetchFacilities();
        onCreateOrUpdate && onCreateOrUpdate(res.data);
        alert("Facility updated");
      } else {
        const res = await facilitiesApi.post("/facilities", payload);
        await fetchFacilities();
        onCreateOrUpdate && onCreateOrUpdate(res.data);
        alert("Facility created");
      }
      closeForm();
    } catch (_) {
      alert("Save failed. See server logs.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete facility?")) return;
    try {
      await facilitiesApi.delete(`/facilities/${id}`);
      await fetchFacilities();
      onDelete && onDelete(id);
      alert("Facility deleted");
    } catch (_) {
      alert("Delete failed. See server logs.");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await facilitiesApi.get(`/facilities/${id}`);
      const f = res.data;
      f.active = !f.active;
      await facilitiesApi.put(`/facilities/${id}`, f);
      await fetchFacilities();
      onToggleActive && onToggleActive(id, f);
    } catch (_) {
      alert("Toggle failed. See server logs.");
    }
  };

  const onSearchChange = (v) => {
    setSearchTerm(v);
    fetchFacilities(v, filter);
  };

  const onFilterClick = (val) => {
    setFilter(val);
    fetchFacilities(searchTerm, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={closeModal} />
      <div className="relative z-60 w-11/12 max-w-6xl h-[90vh] bg-gray-50 rounded-xl shadow-2xl flex flex-col p-6 overflow-hidden">
        <header className="flex items-center justify-between mb-4 border-b pb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Facilities Management</h2>
            <p className="text-sm text-gray-500">Define and manage all physical facilities with rates and availability</p>
          </div>
          <div className="flex gap-2">
            <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">← Back</button>
            <button onClick={openNew} className="px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700">+ Add Facility</button>
            <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-700 ml-2"><FiX size={20} /></button>
          </div>
        </header>

        <section className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Facilities" value={facilities.length} />
          <StatCard label="Active Facilities" value={facilities.filter(f => f.active).length} note="Currently available" />
          <StatCard label="Bookings This Month" value={facilities.reduce((s, f) => s + (f.bookings || 0), 0)} />
          <StatCard label="Avg. Occupancy" value={Math.round(facilities.reduce((s, f) => s + (parseInt(f.occupancy) || 0), 0) / Math.max(1, facilities.filter(f => f.active).length)) || "-"} note="Average capacity" />
        </section>

        <div className="flex items-center justify-between mb-6">
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search facilities by name or ID..."
            className="px-4 py-2 border border-gray-300 rounded-md w-96"
          />
          <div className="flex gap-2 text-sm">
            <button onClick={() => onFilterClick("all")} className={`px-4 py-1.5 rounded-md ${filter === "all" ? "bg-emerald-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}>All</button>
            <button onClick={() => onFilterClick("active")} className={`px-4 py-1.5 rounded-md ${filter === "active" ? "bg-emerald-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}>Active</button>
            <button onClick={() => onFilterClick("inactive")} className={`px-4 py-1.5 rounded-md ${filter === "inactive" ? "bg-emerald-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}>Inactive</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 overflow-y-auto pb-4">
          {loading ? (
            <div className="col-span-4 text-center text-gray-500 py-8">Loading...</div>
          ) : facilities.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 py-8">No facilities found.</div>
          ) : (
            facilities.map((f) => (
              <div key={f.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏟️</span>
                    <div className="font-bold text-gray-800">{f.name}</div>
                  </div>
                  <div className="text-xs text-gray-500">{f.code}</div>
                </div>

                <div className="flex justify-between text-xs mb-3 text-gray-600">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${f.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{f.active ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="text-right">{f.bookings || 0} bookings</div>
                </div>

                <p className="text-xs text-gray-500 mb-3 truncate">{f.description || "No description"}</p>

                {f.occupancy && (
                  <div className="text-sm font-semibold mb-2 flex justify-between items-center border-t pt-2">
                    Occupancy Limit:
                    <span className="font-normal text-gray-700">{f.occupancy}</span>
                  </div>
                )}

                {f.pricing && Object.keys(f.pricing).length > 0 && (
                  <div className="border-t pt-2 mt-auto">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Pricing</h4>
                    {f.pricing.hour && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Hour</span>
                        <span className="font-medium">{f.pricing.hour}</span>
                      </div>
                    )}
                    {f.pricing.halfDay && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Half Day</span>
                        <span className="font-medium">{f.pricing.halfDay}</span>
                      </div>
                    )}
                    {f.pricing.fullDay && (
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Full Day</span>
                        <span className="font-medium">{f.pricing.fullDay}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(f)} className="w-full py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">Edit</button>
                  <button onClick={() => handleDelete(f.id)} className="py-2 px-3 text-sm border border-gray-300 rounded-md bg-white text-red-600 hover:bg-gray-100">Delete</button>
                  <button onClick={() => handleToggleActive(f.id)} className="py-2 px-3 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 ml-auto">{f.active ? "Deactivate" : "Activate"}</button>
                </div>
              </div>
            ))
          )}
        </div>

        {isFormOpen && (
          <div className="absolute right-6 top-20 w-1/3 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-h-[80vh] overflow-y-auto z-70">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{editing ? "Edit Facility" : "Add Facility"}</h4>
              <button onClick={() => { setFormOpen(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700"><FiX /></button>
            </div>
            <form onSubmit={saveFacility} className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="text-xs text-gray-600">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" required />
              </div>
              <div>
                <label className="text-xs text-gray-600">Occupancy (number or text)</label>
                <input value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: e.target.value })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Bookings</label>
                <input type="number" value={form.bookings} onChange={(e) => setForm({ ...form, bookings: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Pricing - Hour</label>
                <input value={form.pricingHour} onChange={(e) => setForm({ ...form, pricingHour: e.target.value })} placeholder='e.g. AED 100' className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Pricing - Half Day</label>
                <input value={form.pricingHalfDay} onChange={(e) => setForm({ ...form, pricingHalfDay: e.target.value })} placeholder='e.g. AED 400' className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-xs text-gray-600">Pricing - Full Day</label>
                <input value={form.pricingFullDay} onChange={(e) => setForm({ ...form, pricingFullDay: e.target.value })} placeholder='e.g. AED 700' className="mt-1 w-full px-3 py-2 border rounded-md" />
                <div className="text-xs text-gray-400 mt-1">Fill any combination of Hour / Half Day / Full Day.</div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full px-3 py-2 border rounded-md" />
              </div>

              <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-3">
                <button type="button" onClick={() => { setFormOpen(false); setEditing(null); }} className="px-3 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-3 py-2 rounded-md bg-emerald-600 text-white">{editing ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------- Main TrainingStreams Component (API integrated) ----------------------- */

export default function TrainingStreams() {
  const [activeTab, setActiveTab] = useState("all");

  const [streams, setStreams] = useState([]);
  const [loadingStreams, setLoadingStreams] = useState(false);

  const [isFacilitiesModalOpen, setFacilitiesModalOpen] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [form, setForm] = useState({
    title: "",
    instructor: "",
    date: "",
    time: "",
    duration: "",
    status: "SCHEDULED",
    difficulty: "",
    description: "",
    visibility: "public",
    maxViewers: 100,
    record: true,
    quality: "720p",
  });
  const [errors, setErrors] = useState({});

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [settingsStreamId, setSettingsStreamId] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    visibility: "public",
    maxViewers: 100,
    record: true,
    quality: "720p",
  });

  const fetchStreams = async (search) => {
    setLoadingStreams(true);
    try {
      const data = await listStreams();
      setStreams(data || []);
    } catch (_) {
      alert("Unable to load streams. See server logs.");
    } finally {
      setLoadingStreams(false);
    }
  };

  useEffect(() => {
    fetchStreams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveStreams = useMemo(() => streams.filter(s => (s.status || "").toUpperCase() === "LIVE"), [streams]);
  const scheduled = useMemo(() => streams.filter(s => !s.status || (s.status || "").toUpperCase() !== "LIVE"), [streams]);

  const stats = useMemo(() => {
    const totalViews = streams.reduce((s, i) => s + (i.views || 0), 0);
    const totalStreams = streams.length;
    return {
      live: liveStreams.length,
      scheduled: scheduled.length,
      activeViewers: liveStreams.reduce((s, i) => s + (i.viewers || 0), 0),
      avgViews: Math.round(totalViews / Math.max(1, totalStreams)),
      totalViews,
    };
  }, [streams, liveStreams, scheduled]);

  const openCreateModal = (prefill = null) => {
    if (prefill) {
      setEditingStream(prefill);
      setForm({
        title: prefill.title || "",
        instructor: prefill.instructor || "",
        date: prefill.date || "",
        time: prefill.time || "",
        duration: prefill.duration || "",
        status: prefill.status === "LIVE" ? "LIVE" : "SCHEDULED",
        difficulty: prefill.difficulty || "",
        description: prefill.description || "",
        visibility: prefill.visibility || "public",
        maxViewers: prefill.maxViewers || 100,
        record: typeof prefill.record === "boolean" ? prefill.record : true,
        quality: prefill.quality || "720p",
      });
    } else {
      setEditingStream(null);
      setForm({
        title: "",
        instructor: "",
        date: "",
        time: "",
        duration: "",
        status: "SCHEDULED",
        difficulty: "",
        description: "",
        visibility: "public",
        maxViewers: 100,
        record: true,
        quality: "720p",
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingStream(null);
    setErrors({});
  };

  const validateForm = () => {
    const e = {};
    if (!form.title?.trim()) e.title = "Title is required";
    if (!form.instructor?.trim()) e.instructor = "Instructor is required";
    if (!form.date?.trim()) e.date = "Date is required";
    if (!form.time?.trim()) e.time = "Time is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };



  const handleCreateOrUpdateStream = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    const abbreviation = getInitials(form.instructor || "");
    const payload = {
      ...form,
      abbreviation,
      date: form.date,
    };

    try {
      if (editingStream && editingStream.id) {
        await updateStream(editingStream.id, payload);
        alert("Stream updated");
      } else {
        await createStream(payload);
        alert("Stream created");
      }
      await fetchStreams();
      closeModal();
    } catch (_) {
      alert("Save failed. See server logs.");
    }
  };

  const handleDeleteStream = async (id) => {
    if (!window.confirm("Delete this stream? This cannot be undone.")) return;
    try {
      await deleteStream(id);
      await fetchStreams();
      alert("Stream deleted");
    } catch (_) {
      alert("Delete failed. See server logs.");
    }
  };

  const handleViewStream = (id) => {
    const url = `${window.location.origin}/streams/${id}`;
    window.open(url, "_blank");
  };

  const openSettingsModal = (streamId) => {
    const s = streams.find(x => x.id === streamId);
    if (!s) return;
    setSettingsStreamId(streamId);
    setSettingsForm({
      visibility: s.visibility || "public",
      maxViewers: s.maxViewers ?? 100,
      record: typeof s.record === "boolean" ? s.record : true,
      quality: s.quality || "720p",
    });
    setSettingsOpen(true);
  };

  const closeSettingsModal = () => {
    setSettingsOpen(false);
    setSettingsStreamId(null);
  };

  const handleSaveSettings = async (ev) => {
    ev.preventDefault();
    if (settingsStreamId == null) return;
    try {
      const s = streams.find(x => x.id === settingsStreamId);
      if (!s) return;
      const payload = { ...s, ...settingsForm };
      payload.abbreviation = payload.abbreviation || getInitials(payload.instructor || "");
      await updateStream(settingsStreamId, payload);
      await fetchStreams();
      alert("Settings saved");
      closeSettingsModal();
    } catch (_) {
      alert("Save settings failed. See server logs.");
    }
  };

  const handleFacilitiesCreatedOrUpdated = (_) => {};
  const handleFacilitiesDeleted = (_) => {};
  const handleFacilitiesToggle = (_) => {};

  return (
    <div className="flex">
      

<div className="w-full p-8 bg-gray-50 min-h-screen">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Training Streams</h1>
            <p className="text-sm text-gray-500">Manage live and on-demand fitness streaming content.</p>
          </div>

          <div className="flex gap-3 items-center text-sm">
            <button onClick={() => setFacilitiesModalOpen(true)} className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">Manage Facilities</button>
            <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">Upload Recording</button>
            <button onClick={() => openCreateModal()} className="px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-md transition-colors">+ Create Stream</button>
          </div>
        </header>

        <section className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Live Streams" value={stats.live} note="Currently broadcasting" icon={FiVideo} />
          <StatCard label="Scheduled Streams" value={stats.scheduled} note="Upcoming sessions" icon={FiCalendar} />
          <StatCard label="Active Viewers" value={stats.activeViewers} note="Currently watching" icon={FiUsers} />
          <StatCard label="Avg. Views" value={stats.avgViews} note="Per stream" icon={FiEye} />
        </section>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-1 -mb-px">
            {[
              { key: "all", label: "All Streams" },
              { key: "live", label: "Live Streams" },
              { key: "scheduled", label: "Scheduled" },
              { key: "library", label: "Stream Library" },
              { key: "analytics", label: "Analytics" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 text-sm transition-colors ${activeTab === t.key ? "font-semibold text-gray-800 border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === "all" && (
            <section className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex justify-between items-center">
                Training Streams
                <span className="text-sm text-gray-500 font-normal">All Streams ⌄</span>
              </h3>

              <div className="space-y-4">
                {loadingStreams ? (
                  <div className="text-sm text-gray-500">Loading streams...</div>
                ) : (
                  <>
                    {liveStreams.map((s) => (
                      <StreamListItem key={`live-${s.id}`} stream={s} onView={handleViewStream} onEdit={openCreateModal} onSettings={openSettingsModal} />
                    ))}
                    {scheduled.map((s) => (
                      <StreamListItem key={`sch-${s.id}`} stream={s} onView={handleViewStream} onEdit={openCreateModal} onSettings={openSettingsModal} />
                    ))}
                    {streams.length === 0 && <div className="text-sm text-gray-500">No streams yet. Create one to get started.</div>}
                  </>
                )}
              </div>
            </section>
          )}

          {activeTab === "live" && (
            <section className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Live Streams Control Center</h3>
              {liveStreams.length === 0 ? <p className="text-sm text-gray-500">No live streams at the moment.</p> : liveStreams.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-red-50 border border-red-300 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <div>
                      <div className="font-semibold text-gray-800">{s.title}</div>
                      <div className="text-sm text-gray-600">{s.instructor} • <strong>{s.viewers} viewers</strong></div>
                    </div>
                  </div>

                  <div className="flex gap-3 text-sm">
                    <button onClick={() => handleViewStream(s.id)} className="px-4 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 font-medium">Monitor</button>
                    <button onClick={() => handleDeleteStream(s.id)} className="px-4 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 font-medium">End Stream</button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {activeTab === "scheduled" && (
            <section className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Scheduled Streams</h3>
              <div className="space-y-3">
                {scheduled.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs">{getInitials(s.instructor)}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{s.title}</div>
                        {s.description ? <div className="text-sm text-gray-500">{s.description}</div> : <div className="text-sm text-gray-500">{s.instructor} • <strong>{s.date}, {s.time}</strong></div>}
                      </div>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <button onClick={() => handleViewStream(s.id)} className="px-3 py-1.5 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700">Start Now</button>
                      <button onClick={() => openCreateModal(s)} className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">Edit</button>
                      <button onClick={() => openSettingsModal(s.id)} className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">Settings</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "library" && (
            <section className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Stream Library</h3>
              <div className="grid grid-cols-3 gap-6">
                <LibraryCard category="HIIT" count={12} />
                <LibraryCard category="Yoga" count={8} />
                <LibraryCard category="Strength" count={15} />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold mb-3 text-gray-800">Recent Recordings</h4>
                <div className="space-y-3">
                  <div className="p-4 border border-gray-200 rounded-md flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-white text-xl font-bold"><FiVideo size={18} /></div>
                      <div>
                        
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100">Watch</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "analytics" && (
            <section className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Stream Analytics</h3>
              <div className="grid grid-cols-3 gap-6">
                <LargeStat title="Total Streams" value={stats.live + stats.scheduled} note="All time" />
                <LargeStat title="Total Views" value={stats.totalViews} note="All streams" />
                <LargeStat title="Engagement Rate" value="73%" note="Average completion" />
              </div>

              <div className="mt-10 pt-6 text-center text-gray-400 border-t border-gray-200">
                <FiBarChart2 className="inline-block opacity-50 text-4xl mb-2" />
                <p className="text-sm mt-3">Detailed Analytics — Advanced streaming analytics and insights coming soon.</p>
              </div>
            </section>
          )}
        </div>
      </div>

      {isFacilitiesModalOpen && (
        <FacilitiesManagementModal
          closeModal={() => setFacilitiesModalOpen(false)}
          onCreateOrUpdate={handleFacilitiesCreatedOrUpdated}
          onDelete={handleFacilitiesDeleted}
          onToggleActive={handleFacilitiesToggle}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <form onSubmit={handleCreateOrUpdateStream} className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-xl p-6" onKeyDown={(e) => { if (e.key === "Escape") closeModal(); }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingStream ? "Edit Stream" : "Create Stream"}</h3>
              <button type="button" onClick={closeModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.title ? "border-red-400" : "border-gray-300"}`} />
                {errors.title && <div className="text-xs text-red-600 mt-1">{errors.title}</div>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Instructor</label>
                <input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.instructor ? "border-red-400" : "border-gray-300"}`} />
                {errors.instructor && <div className="text-xs text-red-600 mt-1">{errors.instructor}</div>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 border-gray-300">
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="LIVE">Live</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.date ? "border-red-400" : "border-gray-300"}`} />
                {errors.date && <div className="text-xs text-red-600 mt-1">{errors.date}</div>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Time</label>
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.time ? "border-red-400" : "border-gray-300"}`} />
                {errors.time && <div className="text-xs text-red-600 mt-1">{errors.time}</div>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Duration</label>
                <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 45 min" className="mt-1 block w-full rounded-md border px-3 py-2 border-gray-300" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="mt-1 block w-full rounded-md border px-3 py-2 border-gray-300">
                  <option value="">Select difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-600">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 block w-full rounded-md border px-3 py-2 border-gray-300" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md border border-gray-300 bg-white">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-emerald-600 text-white">{editingStream ? "Save Changes" : "Create Stream"}</button>
            </div>
          </form>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeSettingsModal} />
          <form onSubmit={handleSaveSettings} className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-xl p-6" onKeyDown={(e) => { if (e.key === "Escape") closeSettingsModal(); }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stream Settings</h3>
              <button type="button" onClick={closeSettingsModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Visibility</label>
                <select value={settingsForm.visibility} onChange={(e) => setSettingsForm({ ...settingsForm, visibility: e.target.value })} className="w-full rounded-md border px-3 py-2">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Viewers</label>
                <input type="number" value={settingsForm.maxViewers} onChange={(e) => setSettingsForm({ ...settingsForm, maxViewers: Number(e.target.value) })} className="w-full rounded-md border px-3 py-2" min={1} />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-gray-600">Record Stream</label>
                <div className="flex items-center gap-3 ml-auto">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={settingsForm.record === true} onChange={() => setSettingsForm({ ...settingsForm, record: true })} />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={settingsForm.record === false} onChange={() => setSettingsForm({ ...settingsForm, record: false })} />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Default Quality</label>
                <select value={settingsForm.quality} onChange={(e) => setSettingsForm({ ...settingsForm, quality: e.target.value })} className="w-full rounded-md border px-3 py-2">
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div>
                <button onClick={async (e) => { e.preventDefault(); if (settingsStreamId==null) return; if (!window.confirm("Delete this stream?")) return; await handleDeleteStream(settingsStreamId); closeSettingsModal(); }} type="button" className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete Stream</button>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={closeSettingsModal} className="px-4 py-2 rounded-md border border-gray-300 bg-white">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-emerald-600 text-white">Save Settings</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
