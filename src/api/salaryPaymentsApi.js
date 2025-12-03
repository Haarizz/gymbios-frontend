import api from "./axiosConfig"; 

const BASE = "/salary";

// ⭐ Fetch Staff (employees)
export const getEmployees = () => api.get(`${BASE}/employees`);

// ⭐ Fetch all salary payments
export const getSalaryPayments = () => api.get(BASE);

// ⭐ Create salary payment
export const createSalaryPayment = (data) => api.post(BASE, data);

// ⭐ Delete salary payment
export const deleteSalaryPayment = (id) => api.delete(`${BASE}/${id}`);
