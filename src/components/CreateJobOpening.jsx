import React, { useState } from "react";
import { createJobOpening } from "../api/recruitment";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X, ChevronDown } from 'lucide-react';

export default function CreateJobOpening() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    jobType: "",
    priority: "",
    salaryRange: "",
    description: "",
    requirements: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault(); // Prevent default form submission
    createJobOpening(form)
      .then(() => {
        toast.success("Job Opening Created");
        navigate("/recruitment");
      })
      .catch(() => toast.error("Error creating job"));
  };

  // Common input styles to match the design (Clean, light border, rounded)
  const inputClasses = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#236b6b]/20 focus:border-[#236b6b] placeholder-gray-400";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-1.5";
  const selectWrapperClasses = "relative"; // For custom arrow positioning if needed

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50 fixed inset-0">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Create New Job Opening</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to post a new job opening</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Job Title */}
            <div className="col-span-1">
              <label className={labelClasses}>Job Title <span className="text-red-500">*</span></label>
              <input
                name="title"
                className={inputClasses}
                placeholder="e.g., Fitness Trainer"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            {/* Department */}
            <div className="col-span-1">
              <label className={labelClasses}>Department <span className="text-red-500">*</span></label>
              <div className={selectWrapperClasses}>
                <select
                  name="department"
                  className={`${inputClasses} appearance-none bg-white`}
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">Select department</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Location */}
            <div className="col-span-1">
              <label className={labelClasses}>Location <span className="text-red-500">*</span></label>
              <input
                name="location"
                className={inputClasses}
                placeholder="e.g., Dubai - Main Branch"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            {/* Job Type */}
            <div className="col-span-1">
              <label className={labelClasses}>Job Type <span className="text-red-500">*</span></label>
              <div className={selectWrapperClasses}>
                <select
                  name="jobType"
                  className={`${inputClasses} appearance-none bg-white`}
                  value={form.jobType}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Salary Range */}
            <div className="col-span-1">
              <label className={labelClasses}>Salary Range <span className="text-red-500">*</span></label>
              <input
                name="salaryRange"
                className={inputClasses}
                placeholder="e.g., AED 5,000 - 8,000"
                value={form.salaryRange}
                onChange={handleChange}
              />
            </div>

            {/* Priority */}
            <div className="col-span-1">
              <label className={labelClasses}>Priority <span className="text-red-500">*</span></label>
              <div className={selectWrapperClasses}>
                <select
                  name="priority"
                  className={`${inputClasses} appearance-none bg-white`}
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="">Select priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Job Description */}
            <div className="col-span-1 md:col-span-2">
              <label className={labelClasses}>Job Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                className={`${inputClasses} min-h-[100px] resize-y`}
                placeholder="Describe the role, responsibilities, and expectations..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* Requirements */}
            <div className="col-span-1 md:col-span-2">
              <label className={labelClasses}>Requirements</label>
              <textarea
                name="requirements"
                className={`${inputClasses} min-h-[100px] resize-y`}
                placeholder="List the required qualifications, skills, and experience (one per line)..."
                value={form.requirements}
                onChange={handleChange}
              />
            </div>

          </form>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button 
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button 
            className="px-6 py-2.5 rounded-lg bg-[#236b6b] text-white font-medium hover:bg-[#1a5252] transition-colors shadow-sm text-sm"
            onClick={submit}
          >
            Create Job Opening
          </button>
        </div>

      </div>
    </div>
  );
}