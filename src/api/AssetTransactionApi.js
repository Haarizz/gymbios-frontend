import api from "./axiosConfig";

const BASE_URL = "/api/asset-transactions";

export async function getAllTransactions(filters = {}) {
  const res = await api.get(BASE_URL, { params: filters });
  return res.data;
}

export async function getTransaction(id) {
  const res = await api.get(`${BASE_URL}/${id}`);
  return res.data;
}

export async function createTransaction(data) {
  const res = await api.post(BASE_URL, data);
  return res.data;
}

export async function updateTransaction(id, data) {
  const res = await api.put(`${BASE_URL}/${id}`, data);
  return res.data;
}

export async function deleteTransaction(id) {
  await api.delete(`${BASE_URL}/${id}`);
}

// CHANGED: Use PUT instead of PATCH to bypass CORS restriction
export async function updateTransactionStatus(id, status) {
  const res = await api.put(`${BASE_URL}/${id}/status`, { status });
  return res.data;
}