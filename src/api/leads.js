// src/api/leads.js
import api from "./axiosConfig"; // same axios instance you use for members/referrals

export async function getLeads() {
  const res = await api.get("/leads");
  return res.data;
}

export async function getLeadStats() {
  const res = await api.get("/leads/stats");
  return res.data;
}

export async function createLead(data) {
  const res = await api.post("/leads", data);
  return res.data;
}

export async function updateLead(id, data) {
  const res = await api.put(`/leads/${id}`, data);
  return res.data;
}

export async function deleteLead(id) {
  await api.delete(`/leads/${id}`);
}
