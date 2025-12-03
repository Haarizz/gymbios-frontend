import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCandidatesByJob, getJobOpenings } from "../api/recruitment";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  User, 
  Download,
  Clock,
  Star,
  FileText
} from 'lucide-react';

export default function CandidateView() {
  const { id } = useParams(); // candidate id
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Fetch all jobs to scan for the candidate
    getJobOpenings()
      .then(async (jobRes) => {
        const jobs = Array.isArray(jobRes.data) ? jobRes.data : (jobRes.data.jobs || []);
        let foundCandidate = null;
        let foundJob = null;

        // Scan candidates of each job
        for (let j of jobs) {
          try {
            // Using the API helper instead of raw fetch for consistency
            const res = await getCandidatesByJob(j.id);
            const candidatesList = res.data;
            const match = candidatesList.find(x => String(x.id) === String(id));
            
            if (match) {
              foundCandidate = match;
              foundJob = j;
              break; // Stop scanning once found
            }
          } catch (e) {
            // Continue to next job if this one fails
            console.error(`Failed to fetch candidates for job ${j.id}`, e);
          }
        }

        if (foundCandidate) {
          setCandidate(foundCandidate);
          setJob(foundJob);
        } else {
          toast.error("Candidate not found");
        }
      })
      .catch(() => toast.error("Failed to load recruitment data"))
      .finally(() => setLoading(false));
  }, [id]);

  // Helper for skills tags
  const skillsList = candidate ? (typeof candidate.skills === 'string' 
    ? candidate.skills.split(',').filter(s => s.trim()) 
    : (Array.isArray(candidate.skills) ? candidate.skills : [])) : [];

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading candidate profile...</div>;
  if (!candidate) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Candidate not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-[#236b6b] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Applicants
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Left Column: Profile Card --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
            {/* Avatar & Identity */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-sm flex items-center justify-center text-gray-400 mb-4">
                 <User size={48} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{candidate.currentRole || "Applicant"}</p>
              
              {candidate.score && (
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                  <Star size={12} className="fill-yellow-500 text-yellow-500" />
                  Score: {candidate.score}
                </div>
              )}
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Contact Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[#236b6b]" />
                </div>
                <span className="truncate">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-[#236b6b]" />
                </div>
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-[#236b6b]" />
                </div>
                <span>{candidate.location || "Location not specified"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button 
                className="w-full py-2.5 bg-[#236b6b] text-white rounded-lg text-sm font-semibold hover:bg-[#1a5252] transition-colors shadow-sm flex items-center justify-center gap-2"
                onClick={() => navigate(`/recruitment/schedule?candidateId=${candidate.id}&jobId=${job?.id}`)}
              >
                <Calendar size={16} />
                Schedule Interview
              </button>
              <button className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Download size={16} />
                Download Resume
              </button>
            </div>

          </div>
        </div>

        {/* --- Right Column: Details --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Job Context Card */}
          {job && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Applied For</p>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Briefcase size={18} className="text-[#236b6b]" />
                  {job.title}
                </h2>
              </div>
              <button 
                onClick={() => navigate(`/recruitment/job/${job.id}`)}
                className="text-sm text-[#236b6b] font-medium hover:underline"
              >
                View Job Details
              </button>
            </div>
          )}

          {/* Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            
            {/* Experience */}
            <div className="mb-8">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-[#236b6b]" />
                Experience & Background
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed">
                {candidate.experience || "No experience details provided."}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-[#236b6b]" />
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillsList.length > 0 ? (
                  skillsList.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">No skills listed</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}