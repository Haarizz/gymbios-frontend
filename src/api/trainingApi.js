import api from "./axiosConfig";

export const getTrainingClasses = () => api.get("/classes");

export const getTrainingClass = (id) => api.get(`/classes/${id}`);

export const createTrainingClass = (data) => api.post("/classes", data);

export const updateTrainingClass = (id, data) =>
  api.put(`/classes/${id}`, data);

export const deleteTrainingClass = (id) =>
  api.delete(`/classes/${id}`);
