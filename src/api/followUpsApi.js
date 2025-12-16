import api from "./axiosConfig";

const BASE = "/api/followups";

export async function listFollowUps() {
  const res = await api.get(BASE);
  return res.data;
}

export async function createFollowUp(payload) {
  const res = await api.post(BASE, payload);
  return res.data;
}

export async function deleteFollowUp(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}
