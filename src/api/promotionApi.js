import api from "./axiosConfig";

export const getPromotions = async () => {
  const res = await api.get("/promotions");
  return res.data;
};

export const getPromotion = async (id) => {
  const res = await api.get(`/promotions/${id}`);
  return res.data;
};

export const createPromotion = async (data) => {
  const res = await api.post("/promotions", data);
  return res.data;
};

export const updatePromotion = async (id, data) => {
  const res = await api.put(`/promotions/${id}`, data);
  return res.data;
};

export const deletePromotion = async (id) => {
  const res = await api.delete(`/promotions/${id}`);
  return res.data;
};
