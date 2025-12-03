import React, { useEffect, useState } from "react";
import { getJobOpenings } from "../api/recruitment"; // Assuming this exists as per your code
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Calendar, 
  Search, 
  Filter, 
  Download, 
  LayoutDashboard, 
  List, 
  Users,
  Clock,
  MapPin,
  DollarSign,
  Briefcase
} from 'lucide-react';

export default function RecruitmentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Derived stats (You can replace these with real API data if available)
  const activeOpenings = jobs.filter(j => j.status?.toLowerCase() === 'active').length;
  const totalApplicants = jobs.reduce((acc, job) => acc + (job.applicantsCount || 0), 0);

  useEffect(() => {
    getJobOpenings()
      .then(res => {
        // Handle response whether it's an array or an object with a 'jobs' key
        const data = Array.isArray(res.data) ? res.data : (res.data.jobs || []);
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch jobs", err);
        setLoading(false);
      });
  }, []);

  // Helper for status badge styling
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  // Helper for priority badge styling
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* --- Top Header --- */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-sm text-gray-500 mt-1">Manage job openings, candidates, and interview scheduling</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#236b6b] text-[#236b6b] rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors"
            onClick={() => navigate("/recruitment/schedule")}
          >
            <Calendar size={16} />
            Schedule Interview
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-[#236b6b] text-white rounded-lg text-sm font-medium hover:bg-[#1a5252] transition-colors shadow-sm"
            onClick={() => navigate("/recruitment/new-job")}
          >
            <Plus size={16} />
            New Job Opening
          </button>
        </div>
      </div>

      {/* --- Stats Banner --- */}
      <div className="grid grid-cols-4 bg-[#1e5c5c] rounded-xl text-white mb-8 shadow-md divide-x divide-teal-800/50">
        <div className="p-6 text-center">
          <h2 className="text-3xl font-bold">{activeOpenings || 0}</h2>
          <p className="text-xs text-teal-100 mt-1 uppercase tracking-wider">Active Openings</p>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-3xl font-bold">{totalApplicants || 0}</h2>
          <p className="text-xs text-teal-100 mt-1 uppercase tracking-wider">Total Applicants</p>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-3xl font-bold">0</h2> {/* Placeholder or fetch from API */}
          <p className="text-xs text-teal-100 mt-1 uppercase tracking-wider">Interviews Today</p>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-3xl font-bold">0</h2> {/* Placeholder or fetch from API */}
          <p className="text-xs text-teal-100 mt-1 uppercase tracking-wider">Recent Hires</p>
        </div>
      </div>

      {/* --- Filters & Controls --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex flex-1 gap-3 w-full">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search candidates, job titles..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#236b6b]/20"
            />
          </div>
          
          {/* Dropdowns */}
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 focus:outline-none">
            <option>All Departments</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 focus:outline-none">
            <option>All Status</option>
          </select>

           <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button className="px-3 py-1.5 text-xs font-medium bg-[#236b6b] text-white rounded-md flex items-center gap-2">
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-2">
            <List size={14} /> Kanban
          </button>
          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-md flex items-center gap-2">
            <Calendar size={14} /> Calendar
          </button>
        </div>
      </div>

      {/* --- Job Cards Grid --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading job openings...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div 
              key={job.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative group"
              onClick={() => navigate(`/recruitment/job/${job.id}`)}
            >
              {/* Header Row */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#236b6b] transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Briefcase size={12} />
                    <span>{job.department}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(job.status)}`}>
                  {job.status || 'Active'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <DollarSign size={14} className="text-gray-400" />
                  {job.salaryRange}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock size={12} />
                  Posted {job.postedDate || 'Recently'}
                </div>
              </div>

              {/* Footer Row */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  {job.applicantsCount || 0} Applicants
                </div>
                
                {job.priority && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityStyle(job.priority)}`}>
                    {job.priority} Priority
                  </span>
                )}
              </div>

              {/* View Pipeline Button (Full width at bottom) */}
              <div className="mt-4">
                <button className="w-full py-2 bg-[#236b6b] text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  View Pipeline <span className="text-xs">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}