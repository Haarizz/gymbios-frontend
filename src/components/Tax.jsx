// src/pages/Tax.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Settings, PieChart, FileCheck, // Tab Icons
  Plus, History, DollarSign, AlertCircle, Bell, CheckCircle, // KPI & Action Icons
  Edit, Trash2, Search, Download, Upload, ExternalLink, ChevronDown, File, X, CloudUpload 
} from 'lucide-react';
import { TaxApi } from '../api/TaxApi'; // Ensure this path matches your file structure

export default function Tax() {
  // --- 1. State Management ---
  
  // Default active tab
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal Visibility States
  const [isAddTaxModalOpen, setIsAddTaxModalOpen] = useState(false);
  const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);
  
  // Mode States
  const [isEditConfigMode, setIsEditConfigMode] = useState(false);

  // --- 2. Data Management (Starts Empty, Fetches from API) ---

  const [taxConfigs, setTaxConfigs] = useState([]);
  const [filingsData, setFilingsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 3. API Fetching ---

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [configs, filings] = await Promise.all([
        TaxApi.getAllConfigs(),
        TaxApi.getAllFilings()
      ]);
      setTaxConfigs(configs);
      setFilingsData(filings);
    } catch (error) {
      console.error("Failed to fetch tax data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- 4. Dynamic KPI Calculations ---
  const kpiData = useMemo(() => {
    let pending = 0;
    let overdueCount = 0;
    let filedCount = 0;
    let dueThisWeekCount = 0;

    filingsData.forEach(f => {
      // Calculate totals
      if (f.status === 'Pending' || f.status === 'Overdue') {
        pending += Number(f.amount || 0);
      }
      if (f.status === 'Overdue') {
        overdueCount++;
      }
      if (f.status === 'Filed') {
        filedCount++;
      }
      
      // Simple check for "Due This Week" (Mock logic for demo comparison)
      // In a real app, compare f.dueDate with current date
      if (f.status !== 'Filed' && f.dueDate.includes('7 days')) { // logic depends on date format
         dueThisWeekCount++;
      }
    });

    return {
      pendingAmount: pending.toLocaleString(),
      overdue: overdueCount,
      filedThisMonth: filedCount,
      dueThisWeek: dueThisWeekCount
    };
  }, [filingsData]);

  // --- 5. Forms State ---

  const [configForm, setConfigForm] = useState({
    id: null,
    type: '',
    frequency: '',
    rate: '',
    accounts: '',
    status: 'Active'
  });

  const [filingForm, setFilingForm] = useState({
    id: null,
    type: '',
    period: '',
    amount: '',
    status: 'Pending',
    notes: '',
    documents: 0
  });

  // --- 6. Helper Functions ---
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Filed': return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200 uppercase">Filed</span>;
      case 'Pending': return <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-200 uppercase">Pending</span>;
      case 'Overdue': return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200 uppercase">Overdue</span>;
      default: return null;
    }
  };

  // --- 7. Handlers ---

  // Configuration Handlers
  const handleOpenAddConfig = () => {
    setIsEditConfigMode(false);
    setConfigForm({ id: null, type: '', frequency: '', rate: '', accounts: '', status: 'Active' });
    setIsAddTaxModalOpen(true);
  };

  const handleOpenEditConfig = (config) => {
    setIsEditConfigMode(true);
    setConfigForm({
      id: config.id,
      type: config.type,
      frequency: config.frequency,
      rate: config.rate,
      accounts: config.accounts ? config.accounts.join(', ') : '',
      status: config.status
    });
    setIsAddTaxModalOpen(true);
  };

  const handleDeleteConfig = async (id) => {
    if(window.confirm("Are you sure you want to delete this tax configuration? This will also delete all associated filings.")) {
      try {
        await TaxApi.deleteConfig(id);
        fetchDashboardData(); // Refresh list
      } catch (error) {
        console.error("Error deleting config:", error);
        alert("Failed to delete configuration");
      }
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    
    // Convert comma-separated string to array for backend
    const accountList = configForm.accounts.split(',').map(s => s.trim()).filter(s => s);
    
    const payload = {
      type: configForm.type,
      frequency: configForm.frequency,
      rate: configForm.rate,
      accounts: accountList,
      status: configForm.status
    };

    try {
      if (isEditConfigMode) {
        await TaxApi.updateConfig(configForm.id, payload);
      } else {
        await TaxApi.addConfig(payload);
      }
      setIsAddTaxModalOpen(false);
      fetchDashboardData(); // Refresh all data (including automatically created filings)
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration");
    }
  };

  // Filing Handlers
  const handleOpenFilingModal = (filingId) => {
    const filing = filingsData.find(f => f.id === filingId);
    if (!filing) return;

    setFilingForm({
      id: filing.id,
      type: filing.type,
      period: filing.period,
      amount: filing.amount === 0 ? '' : filing.amount,
      status: filing.status,
      notes: filing.notes || '',
      documents: filing.documents
    });
    setIsFilingModalOpen(true);
  };

  const handleSaveFiling = async (e) => {
    e.preventDefault();
    
    const payload = {
      amount: parseFloat(filingForm.amount),
      status: filingForm.status,
      notes: filingForm.notes
    };

    try {
      await TaxApi.updateFiling(filingForm.id, payload);
      setIsFilingModalOpen(false);
      fetchDashboardData(); // Refresh to see updated status/amounts
    } catch (error) {
      console.error("Error updating filing:", error);
      alert("Failed to update filing status");
    }
  };

  // Search Logic
  const filteredFilings = filingsData.filter(f => 
    f.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen">Loading Tax Dashboard...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800 relative">
      
      {/* HEADER */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-700 p-2.5 rounded-lg text-white shadow-sm">
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax Compliance Dashboard</h1>
            <p className="text-sm text-gray-500">Manage Corporate Tax, VAT, and Excise Tax compliance in one centralized interface</p>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition">
             <History size={16}/> Audit Log
           </button>
           <button 
             onClick={handleOpenAddConfig}
             className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-800 shadow-sm transition"
           >
             <Plus size={16}/> Add Tax Type
           </button>
        </div>
      </header>

      {/* KPI CARDS (Calculated Realtime) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-600"></div>
          <div className="flex justify-between items-start">
             <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Total Pending Amount</h4>
             <DollarSign size={16} className="text-gray-400"/>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">AED {kpiData.pendingAmount}</div>
            <div className="text-[10px] text-gray-400">Across all tax types</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex justify-between items-start">
             <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Overdue Filings</h4>
             <AlertCircle size={16} className="text-red-500"/>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{kpiData.overdue}</div>
            <div className="text-[10px] text-gray-500">Requires immediate attention</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
          <div className="flex justify-between items-start">
             <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Due This Week</h4>
             <Bell size={16} className="text-yellow-600"/>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{kpiData.dueThisWeek}</div>
            <div className="text-[10px] text-gray-400">Upcoming in next 7 days</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between h-32">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <div className="flex justify-between items-start">
             <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Filed This Month</h4>
             <CheckCircle size={16} className="text-green-600"/>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{kpiData.filedThisMonth}</div>
            <div className="text-[10px] text-gray-400">Successfully completed</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 flex overflow-hidden">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'configuration', label: 'Configuration', icon: Settings },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'filings', label: 'Filings', icon: FileCheck },
        ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${
               activeTab === tab.id 
                 ? 'border-teal-600 text-teal-800 bg-teal-50/50' 
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
             }`}
           >
             <tab.icon size={16} />
             {tab.label}
           </button>
        ))}
      </div>

      {/* ================= CONTENT: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
           {taxConfigs.length === 0 ? (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                <p>No tax types configured yet.</p>
                <p className="text-sm mt-2">Go to the <strong>Configuration</strong> tab to add your first tax type.</p>
             </div>
           ) : (
            <>
             {/* Dynamic Summary Cards */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {taxConfigs.map((config) => {
                  const latestFiling = filingsData.find(f => f.configId === config.id);
                  return (
                    <div key={config.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-gray-800">{config.type}</h3>
                            <p className="text-xs text-gray-500 mt-1">{latestFiling ? latestFiling.period : 'Current Period'}</p>
                          </div>
                          <span className={`bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded`}>{config.status}</span>
                       </div>

                       <div className="space-y-3 mb-6 flex-grow">
                          <div className="flex justify-between text-sm">
                             <span className="text-gray-600">Next Due Date</span>
                             <span className="font-medium text-gray-900 flex items-center gap-1"><History size={12}/> {latestFiling ? latestFiling.dueDate : 'TBD'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                             <span className="text-gray-600">Amount Payable</span>
                             <span className="font-bold text-teal-700">AED {latestFiling ? Number(latestFiling.amount).toLocaleString() : '0'}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                             <span className="text-gray-800 font-medium">Filing Frequency</span>
                             <span className="bg-gray-100 text-gray-600 px-2 rounded text-xs">{config.frequency}</span>
                          </div>
                       </div>

                       {latestFiling && (
                         <button 
                           onClick={() => handleOpenFilingModal(latestFiling.id)}
                           className="w-full border border-gray-200 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-700 hover:border-teal-200 transition font-medium flex items-center justify-center gap-2 shadow-sm"
                         >
                            <FileText size={16}/> File Return
                         </button>
                       )}
                    </div>
                  );
                })}
             </div>

             {/* Filing History Table */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-gray-800">Filing History</h3>
                      <p className="text-xs text-gray-500 mt-1">Log of all submitted returns</p>
                    </div>
                </div>
                {filingsData.filter(f => f.status === 'Filed').length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No filed returns yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 font-semibold border-b border-gray-100 bg-gray-50/30">
                            <tr>
                                <th className="py-3 pl-4">Tax Type</th>
                                <th className="py-3">Period</th>
                                <th className="py-3">Due Date</th>
                                <th className="py-3">Filed Date</th>
                                <th className="py-3">Amount</th>
                                <th className="py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filingsData.filter(f => f.status === 'Filed').map((f) => (
                                <tr key={f.id} className="hover:bg-gray-50">
                                    <td className="py-4 pl-4 font-medium text-gray-900">{f.type}</td>
                                    <td className="py-4 text-gray-600">{f.period}</td>
                                    <td className="py-4 text-gray-600">{f.dueDate}</td>
                                    <td className="py-4 text-gray-600">{f.filedDate}</td>
                                    <td className="py-4 font-medium text-gray-900">AED {Number(f.amount).toLocaleString()}</td>
                                    <td className="py-4">{getStatusBadge(f.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                  </div>
                )}
             </div>
            </>
           )}
        </div>
      )}

      {/* ================= CONTENT: REPORTS ================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
           <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-800">Financial Tax Reports</h3>
              <p className="text-sm text-gray-500">Generate and download detailed tax reports</p>
           </div>
           
           {taxConfigs.length === 0 ? (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
               <p>No tax data available for reports. Please configure tax types.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {taxConfigs.map((config) => {
                  const latestFiling = filingsData.find(f => f.configId === config.id);
                  return (
                    <div key={config.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
                       <div className="flex items-center gap-2 mb-4">
                          <FileText size={18} className="text-teal-700"/>
                          <h3 className="font-bold text-gray-800">{config.type} Report</h3>
                       </div>
                       
                       <div className="space-y-3 mb-6 flex-grow">
                          <div className="flex justify-between text-sm">
                             <span className="text-gray-600">Linked Accounts</span>
                             <span className="font-medium text-gray-900 text-xs">{config.accounts.length > 0 ? config.accounts.join(', ') : 'None'}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                             <span className="text-gray-800 font-medium">Current Status</span>
                             <span className="font-bold text-gray-900">{latestFiling ? latestFiling.status : 'N/A'}</span>
                          </div>
                       </div>

                       <div className="flex justify-between items-center text-sm mb-6 mt-auto">
                          <span className="font-bold text-gray-800">Total Payable</span>
                          <span className="font-bold text-teal-700 text-lg">AED {latestFiling ? Number(latestFiling.amount).toLocaleString() : '0'}</span>
                       </div>

                       <div className="flex gap-2">
                          <button className="flex-1 border border-gray-200 py-2 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                             <FileText size={14}/> Excel
                          </button>
                          <button className="flex-1 border border-gray-200 py-2 rounded text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                             <FileText size={14}/> PDF
                          </button>
                       </div>
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      )}

      {/* ================= CONTENT: FILINGS (With Working Search) ================= */}
      {activeTab === 'filings' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Tax Filings Management</h3>
              <p className="text-sm text-gray-500">Manage tax periods, filing due dates, and document uploads</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by tax type or period..." 
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* List of Filings */}
          <div className="space-y-4">
            {filteredFilings.length === 0 ? (
               <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
                 <p className="text-gray-500">
                   {filingsData.length === 0 
                     ? "No filings available. Add a tax type in Configuration to generate a filing." 
                     : "No filings found matching your search."}
                 </p>
               </div>
            ) : (
              filteredFilings.map((filing) => (
                <div key={filing.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center ${filing.status === 'Filed' ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                        {filing.status === 'Filed' ? <CheckCircle size={20} /> : <History size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-800">{filing.type}</h4>
                          {getStatusBadge(filing.status)}
                        </div>
                        <p className="text-sm text-gray-500">Tax Period: {filing.period}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenFilingModal(filing.id)}
                        className="p-2 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg border border-gray-200 transition"
                      >
                        <Edit size={16}/>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg border border-gray-200 transition">
                        <Upload size={16}/>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><div className="text-xs text-gray-500 mb-1">Due Date:</div><div className="text-sm font-medium text-gray-800">{filing.dueDate}</div></div>
                    <div><div className="text-xs text-gray-500 mb-1">Amount:</div><div className="text-sm font-bold text-teal-700">AED {Number(filing.amount).toLocaleString()}</div></div>
                    <div><div className="text-xs text-gray-500 mb-1">Documents:</div><div className="text-sm font-medium text-gray-800">{filing.documents} file(s)</div></div>
                  </div>

                  {(filing.notes || filing.attachments?.length > 0) && (
                    <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                       {filing.notes && <div className="text-xs text-gray-600 mb-2"><span className="font-semibold text-gray-700">Notes:</span> {filing.notes}</div>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= CONTENT: CONFIGURATION ================= */}
      {activeTab === 'configuration' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
           <div className="mb-6">
             <h3 className="font-bold text-gray-800 text-lg">Tax Type Configuration</h3>
             <p className="text-sm text-gray-500 mt-1">Define and manage tax types</p>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 font-semibold border-b border-gray-100 bg-gray-50/30 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 pl-4">Tax Type</th>
                    <th className="py-4">Filing Frequency</th>
                    <th className="py-4">Rate</th>
                    <th className="py-4">Linked Accounts</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {taxConfigs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        No tax types configured. Click "Add Tax Type" to start.
                      </td>
                    </tr>
                  ) : (
                    taxConfigs.map((tax) => (
                      <tr key={tax.id} className="hover:bg-gray-50 transition-colors">
                         <td className="py-5 pl-4 font-medium text-gray-900">{tax.type}</td>
                         <td className="py-5">
                           <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs border border-gray-200 font-medium">{tax.frequency}</span>
                         </td>
                         <td className="py-5 text-gray-700">{tax.rate}</td>
                         <td className="py-5">
                           <div className="flex gap-2 flex-wrap">
                             {tax.accounts.map((acc, idx) => (
                               <span key={idx} className="bg-white text-gray-600 px-2 py-1 rounded text-xs border border-gray-200 shadow-sm">{acc}</span>
                             ))}
                           </div>
                         </td>
                         <td className="py-5">
                           <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tax.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{tax.status}</span>
                         </td>
                         <td className="py-5 text-center">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleOpenEditConfig(tax)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-teal-600 transition-colors"><Edit size={16}/></button>
                              <button onClick={() => handleDeleteConfig(tax.id)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                            </div>
                         </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {/* ================= MODAL: ADD/EDIT TAX TYPE (Screenshot 612 Styled) ================= */}
      {isAddTaxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsAddTaxModalOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
               <div>
                 <h2 className="text-lg font-bold text-gray-900">{isEditConfigMode ? 'Edit Tax Type' : 'Add New Tax Type'}</h2>
                 <p className="text-xs text-gray-500">Configure tax type, filing frequency, and linked accounts</p>
               </div>
               <button onClick={() => setIsAddTaxModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveConfig} className="p-6 space-y-4">
               {/* Tax Type with Red Highlight Support */}
               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Tax Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      name="type" 
                      value={configForm.type} 
                      onChange={e => setConfigForm({...configForm, type: e.target.value})} 
                      className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white" 
                      required
                    >
                      <option value="" disabled>Select tax type</option>
                      <option value="Corporate Tax" className="checked:bg-red-50 checked:text-red-600">Corporate Tax</option>
                      <option value="VAT (Value Added Tax)" className="checked:bg-red-50 checked:text-red-600">VAT (Value Added Tax)</option>
                      <option value="Excise Tax" className="checked:bg-red-50 checked:text-red-600">Excise Tax</option>
                      <option value="Customs Duty" className="checked:bg-red-50 checked:text-red-600">Customs Duty</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Filing Frequency <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="frequency" value={configForm.frequency} onChange={e => setConfigForm({...configForm, frequency: e.target.value})} className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white" required>
                      <option value="" disabled>Select frequency</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Tax Rate <span className="text-red-500">*</span></label>
                  <input type="text" value={configForm.rate} onChange={e => setConfigForm({...configForm, rate: e.target.value})} placeholder="e.g., 5%, 9%, 50%" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" required />
               </div>

               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Linked Accounts (comma-separated)</label>
                  <input type="text" value={configForm.accounts} onChange={e => setConfigForm({...configForm, accounts: e.target.value})} placeholder="e.g., Revenue, Operating Expenses" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
               </div>

               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
                  <div className="relative">
                    <select value={configForm.status} onChange={e => setConfigForm({...configForm, status: e.target.value})} className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
               </div>

               <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAddTaxModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-medium rounded-lg text-sm hover:bg-teal-800 shadow-sm transition">{isEditConfigMode ? 'Save Changes' : 'Add Tax Type'}</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPDATE FILING STATUS (Screenshot 623 Styled) ================= */}
      {isFilingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsFilingModalOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Update Filing Status</h2>
                  <p className="text-xs text-gray-500">{filingForm.type} - {filingForm.period}</p>
                </div>
                <button onClick={() => setIsFilingModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"><X size={20} /></button>
             </div>

             <form onSubmit={handleSaveFiling} className="p-6 space-y-4">
                {/* Tax Period (Read Only) */}
                <div className="space-y-1.5">
                   <label className="block text-sm font-semibold text-gray-700">Tax Period</label>
                   <input type="text" value={filingForm.period} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500" />
                </div>

                {/* Amount Payable (With Arrows) */}
                <div className="space-y-1.5">
                   <label className="block text-sm font-semibold text-gray-700">Amount Payable (AED) <span className="text-red-500">*</span></label>
                   <input 
                     type="number" 
                     value={filingForm.amount} 
                     onChange={e => setFilingForm({...filingForm, amount: e.target.value})}
                     className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" 
                     required 
                   />
                </div>

                {/* Filing Status (Red selection logic) */}
                <div className="space-y-1.5">
                   <label className="block text-sm font-semibold text-gray-700">Filing Status <span className="text-red-500">*</span></label>
                   <div className="relative">
                     <select 
                       value={filingForm.status} 
                       onChange={e => setFilingForm({...filingForm, status: e.target.value})}
                       className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                     >
                       <option value="Pending">Pending</option>
                       <option value="Filed" className="checked:bg-red-50 checked:text-red-600">Filed</option>
                       <option value="Overdue" className="checked:bg-red-50 checked:text-red-600">Overdue</option>
                     </select>
                     <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                   </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                   <label className="block text-sm font-semibold text-gray-700">Notes / Remarks</label>
                   <textarea 
                     value={filingForm.notes} 
                     onChange={e => setFilingForm({...filingForm, notes: e.target.value})}
                     placeholder="Add any notes or remarks..." 
                     className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 min-h-[80px]"
                   />
                </div>

                {/* Upload Documents Area (Dashed Box) */}
                <div className="space-y-1.5">
                   <label className="block text-sm font-semibold text-gray-700">Upload Documents</label>
                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer">
                      <CloudUpload size={24} className="text-gray-400 mb-2"/>
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-gray-400 mt-1">PDF, Excel, or XML files</p>
                   </div>
                </div>

                {/* Footer */}
                <div className="pt-4 flex justify-end gap-3">
                   <button type="button" onClick={() => setIsFilingModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-teal-700 text-white font-medium rounded-lg text-sm hover:bg-teal-800 shadow-sm transition">Update Filing</button>
                </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
}