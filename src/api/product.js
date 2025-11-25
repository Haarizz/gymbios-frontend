// src/api/product.js
import api from "./axiosConfig";

// CRUD
export const getProducts = (params) => api.get("/products", { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Dashboard / helper endpoints
export const getProductsStats = () => api.get("/products/stats");
export const getProductCategories = () => api.get("/products/categories");
