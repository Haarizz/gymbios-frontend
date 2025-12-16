// src/api/salaryAdvancesApi.js
import api from "../api/axiosConfig";

export async function fetchAdvances() {
  const res = await api.get("/api/salary/advances");
  return res.data || [];
}

export async function createAdvance(payload) {
  const res = await api.post("/api/salary/advances", payload);
  return res.data;
}

export async function fetchEmployees() {
  const res = await api.get("/api/salary/employees");
  return res.data || [];
}
