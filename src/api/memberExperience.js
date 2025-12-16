import axios from './axiosConfig'; // Ensure this points to your existing axiosConfig

const BASE = '/api/experience';

// Fetch all saved sessions/feedback from DB
export async function getSessions() {
  try {
    const res = await axios.get(`${BASE}/sessions`);
    return res.data;
  } catch (err) {
    console.error("Error fetching sessions", err);
    return [];
  }
}

// Save new feedback to DB
export async function createSession(payload) {
  try {
    const res = await axios.post(`${BASE}/sessions`, payload);
    return res.data;
  } catch (err) {
    console.error("Error saving session", err);
    throw err;
  }
}