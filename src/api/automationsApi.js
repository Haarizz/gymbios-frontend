// src/api/automationsApi.js
import api from "./axiosConfig"; // your global axios instance (must exist)

export const listAutomations = (params = {}) =>
  api.get("/api/automations", { params }).then(r => r.data);

export const getAutomation = (id) =>
  api.get(`/api/automations/${id}`).then(r => r.data);

export const createAutomation = (payload) =>
  api.post("/api/automations", payload).then(r => r.data);

export const updateAutomation = (id, payload) =>
  api.put(`/api/automations/${id}`, payload).then(r => r.data);

export const runAutomation = (id) =>
  api.post(`/api/automations/${id}/run`).then(r => r.data);

export const listTemplates = () =>
  api.get("/api/automations/templates").then(r => r.data);

export const recentRuns = () =>
  api.get("/api/automations/runs/recent").then(r => r.data);

export const analytics = () =>
  api.get("/api/automations/analytics").then(r => r.data);
