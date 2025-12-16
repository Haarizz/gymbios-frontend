import api from "./axiosConfig";  // use global axios instance with JWT + CORS

export async function listStreams() {
  const res = await api.get("/streams");
  return res.data;
}

export async function createStream(data) {
  const res = await api.post("/streams", data);
  return res.data;
}

export async function updateStream(id, data) {
  const res = await api.put(`/streams/${id}`, data);
  return res.data;
}

export async function deleteStream(id) {
  const res = await api.delete(`/streams/${id}`);
  return res.data;
}
