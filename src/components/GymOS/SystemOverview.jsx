import React, { useEffect, useState } from "react";
import { getModules, getOverview, getStats } from "../../api/gymosApi";
import {
  BookOpen, Users, Globe, Smartphone, Bell,
  Folder, Shield, Settings, Server, Activity, ArrowRight, Layout
} from "lucide-react";

export default function SystemOverview() {
  const [overview, setOverview] = useState({ activeSections: 0, totalItems: 0, totalRoles: 0 });
  const [modules, setModules] = useState([]);
  const [stats, setStats] = useState({
    modulesActive: 0, modulesInstalled: 0, usersWithPermissions: 0,
    apiIntegrations: 0, devicesOnline: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      // Keeping original API calls
      const [ov, mod, st] = await Promise.all([
        getOverview(),
        getModules(),
        getStats(),
      ]);
      setOverview(ov || { activeSections: 2, totalItems: 44, totalRoles: 5 }); // Fallbacks for UI demo
      setModules(mod || []);
      setStats(st || {
        modulesActive: 8, modulesInstalled: 12, usersWithPermissions: 45,
        apiIntegrations: 6, devicesOnline: 18
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  // --- UI Components ---
  const StatusCard = ({ icon: Icon, title, value, subtext, colorClass, bgClass }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${bgClass} ${colorClass}`}>
          Active
        </div>
      </div>
      <div className="text-gray-500 text-xs font-medium mb-1">{title}</div>
      <div className="flex items-end gap-2">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtext && <div className="text-xs text-gray-400 mb-1">{subtext}</div>}
      </div>
    </div>
  );

  const SectionHeader = ({ title, action }) => (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <button className="text-xs font-medium bg-gray-50 hover:bg-gray-100 border px-3 py-1 rounded transition">
        {action}
      </button>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* Top Row: Large Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Plans & Services */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <SectionHeader title="Plans & Services Catalog Configuration" action="Configure" />
          <p className="text-sm text-gray-500 mb-6">Control what information is shown in the walk-in inquiry view</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-xs text-blue-600 font-semibold mb-1">Active Sections</div>
              <div className="text-2xl font-bold text-blue-900">{overview.activeSections}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-xs text-green-600 font-semibold mb-1">Total Items</div>
              <div className="text-2xl font-bold text-green-900">{overview.totalItems}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Membership Plans & Pricing
              </div>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">8</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Training Screens
              </div>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">12</span>
            </div>
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 py-2">
            <ArrowRight size={14} /> View All Options
          </button>
        </div>

        {/* POS Mode Options */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <SectionHeader title="POS Mode Options" action="Manage" />
          <p className="text-sm text-gray-500 mb-6">Assign POS access type to user roles</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <div className="text-xs text-purple-600 font-medium">Total Roles</div>
              <div className="text-xl font-bold text-purple-900">{overview.totalRoles}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-xs text-green-600 font-medium">Retail POS</div>
              <div className="text-xl font-bold text-green-900">18</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="text-xs text-orange-600 font-medium">F&B POS</div>
              <div className="text-xl font-bold text-orange-900">15</div>
            </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2"><Users size={14} className="text-gray-400"/> Front Desk</span>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Retail POS</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2"><Users size={14} className="text-gray-400"/> Trainers</span>
                <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">F&B POS</span>
             </div>
          </div>
          <div className="mt-6 p-2 bg-green-50 border border-green-100 rounded text-center text-xs text-green-700 font-medium">
             All roles properly assigned
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatusCard 
          icon={Folder} title="Modules Active" 
          value={`${stats.modulesActive} / ${stats.modulesInstalled}`} 
          subtext="67%" colorClass="text-blue-600" bgClass="bg-blue-50" 
        />
        <StatusCard 
          icon={Users} title="Users with Permissions" 
          value={stats.usersWithPermissions} 
          subtext="Across 8 roles" colorClass="text-green-600" bgClass="bg-green-50" 
        />
        <StatusCard 
          icon={Globe} title="API Integrations" 
          value={stats.apiIntegrations} 
          subtext="1 with errors" colorClass="text-purple-600" bgClass="bg-purple-50" 
        />
        <StatusCard 
          icon={Smartphone} title="Devices Online" 
          value={stats.devicesOnline} 
          subtext="1 Offline" colorClass="text-cyan-600" bgClass="bg-cyan-50" 
        />
        <StatusCard 
          icon={Bell} title="Pending Notifications" 
          value="3" 
          subtext="Requires attention" colorClass="text-orange-600" bgClass="bg-orange-50" 
        />
      </div>

      {/* Middle Grid: Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module Management */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
           <SectionHeader title="Module Management" action="Configure" />
           <div className="space-y-4 mt-4">
              <div className="flex justify-between text-sm items-center">
                 <span className="text-gray-600">Modules Installed</span>
                 <span className="font-semibold">{stats.modulesInstalled}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                 <span className="text-gray-600">Currently Active</span>
                 <span className="font-semibold text-green-600 bg-green-50 px-2 rounded-full">{stats.modulesActive}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                 <span className="text-gray-600">Under Maintenance</span>
                 <span className="font-semibold text-orange-600 bg-orange-50 px-2 rounded-full">1</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: '67%' }}></div>
              </div>
           </div>
        </div>

        {/* User Roles */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
           <SectionHeader title="User Roles & Permissions" action="Manage" />
           <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm border-b pb-2">
                 <span className="text-gray-600">Total Roles</span>
                 <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                 <span className="text-gray-600">Active Users</span>
                 <span className="font-medium bg-green-100 text-green-800 px-2 rounded-full text-xs flex items-center">{stats.usersWithPermissions}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                  Top Roles: Trainers (18), Front Desk (8)
              </div>
           </div>
        </div>

        {/* API Integration */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
           <SectionHeader title="API Integration" action="Configure" />
           <div className="space-y-4 mt-4">
              <div className="flex justify-between text-sm">
                 <span className="text-gray-600">Connected APIs</span>
                 <span className="font-semibold">{stats.apiIntegrations}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                 <span className="text-gray-600">Health Status</span>
                 <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">1 Error</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                 <span className="text-gray-600">Success Rate</span>
                 <span className="text-green-600 font-bold">97.8%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '97%' }}></div>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Grid: Devices, Config, Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Access Control */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
            <SectionHeader title="Access Control Devices" action="Manage" />
            <div className="flex items-center justify-between mt-4">
               <div>
                  <div className="text-sm text-gray-500">Total Devices</div>
                  <div className="text-xl font-bold">19</div>
               </div>
               <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">18 Online</div>
                  <div className="text-xs text-red-500 font-medium">1 Offline</div>
               </div>
            </div>
        </div>

        {/* System Config */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
            <SectionHeader title="System Configuration" action="Settings" />
            <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">Config Changes</div>
                <div className="font-medium">12 this month</div>
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-gray-600">Backup Status</div>
                <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Completed</div>
            </div>
        </div>

        {/* Notifications Summary */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
            <SectionHeader title="Notifications" action="View All" />
            <div className="space-y-2 mt-2">
                <div className="p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700 font-medium flex justify-between">
                    <span>Device Offline</span>
                    <span>VIP Area</span>
                </div>
                <div className="p-2 bg-yellow-50 border border-yellow-100 rounded text-xs text-yellow-700 font-medium flex justify-between">
                    <span>API Rate Limit</span>
                    <span>IoT Hub</span>
                </div>
            </div>
        </div>
      </div>

      {/* Module Table (Bottom Section) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
               <Folder size={18} className="text-blue-500"/> Module Status & Performance
            </h3>
            <p className="text-xs text-gray-500">Real-time status of all system modules</p>
          </div>
          <button className="text-sm border bg-white px-3 py-1.5 rounded-lg text-gray-600 shadow-sm hover:bg-gray-50">
             Module Settings
          </button>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Module Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Uptime</th>
              <th className="px-6 py-3">Last Update</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {modules.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{m.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                    ${m.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}
                  `}>
                    {m.status === 'Active' ? '● Active' : '● Maintenance'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-teal-600 h-1.5 rounded-full" style={{width: `${m.uptime}%`}}></div>
                    </div>
                    <span className="text-xs text-gray-500">{m.uptime}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{m.lastUpdate}</td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-600"><Settings size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}