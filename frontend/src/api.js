import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export function setToken(token) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
}

export const auth = {
  register: (data) => axios.post(`${API_BASE}/auth/register`, data).then(r => r.data),
  login: (data) => axios.post(`${API_BASE}/auth/login`, data).then(r => r.data)
};

export const rooms = {
  list: () => axios.get(`${API_BASE}/rooms`).then(r => r.data),
  create: (data) => axios.post(`${API_BASE}/rooms`, data).then(r => r.data),
  join: (id, data) => axios.post(`${API_BASE}/rooms/${id}/join`, data).then(r => r.data)
};
