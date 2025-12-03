import React from "react";
import { Mail, Phone, Star, User } from 'lucide-react';

export default function ApplicantCard({ candidate, onView, onSchedule }) {
  // Helper to process skills if it comes as a comma-separated string
  const skillsList = typeof candidate.skills === 'string' 
    ? candidate.skills.split(',').filter(s => s.trim()) 
    : (Array.isArray(candidate.skills) ? candidate.skills : []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col h-full">
      
      {/* --- Header: Avatar, Name, Score --- */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">
            {candidate.name?.charAt(0) || <User size={20} />}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 text-sm truncate" title={candidate.name}>
              {candidate.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">{candidate.currentRole || "Applicant"}</p>
          </div>
        </div>
        
        {/* Score Badge */}
        {candidate.score && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100 shrink-0">
            <Star size={10} className="fill-yellow-500 text-yellow-500" />
            {candidate.score}
          </div>
        )}
      </div>

      {/* --- Body: Contact Info --- */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail size={14} className="text-gray-400 shrink-0" />
          <span className="truncate" title={candidate.email}>{candidate.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">{candidate.phone}</span>
        </div>
      </div>

      {/* --- Skills Tags --- */}
      {skillsList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {skillsList.slice(0, 3).map((skill, i) => (
             <span key={i} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] font-medium text-gray-600 truncate max-w-[100px]">
               {skill.trim()}
             </span>
          ))}
          {skillsList.length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] text-gray-400">+{skillsList.length - 3}</span>
          )}
        </div>
      )}

      {/* --- Footer: Actions --- */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 mt-auto">
        <button
          className="flex items-center justify-center px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 hover:text-gray-800 transition-colors"
          onClick={onView}
        >
          View Profile
        </button>
        <button
          className="flex items-center justify-center px-3 py-2 bg-[#236b6b] text-white rounded-lg text-xs font-semibold hover:bg-[#1a5252] transition-colors shadow-sm"
          onClick={onSchedule}
        >
          Schedule
        </button>
      </div>

    </div>
  );
}