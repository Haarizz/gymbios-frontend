import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { HiMenu } from "react-icons/hi";
import { getStaff, deleteStaff } from "../api/staff";
import { useNavigate } from "react-router-dom";

export default function StaffListPage() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (err) {
      console.log("Error loading staff", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await deleteStaff(id);
      loadStaff();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // FILTER LOGIC
  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.firstname.toLowerCase().includes(search.toLowerCase()) ||
      s.lastname.toLowerCase().includes(search.toLowerCase()) ||
      (s.role || "").toLowerCase().includes(search.toLowerCase());

    const roleMatch = roleFilter === "All" || s.role === roleFilter;
    const branchMatch = branchFilter === "All" || s.branch === branchFilter;
    const departmentMatch =
      departmentFilter === "All" || s.department === departmentFilter;

    return matchesSearch && roleMatch && branchMatch && departmentMatch;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header row (mobile) */}
        <div className="lg:hidden p-4 bg-white mb-4 shadow flex items-center rounded">
          <HiMenu size={26} className="text-teal-700" />
          <h1 className="ml-4 text-lg font-bold">Staff Management</h1>
        </div>

        {/* PAGE TITLE */}
        <h1 className="text-2xl font-semibold mb-4">Manage Staff</h1>

        {/* TOP CARDS - MATCHES Plan UI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <p className="text-gray-500">Total Staff</p>
            <p className="text-2xl font-semibold">{staff.length}</p>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <p className="text-gray-500">Departments</p>
            <p className="text-xl font-semibold">
              {[...new Set(staff.map((s) => s.department))].length}
            </p>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <p className="text-gray-500">Branches</p>
            <p className="text-xl font-semibold">
              {[...new Set(staff.map((s) => s.branch))].length}
            </p>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <p className="text-gray-500">Roles</p>
            <p className="text-xl font-semibold">
              {[...new Set(staff.map((s) => s.role))].length}
            </p>
          </div>
        </div>

        {/* Search + Filters Row */}
        <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search staff..."
            className="border p-2 rounded w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            {[...new Set(staff.map((s) => s.role))].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All Branches</option>
            {[...new Set(staff.map((s) => s.branch))].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {[...new Set(staff.map((s) => s.department))].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* ADD STAFF BUTTON */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/add-staff")}
            className="bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700"
          >
            + Add Staff
          </button>
        </div>

        {/* STAFF TABLE - MATCHES Plan Table */}
        <div className="bg-white rounded shadow overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{s.firstname} {s.lastname}</td>
                  <td className="p-3">{s.role}</td>
                  <td className="p-3">{s.department}</td>
                  <td className="p-3">{s.branch}</td>
                  <td className="p-3">{s.phone}</td>

                  <td className="p-3 text-center flex justify-center gap-4">
                    <button
                      className="text-blue-600"
                      onClick={() => navigate(`/edit-staff/${s.id}`)}
                    >
                      ✏ Edit
                    </button>

                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(s.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    No staff found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
