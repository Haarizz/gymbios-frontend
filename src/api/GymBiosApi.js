// src/api/GymBiosApi.js
import api from "./axiosConfig"; // Adjust path if your file is in src/utils/ or src/

// API Endpoints
const ONBOARDING_URL = "/api/onboarding";

/**
 * Sends the onboarding form data to the backend.
 * Uses the configured Axios instance to automatically attach the Auth Token.
 * * @param {Object} formData - The complete state object from the onboarding flow.
 * @returns {Promise<Object>} - The JSON response from the server.
 */
export const submitOnboarding = async (formData) => {
  try {
    // We use 'api' (from axiosConfig) instead of 'fetch'
    // This automatically handles the "Authorization: Bearer <token>" header
    const response = await api.post(`${ONBOARDING_URL}/submit`, formData);
    
    return response.data;
  } catch (error) {
    console.error("GymBios API Error:", error);
    
    // Extract readable error message from Axios error object
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data || 
      error.message || 
      "Failed to submit onboarding.";
      
    throw new Error(errorMessage);
  }
};