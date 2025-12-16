// FILE: src/components/AssetTransaction.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  X,
  ShoppingCart,
  Wrench,
  ArrowRightLeft,
  UserPlus,
  TrendingDown,
  Trash2,
  DollarSign,
  ShieldAlert,
  ChevronDown,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  FileText,
  Paperclip,
  MapPin,
  Printer,
  User,
  Box,
  Edit
} from "lucide-react";

// --- API IMPORTS ---
import { getAssets } from "../api/assets"; 
import { getMembers } from "../api/member";
import { 
  getAllTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction, 
  updateTransactionStatus 
} from "../api/AssetTransactionApi";

export default function AssetTransaction() {
  // --- STATE MANAGEMENT ---
  const [transactions, setTransactions] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterLocation, setFilterLocation] = useState("All Locations");

  // UI States
  const [modalType, setModalType] = useState(null); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null); 
  const [activeActionMenu, setActiveActionMenu] = useState(null); 
  
  const actionMenuRef = useRef(null);

  // --- CONFIGURATION ---
  const transactionTypes = [
    { id: "Purchase", label: "Asset Purchase", icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", hover: "hover:bg-emerald-50" },
    { id: "Maintenance", label: "Maintenance", icon: Wrench, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", hover: "hover:bg-orange-50" },
    { id: "Transfer", label: "Asset Transfer", icon: ArrowRightLeft, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", hover: "hover:bg-blue-50" },
    { id: "Assignment", label: "Assign to Staff", icon: UserPlus, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", hover: "hover:bg-purple-50" },
    { id: "Depreciation", label: "Depreciation Entry", icon: TrendingDown, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", hover: "hover:bg-red-50" },
    { id: "Disposal", label: "Asset Disposal", icon: Trash2, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-100", hover: "hover:bg-gray-50" },
    { id: "Sale", label: "Asset Sale", icon: DollarSign, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", hover: "hover:bg-green-50" },
    { id: "Insurance", label: "Insurance Claim", icon: ShieldAlert, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", hover: "hover:bg-indigo-50" },
  ];

  const vendorList = [
    { id: 1, name: "FitnessTech Solutions", type: "Equipment Supplier", icon: ShoppingCart },
    { id: 2, name: "GymFix Pros", type: "Maintenance Provider", icon: Wrench },
    { id: 3, name: "Green Recycling UAE", type: "Disposal Service", icon: Trash2 },
    { id: 4, name: "Emirates Insurance", type: "Insurance Provider", icon: ShieldAlert },
    { id: 5, name: "Tech Solutions UAE", type: "IT Equipment", icon: Box },
  ];

  const locationList = [
    "Dubai Branch - Cardio Zone",
    "Dubai Branch - Free Weights",
    "Dubai Branch - Reception",
    "Dubai Branch - Admin Office",
    "Marina Branch - Cardio Zone",
    "Warehouse",
    "Disposal Facility"
  ];

  // --- INITIAL FORM STATE ---
  const initialFormState = {
    type: transactionTypes[0].label, 
    asset: null,        
    date: new Date().toISOString().split('T')[0],
    value: "",
    location: "",
    assignedTo: null,   
    vendor: null,       
    invoice: "",
    description: "",
    notes: "",
    requiresApproval: false
  };
  const [form, setForm] = useState(initialFormState);

  // --- DATA LOADING ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Transactions from Backend
      const txns = await getAllTransactions();
      setTransactions(Array.isArray(txns) ? txns : []);

      // 2. Fetch Assets
      const assetsData = await getAssets(); 
      const formattedAssets = Array.isArray(assetsData) ? assetsData.map(a => ({
        id: a.id,
        name: a.name, 
        subtitle: a.id, 
        location: a.location,
        displayLabel: `${a.name} (${a.id})`, 
        icon: Box
      })) : [];
      setAssetsList(formattedAssets);

      // 3. Fetch Members
      const membersData = await getMembers();
      const formattedMembers = Array.isArray(membersData) ? membersData.map(m => ({
        id: m.id,
        name: `${m.firstname} ${m.lastname}`,
        subtitle: m.role || "Member",
        icon: User
      })) : [];
      setMemberList(formattedMembers);
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    function handleClickOutside(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActiveActionMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- DYNAMIC STATISTICS CALCULATION ---
  // This calculates totals directly from the current transactions state
  const calculateStats = () => {
    return transactions.reduce((acc, t) => {
      const type = t.transactionType || "";
      const status = t.status || "";
      const value = parseFloat(t.value) || 0;

      // 1. Total Purchases: Check for "Purchase" types
      if (type === "Asset Purchase" || type === "Purchase") {
        acc.totalPurchases += value;
      }

      // 2. Maintenance Costs: Check for "Maintenance" types
      if (type === "Maintenance") {
        acc.maintenanceCosts += value;
      }

      // 3. Active Assignments: Check for Assignments that are Active
      if ((type === "Assign to Staff" || type === "Assignment") && status === "Active") {
        acc.activeAssignments += 1;
      }

      // 4. Pending Reviews: Check for Pending or In-Review status across all types
      if (status === "Pending" || status === "In-Review") {
        acc.pendingReviews += 1;
      }

      return acc;
    }, { totalPurchases: 0, maintenanceCosts: 0, activeAssignments: 0, pendingReviews: 0 });
  };

  const stats = calculateStats();

  // --- ACTIONS HANDLERS ---

  const handleOpenCreateModal = () => {
    const defaultType = transactionTypes[0]; 
    setModalType(defaultType);
    setIsEditMode(false);
    setEditingId(null);
    setForm({ ...initialFormState, type: defaultType.label });
  };

  const handleEditTransaction = (txn) => {
    const typeConfig = transactionTypes.find(t => t.label === txn.transactionType) || transactionTypes[0];
    
    // Reconstruct Objects for Dropdowns
    const assetObj = assetsList.find(a => a.id === txn.assetId) || { displayLabel: txn.assetName, id: txn.assetId, name: txn.assetName };
    const assignedObj = memberList.find(m => m.name === txn.assignedTo) || (txn.assignedTo ? { name: txn.assignedTo, subtitle: "Staff", icon: User } : null);
    
    // Vendor is stored as string in backend, map back to object if possible, else create shell
    const vendorObj = vendorList.find(v => v.name === txn.vendor) || (txn.vendor ? { name: txn.vendor, subtitle: "Provider", icon: Wrench } : null);

    setModalType(typeConfig);
    setIsEditMode(true);
    setEditingId(txn.id); // This is the Long ID from DB
    
    setForm({
      type: typeConfig.label,
      asset: assetObj,
      date: txn.date,
      value: txn.value,
      location: txn.location,
      assignedTo: assignedObj,
      vendor: vendorObj, 
      invoice: txn.invoiceNumber || "",
      description: txn.description || "",
      notes: txn.notes || "",
      requiresApproval: txn.requiresApproval || false
    });

    setActiveActionMenu(null); 
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTransactionStatus(id, newStatus);
      // Optimistic Update
      setTransactions(prev => prev.map(t => 
          t.id === id ? { ...t, status: newStatus } : t
      ));
      setActiveActionMenu(null);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction permanently?")) {
      try {
        await deleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
        setActiveActionMenu(null);
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete transaction");
      }
    }
  };

  const handleSave = async () => {
    if (!form.asset || !form.date) {
      alert("Please fill in required fields (Asset, Date)");
      return;
    }

    const payload = {
      transactionType: form.type,
      assetName: form.asset.name || form.asset.displayLabel,
      assetId: form.asset.id,
      date: form.date,
      value: form.value || 0,
      status: isEditMode ? undefined : "Pending", // Backend handles default for new
      location: form.location || "Unassigned",
      assignedTo: form.assignedTo ? form.assignedTo.name : null,
      vendor: form.vendor ? form.vendor.name : null,
      invoiceNumber: form.invoice,
      description: form.description,
      notes: form.notes,
      requiresApproval: form.requiresApproval
    };

    try {
      if (isEditMode) {
        const updated = await updateTransaction(editingId, payload);
        setTransactions(transactions.map(t => t.id === editingId ? updated : t));
      } else {
        const created = await createTransaction(payload);
        setTransactions([created, ...transactions]);
      }
      setModalType(null);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save transaction");
    }
  };

  // --- FILTERING ---
  const filteredTransactions = transactions.filter(t => {
    const searchLower = query.toLowerCase();
    const matchesSearch = 
      (t.assetName && t.assetName.toLowerCase().includes(searchLower)) ||
      (t.transactionId && t.transactionId.toLowerCase().includes(searchLower)) ||
      (t.transactionType && t.transactionType.toLowerCase().includes(searchLower)) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(searchLower));

    // Map filters to backend field names
    const matchesType = filterType === "All Types" || t.transactionType === filterType;
    const matchesStatus = filterStatus === "All Status" || t.status === filterStatus;
    const matchesLocation = filterLocation === "All Locations" || t.location === filterLocation;

    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  const getTypeConfig = (typeLabel) => transactionTypes.find(t => t.label === typeLabel) || transactionTypes[0];

  // --- RENDER ---
  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asset Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">Complete lifecycle transaction management and audit trail</p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition">
            <Download size={16} /> Export Ledger
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 shadow-sm transition"
          >
            <Plus size={16} /> New Transaction
          </button>
        </div>
      </header>

      {/* Stats Dashboard (DYNAMIC) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Purchases" value={`AED ${stats.totalPurchases.toLocaleString()}`} icon={ShoppingCart} colorClass="text-emerald-600 bg-emerald-100" />
        <StatCard label="Maintenance Costs" value={`AED ${stats.maintenanceCosts.toLocaleString()}`} icon={Wrench} colorClass="text-orange-600 bg-orange-100" />
        <StatCard label="Active Assignments" value={stats.activeAssignments.toString()} icon={UserPlus} colorClass="text-blue-600 bg-blue-100" />
        <StatCard label="Pending Reviews" value={stats.pendingReviews.toString()} icon={Clock} colorClass="text-purple-600 bg-purple-100" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <div className="flex items-center gap-2 text-gray-500 font-medium text-sm mr-2">
           <Filter size={16} /> Transaction Filters
        </div>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            placeholder="Search transactions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[140px] text-gray-600 outline-none focus:border-emerald-500">
          <option>All Types</option>
          {transactionTypes.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[140px] text-gray-600 outline-none focus:border-emerald-500">
          <option>All Status</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Active</option>
          <option>In-Review</option>
        </select>

        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[140px] text-gray-600 outline-none focus:border-emerald-500">
          <option>All Locations</option>
          {locationList.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[140px] text-gray-600 outline-none focus:border-emerald-500">
           <option>All Time</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible pb-12">
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Asset Transaction Ledger</h3>
            <p className="text-xs text-gray-500">Complete audit trail of all asset lifecycle transactions ({filteredTransactions.length} records)</p>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Transaction ID</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="9" className="px-6 py-10 text-center text-gray-500">Loading transactions...</td></tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => {
                  const typeConfig = getTypeConfig(t.transactionType);
                  return (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`p-2 rounded-md ${typeConfig.bg}`}>
                          <typeConfig.icon size={16} className={typeConfig.color} />
                      </div>
                      <span className="font-medium text-gray-700">{t.transactionId}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{t.transactionType}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{t.assetName}</div>
                      <div className="text-xs text-gray-400">{t.assetId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-1">
                        <Clock size={12} className="text-gray-400"/> {t.date}
                    </td>
                    <td className={`px-6 py-4 font-medium ${t.value > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {t.value > 0 ? '+' : ''} AED {t.value}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">{t.location}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {t.assignedTo ? (
                          <div className="flex items-center gap-2">
                              <User size={14} className="text-gray-400"/> {t.assignedTo}
                          </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2 relative">
                      <button onClick={() => setSelectedTxn(t)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition"><Eye size={16} /></button>
                      <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setActiveActionMenu(activeActionMenu === t.id ? null : t.id); }} className={`p-1.5 rounded-full transition ${activeActionMenu === t.id ? 'bg-gray-100 text-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                              <MoreHorizontal size={16} />
                          </button>
                          {activeActionMenu === t.id && (
                              <div ref={actionMenuRef} className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-left animation-fade-in">
                                  <button onClick={() => handleEditTransaction(t)} className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition">
                                      <Edit size={14} className="text-gray-400" /> Edit Transaction
                                  </button>
                                  <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition">
                                      <Printer size={14} className="text-gray-400" /> Generate Report
                                  </button>
                                  <button className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition">
                                      <Paperclip size={14} className="text-gray-400" /> Attach Documents
                                  </button>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mark Status</div>
                                  <button onClick={() => handleStatusChange(t.id, 'Completed')} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition">
                                      <CheckCircle size={14} className="text-emerald-500" /> Completed
                                  </button>
                                  <button onClick={() => handleStatusChange(t.id, 'Active')} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition">
                                      <Activity size={14} className="text-blue-500" /> Active
                                  </button>
                                  <button onClick={() => handleStatusChange(t.id, 'Pending')} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2 transition">
                                      <Clock size={14} className="text-amber-500" /> Pending
                                  </button>
                                  <button onClick={() => handleStatusChange(t.id, 'In-Review')} className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition">
                                      <ShieldAlert size={14} className="text-indigo-500" /> In Review
                                  </button>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button onClick={() => handleDeleteTransaction(t.id)} className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition">
                                      <Trash2 size={14} className="text-red-500" /> Delete Transaction
                                  </button>
                              </div>
                          )}
                      </div>
                    </td>
                  </tr>
                )})
              ) : (
                 <tr>
                    <td colSpan="9" className="px-6 py-10 text-center text-gray-500">
                      No transactions found matching your filters.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      {modalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] animation-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${modalType.bg} ${modalType.border} border`}>
                  <modalType.icon size={28} className={modalType.color} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit' : 'New'} Asset Transaction</h2>
                  <p className="text-sm text-gray-500 font-medium">Type: <span className={`${modalType.color}`}>{modalType.label}</span></p>
                </div>
              </div>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
                <p className="text-sm text-gray-500 mb-6">
                  {isEditMode ? "Update the details of this existing transaction record." : "Create a new asset transaction record for complete lifecycle tracking."}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5 relative z-30">
                        <label className="text-sm font-medium text-gray-700">Transaction Type <span className="text-red-500">*</span></label>
                        <SearchableDropdown 
                            options={transactionTypes}
                            value={transactionTypes.find(t => t.label === form.type)}
                            onChange={(val) => {
                                setForm({...form, type: val.label});
                                setModalType(val); 
                            }}
                            placeholder="Select Type"
                            displayKey="label"
                            iconKey="icon"
                        />
                    </div>
                    <div className="space-y-1.5 relative z-30">
                        <label className="text-sm font-medium text-gray-700">Asset <span className="text-red-500">*</span></label>
                        <SearchableDropdown 
                            options={assetsList}
                            value={form.asset}
                            onChange={(val) => setForm({...form, asset: val})}
                            placeholder="Select asset"
                            displayKey="name"
                            subtitleKey="subtitle"
                            iconKey="icon"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Transaction Date <span className="text-red-500">*</span></label>
                        <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-gray-700" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Value (AED)</label>
                        <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-gray-700" value={form.value} onChange={(e) => setForm({...form, value: e.target.value})} placeholder="0.00" />
                    </div>
                    <div className="space-y-1.5 relative z-20">
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <SearchableDropdown 
                            options={locationList.map(l => ({ name: l }))}
                            value={form.location ? { name: form.location } : null}
                            onChange={(val) => setForm({...form, location: val.name})}
                            placeholder="Select location"
                            displayKey="name"
                        />
                    </div>
                    <div className="space-y-1.5 relative z-20">
                        <label className="text-sm font-medium text-gray-700">Assigned To / Staff Member</label>
                         <SearchableDropdown 
                            options={memberList}
                            value={form.assignedTo}
                            onChange={(val) => setForm({...form, assignedTo: val})}
                            placeholder="Select staff member"
                            displayKey="name"
                            subtitleKey="subtitle"
                            iconKey="icon"
                        />
                    </div>
                    <div className="space-y-1.5 relative z-10">
                        <label className="text-sm font-medium text-gray-700">Vendor / Service Provider</label>
                        <SearchableDropdown 
                            options={vendorList}
                            value={form.vendor}
                            onChange={(val) => setForm({...form, vendor: val})}
                            placeholder="Select vendor"
                            displayKey="name"
                            subtitleKey="type"
                            iconKey="icon"
                        />
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Invoice / Reference Number</label>
                        <input className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-gray-700" value={form.invoice} onChange={(e) => setForm({...form, invoice: e.target.value})} placeholder="INV-2024-001" />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></label>
                        <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none text-gray-700" placeholder="Describe the transaction details..." value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
                    </div>
                     <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Additional Notes</label>
                        <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none text-gray-700" placeholder="Any additional notes or comments..." value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={2} />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
                        <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer" checked={form.requiresApproval} onChange={(e) => setForm({...form, requiresApproval: e.target.checked})} />
                        <span className="text-sm text-gray-600">Requires Management Approval</span>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setModalType(null)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2.5 bg-[#0F5156] text-white rounded-lg text-sm font-medium hover:bg-[#0b3d41] shadow-sm transition">{isEditMode ? 'Save Changes' : 'Create Transaction'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] animation-scale-in">
                <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-emerald-50`}>
                            <ShoppingCart size={24} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Transaction Details</h2>
                            <p className="text-sm text-gray-500">{selectedTxn.transactionId} - {selectedTxn.transactionType}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedTxn(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
                </div>
                
                <div className="p-8 overflow-y-auto custom-scrollbar bg-gray-50/50">
                     <p className="text-xs text-gray-500 mb-6">Complete information about this asset transaction</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                            <div className="text-2xl font-bold text-gray-800 mb-1 leading-tight">{selectedTxn.transactionId.split('-')[1] || '000'}<br/><span className="text-lg text-gray-600">{selectedTxn.transactionId.split('-')[2] || '2025'}</span></div>
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Transaction ID</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center flex flex-col justify-center">
                             <div className="text-xl font-bold text-gray-800 mb-1">{selectedTxn.date}</div>
                             <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Transaction Date</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center flex flex-col justify-center">
                             <div className={`text-xl font-bold mb-1 ${selectedTxn.value > 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                                {selectedTxn.value > 0 ? '+' : ''}AED {selectedTxn.value}
                             </div>
                             <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Transaction Value</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div className="space-y-6">
                                <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Asset Information</label><div className="font-semibold text-gray-900">{selectedTxn.assetName}</div><div className="text-sm text-emerald-600">{selectedTxn.assetId}</div></div>
                                <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Transaction Type</label><div className="flex items-center gap-2 text-gray-700 font-medium">{React.createElement(getTypeConfig(selectedTxn.transactionType).icon, {size: 16})} {selectedTxn.transactionType}</div></div>
                                <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label><StatusBadge status={selectedTxn.status} /></div>
                                <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Location</label><div className="flex items-start gap-2 text-gray-700 text-sm"><MapPin size={16} className="mt-0.5 text-gray-400" />{selectedTxn.location}</div></div>
                            </div>
                            <div className="space-y-6">
                                <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Assigned To</label><div className="text-sm text-gray-700">{selectedTxn.assignedTo || 'Not assigned'}</div></div>
                                <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Vendor / Service Provider</label><div className="flex items-center gap-2 text-sm text-gray-700">{selectedTxn.vendor ? (<><div className="p-1 rounded bg-orange-100"><Wrench size={12} className="text-orange-600"/></div>{selectedTxn.vendor}</>) : <span className="text-gray-400">—</span>}</div></div>
                                <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Invoice Number</label><div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block border border-gray-100"><FileText size={12} /> {selectedTxn.invoiceNumber || 'N/A'}</div></div>
                            </div>
                            <div className="col-span-1 md:col-span-2 pt-4 border-t border-dashed border-gray-200">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Description</label><p className="text-sm text-gray-700 leading-relaxed">{selectedTxn.description || "No description provided."}</p>
                            </div>
                             <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Additional Notes</label><p className="text-sm text-gray-500 italic">{selectedTxn.notes || "No additional notes."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
      <div><p className="text-xs text-gray-500 font-medium mb-1">{label}</p><h4 className="text-xl font-bold text-gray-900">{value}</h4></div>
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-20`}><Icon size={20} /></div>
    </div>
  );
}

function StatusBadge({ status }) {
    const styles = { Completed: "bg-emerald-100 text-emerald-700 border-emerald-200", Active: "bg-blue-100 text-blue-700 border-blue-200", Pending: "bg-amber-100 text-amber-700 border-amber-200", "In-Review": "bg-indigo-100 text-indigo-700 border-indigo-200" };
    const icons = { Completed: CheckCircle, Active: Activity, Pending: Clock, "In-Review": ShieldAlert }
    const Icon = icons[status] || Activity;
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100 text-gray-700"}`}><Icon size={12} className="mr-1" /> {status}</span>;
}

function SearchableDropdown({ options, value, onChange, placeholder, displayKey, subtitleKey, iconKey, disabled }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) { if (ref.current && !ref.current.contains(event.target)) { setIsOpen(false); } }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt[displayKey].toLowerCase().includes(search.toLowerCase()) || (subtitleKey && opt[subtitleKey] && opt[subtitleKey].toString().toLowerCase().includes(search.toLowerCase())));

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => !disabled && setIsOpen(!isOpen)} className={`w-full border ${disabled ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 cursor-pointer hover:border-emerald-400'} rounded-lg px-3 py-2.5 text-sm flex items-center justify-between transition-all`}>
                <span className={`${!value ? 'text-gray-400' : 'text-gray-700'} truncate flex items-center gap-2`}>
                   {value && iconKey && value[iconKey] && React.createElement(value[iconKey], { size: 16, className: value.color || "text-gray-500" })}
                   {value ? value[displayKey] : placeholder}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar p-1">
                    <div className="p-2 sticky top-0 bg-white border-b border-gray-50 z-10">
                        <div className="relative"><Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" /><input autoFocus placeholder="Search..." className="w-full text-xs py-2 pl-8 pr-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                    </div>
                    {filteredOptions.length === 0 ? <div className="p-4 text-xs text-gray-400 text-center italic">No results found</div> : (
                        <div className="py-1">
                            {filteredOptions.map((opt, idx) => (
                                <div key={idx} onClick={() => { onChange(opt); setIsOpen(false); setSearch(""); }} className={`px-3 py-2.5 mx-1 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${value?.id === opt.id ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-gray-50 text-gray-700'} group`}>
                                    {iconKey && opt[iconKey] && <div className={`${value?.id === opt.id ? 'text-emerald-700' : (opt.color || "text-gray-400")}`}>{React.createElement(opt[iconKey], { size: 16 })}</div>}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className={`text-sm font-medium truncate ${value?.id === opt.id ? 'text-emerald-900' : ''}`}>{opt[displayKey]}</span>
                                        {subtitleKey && <span className={`text-[10px] uppercase tracking-wide truncate ${value?.id === opt.id ? 'text-emerald-700' : 'text-gray-400'}`}>{opt[subtitleKey]}</span>}
                                    </div>
                                    {value?.id === opt.id && <CheckCircle size={14} className="text-emerald-600" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}