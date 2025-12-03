// src/api/billingApi.js

import api from "./axiosConfig";

export const fetchBills = async () => {
  const res = await api.get("/api/billing/bills");
  return res.data;
};

export const createBill = async (payload) => {
  const res = await api.post("/api/billing/bills", payload);
  return res.data;
};

export const updateBill = async (id, payload) => {
  const res = await api.put(`/api/billing/bills/${id}`, payload);
  return res.data;
};

export const deleteBill = async (id) => {
  await api.delete(`/api/billing/bills/${id}`);
};

export const fetchMemberPendingBills = async (memberId) => {
  const res = await api.get(`/api/billing/members/${memberId}/pending-bills`);
  return res.data;
};


export const payBill = async (billId, payload) => {
  const res = await api.post(`/api/billing/bills/${billId}/pay`, payload);
  return res.data;
};


