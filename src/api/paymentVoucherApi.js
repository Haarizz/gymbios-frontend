// src/api/paymentVoucherApi.js
import api from "./axiosConfig";

const BASE = "/api/payment-vouchers"; // backend controller mapping

export async function fetchVouchers() {
  const res = await api.get(BASE);
  return res.data;
}

export async function createVoucher(payload) {
  const res = await api.post(BASE, payload);
  return res.data;
}

export async function updateVoucher(id, payload) {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
}

// <-- REPLACE deleteVoucher with this simple version:
export async function deleteVoucher(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return { status: res.status, data: res.data };
}

export async function addPaymentToVoucher(voucherId, payment) {
  const res = await api.post(`${BASE}/${voucherId}/payments`, payment);
  return res.data;
}

export default {
  fetchVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  addPaymentToVoucher,
};
