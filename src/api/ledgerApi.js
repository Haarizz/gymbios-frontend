// src/api/ledgerApi.js
import api from "./axiosConfig";

// ACCOUNTS
export const getAccounts = (params) =>
  api.get("/ledgers/accounts", { params });

export const createAccount = (data) =>
  api.post("/ledgers/accounts", data);

// COST CENTERS
export const getCostCenters = (params) =>
  api.get("/ledgers/cost-centers", { params });

export const createCostCenter = (data) =>
  api.post("/ledgers/cost-centers", data);

// TRANSACTIONS (general ledger entries)
export const getTransactions = (params) =>
  api.get("/ledgers/transactions", { params });
