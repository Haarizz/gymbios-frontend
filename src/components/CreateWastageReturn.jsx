import { useState, useEffect } from "react";
import { createWastageReturn } from "../api/wastageReturnApi";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// --- DUMMY API FUNCTION (Replace with your actual API call) ---
// This function simulates fetching your product list from the backend.
const getProducts = async () => {
  return [
    { id: 101, name: "Whey Protein Powder 5lb", defaultPrice: 250.00 },
    { id: 102, name: "Creatine Monohydrate 300g", defaultPrice: 55.50 },
    { id: 103, name: "Gym Towel - Small", defaultPrice: 15.00 },
    { id: 104, name: "Pre-Workout Blue Raspberry", defaultPrice: 89.99 },
    { id: 105, name: "Yoga Mat Standard", defaultPrice: 120.00 },
  ];
};

const initialProductState = { 
    name: "", 
    qty: 1, 
    price: 0.0, 
    subtotal: 0.0, 
    productId: null // Key change: store the ID of the selected product
};

const CreateWastageReturn = () => {
  const [form, setForm] = useState({
    voucherType: "WASTAGE",
    date: "",
    reason: "",
    location: "",
    products: [],
    notes: "",
    totalValue: 0.0,
  });

  const [availableProducts, setAvailableProducts] = useState([]);
  const navigate = useNavigate();

  // Load available products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts();
        setAvailableProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Could not load product list.");
      }
    };
    fetchProducts();
  }, []);

  const addProductField = () => {
    // Adds a new product row with initial state
    setForm({ ...form, products: [...form.products, initialProductState] });
  };

  const updateProduct = (index, field, value) => {
    const updated = [...form.products];
    // Ensure numeric fields are treated as numbers
    const numericValue = ["qty", "price"].includes(field) ? parseFloat(value) || 0 : value;

    updated[index][field] = numericValue;

    // Recalculate subtotal
    updated[index].subtotal = (updated[index].qty || 0) * (updated[index].price || 0);

    // Calculate new total value
    const totalValue = updated.reduce((sum, p) => sum + (p.subtotal || 0), 0);

    setForm({ ...form, products: updated, totalValue: parseFloat(totalValue.toFixed(2)) });
  };
  
  // --- Handle Product Selection from Dropdown ---
  const handleProductSelect = (index, productId) => {
    // Convert productId to number for comparison
    const id = parseInt(productId);
    const selectedProduct = availableProducts.find(p => p.id === id);

    const updated = [...form.products];

    if (selectedProduct) {
        // Set the product details from the selected inventory item
        updated[index].productId = id;
        updated[index].name = selectedProduct.name;
        updated[index].price = selectedProduct.defaultPrice;
        updated[index].qty = 1; // Reset quantity to 1 upon selection

        // Recalculate subtotal
        updated[index].subtotal = updated[index].qty * updated[index].price;
    } else {
        // Handle deselection (reset to initial state)
        updated[index] = initialProductState;
    }

    const totalValue = updated.reduce((sum, p) => sum + (p.subtotal || 0), 0);
    setForm({ ...form, products: updated, totalValue: parseFloat(totalValue.toFixed(2)) });
  };

  const removeProductField = (index) => {
    const updatedProducts = form.products.filter((_, i) => i !== index);
    
    // Recalculate total value after removal
    const totalValue = updatedProducts.reduce((sum, p) => sum + (p.subtotal || 0), 0);

    setForm({ 
        ...form, 
        products: updatedProducts,
        totalValue: parseFloat(totalValue.toFixed(2))
    });
  }

  const submit = async () => {
    // Basic validation
    if (!form.date || !form.reason || form.products.length === 0) {
      toast.error("Please fill in Date, Reason, and add at least one Product.");
      return;
    }
    
    // Ensure all products have been selected (i.e., have an ID)
    if (form.products.some(p => p.productId === null)) {
        toast.error("Please select a valid product for all rows.");
        return;
    }

    const payload = {
      ...form,
      totalValue: form.totalValue, 
      // Filter out only the necessary fields for the API, ensuring numeric types are correct
      products: JSON.stringify(form.products.map(({ productId, name, qty, price, subtotal }) => ({ 
          productId, 
          name, 
          qty: parseFloat(qty), 
          price: parseFloat(price), 
          subtotal 
      }))),
    };

    try {
      await createWastageReturn(payload);
      toast.success(`${form.voucherType} Voucher saved successfully!`);
      navigate("/wastage-return"); // Redirect to the list view
    } catch (error) {
      console.error("Failed to create voucher:", error);
      toast.error("Failed to save voucher. Please try again.");
    }
  };
    
  /**
   * Function to handle the Cancel action.
   * Navigates the user back to the list/index page without saving.
   */
  const handleCancel = () => {
    // Optionally, you might show a confirmation dialog here
    // before navigating away if the form has unsaved changes.
    navigate("/wastage-return");
  };

  return (
  
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">➕ New {form.voucherType === "WASTAGE" ? "Wastage" : "Goods Return"} Voucher</h2>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          
          {/* TYPE */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Voucher Type</label>
            <div className="flex space-x-6">
              <label className="inline-flex items-center text-gray-700">
                <input 
                  type="radio" 
                  className="form-radio text-teal-600 h-4 w-4"
                  checked={form.voucherType === "WASTAGE"} 
                  onChange={() => setForm({ ...form, voucherType: "WASTAGE" })} 
                /> 
                <span className="ml-2 font-medium">WASTAGE</span>
              </label>
              <label className="inline-flex items-center text-gray-700">
                <input 
                  type="radio" 
                  className="form-radio text-teal-600 h-4 w-4"
                  checked={form.voucherType === "RETURN"} 
                  onChange={() => setForm({ ...form, voucherType: "RETURN" })} 
                /> 
                <span className="ml-2 font-medium">GOODS RETURN</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* DATE */}
            <div className="col-span-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input 
                id="date"
                type="date" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })} 
              />
              </div>

            {/* LOCATION */}
            <div className="col-span-1">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location / Department</label>
              <input 
                id="location"
                type="text" 
                placeholder="e.g., Kitchen, Storage, Supplier Name" 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })} 
              />
            </div>
          </div>

          {/* REASON */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
            <input 
              id="reason"
              type="text" 
              placeholder="e.g., Expired Goods, Damaged in Transit, Customer Return" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })} 
            />
          </div>

          {/* PRODUCT LIST */}
          <div className="mb-6 border border-dashed border-gray-300 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>
            
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-500 mb-2">
                <div className="col-span-4">Product Name</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3">Unit Price (AED)</div>
                <div className="col-span-2 text-right">Subtotal</div>
                <div className="col-span-1"></div>
            </div>

            {form.products.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                {/* PRODUCT SELECTION DROPDOWN */}
                <select 
                    className="border p-2 rounded-md col-span-4 text-sm bg-white focus:ring-teal-500 focus:border-teal-500"
                    value={p.productId || ""} // Use productId for the value
                    onChange={(e) => handleProductSelect(i, e.target.value)}
                >
                    <option value="" disabled>Select a Product...</option>
                    {availableProducts.map(product => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>

                <input 
                  type="number" 
                  placeholder="Qty" 
                  className="border p-2 rounded-md col-span-2 text-sm focus:ring-teal-500 focus:border-teal-500"
                  value={p.qty}
                  onChange={(e) => updateProduct(i, "qty", e.target.value)} 
                  disabled={!p.productId} // Disable if no product is selected
                />
                <input 
                  type="number" 
                  placeholder="Price" 
                  className="border p-2 rounded-md col-span-3 text-sm focus:ring-teal-500 focus:border-teal-500"
                  value={p.price.toFixed(2)}
                  onChange={(e) => updateProduct(i, "price", e.target.value)} 
                  disabled={!p.productId} // Disable if no product is selected
                />
                <div className="col-span-2 text-right font-medium text-gray-700 pr-1 text-sm">
                  AED {(p.subtotal || 0).toFixed(2)}
                </div>
                <button 
                  onClick={() => removeProductField(i)} 
                  className="col-span-1 text-red-500 hover:text-red-700 transition duration-150"
                  title="Remove Item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m3 3h.01" />
                    </svg>
                </button>
              </div>
            ))}
            
            <button 
              onClick={addProductField} 
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm mt-3 flex items-center shadow-md transition duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
            </button>
          </div>

          {/* NOTES */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea 
              id="notes"
              placeholder="Any additional details or comments..." 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 h-24 resize-none focus:ring-teal-500 focus:border-teal-500 text-sm"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} 
            />
          </div>

          {/* TOTAL */}
          <div className="text-right py-3 border-t border-gray-200">
            <div className="font-bold text-2xl text-gray-800">
              Total Value: <span className="text-teal-600">AED {form.totalValue.toFixed(2)}</span>
            </div>
          </div>

          {/* ACTION BUTTONS: Cancel and Submit */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-lg text-lg shadow-md transition duration-300 ease-in-out"
            >
              Cancel
            </button>
            <button 
              onClick={submit} 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg text-lg shadow-xl transition duration-300 ease-in-out"
            >
              Submit Voucher
            </button>
          </div>
        </div>
      </div>
   
  );
};

export default CreateWastageReturn;