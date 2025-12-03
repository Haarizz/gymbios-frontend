import api from "./axiosConfig";

export const createJobOpening = (data) => api.post("/recruitment/jobs", data);
export const getJobOpenings = () => api.get("/recruitment/jobs");

export const createCandidate = (data) => api.post("/recruitment/candidates", data);
export const getCandidatesByJob = (jobId) => api.get(`/recruitment/candidates/${jobId}`);

export const scheduleInterview = (data) => api.post("/recruitment/interviews", data);
// src/api/recruitment.js (add)
export const getCandidateById = (id) => api.get(`/recruitment/candidate/${id}`); // if you add endpoint
export const getInterviewsByJob = (jobId) => api.get(`/recruitment/interviews?jobId=${jobId}`);

