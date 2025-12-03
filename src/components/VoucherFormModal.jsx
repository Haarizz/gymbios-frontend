import React, { useState, useEffect } from "react";
import { createWastageReturn, updateWastageReturn } from "../api/wastageReturnApi";
import toast from "react-hot-toast";

const initialProductState = { 
    name: "", 
    qty: 1, 
    price: 0.0, 
    subtotal: 0.0, 
    productId: null
};

// --- DUMMY API FUNCTION (Simulates product list for dropdown) ---
const getProducts = async () => {
    return [
        { id: 101, name: "Whey Protein Powder 5lb", defaultPrice: 250.00 },
        { id: 102, name: "Creatine Monohydrate 300g", defaultPrice: 55.50 },
        { id: 103, name: "Premium Gym T-Shirt", defaultPrice: 35.00 },
        { id: 104, name: "BCAA Energy Drink", defaultPrice: 89.99 },
        { id: 105, name: "Yoga Mat Standard", defaultPrice: 120.00 },
    ];
};

export default function VoucherFormModal({ onClose, initialData = null }) {
    const isEdit = initialData && initialData.id;

    const [form, setForm] = useState(() => ({
        id: initialData?.id || null, 
        voucherNumber: initialData?.voucherNumber || '', 
        voucherType: initialData?.voucherType === "Goods Return" ? "RETURN" : "WASTAGE",
        date: initialData?.date || new Date().toISOString().slice(0, 10),
        reason: initialData?.reason || "",
        location: initialData?.location || "",
        // Initialize partyType to a safe default if the voucher type is RETURN
        partyType: initialData?.partyType || (initialData?.voucherType === "Goods Return" ? "Supplier" : "N/A"),
        products: initialData?.products || [],
        notes: initialData?.notes || "",
        totalValue: initialData?.totalValue || 0.0,
        status: initialData?.status || "Draft",
    }));

    const [availableProducts, setAvailableProducts] = useState([]);
    
    // Calculate total value whenever products change
    useEffect(() => {
        const totalValue = form.products.reduce((sum, p) => sum + (p.subtotal || 0), 0);
        setForm(p => ({ ...p, totalValue: parseFloat(totalValue.toFixed(2)) }));
    }, [form.products]);

    // Load available products
    useEffect(() => {
        getProducts().then(setAvailableProducts).catch(() => toast.error("Could not load product list."));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    };

    const addProductField = () => {
        setForm({ ...form, products: [...form.products, initialProductState] });
    };

    const updateProduct = (index, field, value) => {
        const updated = [...form.products];
        const numericValue = ["qty", "price"].includes(field) ? parseFloat(value) || 0 : value;

        updated[index][field] = numericValue;
        updated[index].subtotal = (updated[index].qty || 0) * (updated[index].price || 0);
        
        setForm({ ...form, products: updated });
    };

    const handleProductSelect = (index, productId) => {
        const id = parseInt(productId);
        const selectedProduct = availableProducts.find(p => p.id === id);

        const updated = [...form.products];

        if (selectedProduct) {
            updated[index] = {
                ...updated[index],
                productId: id,
                name: selectedProduct.name,
                price: selectedProduct.defaultPrice,
                qty: 1,
            };
            updated[index].subtotal = updated[index].qty * updated[index].price;
        } else {
            updated[index] = initialProductState;
        }
        setForm({ ...form, products: updated });
    };

    const removeProductField = (index) => {
        const updatedProducts = form.products.filter((_, i) => i !== index);
        setForm({ ...form, products: updatedProducts });
    }

    const handleSubmit = async (submitStatus) => {
        // Validate required fields
        if (!form.date || !form.reason || !form.location || form.products.length === 0) {
            toast.error("Please fill in Date, Reason, Location, and add at least one Product.");
            return;
        }
        if (!form.voucherNumber) {
            toast.error("Please enter a Voucher Number.");
            return;
        }
        // CRITICAL FIX FOR GOODS RETURN: Ensure partyType is set if voucherType is RETURN
        if (form.voucherType === "RETURN" && (!form.partyType || form.partyType === 'N/A')) {
            toast.error("Please select a Party Type for Goods Return.");
            return;
        }
        if (form.products.some(p => p.productId === null)) {
            toast.error("Please select a valid product for all rows.");
            return;
        }

        const simplifiedProducts = form.products.map(p => ({ 
            productId: p.productId, 
            name: p.name,           
            qty: parseFloat(p.qty), 
            price: parseFloat(p.price), 
            subtotal: p.subtotal    
        }));
        
        const basePayload = {
            voucherType: form.voucherType,
            date: form.date,
            reason: form.reason,
            location: form.location,
            status: submitStatus,
            notes: form.notes,
            // Ensure partyType is only sent if it's a RETURN voucher
            partyType: form.voucherType === "RETURN" ? form.partyType : null,
            totalValue: form.totalValue, 
            products: JSON.stringify(simplifiedProducts),
            voucherNumber: form.voucherNumber, 
        };

        const payload = isEdit ? { ...basePayload, id: form.id } : basePayload; 

        try {
            if (isEdit) {
                await updateWastageReturn(form.id, payload);
                toast.success(`Voucher ${form.voucherNumber} updated successfully!`);
            } else {
                await createWastageReturn(payload);
                toast.success(`New Voucher ${form.voucherNumber} created successfully!`);
            }
            onClose(); 
        } catch (error) {
            console.error("Failed to save voucher:", error);
            toast.error(`Failed to save voucher. Check console.`);
        }
    };
    
    const handleSaveDraft = () => {
        if (!form.date || !form.reason || !form.location) {
            toast.error("Draft requires Date, Reason, and Location.");
            return;
        }
        handleSubmit("Draft");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"> 
            
            <div className="bg-white w-[750px] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 relative">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 border-b pb-2">
                    <div>
                        <h2 className="text-lg font-semibold">{isEdit ? `Edit Voucher ${form.id}` : "New Wastage / Goods Return Voucher"}</h2>
                        <p className="text-sm text-gray-500">Create a new voucher to document product wastage or goods returns</p>
                    </div>
                    <button onClick={onClose} aria-label="close" className="text-gray-500 hover:bg-gray-100 p-1 rounded">✕</button>
                </div>

                {/* Main Form Fields */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    
                    {/* Voucher Number (MANUAL ENTRY) */}
                    <div className="col-span-2">
                        <label htmlFor="voucherNumber" className="block text-xs font-semibold text-gray-600">Voucher Number</label>
                        <input 
                            id="voucherNumber"
                            name="voucherNumber"
                            type="number" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            value={form.voucherNumber}
                            onChange={handleChange}
                            disabled={false} 
                        />
                    </div>
                    
                    {/* Voucher Type */}
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Voucher Type</label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center text-gray-700">
                                <input 
                                    type="radio" 
                                    checked={form.voucherType === "WASTAGE"} 
                                    onChange={() => setForm({ ...form, voucherType: "WASTAGE", partyType: "N/A" })} 
                                    className="form-radio text-red-600 h-4 w-4"
                                    disabled={isEdit}
                                /> 
                                <span className="ml-2 font-medium text-red-600">WASTAGE</span>
                            </label>
                            <label className="inline-flex items-center text-gray-700">
                                <input 
                                    type="radio" 
                                    checked={form.voucherType === "RETURN"} 
                                    // ✅ FIX: Ensure partyType is set to a valid default ('Supplier') when switching to RETURN
                                    onChange={() => setForm({ 
                                        ...form, 
                                        voucherType: "RETURN", 
                                        partyType: form.partyType === "N/A" || !form.partyType ? "Supplier" : form.partyType 
                                    })} 
                                    className="form-radio text-blue-600 h-4 w-4"
                                    disabled={isEdit}
                                /> 
                                <span className="ml-2 font-medium text-blue-600">GOODS RETURN</span>
                            </label>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                        <label htmlFor="date" className="block text-xs font-medium text-gray-600">Date</label>
                        <input 
                            id="date"
                            name="date"
                            type="date" 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            value={form.date}
                            onChange={handleChange} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Party Type (Conditional) */}
                    {form.voucherType === "RETURN" && (
                        <div className="col-span-1">
                            <label htmlFor="partyType" className="block text-xs font-medium text-gray-600">Party Type *</label>
                            <select 
                                id="partyType"
                                name="partyType"
                                value={form.partyType}
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            >
                                <option value="">Select Party</option> {/* Added explicit default option */}
                                <option value="Supplier">Supplier</option>
                                <option value="Customer">Customer</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    )}

                    {/* Reason */}
                    <div className={`${form.voucherType === "RETURN" ? "col-span-1" : "col-span-2"}`}>
                        <label htmlFor="reason" className="block text-xs font-medium text-gray-600">Reason *</label>
                        <select 
                            id="reason"
                            name="reason"
                            value={form.reason}
                            onChange={handleChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                            <option value="">Select reason</option>
                            <option>Expired</option>
                            <option>Damaged in Storage</option>
                            <option>Damaged in Transit</option>
                            <option>Customer Return</option>
                            <option>Manufacturing Defect</option>
                            <option>Other</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div className={`${form.voucherType === "RETURN" ? "col-span-1" : "col-span-2"}`}>
                        <label htmlFor="location" className="block text-xs font-medium text-gray-600">Location *</label>
                        <select 
                            id="location"
                            name="location"
                            value={form.location}
                            onChange={handleChange} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        >
                            <option value="">Select location</option>
                            <option>Main Store</option>
                            <option>Warehouse A</option>
                            <option>Warehouse B</option>
                            <option>Retail Floor</option>
                        </select>
                    </div>
                </div>

                {/* Products Section */}
                <div className="mb-4 border border-dashed border-gray-300 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-700">Products *</h3>
                        <button 
                            onClick={addProductField}
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                        >
                            + Add Product
                        </button>
                    </div>
                    
                    {/* Product Table Header */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 mb-2 border-b pb-1">
                        <div className="col-span-4">Product Name</div>
                        <div className="col-span-2">Qty</div>
                        <div className="col-span-3">Unit Price (AED)</div>
                        <div className="col-span-2 text-right">Subtotal</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Product Rows */}
                    {form.products.map((p, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
                            {/* PRODUCT SELECTION DROPDOWN */}
                            <select 
                                className="border p-2 rounded-md col-span-4 text-sm bg-white focus:ring-teal-500 focus:border-teal-500"
                                value={p.productId || ""} 
                                onChange={(e) => handleProductSelect(i, e.target.value)}
                            >
                                <option value="" disabled>Select a Product...</option>
                                {availableProducts.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>

                            <input type="number" placeholder="Qty" min="1"
                                className="border p-2 rounded-md col-span-2 text-sm"
                                value={p.qty}
                                onChange={(e) => updateProduct(i, "qty", e.target.value)} 
                                disabled={!p.productId}
                            />
                            <input type="number" placeholder="Price" step="0.01"
                                className="border p-2 rounded-md col-span-3 text-sm"
                                value={p.price.toFixed(2)}
                                onChange={(e) => updateProduct(i, "price", e.target.value)} 
                                disabled={!p.productId}
                            />
                            <div className="col-span-2 text-right font-medium text-gray-700 text-sm">
                                {(p.subtotal || 0).toFixed(2)}
                            </div>
                            <button onClick={() => removeProductField(i)} 
                                className="col-span-1 text-red-500 hover:text-red-700 transition duration-150"
                                title="Remove Item"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    
                    {/* Total Value */}
                    <div className="text-right pt-3 border-t border-gray-200 mt-4">
                        <div className="font-bold text-lg text-gray-800">
                            Total Value: <span className="text-teal-600">AED {form.totalValue.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-600">Notes / Comments</label>
                    <textarea 
                        name="notes"
                        placeholder="Enter any additional notes or comments" 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-20 resize-none text-sm"
                        value={form.notes}
                        onChange={handleChange} 
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                    <button onClick={onClose} className="px-4 py-2 rounded text-gray-700 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSaveDraft} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">Save as Draft</button>
                    <button onClick={() => handleSubmit("Pending Approval")} className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700">Submit</button>
                </div>
            </div>
        </div>
    );
}