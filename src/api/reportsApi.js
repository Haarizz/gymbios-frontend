import api from "./axiosConfig";

export const getSales = () => api.get("/sales");
export const getPurchases = () => api.get("/purchases");
