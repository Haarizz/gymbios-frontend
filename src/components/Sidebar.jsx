import { Link, useLocation } from "react-router-dom";
import { HiChevronDown, HiMenu } from "react-icons/hi";
import { sidebarMenu } from "../api/sidebarMenu";
import { useState } from "react";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login"; 
};

  return (
    <>
      {/* Mobile dark backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          bg-teal-800 text-white flex flex-col h-full w-64 z-40
          fixed top-0 left-0 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="px-5 py-6 flex items-center gap-3 border-b border-green-900">
          <div className="rounded-full bg-teal-600 h-10 w-10 flex items-center justify-center font-bold">
            <span>GB</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">GymBios</h1>
            <p className="text-xs text-teal-200">Business Operating System</p>
          </div>

          {/* Mobile close */}
          <HiMenu
            className="ml-auto text-xl cursor-pointer lg:hidden"
            onClick={toggleSidebar}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto px-2 pt-3">
          {sidebarMenu.map((group, idx) => (
            <div key={idx} className="mb-3">

              {/* Section Title */}
              <div className="text-teal-200 uppercase text-xs font-bold px-3 py-2 tracking-wide">
                {group.section}
              </div>

              {/* Items */}
              {group.collapsible ? (
                <div>
                  <button
                    onClick={() => toggleSection(group.section)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-teal-700 rounded"
                  >
                    <span>{group.section}</span>
                    <HiChevronDown
                      className={`transition-transform ${
                        openSections[group.section] ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all ${
                      openSections[group.section] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    {group.items.map(({ label, icon: Icon, path }) => {
                      const active = location.pathname === path;

                      return (
                        <Link
                          key={path}
                          to={path}
                          onClick={toggleSidebar}
                          className={`flex items-center gap-3 px-6 py-2 text-sm rounded-md mb-[2px]
                            ${
                              active
                                ? "bg-white text-teal-900 font-semibold border-l-4 border-green-500"
                                : "hover:bg-teal-700"
                            }
                          `}
                        >
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center 
                              ${
                                active
                                  ? "bg-green-100 text-teal-900"
                                  : "bg-teal-900 text-teal-100"
                              }
                            `}
                          >
                            <Icon className="text-[15px]" />
                          </div>

                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                group.items.map(({ label, icon: Icon, path }) => {
                  const active = location.pathname === path;

                  return (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-3 px-6 py-2 mb-[2px] text-sm rounded-md
                        ${
                          active
                            ? "bg-white text-teal-900 font-semibold border-l-4 border-green-500"
                            : "hover:bg-teal-700"
                        }
                      `}
                    >
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center 
                          ${
                            active
                              ? "bg-green-100 text-teal-900"
                              : "bg-teal-900 text-teal-100"
                          }
                        `}
                      >
                        <Icon className="text-[15px]" />
                      </div>

                      {label}
                    </Link>
                  );
                })
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-teal-700">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-teal-600 h-10 w-10 flex items-center justify-center">
              GM
            </div>
            <div>
              <p className="font-semibold text-sm">Gym Manager</p>
              <p className="text-xs text-teal-300">admin@gymbios.com</p>
            </div>
          </div>
          <button onClick={logout} className="mt-3 w-full px-3 py-2 bg-teal-600 rounded text-sm hover:bg-teal-500">
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
