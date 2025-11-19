import api from "./axiosConfig";

const BASE = "/api/trainers";

export const getStaff = async () => {
  const res = await api.get(BASE);
  return res.data;
};

export const getSingleStaff = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createStaff = (data) => api.post(BASE, data);

export const updateStaff = (id, data) => api.put(`${BASE}/${id}`, data);

export const deleteStaff = (id) => api.delete(`${BASE}/${id}`);
