import api from "./axiosConfig";

export const getCategories = () => api.get("/api/categories");
export const getCategory = (id) => api.get(`/api/categories/${id}`);
export const createCategory = (data) => api.post("/api/categories", data);
export const updateCategory = (id, data) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);
