import { Link, useNavigate } from "react-router-dom";
import { sidebarMenu } from "../api/sidebarMenu";
import { useSidebar } from "./Layout";
import * as HeroIcons from "react-icons/hi"; // Import all Heroicons

// Helper component to dynamically render an icon by its name
const DynamicIcon = ({ name, className }) => {
  const IconComponent = HeroIcons[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

export default function Sidebar() {
  const navigate = useNavigate();
  // Get state and functions from the context provided by Layout.js
  const { expandedSections, toggleSection, currentPath } = useSidebar();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Colors based on your image
  const bgColor = "#236b6b";
  const bgDarker = "#1a5252";
  const bgSubmenu = "#1f6060";
  const textColor = "#e0f2f1";
  const activeTextColor = "#ffffff";
  const hoverBg = "rgba(255, 255, 255, 0.1)";


  return (
    <div
      className="flex flex-col h-full w-64 z-40 fixed lg:relative transition-transform duration-300 shadow-xl font-sans"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* --- Header / Logo Area --- */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="rounded-2xl h-12 w-12 flex items-center justify-center shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
          <span className="text-2xl">🏋️</span>
        </div>
        <div>
          <h1 className="font-bold text-xl leading-none tracking-wide text-white">GymBios</h1>
          <p className="text-[11px] opacity-80 mt-1" style={{ color: textColor }}>Business Operating System</p>
        </div>
      </div>

      {/* --- Navigation Menu --- */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="py-2">
          {sidebarMenu.map((group, idx) => {
            const isExpanded = expandedSections[group.section];
            // Check if the main section or any of its children are active
            const isActive = group.path === currentPath || group.items.some(item => item.path === currentPath);

            // --- RENDER A COLLAPSIBLE SECTION (e.g., Community, Sales) ---
            if (group.collapsible) {
              return (
                <div key={idx}>
                  <button
                    onClick={() => toggleSection(group.section)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[15px] font-medium transition-colors duration-200
                      ${isActive || isExpanded ? `bg-[${bgDarker}] text-[${activeTextColor}]` : `hover:bg-[${hoverBg}] hover:text-[${activeTextColor}]`}
                      ${isActive && !isExpanded ? 'border-l-4 border-white' : 'border-l-4 border-transparent'}
                    `}
                    style={{
                      backgroundColor: (isActive || isExpanded) ? bgDarker : 'transparent',
                      color: (isActive || isExpanded) ? activeTextColor : textColor,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <DynamicIcon name={group.icon} className="text-xl" />
                      <span>{group.section}</span>
                    </div>
                    <DynamicIcon
                      name={isExpanded ? "HiChevronDown" : "HiChevronRight"}
                      className={`text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Submenu Items */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out`}
                    style={{
                        backgroundColor: bgSubmenu,
                        maxHeight: isExpanded ? `${group.items.length * 48}px` : '0px', // Smooth height transition
                        opacity: isExpanded ? 1 : 0
                    }}
                  >
                    {group.items.map(({ label, icon, path }) => {
                      const isSubActive = currentPath === path;
                      return (
                        <Link
                          key={path}
                          to={path}
                          className={`flex items-center gap-4 px-4 py-3 text-[14px] transition-colors duration-200 pl-12
                            ${isSubActive ? `text-[${activeTextColor}] font-medium` : `hover:text-[${activeTextColor}] hover:bg-[${hoverBg}]`}
                          `}
                          style={{ color: isSubActive ? activeTextColor : textColor }}
                        >
                          <DynamicIcon name={icon} className="text-lg" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // --- RENDER A DIRECT LINK (e.g., Dashboard, GymOS) ---
            return (
              <Link
                key={idx}
                to={group.path}
                className={`relative flex items-center justify-between px-4 py-3 text-[15px] font-medium transition-colors duration-200
                  ${isActive ? `bg-[${bgDarker}] text-[${activeTextColor}] border-l-4 border-white` : `hover:bg-[${hoverBg}] hover:text-[${activeTextColor}] border-l-4 border-transparent`}
                `}
                style={{
                  backgroundColor: isActive ? bgDarker : 'transparent',
                  color: isActive ? activeTextColor : textColor,
                }}
              >
                <div className="flex items-center gap-4">
                  <DynamicIcon name={group.icon} className="text-xl" />
                  <span>{group.section}</span>
                </div>
                {/* Add a chevron for "My Profile" to match the image */}
                {group.isProfileLink && (
                   <DynamicIcon name="HiChevronRight" className="text-sm" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* --- Footer Area --- */}
      <div className="p-5" style={{ backgroundColor: bgDarker }}>
        {/* Profile */}
        <div
          className="flex items-center gap-3 mb-6 cursor-pointer hover:opacity-90 transition"
          onClick={() => navigate('/profile')}
        >
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
            GM
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">Gym Manager</p>
            <p className="text-xs truncate" style={{ color: textColor }}>admin@gymbios.com</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="w-full py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: activeTextColor }}
        >
          <DynamicIcon name="HiOutlineLogout" className="text-lg" />
          Sign Out
        </button>
      </div>
    </div>
  );
}