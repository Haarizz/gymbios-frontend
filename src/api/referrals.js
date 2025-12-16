import api from "./axiosConfig";

const BASE = "/api/referrals";

export async function getReferrals() {
  const res = await api.get(BASE);
  return res.data;
}

export async function getReferralStats() {
  const res = await api.get(`${BASE}/stats`);
  return res.data;
}

export async function createReferral(payload) {
  const res = await api.post(BASE, payload);
  return res.data;
}

export async function updateReferral(id, payload) {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
}

export async function deleteReferral(id) {
  return api.delete(`${BASE}/${id}`);
}
