// MembersListPage.jsx
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { getMembers, deleteMember } from "../api/member";
import toast from "react-hot-toast"; // Assuming react-hot-toast for notifications

// --- Icon components (Placeholder for libraries like Heroicons) ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function MembersListPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const load = () => {
    getMembers()
      .then((data) => setMembers(data || []))
      .catch((err) => {
        console.error("Failed to load members", err);
        toast.error("Failed to load members data.");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this member?")) return;
    try {
      const res = await deleteMember(id);
      
      // Assuming deleteMember returns a response object with a standard `ok` property.
      if (res && res.ok) {
        toast.success("Member deleted successfully!");
        load();
      } else {
        // Handle API error response if not successful
        const errorText = res ? (await res.text()).substring(0, 100) : "Unknown error";
        toast.error(`Failed to delete: ${errorText}`);
      }
    } catch (err) {
      console.error("Deletion network error:", err);
      toast.error("Network error during deletion.");
    }
  };

  const filteredMembers = members.filter((m) =>
    (m.firstname + " " + (m.lastname || "")).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.memberId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status && m.status.toLowerCase() === "active").length;
  const inactiveMembers = members.filter((m) => m.status && m.status.toLowerCase() === "inactive").length;
  const expiredMembers = members.filter((m) => m.status && m.status.toLowerCase() === "expired").length;

  // Function to determine badge style based on status
  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'unknown';
    switch (s) {
      case 'active':
        return 'bg-green-100 text-green-700 font-medium';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-700 font-medium';
      case 'expired':
        return 'bg-red-100 text-red-700 font-medium';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };
  
  // Function to determine card style based on type
  const getCardStyle = (type) => {
      switch (type) {
        case 'total':
          return 'border-blue-400 shadow-lg hover:shadow-xl transition duration-300';
        case 'active':
          return 'border-green-400 shadow-lg hover:shadow-xl transition duration-300';
        case 'inactive':
          return 'border-yellow-400 shadow-lg hover:shadow-xl transition duration-300';
        case 'expired':
          return 'border-red-400 shadow-lg hover:shadow-xl transition duration-300';
        default:
          return 'border-gray-300 shadow-lg hover:shadow-xl transition duration-300';
      }
  };


  return (
 
      
      <div className={`flex-1 overflow-auto p-6 md:p-10 transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="mb-8 flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center">
                <UserIcon className="h-7 w-7 mr-2 text-teal-600"/> Member Directory
            </h1>
            <p className="text-gray-500">Manage and oversee all registered members and their statuses.</p>
          </div>
          <div>
            <button 
              onClick={() => navigate("/addmembers")} 
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-300"
            >
              + Add New Member
            </button>
          </div>
        </div>

        {/* Summary cards (Enhanced Styling) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`bg-white rounded-xl border-l-4 p-5 ${getCardStyle('total')}`}>
            <div className="text-sm font-medium text-gray-600">Total Members</div>
            <div className="font-extrabold text-3xl mt-1 text-gray-900">{totalMembers}</div>
          </div>
          <div className={`bg-white rounded-xl border-l-4 p-5 ${getCardStyle('active')}`}>
            <div className="text-sm font-medium text-green-600">Active Members</div>
            <div className="font-extrabold text-3xl mt-1 text-green-600">{activeMembers}</div>
          </div>
          <div className={`bg-white rounded-xl border-l-4 p-5 ${getCardStyle('inactive')}`}>
            <div className="text-sm font-medium text-yellow-600">Inactive</div>
            <div className="font-extrabold text-3xl mt-1 text-yellow-600">{inactiveMembers}</div>
          </div>
          <div className={`bg-white rounded-xl border-l-4 p-5 ${getCardStyle('expired')}`}>
            <div className="text-sm font-medium text-red-600">Expired</div>
            <div className="font-extrabold text-3xl mt-1 text-red-600">{expiredMembers}</div>
          </div>
        </div>

        {/* Search & Main Table Container */}
        <div className="bg-white rounded-xl shadow-lg border">
          
          {/* Search Bar */}
          <div className="p-4 border-b">
            <div className="flex items-center">
              <SearchIcon />
              <input 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search by name, email, or member ID..." 
                className="ml-2 w-full p-2 focus:outline-none text-gray-700" 
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-700 divide-y divide-gray-200">
              <thead className="bg-gray-50 uppercase text-xs text-gray-500 tracking-wider">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Membership Type</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700 text-sm">
                        {(m.firstname ? m.firstname[0] : "U")}{(m.lastname ? m.lastname[0] : "")}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{m.firstname} {m.lastname}</div>
                        <div className="text-xs text-gray-500">ID: {m.memberId || 'N/A'}</div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-gray-900">{m.email}</div>
                      <div className="text-xs text-gray-500">{m.phone || 'N/A'}</div>
                    </td>

                    <td className="p-4">{m.membership_type || "General"}</td>
                    <td className="p-4 text-gray-600">{m.membership_plan || "None"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider ${getStatusBadge(m.status)}`}>
                        {m.status || 'unknown'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => navigate(`/edit-member/${m.id}`)} 
                          className="text-blue-600 hover:text-blue-800 font-medium transition duration-150"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)} 
                          className="text-red-600 hover:text-red-800 font-medium transition duration-150"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* No Results Message */}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                        No members found matching "{searchTerm}".
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