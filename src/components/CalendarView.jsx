import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getInterviewsByJob } from "../api/recruitment";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  Plus 
} from 'lucide-react';

export default function CalendarView() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params
  const q = Object.fromEntries(new URLSearchParams(location.search));
  const jobId = q.jobId;

  useEffect(() => {
    if (jobId) {
      setLoading(true);
      getInterviewsByJob(jobId)
        .then(res => setInterviews(res.data))
        .catch(() => setInterviews([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [jobId]);

  // Helper to get type icon
  const getTypeIcon = (type) => {
    if (type?.toLowerCase().includes('online') || type?.toLowerCase().includes('zoom')) {
      return <Video size={14} className="text-blue-500" />;
    }
    return <MapPin size={14} className="text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-6">
        <div>
           <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#236b6b] transition-colors text-sm font-medium mb-1"
          >
            <ArrowLeft size={16} />
            Back to Job Details
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Interview Schedule</h2>
        </div>
        
        <button 
          onClick={() => navigate(`/recruitment/schedule?jobId=${jobId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-[#236b6b] text-white rounded-lg text-sm font-medium hover:bg-[#1a5252] transition-colors shadow-sm"
        >
          <Plus size={16} />
          Schedule Interview
        </button>
      </div>

      {/* --- Content --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading schedule...</div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {interviews.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <Calendar size={48} className="mb-4 opacity-20" />
                <p>No interviews scheduled yet.</p>
             </div>
          ) : (
            interviews.map(iv => (
              <div 
                key={iv.id} 
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Date & Time */}
                <div className="flex items-start gap-4 min-w-[180px]">
                  <div className="flex flex-col items-center justify-center bg-teal-50 text-[#236b6b] rounded-lg p-3 w-16 h-16 shrink-0 border border-teal-100">
                    <span className="text-xs font-bold uppercase">{new Date(iv.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-bold">{new Date(iv.date).getDate()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-800 font-semibold mb-1">
                      <Clock size={16} className="text-[#236b6b]" />
                      {iv.time}
                    </div>
                    <div className="text-sm text-gray-500 capitalize flex items-center gap-1.5">
                      {getTypeIcon(iv.type)}
                      {iv.type || 'In-Person'}
                    </div>
                  </div>
                </div>

                {/* Middle: Candidate Info */}
                <div className="flex-1 border-l border-gray-100 pl-4 md:pl-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    {iv.candidateName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Interviewer: <span className="font-medium text-gray-700">{iv.interviewer}</span>
                  </p>
                </div>

                {/* Right: Actions/Location */}
                <div className="flex items-center gap-3 md:justify-end min-w-[200px]">
                   {iv.link ? (
                     <a 
                       href={iv.link} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="px-4 py-2 text-sm font-medium text-[#236b6b] bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                     >
                       Join Meeting
                     </a>
                   ) : (
                     <div className="text-sm text-gray-500 italic max-w-[200px] truncate" title={iv.location}>
                       {iv.location || 'Location not set'}
                     </div>
                   )}
                   
                   {/* Options Button Placeholder */}
                   <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                     <span className="sr-only">Options</span>
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}