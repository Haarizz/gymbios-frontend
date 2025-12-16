// src/components/MyProfileDropdown.jsx
import React from "react";

export default function MyProfileDropdown() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>
      <p className="text-gray-600">This is the main profile page.</p>

      <div className="mt-6 p-4 bg-white shadow rounded">
        <h2 className="text-lg font-semibold mb-3">Profile Summary</h2>
        <p>Put user details here (name, role, email, etc.).</p>
      </div>
    </div>
  );
}
