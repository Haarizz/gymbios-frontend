import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";

export default function MyProfile() {
  const email = localStorage.getItem("email") || "admin@gymbios.com";
  const role = localStorage.getItem("role") || "Gym Manager";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const navigate=useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMsg("New passwords do not match");
      return;
    }

    try {
      await axios.post("/api/auth/change-password", {
        oldPassword,
        newPassword,
      });

      setMsg("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMsg(err.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
      <p className="text-gray-600">
        Manage your personal information and change your account password.
      </p>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl">
          {email?.charAt(0)?.toUpperCase()}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800">{role}</h2>
          <p className="text-gray-500">{email}</p>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Change Password
        </h2>

        {msg && (
          <div className="mb-4 px-4 py-2 rounded bg-teal-100 text-teal-800 border border-teal-300">
            {msg}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Old Password */}
          <div className="relative w-80">
            <label className="text-gray-700 font-medium text-sm">
              Old Password
            </label>
            <input
              type={showOld ? "text" : "password"}
              className="mt-1 w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-teal-600 outline-none"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />

            {/* Toggle Icon */}
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowOld(!showOld)}
            >
              {showOld ? "👀" : "🫣"}
            </span>
          </div>

          {/* New Password */}
          <div className="relative w-80">
            <label className="text-gray-700 font-medium text-sm">
              New Password
            </label>
            <input
              type={showNew ? "text" : "password"}
              className="mt-1 w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-teal-600 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            {/* Toggle Icon */}
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? "👀" : "🫣"}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative w-80">
            <label className="text-gray-700 font-medium text-sm">
              Confirm New Password
            </label>
            <input
              type={showNew ? "text" : "password"}
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-600 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowNew(!showNew)}
            >
              {showNew ? "👀" : "🫣"}
            </span>
          </div>
        <div className="flex items-center gap-4 mt-4">
          <button
            type="submit"
            className="bg-teal-700 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition shadow"
          >
            Update Password
          </button>
          <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2 border rounded bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            </div>
        </form>
      </div>
    </div>
  );
}
