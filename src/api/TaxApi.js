import api from "../api/axiosConfig"; // Ensure axiosConfig.js is in the 'src' folder

export const TaxApi = {
  // --- Configuration Endpoints ---
  
  // Get all tax configurations
  getAllConfigs: async () => {
    const response = await api.get("/api/tax/config");
    return response.data;
  },

  // Add a new tax configuration (Backend automatically creates the first filing)
  addConfig: async (configData) => {
    const response = await api.post("/api/tax/config", configData);
    return response.data;
  },

  // Update an existing configuration
  updateConfig: async (id, configData) => {
    const response = await api.put(`/api/tax/config/${id}`, configData);
    return response.data;
  },

  // Delete a configuration
  deleteConfig: async (id) => {
    await api.delete(`/api/tax/config/${id}`);
  },

  // --- Filing Endpoints ---

  // Get all filings
  getAllFilings: async () => {
    const response = await api.get("/api/tax/filings");
    return response.data;
  },

  // Update a filing (Status, Amount, Notes)
  updateFiling: async (id, filingData) => {
    const response = await api.put(`/api/tax/filings/${id}`, filingData);
    return response.data;
  }
};