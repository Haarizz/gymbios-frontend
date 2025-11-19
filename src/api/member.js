import api from "./axiosConfig";

const BASE = "/api/members";

export async function getMembers() {
  const res = await api.get(BASE);
  return res.data;
}

export async function getMember(id) {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
}

export async function addMember(payload) {
  return api.post(BASE, payload);
}

export async function updateMember(id, payload) {
  return api.put(`${BASE}/${id}`, payload);
}

export async function deleteMember(id) {
  return api.delete(`${BASE}/${id}`);
}
