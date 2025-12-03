// src/api/payroll.js
import api from "./axiosConfig";



export const getPayrollDashboard = () => api.get("/payroll/dashboard");
export const getPayrollList = (params) => api.get("/payroll", { params });
export const getPayrollById = (id) => api.get(`/payroll/${id}`);
export const generatePayroll = (payload) => api.post("/payroll/generate", payload);
export const approvePayroll = (id) => api.post(`/payroll/${id}/approve`);
export const getPayrollHistory = (params) => api.get("/payroll/history", { params });
export const getPayrollReports = () => api.get("/payroll/reports");
export const getDashboardData = () => api.get("/payroll/dashboard").then(res => res.data);


