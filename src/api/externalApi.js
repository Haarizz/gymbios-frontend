import api from "./axiosConfig";

// MEMBERS API (from your file)
export const getMembers = async () => {
  const res = await api.get("/api/members");
  return res.data;
};

// TRAINING CLASSES API
export const getTrainingClasses = async () => {
  const res = await api.get("/classes");
  return res.data;
};

export const getTrainingClass = async (id) => {
  const res = await api.get(`/classes/${id}`);
  return res.data;
};
