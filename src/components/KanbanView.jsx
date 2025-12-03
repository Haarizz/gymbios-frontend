import React, { useEffect, useState } from "react";
import { getCandidatesByJob } from "../api/recruitment";
import { useLocation, useNavigate } from "react-router-dom";
import ApplicantCard from "./ApplicantCard";
import { ArrowLeft, Plus, MoreHorizontal } from 'lucide-react';

const stages = [
  { id: "applied", label: "Applied", color: "border-blue-500 bg-blue-50 text-blue-700" },
  { id: "shortlisted", label: "Shortlisted", color: "border-purple-500 bg-purple-50 text-purple-700" },
  { id: "interviewed", label: "Interviewed", color: "border-orange-500 bg-orange-50 text-orange-700" },
  { id: "offered", label: "Offered", color: "border-green-500 bg-green-50 text-green-700" },
  { id: "hired", label: "Hired", color: "border-teal-500 bg-teal-50 text-teal-700" }
];

export default function KanbanView() {
  const [candidates, setCandidates] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params
  const q = Object.fromEntries(new URLSearchParams(location.search));
  const jobId = q.jobId;

  useEffect(() => {
    if (jobId) {
      getCandidatesByJob(jobId)
        .then((res) => setCandidates(res.data))
        .catch(() => setCandidates([]));
    }
  }, [jobId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800 flex flex-col">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
           <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#236b6b] transition-colors text-sm font-medium mb-1"
          >
            <ArrowLeft size={16} />
            Back to Job Details
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h2>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-[#236b6b] text-white rounded-lg text-sm font-medium hover:bg-[#1a5252] transition-colors shadow-sm">
          <Plus size={16} />
          Add Candidate
        </button>
      </div>

      {/* --- Kanban Board (Horizontal Scroll) --- */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 min-w-max h-full pb-4">
          {stages.map((stage) => {
             const stageCandidates = candidates.filter((c) => (c.stage || 'applied').toLowerCase() === stage.id);
             
             return (
              <div
                key={stage.id}
                className="w-80 flex flex-col bg-gray-100/50 rounded-xl border border-gray-200/60 max-h-full"
              >
                {/* Column Header */}
                <div className={`p-4 border-t-4 rounded-t-xl bg-white border-b border-gray-100 flex justify-between items-center ${stage.color.split(' ')[0]}`}>
                  <h3 className="font-bold text-gray-700 capitalize text-sm">
                    {stage.label}
                  </h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.color.split(' ').slice(1).join(' ')}`}>
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Cards Container (Vertical Scroll) */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {stageCandidates.map((c) => (
                    <div key={c.id}>
                      <ApplicantCard 
                        candidate={c} 
                        onView={() => navigate(`/recruitment/candidate/${c.id}`)}
                        onSchedule={() => navigate(`/recruitment/schedule?candidateId=${c.id}&jobId=${jobId}`)}
                      />
                    </div>
                  ))}

                  {/* Empty State */}
                  {stageCandidates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                      <p className="text-xs italic">No candidates</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}