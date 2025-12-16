import api from "../api/axiosConfig";

export const PosApi = {
  // --- Products & Customers ---
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/api/pos/products?${query}`);
    return response.data;
  },

  getCustomers: async () => {
    // Try POS customers first, fallback logic handled in component if needed
    const response = await api.get("/api/pos/customers");
    return response.data;
  },

  // --- Sessions ---
  startSession: async (openingCash) => {
    const response = await api.post("/api/pos/sessions", { openingCash });
    return response.data;
  },

  closeSession: async (sessionId, closingCash) => {
    const response = await api.post(`/api/pos/sessions/${sessionId}/close`, { closingCash });
    return response.data;
  },

  // --- Sales & Transactions ---
  createSale: async (saleData) => {
    const response = await api.post("/api/pos/sales", saleData);
    return response.data;
  },

  recordCashMovement: async (data) => {
    const response = await api.post("/api/pos/cash-movements", data);
    return response.data;
  },

  // --- Held Orders ---
  holdOrder: async (orderData) => {
    // Ensure items are stringified if the backend expects a JSON string for this specific field
    const payload = {
      ...orderData,
      itemsJson: JSON.stringify(orderData.items)
    };
    const response = await api.post("/api/pos/held", payload);
    return response.data;
  },

  getHeldOrders: async () => {
    const response = await api.get("/api/pos/held");
    // Parse the itemsJson back to an array for the frontend
    return response.data.map(order => ({
      ...order,
      items: order.itemsJson ? JSON.parse(order.itemsJson) : []
    }));
  },

  deleteHeldOrder: async (id) => {
    await api.delete(`/api/pos/held/${id}`);
  }
};