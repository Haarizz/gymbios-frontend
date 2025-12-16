import api from "./axiosConfig";

const BASE = "/api/followup-workflows";

export async function listWorkflows() {
  const res = await api.get(BASE);
  return res.data;
}

export async function createWorkflow(payload) {
  const res = await api.post(BASE, payload);
  return res.data;
}

export async function updateWorkflow(id, payload) {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
}

export async function deleteWorkflow(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}
