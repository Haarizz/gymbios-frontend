import api from "./axiosConfig";

const BASE = "/api/plans";

export const getPlans = async () => {
  const res = await api.get(BASE);
  return res.data;
};

export const getPlan = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createPlan = (data) => api.post(BASE, data);

export const updatePlan = (id, data) => api.put(`${BASE}/${id}`, data);

export const deletePlan = (id) => api.delete(`${BASE}/${id}`);
