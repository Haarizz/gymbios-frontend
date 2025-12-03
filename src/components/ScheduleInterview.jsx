import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { scheduleInterview, getCandidatesByJob } from "../api/recruitment";
import { X, ChevronDown, Calendar, Clock, User, MapPin, Briefcase, Video } from 'lucide-react';

export default function ScheduleInterview() {
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query params
  const q = Object.fromEntries(new URLSearchParams(location.search));
  const jobId = q.jobId || null;
  const candidateId = q.candidateId || null;

  const [candidates, setCandidates] = useState([]);

  const [form, setForm] = useState({
    candidateId: candidateId || "",
    jobId: jobId || "",
    date: "",
    time: "",
    interviewer: "",
    type: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (jobId) {
      getCandidatesByJob(jobId)
        .then((res) => setCandidates(res.data))
        .catch(() => setCandidates([]));
    }
  }, [jobId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await scheduleInterview(form);
      toast.success("Interview scheduled successfully");
      navigate("/recruitment"); // Redirecting to main recruitment page
    } catch (error) {
      toast.error("Failed to schedule interview");
    }
  };

  // Styling constants
  const inputClasses = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#236b6b]/20 focus:border-[#236b6b] placeholder-gray-400 bg-white";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";
  const selectWrapperClasses = "relative"; 

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50 fixed inset-0">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* --- Header --- */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Schedule Interview</h2>
            <p className="text-sm text-gray-500 mt-1">Set up an interview with a candidate</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Form Body --- */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Candidate */}
            <div className="col-span-1">
              <label className={labelClasses}>Candidate <span className="text-red-500">*</span></label>
              <div className={selectWrapperClasses}>
                <select
                  name="candidateId"
                  value={form.candidateId}
                  onChange={handleChange}
                  className={`${inputClasses} appearance-none`}
                >
                  <option value="">Select candidate</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Job Position */}
            <div className="col-span-1">
              <label className={labelClasses}>Job Position <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  className={`${inputClasses} bg-gray-50 text-gray-500 cursor-not-allowed`}
                  value={form.jobId ? `Job ID: ${form.jobId}` : "No Job Selected"} 
                  disabled
                  readOnly
                />
                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Date */}
            <div className="col-span-1">
              <label className={labelClasses}>Interview Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`${inputClasses} [color-scheme:light]`} // Forces calendar icon to be dark/standard
                />
                {/* Custom icon positioning if you hide default indicator, or just let default show */}
              </div>
            </div>

            {/* Time */}
            <div className="col-span-1">
              <label className={labelClasses}>Interview Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={`${inputClasses} [color-scheme:light]`}
                />
              </div>
            </div>

            {/* Interviewer */}
            <div className="col-span-1">
              <label className={labelClasses}>Interviewer <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  name="interviewer"
                  value={form.interviewer}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Enter interviewer name"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Type */}
            <div className="col-span-1">
              <label className={labelClasses}>Interview Type <span className="text-red-500">*</span></label>
              <div className={selectWrapperClasses}>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={`${inputClasses} appearance-none`}
                >
                  <option value="">Select type</option>
                  <option value="Online">Online (Zoom/Teams)</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Phone">Phone Call</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Meeting Link / Location */}
            <div className="col-span-2">
              <label className={labelClasses}>Meeting Link / Location</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Enter Zoom/Teams link or office location"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className={labelClasses}>Notes (Optional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className={`${inputClasses} min-h-[80px] resize-y`}
                placeholder="Add any additional notes or preparation requirements..."
              />
            </div>
            
            {/* Auto-send Checkbox (Visual only based on UI) */}
            <div className="col-span-2 flex items-center gap-2">
               <input type="checkbox" id="auto-email" className="w-4 h-4 text-[#236b6b] border-gray-300 rounded focus:ring-[#236b6b]" />
               <label htmlFor="auto-email" className="text-sm text-gray-600 select-none cursor-pointer">Auto-send email invitation to candidate</label>
            </div>

          </div>
        </div>

        {/* --- Footer Buttons --- */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button
            className="px-6 py-2.5 rounded-lg bg-[#236b6b] text-white font-medium hover:bg-[#1a5252] transition-colors shadow-sm text-sm"
            onClick={handleSubmit}
          >
            Schedule Interview
          </button>
        </div>

      </div>
    </div>
  );
}