import { useState } from "react";
import { addMember } from "../api/member";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

export default function MemberPage() {
  // Format date to yyyy-mm-dd
  const toSpringDate = (value) => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split("-");
      return `${yyyy}-${mm}-${dd}`;
    }
    return value;
  };

  const generateMemberId = () => {
    const random = Math.floor(100000000 + Math.random() * 900000000);
    return `MBR-${random}`;
  };

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
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberId, setMemberId] = useState(generateMemberId());
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --------- FIXED SUBMIT FORM ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const payload = {
      firstname: form.firstname,
      lastname: form.lastname,
      gender: form.gender,
      email: form.email,
      phone: form.phone,
      nationality: form.nationality,
      birthday: toSpringDate(form.birthday),
      address: form.address,

      memberId: memberId,
      role: form.role,
      status: form.status,
      password: form.password,

      membership_type: form.membership_type,
      membership_plan: form.membership_plan,

      id_type: form.id_type,
      id_number: form.id_number,

      emergency_contact: form.emergency_contact,
      emergency_phone: form.emergency_phone,

      medicalConditions: form.medconditions || null,
      allergies: form.allergies || null,
      medications: form.currmedications || null,
      chronicIllness: form.illness || null,
      bloodType: form.bloodtype || null,
      height: form.height ? parseInt(form.height) : null,
      weight: form.weight ? parseInt(form.weight) : null,
    };

    console.log("Submitting:", payload);

    try {
      const res = await addMember(payload);  // Axios POST

      console.log("Backend Response:", res.data);

      // SUCCESS — Show message
      setMessage("Member Added Successfully!");

      // Reset form
      setForm({
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
      });

      setMemberId(generateMemberId());
    } catch (err) {
      console.error("ADD MEMBER ERROR:", err);

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Unknown error";

      setMessage("Failed to Add Member: " + errorMsg);
    }

    setIsSubmitting(false);
  };
  // ------------- UI -------------
  return (
    <div className="flex h-screen font-sans text-gray-900 bg-gray-50">
      <Sidebar />

      <main className="flex-1 max-w-3xl mx-auto bg-white rounded shadow p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">New Member</h1>

        {message && (
          <p
            className={`mb-4 p-2 rounded ${
              message.includes("Failed")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* PERSONAL INFO */}
          <section className="border rounded p-4 space-y-4">
            <h2 className="font-semibold mb-4">Personal Information</h2>

            <div className="flex gap-2">
              <input
                name="firstname"
                placeholder="First Name"
                value={form.firstname}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <input
                name="lastname"
                placeholder="Last Name"
                value={form.lastname}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />

            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="" hidden>Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <select
              name="nationality"
              value={form.nationality}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="" hidden>Select Country</option>
              <option>India</option>
              <option>USA</option>
              <option>UK</option>
            </select>

            <input
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </section>

          {/* IDENTITY */}
          <section className="border rounded p-4 space-y-4">
            <h2 className="font-semibold mb-4">Identity & Registration</h2>

            <label className="font-semibold gap-2 flex items-center">Member ID
            <input
              type="text"
              className="border rounded p-2 bg-gray-100 "
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />

            <button
              type="button"
              className="text-sm text-blue-600"
              onClick={() => setMemberId(generateMemberId())}
            >
              Change Member ID
            </button>
        </label>
            <select
              name="id_type"
              value={form.id_type}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="" hidden>Select ID Type</option>
              <option value="aadhaar">Aadhaar</option>
              <option value="driver_license">Driver's License</option>
              <option value="national_id">National ID</option>
            </select>

            <input
              name="id_number"
              placeholder="ID Number"
              value={form.id_number}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </section>

          {/* MEMBERSHIP TYPE */}
          <section className="border rounded p-4">
            <h2 className="font-semibold mb-4">Membership Type</h2>
            <div className="flex gap-4">
              {["individual", "family", "corporate"].map((type) => (
                <label
                  key={type}
                  className={`flex-1 p-4 border rounded cursor-pointer ${
                    form.membership_type === type
                      ? "bg-blue-100 border-blue-600"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="membership_type"
                    value={type}
                    checked={form.membership_type === type}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="text-center capitalize">{type}</div>
                </label>
              ))}
            </div>
          </section>

          {/* MEMBERSHIP PLAN */}
          <section className="border rounded p-4 space-y-4">
            <h2 className="font-semibold mb-4">Membership Plan</h2>

            {[ 
              { value: "premiumAnnual", label: "Premium Annual", price: "1,200 AED" },
              { value: "standardMonthly", label: "Standard Monthly", price: "299 AED" },
              { value: "basicMonthly", label: "Basic Monthly", price: "149 AED" },
              { value: "studentSpecial", label: "Student Special", price: "99 AED" },
            ].map((plan) => (
              <label
                key={plan.value}
                className={`block border rounded p-4 cursor-pointer ${
                  form.membership_plan === plan.value
                    ? "shadow-lg border-blue-600"
                    : "border-gray-300 hover:shadow-md"
                }`}
              >
                <input
                  type="radio"
                  name="membership_plan"
                  value={plan.value}
                  checked={form.membership_plan === plan.value}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.label}</h3>
                    <p className="text-sm text-gray-600">Click to select</p>
                  </div>
                  <div className="text-xl font-bold">{plan.price}</div>
                </div>
              </label>
            ))}
          </section>

          {/* HEALTH INFORMATION */}
          <section className="border rounded p-4 space-y-4">
            <h2 className="font-semibold mb-4">Health Information</h2>

            <input
              name="medconditions"
              placeholder="Medical Conditions (optional)"
              value={form.medconditions}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              name="currmedications"
              placeholder="Current Medications (optional)"
              value={form.currmedications}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <select
              name="bloodtype"
              value={form.bloodtype}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="" hidden>Select Blood Type</option>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option>
              <option>AB+</option><option>AB-</option>
            </select>

            <input
              name="allergies"
              placeholder="Allergies (optional)"
              value={form.allergies}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              name="illness"
              placeholder="Chronic Illness (optional)"
              value={form.illness}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <div className="flex gap-2">
              <input
                name="height"
                placeholder="Height (cm)"
                value={form.height}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input
                name="weight"
                placeholder="Weight (kg)"
                value={form.weight}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          </section>

          {/* EMERGENCY */}
          <section className="border rounded p-4 bg-red-50 border-red-400">
            <h2 className="font-semibold mb-2 text-red-700">
              Emergency Contact Information
            </h2>

            <input
              name="emergency_contact"
              placeholder="Emergency Contact Name"
              value={form.emergency_contact}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-2"
            />

            <input
              name="emergency_phone"
              placeholder="Emergency Contact Phone"
              value={form.emergency_phone}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </section>
            <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => navigate("/members")}
              className="px-6 py-2 border rounded bg-white hover:bg-gray-50"
            >
              Cancel
            </button>

            <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Save Member
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
