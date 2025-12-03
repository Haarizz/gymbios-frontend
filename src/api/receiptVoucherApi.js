// src/api/receiptVoucherApi.js
import api from "./axiosConfig"; // same axios instance you use in other modules

export const getReceiptVouchers = async (params = {}) => {
  const res = await api.get("/receipt-vouchers", { params });
  return res.data;
};

export const getReceiptVoucherById = async (id) => {
  const res = await api.get(`/receipt-vouchers/${id}`);
  return res.data;
};

export const createReceiptVoucher = async (payload) => {
  const res = await api.post("/receipt-vouchers", payload);
  return res.data;
};

export const updateReceiptVoucher = async (id, payload) => {
  const res = await api.put(`/receipt-vouchers/${id}`, payload);
  return res.data;
};

export const deleteReceiptVoucher = async (id) => {
  await api.delete(`/receipt-vouchers/${id}`);
};
