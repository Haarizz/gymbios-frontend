// src/api/facilitiesApi.js
import api from "./axiosConfig";

export async function getFacilities({ search = "", filter = "all" } = {}) {
  const params = {};
  if (search) params.search = search;
  if (filter) params.filter = filter;
  const res = await api.get("/facilities", { params });
  return res.data;
}

export async function getFacility(id) {
  const res = await api.get(`/facilities/${id}`);
  return res.data;
}

export async function createFacility(payload) {
  const res = await api.post("/facilities", payload);
  return res.data;
}

export async function updateFacility(id, payload) {
  const res = await api.put(`/facilities/${id}`, payload);
  return res.data;
}

export async function deleteFacility(id) {
  const res = await api.delete(`/facilities/${id}`);
  return res.status === 204 || res.status === 200;
}
