import api from "./axiosConfig";

const BASE = "/bookings";

export const getBookings = () => api.get(BASE);
export const getBooking = (id) => api.get(`${BASE}/${id}`);
export const addBooking = (data) => api.post(BASE, data);
export const updateBooking = (id, data) => api.put(`${BASE}/${id}`, data);
export const deleteBooking = (id) => api.delete(`${BASE}/${id}`);
