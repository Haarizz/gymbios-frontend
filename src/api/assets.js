// src/api/assets.js
// Exports helpers for calling /api/assets using your global axios instance (which
// attaches the Authorization header from localStorage via axiosconfig.js)

import api from "./axiosConfig"; // <- uses your axios config that sets baseURL: http://localhost:8080 and Authorization

// Note: api has baseURL: "http://localhost:8080" (from your axiosconfig),
// so here we use paths relative to that base.

export async function getAssets(search) {
  const params = {};
  if (search) params.search = search;
  const res = await api.get("/api/assets", { params });
  return res.data || [];
}

export async function getAsset(id) {
  const res = await api.get(`/api/assets/${encodeURIComponent(id)}`);
  return res.data;
}

export async function createAsset(data) {
  const res = await api.post("/api/assets", data);
  return res.data;
}

export async function updateAsset(id, data) {
  const res = await api.put(`/api/assets/${encodeURIComponent(id)}`, data);
  return res.data;
}

export async function deleteAsset(id) {
  await api.delete(`/api/assets/${encodeURIComponent(id)}`);
}
