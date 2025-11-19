// EditMemberPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { HiMenu } from "react-icons/hi";
import { getMember, updateMember } from "../api/member";

const toSpringDate = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [dd, mm, yyyy] = value.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  return value;
};

export default function EditMemberPage() {
  const { id } = useParams(); // member ID from route
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    email: "",
    phone: "",
    nationality: "",
    birthday: "",
    address: "",
    password: "",
    role: "member",
    status: "active",
    membership_type: "individual",
    membership_plan: "standardMonthly",
    id_type: "",
    id_number: "",
    medconditions: "",
    currmedications: "",
    bloodtype: "",
    allergies: "",
    illness: "",
    height: "",
    weight: "",
    emergency_contact: "",
    emergency_phone: "",
    memberId: "",
  });

  useEffect(() => {
    setIsLoading(true);
    getMember(id)
      .then((data) => {
        // Map backend fields to form shape
        setForm({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          gender: data.gender || "",
          email: data.email || "",
          phone: data.phone || "",
          nationality: data.nationality || "",
          birthday: toSpringDate(data.birthday) || "",
          address: data.address || "",
          password: "", // do not prefill password
          role: data.role || "member",
          status: data.status || "active",
          membership_type: data.membership_type || "individual",
          membership_plan: data.membership_plan || "standardMonthly",
          id_type: data.id_type || "",
          id_number: data.id_number || "",
          medconditions: data.medicalConditions || "",
          currmedications: data.medications || "",
          bloodtype: data.bloodType || "",
          allergies: data.allergies || "",
          illness: data.chronicIllness || "",
          height: data.height ? String(data.height) : "",
          weight: data.weight ? String(data.weight) : "",
          emergency_contact: data.emergency_contact || "",
          emergency_phone: data.emergency_phone || "",
          memberId: data.memberId || "",
        });
      })
      .catch((err) => {
        setError("Failed to load member: " + err.message);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    // Build payload matching backend
    const payload = {
      firstname: form.firstname,
      lastname: form.lastname,
      gender: form.gender,
      email: form.email,
      phone: form.phone,
      nationality: form.nationality,
      birthday: toSpringDate(form.birthday) || null,
      address: form.address,
      memberId: form.memberId,
      role: form.role,
      status: form.status,
      // only send password if set (optional)
      ...(form.password ? { password: form.password } : {}),

      membership_type: form.membership_type,
      membership_plan: form.membership_plan,
      id_type: form.id_type,
      id_number: form.id_number,

      medicalConditions: form.medconditions || null,
      allergies: form.allergies || null,
      medications: form.currmedications || null,
      chronicIllness: form.illness || null,
      bloodType: form.bloodtype || null,
      height: form.height ? parseInt(form.height) : null,
      weight: form.weight ? parseInt(form.weight) : null,

      emergency_contact: form.emergency_contact || null,
      emergency_phone: form.emergency_phone || null,
    };

    try {
    const res = await updateMember(id, payload);

    // SUCCESS
    setMessage("Member updated successfully.");

    setTimeout(() => navigate("/members"), 700);

} catch (err) {
    console.error("Update Member Error:", err);

    const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Unknown error";

    setError("Failed to update member: " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-teal-700 font-semibold">
        Loading member...
      </div>
    );

  return (
    <div className="flex h-screen font-sans bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

      <main className="flex-1 max-w-3xl mx-auto bg-white rounded shadow p-6 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Edit Member</h1>
        </div>

        {message && <div className="p-2 bg-green-100 text-green-700 rounded mb-4">{message}</div>}
        {error && <div className="p-2 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal info */}
          <section className="border rounded p-4 space-y-4">
            <h2 className="font-semibold">Personal Information</h2>
            <div className="flex gap-2">
              <input name="firstname" placeholder="First name" value={form.firstname} onChange={handleChange} required className="border p-2 rounded w-full" />
              <input name="lastname" placeholder="Last name" value={form.lastname} onChange={handleChange} required className="border p-2 rounded w-full" />
            </div>

            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border p-2 rounded w-full" />

            <select name="gender" value={form.gender} onChange={handleChange} className="border p-2 rounded w-full">
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="border p-2 rounded w-full" />
            <input name="nationality" placeholder="Nationality" value={form.nationality} onChange={handleChange} className="border p-2 rounded w-full" />
            <input type="date" name="birthday" value={form.birthday} onChange={handleChange} className="border p-2 rounded w-full" />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="border p-2 rounded w-full" />
          </section>

          {/* Identity */}
          <section className="border rounded p-4 space-y-4">
            <h2 className="font-semibold">Identity & Registration</h2>
            <div className="flex items-center gap-2">
              <input name="memberId" placeholder="Member ID" value={form.memberId} onChange={handleChange} className="border p-2 rounded w-full bg-gray-50" />
            </div>
            <select name="id_type" value={form.id_type} onChange={handleChange} className="border p-2 rounded w-full">
              <option value="">Select ID Type</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="driver_license">Driver's License</option>
              <option value="national_id">National ID</option>
            </select>
            <input name="id_number" placeholder="ID number" value={form.id_number} onChange={handleChange} className="border p-2 rounded w-full" />
          </section>

          {/* Membership */}
          <section className="border rounded p-4">
            <h2 className="font-semibold">Membership</h2>
            <div className="flex gap-3">
              {["individual", "family", "corporate"].map((t) => (
                <label key={t} className={`flex-1 p-3 border rounded cursor-pointer ${form.membership_type === t ? "bg-blue-50 border-blue-400" : "border-gray-200"}`}>
                  <input type="radio" name="membership_type" value={t} checked={form.membership_type === t} onChange={handleChange} className="hidden" />
                  <div className="capitalize text-center">{t}</div>
                </label>
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-sm mb-1">Plan</label>
              <select name="membership_plan" value={form.membership_plan} onChange={handleChange} className="border p-2 rounded w-full">
                <option value="premiumAnnual">Premium Annual</option>
                <option value="standardMonthly">Standard Monthly</option>
                <option value="basicMonthly">Basic Monthly</option>
                <option value="studentSpecial">Student Special</option>
              </select>
            </div>
          </section>

          {/* Health */}
          <section className="border rounded p-4 space-y-3">
            <h2 className="font-semibold">Health</h2>
            <input name="medconditions" placeholder="Medical Conditions" value={form.medconditions} onChange={handleChange} className="border p-2 rounded w-full" />
            <input name="currmedications" placeholder="Current Medications" value={form.currmedications} onChange={handleChange} className="border p-2 rounded w-full" />
            <select name="bloodtype" value={form.bloodtype} onChange={handleChange} className="border p-2 rounded w-full">
              <option value="">Select blood type</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
            </select>
            <input name="allergies" placeholder="Allergies" value={form.allergies} onChange={handleChange} className="border p-2 rounded w-full" />
            <div className="flex gap-2">
              <input name="height" placeholder="Height (cm)" value={form.height} onChange={handleChange} className="border p-2 rounded w-full" />
              <input name="weight" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} className="border p-2 rounded w-full" />
            </div>
          </section>

          {/* Emergency */}
          <section className="border rounded p-4">
            <h2 className="font-semibold">Emergency Contact</h2>
            <input name="emergency_contact" placeholder="Contact name" value={form.emergency_contact} onChange={handleChange} className="border p-2 rounded w-full" />
            <input name="emergency_phone" placeholder="Phone" value={form.emergency_phone} onChange={handleChange} className="border p-2 rounded w-full mt-2" />
          </section>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => navigate("/members")} className="px-4 py-2 border rounded bg-white">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-green-600 text-white">
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
