// src/api/purchaseApi.js
import api from "./axiosConfig"; // your existing axios config

export const getPurchases = () => api.get("/purchases");
export const getPurchaseById = (id) => api.get(`/purchases/${id}`);
export const createPurchase = (payload) => api.post("/purchases", payload);
export const updatePurchase = (id, payload) =>
  api.put(`/purchases/${id}`, payload);
export const deletePurchase = (id) => api.delete(`/purchases/${id}`);