import api from "./axiosConfig";

const BASE = "/api/reward-rules";

export async function getRewardRules() {
  const res = await api.get(BASE);
  return res.data;
}

export async function createRewardRule(payload) {
  const res = await api.post(BASE, payload);
  return res.data;
}
