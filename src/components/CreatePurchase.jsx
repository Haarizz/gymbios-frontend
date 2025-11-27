// src/components/CreatePurchase.jsx

import Layout from "./Layout";
import { useEffect, useState } from "react";
import { createPurchase, getPurchaseById, updatePurchase } from "../api/purchaseApi";
import { useNavigate, useParams } from "react-router-dom";
import { getProducts } from "../api/product"; 
import { 
  Save, 
  X, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  CheckCircle, 
  AlertTriangle,
  Plus,
  Trash2,
  Package,
  List
} from "lucide-react";

export default function CreatePurchase() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    purchaseNumber: "",
    supplierName: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    priority: "Medium",
    paymentStatus: "Pending",
    totalAmount: 0,
    items: []
  });

  const [products, setProducts] = useState([]); // Product list for item dropdown
  const [notification, setNotification] = useState({ message: null, type: null }); // Notification state

  // Static list of suppliers for the dropdown
  const suppliers = [
    "Sports Nutrition Ltd",
    "Fitness Equipment Co",
    "Beverage Suppliers Inc",
    "Gym Global Traders",
    "Wellness Equip Mart"
  ];

  // --- Initial Data Load (unchanged) ---
  useEffect(() => {
    if (isEdit) {
      getPurchaseById(id).then(r => {
        const p = r.data;
        let items = [];
        try { items = p.itemsJson ? JSON.parse(p.itemsJson) : []; } catch(e){ items = []; }
        setForm({
          purchaseNumber: p.purchaseNumber || "",
          supplierName: p.supplierName || "",
          purchaseDate: p.purchaseDate || new Date().toISOString().split("T")[0],
          priority: p.priority || "Medium",
          paymentStatus: p.paymentStatus || "Pending",
          totalAmount: p.totalAmount || 0,
          items
        });
      }).catch(e => console.error(e));
    }

    if (getProducts) {
      getProducts().then(r => setProducts(r.data)).catch(() => {});
    }
  }, [id]);

  // --- Form & Item Handlers (logic kept the same, but wrapped in helper functions) ---
  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { productId: "", productName: "", unitPrice: 0, quantity: 1, subtotal: 0 }] }));
  };

  const removeItem = (idx) => {
    setForm(prev => {
      const items = [...prev.items]; items.splice(idx, 1);
      const total = items.reduce((s, it) => s + Number(it.subtotal || 0), 0);
      return { ...prev, items, totalAmount: total };
    });
  };

  const updateItem = (idx, key, value) => {
    setForm(prev => {
      const items = prev.items.map((it, i) => {
        if (i !== idx) return it;
        const updated = { ...it, [key]: value };
        // Recalc subtotal when unitPrice or quantity change
        updated.unitPrice = Number(updated.unitPrice || 0);
        updated.quantity = Number(updated.quantity || 0);
        updated.subtotal = Number((updated.unitPrice * updated.quantity).toFixed(2));
        return updated;
      });
      const total = items.reduce((s, it) => s + Number(it.subtotal || 0), 0);
      return { ...prev, items, totalAmount: total };
    });
  };
  
  // --- Submit Handler (FIXED PAYLOAD DEFINITION) ---
  const submit = async () => {
    setNotification({ message: null, type: null }); // Clear previous

    // 1. DEFINE PAYLOAD FIRST
    const payload = {
      purchaseNumber: form.purchaseNumber,
      supplierName: form.supplierName,
      purchaseDate: new Date(form.purchaseDate).toISOString().split("T")[0],
      priority: form.priority,
      paymentStatus: form.paymentStatus,
      totalAmount: Number(form.totalAmount || 0),
      itemsJson: JSON.stringify(form.items)
    };

    const action = isEdit ? "Updated" : "Created";
    // 2. USE PAYLOAD IN API CALL
    const apiCall = isEdit ? updatePurchase(id, payload) : createPurchase(payload);
    

    try {
      await apiCall;
      setNotification({ message: `Purchase successfully ${action}! Redirecting in 2 seconds...`, type: 'success' });
      
      setTimeout(() => {
        navigate("/purchases");
      }, 2000);

    } catch (err) {
      console.error("SAVE ERROR:", err);
      setNotification({ message: `Failed to ${isEdit ? 'update' : 'create'} purchase. Error: ${err.message || 'Server error.'}`, type: 'error' });
    }
  };

  // --- UI Helpers (omitted for brevity, assume they are the same as last response) ---
  const inputClass = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  
  // Notification Banner Component (omitted for brevity)
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
  // ---------------------------------------------------------------------------------------------------

  return (
    
      <div className="p-6 w-full bg-gray-50 min-h-screen flex justify-center">
        <div className="w-full max-w-4xl">
          
          {/* PAGE HEADER */}
          <div className="w-full mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "Edit Purchase Record" : "Create New Purchase"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEdit ? `Update record #${form.purchaseNumber || id}` : "Record incoming inventory and supplier details."}
            </p>
          </div>

          {/* NOTIFICATION */}
          <NotificationBanner message={notification.message} type={notification.type} />
          
          {/* FORM CARD */}
          <div className="bg-white shadow-lg border border-gray-100 rounded-xl p-8 w-full">
            
            {/* TOP METADATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

              {/* Purchase Number */}
              <div>
                <label className={labelClass}>Purchase Number</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    name="purchaseNumber"
                    value={form.purchaseNumber}
                    onChange={e => setField("purchaseNumber", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. PUR-2025-001 (Auto if empty)"
                    readOnly={isEdit}
                  />
                </div>
              </div>

              {/* Purchase Date */}
              <div>
                <label className={labelClass}>Purchase Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={e => setField("purchaseDate", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className={labelClass}>Priority</label>
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={e => setField("priority", e.target.value)}
                    className={`${inputClass} appearance-none bg-white`}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className={labelClass}>Payment Status</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <select
                    name="paymentStatus"
                    value={form.paymentStatus}
                    onChange={e => setField("paymentStatus", e.target.value)}
                    className={`${inputClass} appearance-none bg-white`}
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>

              {/* Supplier Dropdown */}
              <div className="md:col-span-2">
                <label className={labelClass}>Supplier</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <select
                    name="supplierName"
                    value={form.supplierName}
                    onChange={e => setField("supplierName", e.target.value)}
                    className={`${inputClass} appearance-none bg-white`}
                  >
                    <option value="">Select supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            {/* PURCHASE ITEMS SECTION */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-xl text-gray-800 flex items-center gap-2"><List size={20} className="text-teal-600" /> Purchase Items</h3>
                <button 
                  onClick={addItem} 
                  className="flex items-center gap-1 px-3 py-1.5 bg-teal-700 text-white rounded-lg text-sm hover:bg-teal-800 transition"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {/* ITEMS HEADER ROW */}
              <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2rem] gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase">
                <div>Product Select</div>
                <div>Name/Description</div>
                <div className="text-right">Unit Price</div>
                <div className="text-right">Quantity</div>
                <div className="text-right">Subtotal</div>
                <div></div>
              </div>


              {/* ITEM LIST */}
              {form.items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_2rem] gap-2 items-center mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                  {/* Product Select */}
                  <div className="relative">
                    <Package className="absolute left-2 top-2.5 text-gray-400" size={16} />
                    <select 
                      className="border p-2 rounded w-full text-sm pl-8 focus:ring-teal-500 focus:border-teal-500" 
                      value={it.productId} 
                      onChange={e => {
                        const sel = products.find(p => String(p.id) === e.target.value);
                        updateItem(idx, "productId", e.target.value);
                        updateItem(idx, "productName", sel ? sel.name : it.productName);
                        updateItem(idx, "unitPrice", sel ? sel.price : it.unitPrice);
                      }}
                    >
                      <option value="">Select product...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  
                  {/* Name/Description */}
                  <input 
                    className="border p-2 rounded w-full text-sm focus:ring-teal-500 focus:border-teal-500" 
                    value={it.productName} 
                    placeholder="Custom Product Name" 
                    onChange={e => updateItem(idx, "productName", e.target.value)} 
                  />
                  
                  {/* Unit Price */}
                  <input 
                    className="border p-2 rounded w-full text-sm text-right focus:ring-teal-500 focus:border-teal-500" 
                    type="number" 
                    value={it.unitPrice} 
                    onChange={e => updateItem(idx, "unitPrice", e.target.value)} 
                  />
                  
                  {/* Quantity */}
                  <input 
                    className="border p-2 rounded w-full text-sm text-right focus:ring-teal-500 focus:border-teal-500" 
                    type="number" 
                    value={it.quantity} 
                    onChange={e => updateItem(idx, "quantity", e.target.value)} 
                  />
                  
                  {/* Subtotal */}
                  <div className="text-right font-medium text-gray-900 text-sm">
                    {it.subtotal?.toFixed?.(2) ?? Number(it.subtotal || 0).toFixed(2)}
                  </div>
                  
                  {/* Remove Button */}
                  <button onClick={() => removeItem(idx)} className="p-1 text-red-500 hover:text-red-700 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* FOOTER & TOTALS */}
            <div className="flex justify-between items-end mt-8 pt-6 border-t border-gray-100">
              {/* Total Display */}
              <div className="ml-auto mr-8">
                <div className="text-sm text-gray-500 font-medium">TOTAL AMOUNT</div>
                <div className="text-3xl font-extrabold text-teal-800">
                  AED {Number(form.totalAmount || 0).toFixed(2)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  onClick={submit} 
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm transition-colors disabled:opacity-50"
                  disabled={notification.type === 'success'}
                >
                  <Save size={18} />
                  {isEdit ? "Update Purchase" : "Save Purchase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}