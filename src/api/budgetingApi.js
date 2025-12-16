// src/api/budgetingApi.js
import api from "./axiosConfig"; // 🔥 use your token-enabled axios instance

// ---- Overview ----
export const getOverview = async () => {
  const res = await api.get("/budgeting/overview");
  return res.data;
};

// ---- Master list ----
export const getMaster = async () => {
  const res = await api.get("/budgeting/master");
  return res.data;
};

// ---- Create Budget ----
export const createBudget = async (payload) => {
  const res = await api.post("/budgeting/create", payload);
  return res.data;
};

// ---- Get categories (existing module) ----
export const getCategories = async () => {
  const res = await api.get("/api/categories");
  return res.data;
};

// ---- Get staff (existing module) ----
export const getStaff = async () => {
  const res = await api.get("/api/trainers");
  return res.data;
};

// ---- BvA Analytics ----
export const getBva = async () => {
  const res = await api.get("/budgeting/analytics/bva");
  return res.data;
};
