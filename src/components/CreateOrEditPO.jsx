import Layout from "./Layout";
import { useState, useEffect } from "react";
import { createPO, getPOById, updatePO } from "../api/purchaseOrderApi";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Save, 
  X, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  Activity, 
  AlertCircle,
  CheckCircle, // Added for success message icon
  AlertTriangle // Added for error message icon
} from "lucide-react";

export default function CreateOrEditPO() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    poNumber: "",
    supplierName: "",
    orderDate: "",
    expectedDelivery: "",
    status: "Pending",
    priority: "Medium",
    totalAmount: ""
  });

  // 1. NEW STATE for notifications
  const [notification, setNotification] = useState({
    message: null,
    type: null // 'success' or 'error'
  });

  // Supplier list (STATIC LIST)
  const suppliers = [
    "Sports Nutrition Ltd",
    "Fitness Equipment Co",
    "Beverage Suppliers Inc",
    "Gym Global Traders",
    "Wellness Equip Mart"
  ];

  useEffect(() => {
    if (isEdit) {
      getPOById(id).then((res) => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    const action = isEdit ? "Updated" : "Created";
    const apiCall = isEdit ? updatePO(id, form) : createPO(form);

    // Clear previous notification
    setNotification({ message: null, type: null });

    try {
      await apiCall;
      
      // 2. Set Success Notification
      setNotification({
        message: `Purchase Order successfully ${action}! Redirecting in 3 seconds...`,
        type: 'success'
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/purchase-orders");
      }, 3000);

    } catch (error) {
      console.error(error);
      // 3. Set Error Notification
      setNotification({
        message: `Failed to ${isEdit ? 'update' : 'create'} Purchase Order. Error: ${error.message || 'Server error.'}`,
        type: 'error'
      });
      // Do not redirect on error, allow user to fix the form
    }
  };

  // Helper class for inputs to avoid repetition
  const inputClass = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

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
// ---------------------------------------------------------------------------------------------------

  return (
   
      <div className="p-6 w-full bg-gray-50 min-h-screen flex flex-col items-center">
        
        {/* --- PAGE HEADER --- */}
        <div className="w-full max-w-4xl mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? `Update details for PO #${form.poNumber || id}` : "Fill in the details below to generate a new order."}
          </p>
        </div>

        {/* 4. Notification Display */}
        <div className="w-full max-w-4xl">
           <NotificationBanner message={notification.message} type={notification.type} />
        </div>
        
        {/* --- FORM CARD --- */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-8 w-full max-w-4xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PO Number */}
            <div>
              <label className={labelClass}>PO Number</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  name="poNumber"
                  value={form.poNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. PO-2025-001 (Auto if empty)"
                  readOnly={isEdit} // Often PO numbers are not editable
                />
              </div>
            </div>

            {/* Supplier Dropdown */}
            <div>
              <label className={labelClass}>Supplier</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <select
                  name="supplierName"
                  value={form.supplierName}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none bg-white`}
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order Date */}
            <div>
              <label className={labelClass}>Order Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="date"
                  name="orderDate"
                  value={form.orderDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Expected Delivery */}
            <div>
              <label className={labelClass}>Expected Delivery</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="date"
                  name="expectedDelivery"
                  value={form.expectedDelivery}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <div className="relative">
                <Activity className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none bg-white`}
                >
                  <option>Pending</option>
                  <option>Ordered</option>
                  <option>Received</option>
                </select>
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
                  onChange={handleChange}
                  className={`${inputClass} appearance-none bg-white`}
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            {/* Total Amount (Full Width) */}
            <div className="md:col-span-2">
              <label className={labelClass}>Total Amount</label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 text-gray-400 font-semibold text-sm">AED</div>
                <input
                  type="number"
                  name="totalAmount"
                  value={form.totalAmount}
                  onChange={handleChange}
                  className={`${inputClass} pl-12`} // Extra padding for AED prefix
                  placeholder="0.00"
                />
                <DollarSign className="absolute right-3 top-2.5 text-gray-300" size={18} />
              </div>
            </div>

          </div>

          {/* --- BUTTONS --- */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={() => navigate("/purchase-orders")}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <X size={18} />
              Cancel
            </button>

            <button
              onClick={submit}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-700 text-white rounded-lg font-medium hover:bg-teal-800 shadow-sm transition-colors disabled:opacity-50"
              disabled={notification.type === 'success'} // Prevent resubmitting after success
            >
              <Save size={18} />
              {isEdit ? "Update Order" : "Create Order"}
            </button>
          </div>

        </div>
      </div>
    
  );
}