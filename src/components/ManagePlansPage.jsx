import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { HiClock } from "react-icons/hi"; // Add clock icon
import { useNavigate } from "react-router-dom";
import { getPlans, deletePlan } from "../api/plans";


export default function ManagePlansPage() {
  const [plans, setPlans] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDuration, setFilterDuration] = useState("All Duration");
  const [filterType, setFilterType] = useState("All Types");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const navigate = useNavigate();
    
    
  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    getPlans().then(setPlans);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this plan?")) {
      await deletePlan(id);
      loadPlans();
    }
  };

  // Filtering and searching logic here
  const filteredPlans = plans.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDuration =
      filterDuration === "All Duration" || p.durationType.includes(filterDuration);

    const matchesType = filterType === "All Types" || p.type === filterType;

    const matchesStatus = filterStatus === "All Status" || p.status === filterStatus;

    return matchesSearch && matchesDuration && matchesType && matchesStatus;
  });

  // Calculate summary cards (you should adjust counts accordingly)
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => p.status === 'Active').length;
  const avgPrice = (plans.reduce((acc, p) => acc + p.price, 0) / totalPlans).toFixed(2);
  const familyPlans = plans.filter(p => p.type === 'Family').length;

  return (
    

      
        
      <div className="flex-1 p-6 overflow-auto">

        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manage Plans</h1>
            <p className="text-gray-600">Create and manage membership plans, class packages, and training programs.</p>
          </div>
          <button
            onClick={() => navigate("/create-plan")}
            className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800 shadow"
          >
            + Create Plan
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow text-sm text-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div>Total Plans</div>
              <div>
                {/* Icon placeholder */}
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 7h18M3 12h18M3 17h18" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold">{totalPlans}</div>
            <div className="text-xs text-gray-500">All membership plans</div>
          </div>

          <div className="bg-white p-4 rounded shadow text-sm text-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div>Active Plans</div>
              <div>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">{activePlans}</div>
            <div className="text-xs text-gray-500">Currently available</div>
          </div>

          <div className="bg-white p-4 rounded shadow text-sm text-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div>Average Price</div>
              <div>
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c-1 0-2 .5-2 1.5S11 11 12 11s2 .5 2 1.5-.5 1.5-2 1.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">${avgPrice}</div>
            <div className="text-xs text-gray-500">Across all plans</div>
          </div>

          <div className="bg-white p-4 rounded shadow text-sm text-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div>Family Plans</div>
              <div>
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M17 11a4 4 0 11-8 0 4 4 0 018 0zM6 21v-2a4 4 0 018 0v2H6z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">{familyPlans}</div>
            <div className="text-xs text-gray-500">Multi-member plans</div>
          </div>
        </div>

        {/* Plan Overview Card */}
        <div className="bg-white rounded shadow p-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-1">Plan Overview</h2>
          <p className="text-gray-600 mb-4">View and manage all membership plans</p>

          {/* Search and filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">

            <input
              type="text"
              placeholder="Search plans..."
              className="border border-gray-300 rounded p-2 flex-grow max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Duration filter */}
            <select
              className="border border-gray-300 rounded p-2"
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
            >
              <option>All Duration</option>
              <option>1 month</option>
              <option>6 months</option>
              <option>12 months</option>
              <option>8 sessions</option>
            </select>

            {/* Type filter */}
            <select
              className="border border-gray-300 rounded p-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option>All Types</option>
              <option>Individual</option>
              <option>Family</option>
              <option>Corporate</option>
            </select>

            {/* Status filter */}
            <select
              className="border border-gray-300 rounded p-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <table className="w-full table-auto text-left text-sm text-gray-700 border-collapse">
            <thead className="border-b border-gray-300">
              <tr>
                <th className="pb-3 pr-6">Plan Name</th>
                <th className="pb-3 pr-6">Duration</th>
                <th className="pb-3 pr-6">Type</th>
                <th className="pb-3 pr-6">Price / Discounts</th>
                <th className="pb-3 pr-6">Assigned Trainers</th>
                <th className="pb-3 pr-6">Discount</th>
                
              
              
                <th className="pb-3 pr-6">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 pr-6">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">Membership</div>
                  </td>

                  <td className="py-3 pr-6 flex items-center gap-1 text-gray-600">
                    <HiClock className="inline" />
                    {p.durationValue} {p.durationType}
                  </td>

                  <td className="py-3 pr-6">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        p.type === 'Individual' 
                          ? 'bg-blue-100 text-blue-700' :
                        p.type === 'Family' 
                          ? 'bg-purple-100 text-purple-700' :
                        p.type === 'Corporate'
                          ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {p.type}
                    </span>
                  </td>

                  <td className="py-3 pr-6">
                    <div>AED {p.price}</div>
                    {/* Placeholder for discount */}
                    {/* <div className="text-green-600 text-xs">15% off</div> */}
                  </td>

                  <td className="py-3 pr-6 text-medium ">
                    {/* Example of assigned trainers - adapt as needed */}
                    {p.trainers}
                  </td>

               <td className="py-3 pr-6">
                    <div>{p.discount}%</div>
                    
                  </td>


                  <td className="py-3 pr-6">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => navigate(`/edit-plan/${p.id}`)}
                        title="Edit Plan"
                      >
                        ✏️
                      </button>

                      <button
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => handleDelete(p.id)}
                        title="Delete Plan"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-6 text-gray-500">
                    No plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
 
  );
}
