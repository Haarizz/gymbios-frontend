import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { HiMenu } from "react-icons/hi";
import { getPlan, updatePlan } from "../api/plans";


const TRAINING_STREAMS = [
  { name: "Strength Training", category: "Fitness", id: "strengthTraining" },
  { name: "Cardio & HIIT", category: "Fitness", id: "cardioHiiT" },
  { name: "Yoga & Mindfulness", category: "Wellness", id: "yogaMindfulness" },
  { name: "Pilates", category: "Wellness", id: "pilates" },
  { name: "Group Classes", category: "Classes", id: "groupClasses" },
  { name: "Personal Training", category: "Training", id: "personalTraining" },
  { name: "Aqua Fitness", category: "Classes", id: "aquaFitness" },
  { name: "CrossFit", category: "Fitness", id: "crossfit" },
  { name: "Martial Arts", category: "Training", id: "martialArts" },
  { name: "Senior Fitness", category: "Specialized", id: "seniorFitness" },
];

const FACILITIES = [
  { name: "Basketball Court", icon: "🏀", status: "Active", id: "basketballCourt" },
  { name: "Swimming Pool", icon: "🏊‍♂️", status: "Active", id: "swimmingPool" },
  { name: "Padel Court", icon: "🎾", status: "Active", id: "padelCourt" },
  { name: "Football Ground", icon: "⚽", status: "Active", id: "footballGround" },
];

export default function EditPlanPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Membership",
    type: "Individual",
    durationType: "Monthly",
    duration: "",
    price: "",
    
    maxSessions: "",
    trainers: "",
    description: "",
    status: "Active",
    attendanceLimit: "Unlimited",
    maxMembers: "",
    attendancePer: "Payment",
    membershipCapacity: "Unlimited",
    accessTraining: TRAINING_STREAMS.reduce((acc, cur) => {
      acc[cur.id] = false;
      return acc;
    }, {}),
    accessFacilities: FACILITIES.reduce((acc, cur) => {
      acc[cur.id] = false;
      return acc;
    }, {}),
  });

  // Load plan from backend on mount
  useEffect(() => {
    setIsLoading(true);
    setError("");
    getPlan(planId)
      .then((data) => {
        setForm({
          name: data.name || "",
          category: data.category || "Membership",
          type: data.type || "Individual",
          durationType: data.durationType || "Monthly",
          durationValue: data.durationValue?.toString() || "",
          price: data.price?.toString() || "",
          discount: data.discount?.toString() || "",
          maxSessions: data.maxSessions?.toString() || "",
          trainers: data.trainers || "",
          description: data.description || "",
          status: data.status || "Active",
          attendanceLimit: data.attendanceLimit || "Unlimited",
          maxMembers: data.maxMembers?.toString() || "",
          attendancePer: data.attendancePer || "Payment",
          membershipCapacity: data.membershipCapacity || "Unlimited",
          accessTraining: TRAINING_STREAMS.reduce((acc, stream) => {
            acc[stream.id] = data.accessTraining?.includes(stream.name) || false;
            return acc;
          }, {}),
          accessFacilities: FACILITIES.reduce((acc, fac) => {
            acc[fac.id] = data.accessFacilities?.includes(fac.name) || false;
            return acc;
          }, {}),
        });
      })
      .catch((err) => {
        setError("Failed to load plan details: " + err.message);
      })
      .finally(() => setIsLoading(false));
  }, [planId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const toggleTrainingStream = (id) => {
    setForm((s) => ({
      ...s,
      accessTraining: { ...s.accessTraining, [id]: !s.accessTraining[id] },
    }));
  };

  const toggleFacility = (id) => {
    setForm((s) => ({
      ...s,
      accessFacilities: { ...s.accessFacilities, [id]: !s.accessFacilities[id] },
    }));
  };

  const selectAllTraining = () => {
    const allSelected = {};
    TRAINING_STREAMS.forEach((s) => (allSelected[s.id] = true));
    setForm((s) => ({ ...s, accessTraining: allSelected }));
  };

  const deselectAllTraining = () => {
    const noneSelected = {};
    TRAINING_STREAMS.forEach((s) => (noneSelected[s.id] = false));
    setForm((s) => ({ ...s, accessTraining: noneSelected }));
  };

  const selectAllFacilities = () => {
    const allSelected = {};
    FACILITIES.forEach((f) => (allSelected[f.id] = true));
    setForm((s) => ({ ...s, accessFacilities: allSelected }));
  };

  const deselectAllFacilities = () => {
    const noneSelected = {};
    FACILITIES.forEach((f) => (noneSelected[f.id] = false));
    setForm((s) => ({ ...s, accessFacilities: noneSelected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price || !form.durationValue) {
      setError("Please provide plan name, price, and duration.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        category: form.category,
        type: form.type,
        durationType:form.durationType , 
        durationValue:parseInt( form.durationValue) || 0,
        price: parseFloat(form.price) || 0,
        discount: parseInt(form.discount) || 0,
        maxSessions: form.maxSessions ? parseInt(form.maxSessions) : null,
        trainers: form.trainers,
        description: form.description,
        status: form.status,
        attendanceLimit: form.attendanceLimit,
        maxMembers: form.maxMembers ? parseInt(form.maxMembers) : 0,
        attendancePer: form.attendancePer,
        membershipCapacity: form.membershipCapacity,
        accessTraining: Object.entries(form.accessTraining)
          .filter(([_, val]) => val)
          .map(([key]) => TRAINING_STREAMS.find((s) => s.id === key)?.name)
          .filter(Boolean),
        accessFacilities: Object.entries(form.accessFacilities)
          .filter(([_, val]) => val)
          .map(([key]) => FACILITIES.find((f) => f.id === key)?.name)
          .filter(Boolean),
      };

      const res = await updatePlan(planId, payload);
      if (!res.ok && res.status !== 200) {
        const txt = await res.text();
        setError("Failed to update plan: " + txt);
      } else {
        navigate("/plans");
      }
    } catch (err) {
      setError("Network or server error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-teal-700 font-semibold">
        Loading plan details...
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto">
        {/* Mobile header */}
        <div className="lg:hidden p-4 bg-white shadow flex items-center mb-6 rounded">
          <HiMenu
            size={26}
            className="text-teal-700 cursor-pointer"
            onClick={() => setSidebarOpen(true)}
          />
          <h1 className="ml-4 font-bold text-lg">Edit Plan</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">Edit Plan</h2>
            <p className="text-gray-600">Update membership plan details below.</p>
          </div>

          {/* Basic info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="name">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Premium Monthly"
                required
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="category">
                Plan Type <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option>Membership</option>
                <option>Personal Training</option>
                <option>Package</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="type">
                Membership Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option>Individual</option>
                <option>Family</option>
                <option>Corporate</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="durationType">
                Duration Type <span className="text-red-500">*</span>
              </label>
              <select
                id="durationType"
                name="durationType"
                value={form.durationType}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              >
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Yearly</option>
                <option>Single Session</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="durationValue">
                Duration Value <span className="text-red-500">*</span>
              </label>
              <input
                id="durationValue"
                name="durationValue"
                value={form.durationValue}
                onChange={handleChange}
                placeholder="e.g., 1, 3, 12"
                required
                type="number"
                min="1"
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="price">
                Price (AED) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g., 49.99"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="discount">
                Discount (%)
              </label>
              <input
                id="discount"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                placeholder="e.g., 15"
                type="number"
                min="0"
                max="100"
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="maxSessions">
                Max Number of Sessions (optional)
              </label>
              <input
                id="maxSessions"
                name="maxSessions"
                value={form.maxSessions}
                onChange={handleChange}
                placeholder="e.g., 8 for personal training packages"
                type="number"
                min="0"
                className="w-full border rounded p-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1 font-medium text-sm" htmlFor="trainers">
                Assignable Trainers (optional)
              </label>
              <input
                id="trainers"
                name="trainers"
                value={form.trainers}
                onChange={handleChange}
                placeholder="John Smith, Sarah Wilson (comma-separated)"
                className="w-full border rounded p-2"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1 font-medium text-sm" htmlFor="description">
                Description / Notes
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what this plan includes..."
                rows={4}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          {/* Access to Training Section */}
          <section className="p-4 border rounded bg-gray-50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-teal-700 font-semibold text-lg flex items-center gap-1">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
                Access To Training
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Set program and class access for the membership.
            </p>

            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-4">
                <label className="block text-xs font-bold mb-1">
                  HOW MANY TIMES CAN A MEMBER ATTEND?
                </label>
                <select
                  name="attendanceLimit"
                  value={form.attendanceLimit}
                  onChange={handleChange}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option>Unlimited</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>5</option>
                  <option>10</option>
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-xs font-bold mb-1">&nbsp;</label>
                <input
                  type="number"
                  min="0"
                  name="maxMembers"
                  value={form.maxMembers}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  className="border rounded p-2 w-full text-sm"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-xs font-bold mb-1">per</label>
                <select
                  name="attendancePer"
                  value={form.attendancePer}
                  onChange={handleChange}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option>Day</option>
                  <option>Week</option>
                  <option>Month</option>
                  <option>Payment</option>
                </select>
              </div>

              <div className="col-span-4">
                <label className="block text-xs font-bold mb-1">MEMBERSHIP CAPACITY</label>
                <select
                  name="membershipCapacity"
                  value={form.membershipCapacity}
                  onChange={handleChange}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option>Unlimited</option>
                  <option>Limited</option>
                </select>
              </div>

              <div className="col-span-8">
                <label
                  className="inline-flex items-center gap-2 text-xs font-semibold mb-1 opacity-70 cursor-default"
                  title="Maximum number of members allowed for this membership."
                >
                  Members max capacity
                  <span className="ml-1 text-gray-400">?</span>
                </label>
                {form.membershipCapacity === "Unlimited" ? (
                  <div className="text-sm text-gray-500">No limit</div>
                ) : (
                  <input
                    type="number"
                    min="0"
                    name="maxMembers"
                    value={form.maxMembers}
                    onChange={handleChange}
                    placeholder="Enter max members"
                    className="border rounded p-2 w-full text-sm"
                  />
                )}
              </div>

              {/* Training streams multiselect */}
              <div className="col-span-12">
                <div className="flex justify-between mb-2">
                  <label className="font-semibold text-sm">Select Training Streams</label>
                  <div className="space-x-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllTraining}
                      className="text-teal-600 hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllTraining}
                      className="text-teal-600 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {TRAINING_STREAMS.map((stream) => (
                    <label
                      key={stream.id}
                      className="flex items-center gap-2 cursor-pointer bg-white border rounded p-2 text-sm select-none"
                    >
                      <input
                        type="checkbox"
                        checked={form.accessTraining[stream.id]}
                        onChange={() => toggleTrainingStream(stream.id)}
                      />
                      <span>{stream.name}</span>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700 whitespace-nowrap">
                        {stream.category}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-gray-600 text-xs">
                  {Object.values(form.accessTraining).filter(Boolean).length} of{" "}
                  {TRAINING_STREAMS.length} training streams selected
                </p>
              </div>
            </div>
          </section>

          {/* Access to Facilities Section */}
          <section className="p-4 border rounded bg-gray-50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-teal-700 font-semibold text-lg flex items-center gap-1">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 6h18M3 14h18" />
                </svg>
                Access to Facilities
              </div>
            </div>
            <p className="text-gray-700 text-sm">
              Select which facilities members with this plan can access (only active
              facilities are shown).
            </p>

            <div className="flex items-center justify-between mb-2">
              <div>
                <button
                  type="button"
                  onClick={selectAllFacilities}
                  className="text-teal-600 hover:underline text-xs mr-2"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAllFacilities}
                  className="text-teal-600 hover:underline text-xs"
                >
                  Deselect All
                </button>
              </div>
              <div className="text-xs text-gray-600">
                {Object.values(form.accessFacilities).filter(Boolean).length} of{" "}
                {FACILITIES.length} selected
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FACILITIES.map((facility) => (
                <label
                  key={facility.id}
                  className="flex items-center gap-2 cursor-pointer border rounded p-2 bg-white text-sm select-none"
                >
                  <input
                    type="checkbox"
                    checked={form.accessFacilities[facility.id]}
                    onChange={() => toggleFacility(facility.id)}
                  />
                  <span className="text-xl">{facility.icon}</span>
                  <span>{facility.name}</span>
                  <span className="ml-auto inline-block px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                    {facility.status}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/plans")}
              className="px-6 py-2 border rounded bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Update Plan"}
            </button>
          </div>

          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  );
}
