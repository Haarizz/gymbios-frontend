import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getSingleStaff, updateStaff } from "../api/staff";
import { useNavigate, useParams } from "react-router-dom";

export default function EditStaffPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await getSingleStaff(id);
      setForm(data);
      setLoading(false);
    } catch {
      alert("Failed to fetch staff details");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    await updateStaff(id, payload);
    navigate("/staff");
} catch (err) {
    setError("Failed to update staff: " + (err.response?.data || err.message));
}

  };

  if (loading || !form) return <div className="p-6">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Edit Staff Member</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-6"
        >
          {/* BASIC INFO */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-teal-700">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name
                </label>
                <input
                  name="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee ID
                </label>
                <input
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
          </div>

          {/* JOB DETAILS */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-teal-700">
              Job Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Role</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Manager">Manager</option>
                  <option value="Reception">Reception</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Department</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Sales">Sales</option>
                  <option value="Admin">Admin</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <select
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                >
                  <option value="">Select Branch</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                </select>
              </div>
            </div>
          </div>

          {/* TARGETS */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-teal-700">
              Performance Targets
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Monthly Target
                </label>
                <input
                  name="monthlyTarget"
                  value={form.monthlyTarget}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  type="number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Target
                </label>
                <input
                  name="target"
                  value={form.target}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  type="number"
                />
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-teal-700">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  type="email"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded p-2"
                rows={3}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => navigate("/staff")}
              className="px-6 py-2 bg-white border rounded hover:bg-gray-50"
            >
              Cancel
            </button>

            <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Update Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
