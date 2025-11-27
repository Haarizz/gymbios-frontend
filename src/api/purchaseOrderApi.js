import api from "./axiosConfig";

export const createPO = (data) => api.post("/purchase-orders", data);
export const getPOs = () => api.get("/purchase-orders");
export const getPOById = (id) => api.get(`/purchase-orders/${id}`);
export const updatePO = (id, data) => api.put(`/purchase-orders/${id}`, data);
export const deletePO = (id) => api.delete(`/purchase-orders/${id}`);
