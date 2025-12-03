import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobOpenings, getCandidatesByJob } from "../api/recruitment";
import ApplicantCard from "./ApplicantCard";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Users, 
  LayoutDashboard, 
  List, 
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function JobView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch job details
    getJobOpenings()
      .then(res => {
        // Handle varying API response structures (array vs object with key)
        const jobsList = Array.isArray(res.data) ? res.data : (res.data.jobs || []);
        const found = jobsList.find(j => String(j.id) === String(id));
        setJob(found || null);
      })
      .catch(() => toast.error("Failed to load job"))
      .finally(() => setLoading(false));

    // Fetch applicants
    getCandidatesByJob(id)
      .then(res => setCandidates(res.data))
      .catch(() => setCandidates([]));
  }, [id]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading job details...</div>;
  if (!job) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      
      {/* --- Header Navigation --- */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate("/recruitment")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#236b6b] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Recruitment
        </button>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#236b6b] text-[#236b6b] rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors"
            onClick={() => navigate(`/recruitment/schedule?jobId=${id}`)}
          >
            <Calendar size={16} />
            Schedule Interview
          </button>
        </div>
      </div>

      {/* --- Job Header Card --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(job.status)}`}>
                {job.status || 'Active'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Briefcase size={14} /> {job.department}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> Posted {job.postedDate || 'Recently'}</span>
            </div>
          </div>
          
          <div className="text-right">
             <div className="text-sm text-gray-500">Salary Range</div>
             <div className="text-lg font-bold text-gray-800 flex items-center justify-end gap-1">
               {job.salaryRange || 'Not specified'}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Left Column: Job Details --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-[#236b6b]" />
              Job Description
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {job.description || "No description provided."}
            </div>

            <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-[#236b6b]" />
              Requirements
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {job.requirements || "No specific requirements listed."}
            </div>
          </div>
        </div>

        {/* --- Right Column: Applicants --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-[#236b6b]" />
                Applicants <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{candidates.length}</span>
              </h3>
            </div>

            {/* View Toggles */}
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200 mb-4">
              <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-white text-[#236b6b] shadow-sm rounded-md flex items-center justify-center gap-2">
                <List size={14} /> List
              </button>
              <button 
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-md flex items-center justify-center gap-2"
                onClick={() => navigate(`/recruitment/kanban?jobId=${id}`)}
              >
                <LayoutDashboard size={14} /> Kanban
              </button>
            </div>

            {/* Applicant List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-3 max-h-[600px]">
              {candidates.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                  No applicants yet
                </div>
              ) : (
                candidates.map(c => (
                  <ApplicantCard 
                    key={c.id} 
                    candidate={c} 
                    onView={() => navigate(`/recruitment/candidate/${c.id}`)} 
                    onSchedule={() => navigate(`/recruitment/schedule?candidateId=${c.id}&jobId=${id}`)} 
                  />
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}