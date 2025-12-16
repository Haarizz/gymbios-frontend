import api from "./axiosConfig";

const BASE = "/api/messaging";

/* ---------- Templates ---------- */

export async function fetchTemplates() {
  const res = await api.get(`${BASE}/templates`);
  return res.data;
}

export async function createTemplate(payload) {
  const res = await api.post(`${BASE}/templates`, payload);
  return res.data;
}

export async function updateTemplate(id, payload) {
  const res = await api.put(`${BASE}/templates/${id}`, payload);
  return res.data;
}

export async function deleteTemplate(id) {
  const res = await api.delete(`${BASE}/templates/${id}`);
  return res.data;
}

/* ---------- Messages / History ---------- */

export async function fetchMessages() {
  const res = await api.get(`${BASE}/messages`);
  return res.data;
}

export async function createMessage(payload) {
  // payload should match Message entity fields
  const res = await api.post(`${BASE}/messages`, payload);
  return res.data;
}

/* ---------- Groups ---------- */

export async function fetchGroups() {
  const res = await api.get(`${BASE}/groups`);
  return res.data;
}

export async function createGroup(payload) {
  const res = await api.post(`${BASE}/groups`, payload);
  return res.data;
}

export async function updateGroup(id, payload) {
  const res = await api.put(`${BASE}/groups/${id}`, payload);
  return res.data;
}

export async function deleteGroup(id) {
  const res = await api.delete(`${BASE}/groups/${id}`);
  return res.data;
}
