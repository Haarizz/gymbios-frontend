// MembersListPage.jsx
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { getMembers, deleteMember } from "../api/member";

export default function MembersListPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const load = () => {
    getMembers()
      .then((data) => setMembers(data || []))
      .catch((err) => console.error("Failed to load members", err));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      const res = await deleteMember(id);
      if (!res.ok) {
        const txt = await res.text();
        alert("Failed to delete: " + txt);
      } else {
        load();
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  const filteredMembers = members.filter((m) =>
    (m.firstname + " " + (m.lastname || "")).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === "active").length;
  const inactiveMembers = members.filter((m) => m.status === "inactive").length;
  const expiredMembers = members.filter((m) => m.status === "expired").length;

  return (
    <div className="flex h-screen font-sans bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Members</h1>
            <p className="text-gray-600">Comprehensive member management and operations.</p>
          </div>
          <div>
            <button onClick={() => navigate("/addmembers")} className="bg-teal-700 hover:bg-teal-800 text-white py-2 px-4 rounded">
              + Add Member
            </button>
          </div>
        </div>

        {/* Summary cards (same as earlier) */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Total Members</div>
            <div className="font-bold text-2xl">{totalMembers}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-green-600">Active</div>
            <div className="font-bold text-2xl text-green-600">{activeMembers}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-600">Inactive</div>
            <div className="font-bold text-2xl">{inactiveMembers}</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-red-600">Expired</div>
            <div className="font-bold text-2xl text-red-600">{expiredMembers}</div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search members..." className="border p-2 rounded w-64" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border p-4">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="border-b bg-gray-100">
              <tr>
                <th className="p-3">Member</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Membership Type</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-semibold">
                      {(m.firstname ? m.firstname[0] : "U")}{(m.lastname ? m.lastname[0] : "")}
                    </div>
                    <div>
                      <div className="font-semibold">{m.firstname} {m.lastname}</div>
                      <div className="text-xs text-gray-400">ID: {m.memberId}</div>
                    </div>
                  </td>

                  <td className="p-3">
                    <div>{m.email}</div>
                    <div className="text-xs text-gray-400">{m.phone}</div>
                  </td>

                  <td className="p-3">{m.membership_type || "N/A"}</td>
                  <td className="p-3">{m.membership_plan || "N/A"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${m.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {m.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-3">
                      <button onClick={() => navigate(`/edit-member/${m.id}`)} className="text-blue-600">Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
