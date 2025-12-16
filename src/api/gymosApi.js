import api from "./axiosConfig";

export const getOverview = () =>
  api.get("/gymos/overview").then(res => res.data);

export const getModules = () =>
  api.get("/gymos/modules").then(res => res.data);

export const getStats = () =>
  api.get("/gymos/stats").then(res => res.data);

export const getDevices = () =>
  api.get("/gymos/devices").then(res => res.data);

export const getApiIntegrations = () =>
  api.get("/gymos/api-integrations").then(res => res.data);

export const getNotifications = () =>
  api.get("/gymos/notifications").then(res => res.data);

export const getActivity = () =>
  api.get("/gymos/activity").then(res => res.data);

export const getConfig = () =>
  api.get("/gymos/config").then(res => res.data);

export const saveConfig = (payload) =>
  api.post("/gymos/config", payload).then(res => res.data);
