import { useState } from "react";
import { addMember } from "../api/member";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Assuming react-hot-toast for notifications

// Icon placeholder
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const HealthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16M4 12h16m-7-5a3 3 0 013 3v4a3 3 0 01-3 3h-2a3 3 0 01-3-3v-4a3 3 0 013-3h2z" />
  </svg>
);
const MembershipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 116 0M10 20h4M12 4v4m-6 4H4m16 0h-2M18 10h2M4 10H2" />
  </svg>
);


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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberId, setMemberId] = useState(generateMemberId());
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --------- FIXED SUBMIT FORM ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
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
      password: form.password, // IMPORTANT: Ensure this is securely handled on the backend

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
      // Assuming addMember is an Axios POST call and returns a response object
      const res = await addMember(payload); 
      
      console.log("Backend Response:", res.data);

      // SUCCESS — Show message
      toast.success("Member Added Successfully!");

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
      
      // Navigate to the list page on success
      navigate("/members");

    } catch (err) {
      console.error("ADD MEMBER ERROR:", err);

      const errorMsg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Unknown error";

      toast.error("Failed to Add Member: " + errorMsg);
    }

    setIsSubmitting(false);
  };
  
  // Custom Input Component for consistent styling
  const FormInput = ({ label, name, type = "text", placeholder, required = false, className = "", ...props }) => (
    <div className="flex flex-col space-y-1">
        {label && <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>}
        <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            className={`border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ${className}`}
            {...props}
        />
    </div>
  );

  // Custom Select Component for consistent styling
  const FormSelect = ({ label, name, children, required = false, className = "", ...props }) => (
    <div className="flex flex-col space-y-1">
        {label && <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>}
        <select
            id={name}
            name={name}
            required={required}
            className={`border border-gray-300 p-3 rounded-lg w-full bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ${className}`}
            {...props}
        >
            {children}
        </select>
    </div>
  );

  // ------------- UI -------------
  return (
    
     

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Register New Member
          </h1>
          <p className="text-gray-500 mb-8 border-b pb-4">
            Fill out the details below to enroll a new user into the system.
          </p>

          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* PERSONAL INFO */}
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-teal-700 border-b pb-2 mb-4 flex items-center">
                <PlusIcon /> Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  name="firstname"
                  placeholder="John"
                  value={form.firstname}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Last Name"
                  name="lastname"
                  placeholder="Doe"
                  value={form.lastname}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="john.doe@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Phone Number"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
                <FormSelect
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="" hidden>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </FormSelect>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSelect
                  label="Nationality"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                >
                  <option value="" hidden>Select Country</option>
                  <option>India</option>
                  <option>USA</option>
                  <option>UK</option>
                </FormSelect>
                <FormInput
                  label="Date of Birth"
                  type="date"
                  name="birthday"
                  value={form.birthday}
                  onChange={handleChange}
                />
                 <FormInput
                  label="Account Password"
                  type="password"
                  name="password"
                  placeholder="********"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <FormInput
                label="Residential Address"
                name="address"
                placeholder="123 Gym Street, City, State, ZIP"
                value={form.address}
                onChange={handleChange}
              />
            </section>

            {/* IDENTITY */}
            <section className="space-y-6 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-teal-700 border-b pb-2 mb-4 flex items-center">
                <MembershipIcon /> Identity & Registration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                    <label className="text-sm font-medium text-gray-700">Member ID</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            className="border border-gray-300 rounded-lg p-3 bg-gray-50 flex-1 font-mono text-sm"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            readOnly // Member ID is usually system-generated
                        />
                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                            onClick={() => setMemberId(generateMemberId())}
                        >
                            Generate New ID
                        </button>
                    </div>
                </div>
                <FormSelect
                    label="ID Type"
                    name="id_type"
                    value={form.id_type}
                    onChange={handleChange}
                >
                    <option value="" hidden>Select ID Type</option>
                    <option value="aadhaar">Aadhaar</option>
                    <option value="driver_license">Driver's License</option>
                    <option value="national_id">National ID</option>
                </FormSelect>
              </div>

              <FormInput
                label="ID Number"
                name="id_number"
                placeholder="Enter ID Document Number"
                value={form.id_number}
                onChange={handleChange}
              />
            </section>

            {/* MEMBERSHIP TYPE */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-teal-700 border-b pb-2 mb-4">
                Membership Type Selection
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["individual", "family", "corporate"].map((type) => (
                  <label
                    key={type}
                    className={`block p-4 border-2 rounded-xl cursor-pointer transition duration-300 shadow-md ${
                      form.membership_type === type
                        ? "bg-teal-50 border-teal-500 ring-4 ring-teal-200"
                        : "border-gray-200 hover:border-teal-400 hover:shadow-lg"
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
                    <div className="text-center">
                        <span className="text-2xl">{type === 'family' ? '👨‍👩‍👧' : type === 'corporate' ? '🏢' : '👤'}</span>
                        <h3 className="font-bold capitalize text-lg mt-1 text-gray-800">{type}</h3>
                        <p className="text-sm text-gray-500">Membership</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* MEMBERSHIP PLAN */}
            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-teal-700 border-b pb-2 mb-4">
                Subscription Plan Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[ 
                  { value: "premiumAnnual", label: "Premium Annual", price: "1,200 AED", features: "Full access, 1 year commitment" },
                  { value: "standardMonthly", label: "Standard Monthly", price: "299 AED", features: "Full access, monthly billing" },
                  { value: "basicMonthly", label: "Basic Monthly", price: "149 AED", features: "Limited access, monthly billing" },
                  { value: "studentSpecial", label: "Student Special", price: "99 AED", features: "Requires valid student ID" },
                ].map((plan) => (
                  <label
                    key={plan.value}
                    className={`block border-2 rounded-xl p-5 cursor-pointer transition duration-300 ${
                      form.membership_plan === plan.value
                        ? "shadow-xl border-teal-500 bg-teal-50 ring-4 ring-teal-200"
                        : "border-gray-200 hover:shadow-md hover:border-teal-400"
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
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-lg text-gray-900">{plan.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{plan.features}</p>
                      </div>
                      <div className="text-2xl font-bold text-teal-600">{plan.price}</div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* HEALTH INFORMATION */}
            <section className="space-y-6 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-teal-700 border-b pb-2 mb-4 flex items-center">
                <HealthIcon /> Health & Fitness Profile (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Height (cm)"
                  name="height"
                  type="number"
                  placeholder="e.g., 175"
                  value={form.height}
                  onChange={handleChange}
                />
                <FormInput
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  placeholder="e.g., 75"
                  value={form.weight}
                  onChange={handleChange}
                />
              </div>
              
              <FormSelect
                label="Blood Type"
                name="bloodtype"
                value={form.bloodtype}
                onChange={handleChange}
              >
                <option value="" hidden>Select Blood Type (Optional)</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </FormSelect>

              <FormInput
                label="Medical Conditions"
                name="medconditions"
                placeholder="Chronic conditions, past surgeries, etc."
                value={form.medconditions}
                onChange={handleChange}
              />

              <FormInput
                label="Allergies"
                name="allergies"
                placeholder="Food, drug, environmental allergies"
                value={form.allergies}
                onChange={handleChange}
              />
              
              <FormInput
                label="Current Medications"
                name="currmedications"
                placeholder="Any regular medications being taken"
                value={form.currmedications}
                onChange={handleChange}
              />
              
            </section>

            {/* EMERGENCY */}
            <section className="p-6 bg-red-50 border border-red-300 rounded-xl space-y-4 shadow-inner">
              <h2 className="font-extrabold mb-2 text-red-700 text-lg">
                🚨 Emergency Contact Information (Mandatory)
              </h2>

              <FormInput
                label="Contact Name"
                name="emergency_contact"
                placeholder="Full Name of Emergency Contact"
                value={form.emergency_contact}
                onChange={handleChange}
              />

              <FormInput
                label="Contact Phone"
                name="emergency_phone"
                placeholder="Phone number of Emergency Contact"
                value={form.emergency_phone}
                onChange={handleChange}
              />
            </section>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-4 border-t pt-6">
              <button
                type="button"
                onClick={() => navigate("/members")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold bg-white hover:bg-gray-50 transition duration-150 shadow-sm"
              >
                Cancel
              </button>

              <button 
                type="submit"
                className="px-8 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition duration-150 shadow-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Member...' : 'Register Member'}
              </button>
            </div>

          </form>
        </div>
      </main>
   
  );
}