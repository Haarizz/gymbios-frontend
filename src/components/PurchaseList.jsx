import Layout from "./Layout";
import { useEffect, useState } from "react";
import { getPurchases, deletePurchase } from "../api/purchaseApi";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Columns, 
  Eye, 
  Edit3, 
  Trash2,
  ShoppingCart, 
  DollarSign,   
  Clock,        
  Truck,        
  CheckCircle,  
  AlertTriangle, 
  X 
} from "lucide-react";

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [notification, setNotification] = useState({ message: null, type: null }); 
  const navigate = useNavigate();

  const loadPurchases = async () => {
    try {
      const res = await getPurchases();
      setPurchases(res.data);
    } catch (err) {
      console.error("Failed to load purchases:", err);
      setNotification({ message: "Failed to load purchases.", type: "error" });
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase order? This action cannot be undone.")) {
      try {
        await deletePurchase(id);
        setNotification({ message: "Purchase order deleted successfully!", type: "success" });
        loadPurchases(); 
      } catch (err) {
        console.error("Delete failed:", err);
        setNotification({ message: `Failed to delete purchase order: ${err.message || 'Server error.'}`, type: "error" });
      }
    }
  };

  // Notification Banner Component
  const NotificationBanner = ({ message, type }) => {
    if (!message) return null;

    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
    const Icon = isSuccess ? CheckCircle : AlertTriangle;

    return (
      <div className={`p-4 mb-6 border-l-4 rounded-lg flex items-center ${bgColor}`} role="alert">
        <Icon size={20} className="mr-3 flex-shrink-0" />
        <p className="font-medium text-sm flex-grow">{message}</p>
        <button onClick={() => setNotification({ message: null, type: null })} className="ml-4 p-1 rounded-full hover:bg-opacity-50">
          <X size={16} />
        </button>
      </div>
    );
  };

  // Calculate statistics
  const totalPurchases = purchases.length;
  const totalSpend = purchases.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
  const pendingReceipts = purchases.filter(p => p.status === 'Pending' || p.status === 'Ordered').length; 
  const recentSuppliers = new Set(purchases.map(p => p.supplierName)).size;

  return (
    
      <div className="p-6 w-full bg-gray-50 min-h-screen">
        
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
            <p className="text-gray-500 mt-1">
              Manage all incoming inventory and purchase records.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition">
              <Download size={18} />
              Export
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 font-medium shadow-sm transition"
              // FIX: Updated route to '/purchases/add'
              onClick={() => navigate("/purchases/add")}
            >
              <Plus size={18} />
              Add New Purchase
            </button>
          </div>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: Total Purchases */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Purchases</p>
              <h2 className="text-2xl font-bold text-gray-800">{totalPurchases}</h2>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <ShoppingCart size={20} />
            </div>
          </div>

          {/* Card 2: Total Spend */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Spend</p>
              <h2 className="text-2xl font-bold text-green-600">
                AED {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-gray-400 mt-1">This year</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
          </div>

          {/* Card 3: Pending Receipts (Mocked for visual match) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending Receipts</p>
              <h2 className="text-2xl font-bold text-orange-600">{pendingReceipts}</h2>
              <p className="text-xs text-gray-400 mt-1">Awaiting delivery</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Clock size={20} />
            </div>
          </div>

          {/* Card 4: Unique Suppliers */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Unique Suppliers</p>
              <h2 className="text-2xl font-bold text-purple-600">{recentSuppliers}</h2>
              <p className="text-xs text-gray-400 mt-1">In past 90 days</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Truck size={20} />
            </div>
          </div>
        </div>

        {/* --- NOTIFICATION BANNER --- */}
        <NotificationBanner message={notification.message} type={notification.type} />

        {/* --- SEARCH & FILTERS --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by purchase number, supplier..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4 w-full lg:w-auto overflow-x-auto">
             <select className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white focus:outline-none">
                <option>All Status</option>
                <option>Pending</option>
                <option>Received</option>
             </select>
             <select className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 bg-white focus:outline-none">
                <option>All Suppliers</option>
             </select>
             <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
               <Filter size={18} />
               Advanced
             </button>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
             <div>
                <h3 className="text-lg font-semibold text-gray-800">Recent Purchases</h3>
                <p className="text-sm text-gray-500">{purchases.length} records</p>
             </div>
             <button className="flex items-center gap-2 text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
                <Columns size={16} />
                Columns
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  </th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Purchase Number</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th> 
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {purchases.length === 0 
                  ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500">
                        No purchase records found.
                      </td>
                    </tr>
                  ) 
                  : purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-center">
                        <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                      </td>
                      <td className="p-4 text-sm text-gray-700">{p.id}</td>
                      <td className="p-4 font-medium text-gray-900">{p.purchaseNumber}</td>
                      <td className="p-4 text-sm text-gray-700">{p.supplierName}</td>
                      <td className="p-4 text-sm text-gray-700">{p.purchaseDate}</td>
                      <td className="p-4 font-semibold text-gray-900">AED {p.totalAmount ? parseFloat(p.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</td>
                      
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border 
                           ${p.status === "Received" ? "bg-green-100 text-green-800 border-green-200" :
                             p.status === "Pending" ? "bg-orange-100 text-orange-800 border-orange-200" :
                             "bg-gray-100 text-gray-800 border-gray-200"}`}>
                          {p.status || "Unknown"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => navigate(`/view-purchase/${p.id}`)} className="p-1 text-gray-500 hover:text-teal-600 transition">
                              <Eye size={18} />
                           </button>
                           <button onClick={() => navigate(`/edit-purchase/${p.id}`)} className="p-1 text-gray-500 hover:text-blue-600 transition">
                              <Edit3 size={18} />
                           </button>
                           <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-500 hover:text-red-600 transition">
                              <Trash2 size={18} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer Mockup */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
             <div className="text-sm text-gray-500">Showing 1-{Math.min(10, purchases.length)} of {purchases.length}</div>
             <div className="flex gap-1">
                 <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50">Prev</button>
                 <button className="px-3 py-1 bg-teal-600 text-white rounded text-sm">1</button>
                 {purchases.length > 10 && <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600">2</button>}
                 <button className="px-3 py-1 border border-gray-200 rounded text-sm text-gray-600 disabled:opacity-50">Next</button>
             </div>
          </div>
        </div>

      </div>
 
  );
};

export default PurchaseList;