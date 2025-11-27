import { useEffect, useState } from "react";
// We need useNavigate for navigation (e.g., to /classes/new)
import { Link, useNavigate } from "react-router-dom"; 
import { getTrainingClasses, deleteTrainingClass } from "../api/trainingApi";
import toast from "react-hot-toast";
import Layout from "./Layout";

// Import icons for the Actions column (install with: npm install react-icons)
import { FaEye, FaTrashAlt, FaCalendarCheck } from 'react-icons/fa';

const TrainingClassList = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate(); // Added useNavigate

  const loadData = async () => {
    try {
      // Using actual API call from your original snippet
      const res = await getTrainingClasses();
      
      // --- IMPORTANT NOTE: Data Transformation ---
      // The API response (res.data) must contain objects with fields like:
      // id, className, trainer, classType, date, startTime, endTime, location, 
      // currentCapacity (or capacity string like "15/20"), and status.
      
      // If your API returns capacity as a single string like "15/20", you might need to parse it.
      // If it returns separate fields (e.g., currentCapacity: 15, maxCapacity: 20),
      // the rendering logic below is correct. Assuming the latter for best display.
      
      setList(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load classes");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- ACTION HANDLERS ---
  const handleDelete = async (id, className) => {
    if (!window.confirm(`Are you sure you want to permanently delete the class: ${className}?`)) {
      return;
    }

    try {
      await toast.promise(
        deleteTrainingClass(id), 
        {
          loading: `Deleting ${className}...`, 
          success: `${className} successfully deleted!`,
          error: `Deletion of ${className} failed. Please try again.`, 
        }
      );
      loadData();
    } catch (err) {
      // Error handled by toast.promise
    }
  };
  
  const handleEdit = (id) => {
    // Navigates to the edit page for the specific class ID
    navigate(`/classes/edit/${id}`);
  };

  const handleBook = (id, className) => {
    // Placeholder for a client-side booking action
    toast.success(`Booking simulated for ${className}!`);
  };

  // Helper to get the first letter of the trainer's name for the avatar
  const getInitials = (name) => {
    const parts = name.split(" ");
    return parts.length > 1 
      ? parts[0][0] + parts[parts.length - 1][0] 
      : parts[0][0];
  };

  // Helper to parse capacity (if API returns it as a string like "15/20")
  const parseCapacity = (capacityString) => {
    if (typeof capacityString === 'string' && capacityString.includes('/')) {
      const [current, max] = capacityString.split('/');
      return { currentCapacity: parseInt(current), maxCapacity: parseInt(max) };
    }
    // Default to placeholder or handle API returning separate fields
    return { currentCapacity: 0, maxCapacity: 0 }; 
  };


  return (
  
      <div className="p-6">
        {/* --- Page Header --- */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Trainings & Classes</h2>

          {/* NAVIGATE to Create Page / Add Class button (Red Theme) */}
          {/* Note: Used `Maps` instead of `Link` for better handling with `onClick` */}
          <button
            onClick={() => navigate("/classes/new")}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition duration-150"
          >
            + Add Class
          </button>
        </div>

        {/* --- Search and Filter Section (Matching Screenshot Layout) --- */}
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search classes or trainers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-2 appearance-none">
            <option>All Types</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-4 py-2 appearance-none">
            <option>All Trainers</option>
          </select>
          {/* View Toggle Buttons - simplified for Tailwind */}
          <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">
            ▦
          </button>
          <button className="p-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-100">
            ≡
          </button>
        </div>


        {/* --- Table Container (Matching Screenshot Theme) --- */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-700">Class Name</th>
                <th className="px-6 py-3 font-medium text-gray-700">Trainer</th>
                <th className="px-6 py-3 font-medium text-gray-700">Type</th>
                <th className="px-6 py-3 font-medium text-gray-700">Date & Time</th>
                <th className="px-6 py-3 font-medium text-gray-700">Location</th>
                <th className="px-6 py-3 font-medium text-gray-700">Capacity</th>
                <th className="px-6 py-3 font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td
                    colSpan="9" // Changed colSpan to 9 to account for all columns
                    className="px-6 py-6 text-center text-gray-500 italic"
                  >
                    No classes found
                  </td>
                </tr>
              ) : (
                list.map((cls) => {
                  // Fallback for capacity display if API only sends 'capacity' string
                  const capacityData = cls.currentCapacity && cls.maxCapacity ? 
                    { currentCapacity: cls.currentCapacity, maxCapacity: cls.maxCapacity } :
                    parseCapacity(cls.capacity);
                  
                  // Fallback for trainer name if API only sends ID
                  const trainerName = cls.trainer || "N/A";

                  return (
                <tr
                  key={cls.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* Class Name */}
                  <td className="px-6 py-3 font-semibold text-gray-800">{cls.className}</td>

                  {/* Trainer with Initials/Avatar */}
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-200 text-green-800 text-xs font-bold">
                        {getInitials(trainerName)}
                      </span>
                      <span>{trainerName}</span>
                    </div>
                  </td>

                  {/* Type Tag */}
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-md">
                      {cls.classType}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-800">{cls.date}</div>
                    <div className="text-xs text-gray-500">
                      {cls.startTime} - {cls.endTime}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-3 text-gray-600">{cls.location}</td>

                  {/* Capacity (Current/Max) */}
                  <td className="px-6 py-3 font-medium">
                    <span className="text-gray-800">{capacityData.currentCapacity}</span>
                    <span className="text-gray-400">/{capacityData.maxCapacity}</span>
                  </td>

                  {/* Status Pill */}
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cls.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cls.status}
                    </span>
                  </td>

                  {/* Actions - Functional Buttons */}
                  <td className="px-6 py-3 space-x-2 flex items-center">
                    
                    {/* 1. Book Button (Red Primary Action) */}
                    <button
                      onClick={() => handleBook(cls.id, cls.className)}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition flex items-center space-x-1"
                      title="Book this Class"
                    >
                      <FaCalendarCheck className="w-3 h-3"/>
                      <span>Book</span>
                    </button>

                    {/* 2. View/Edit Icon */}
                    <button
                      onClick={() => handleEdit(cls.id)}
                      className="p-2 text-gray-600 rounded-full hover:bg-gray-100"
                      title="View/Edit Class"
                    >
                      <FaEye className="w-4 h-4" /> 
                    </button>

                    {/* 3. Delete Icon */}
                    <button
                      onClick={() => handleDelete(cls.id, cls.className)}
                      className="p-2 text-red-500 rounded-full hover:bg-red-50"
                      title="Delete Class"
                    >
                      <FaTrashAlt className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )})
            )}
            </tbody>
          </table>
        </div>
      </div>
 
  );
};

export default TrainingClassList;