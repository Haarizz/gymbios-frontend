import api from "./axiosConfig";

export const getWastageReturns = () => api.get("/wastage-return");
export const getWastageReturnById = (id) => api.get(`/wastage-return/${id}`);
export const createWastageReturn = (data) => api.post("/wastage-return", data);
export const updateWastageReturn = (id, data) => api.put(`/wastage-return/${id}`, data);
export const deleteWastageReturn = (id) => api.delete(`/wastage-return/${id}`);
