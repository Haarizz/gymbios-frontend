import api from "./axiosConfig";

// Save a snapshot of the report
export const saveReport = async (payload) => {
  // Payload expects: { name, filters: {}, summary: {} }
  const res = await api.post("/api/community-reports", payload);
  return res.data;
};

// List all saved reports history
export const listSavedReports = async () => {
  const res = await api.get("/api/community-reports");
  return res.data;
};

// Delete a report (optional utility)
export const deleteSavedReport = async (id) => {
  await api.delete(`/api/community-reports/${id}`);
};