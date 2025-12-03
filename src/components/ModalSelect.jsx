// src/components/ModalSelect.jsx
import React, { useState } from "react";

export default function ModalSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full">
      {/* DISPLAYED SELECT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full px-3 py-2 
          rounded-lg 
          border border-gray-200
          bg-white 
          text-sm text-gray-700
          flex justify-between items-center
        "
      >
        <span>{value.label || value}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* DROPDOWN LIST */}
      {open && (
        <div
          className="
            absolute z-20 mt-1 w-full 
            bg-white 
            border border-gray-200 rounded-lg shadow-lg
            max-h-60 overflow-y-auto
          "
        >
          {options.map((opt, i) => {
            const label = opt.label || opt.value || opt;

            return (
              <button
                key={i}
                onClick={() => {
                  onChange(opt.value || opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${value === opt.value || value === opt ? "bg-gray-50" : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
