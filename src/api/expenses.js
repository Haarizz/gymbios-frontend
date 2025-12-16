// Adjust the import based on your project.
// I’m assuming you have a shared axios instance exported as default from "./api".
import api from "./axiosConfig";

export const getExpenses = (params = {}) => {
  return api.get("/expenses", { params });
};

export const getExpenseStats = () => {
  return api.get("/expenses/stats");
};

export const createExpense = (data) => {
  return api.post("/expenses", data);
};

export const updateExpense = (id, data) => {
  return api.put(`/expenses/${id}`, data);
};

export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`);
};
