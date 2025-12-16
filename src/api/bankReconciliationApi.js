import api from "./axiosConfig";

// Get full bank reconciliation summary by date range
export const getBankReconciliation = (from, to) =>
  api.get("/bank-reconciliation", {
    params: { from, to },
  });

// Get only ledger balance
export const getLedgerBalance = (from, to) =>
  api.get("/bank-reconciliation/ledger-balance", {
    params: { from, to },
  });

// Get only bank receipts total
export const getBankReceipts = (from, to) =>
  api.get("/bank-reconciliation/bank-receipts", {
    params: { from, to },
  });

// Get only bank payments total
export const getBankPayments = (from, to) =>
  api.get("/bank-reconciliation/bank-payments", {
    params: { from, to },
  });

// Finalize reconciliation
export const finalizeReconciliation = (data) =>
  api.post("/bank-reconciliation/finalize", data);
