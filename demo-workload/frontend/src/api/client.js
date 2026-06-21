import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const healthApi = {
  getHealth: () => api.get('/health'),
  getStatus: () => api.get('/status'),
  getMetrics: () => api.get('/metrics', { transformResponse: [(data) => data] }),
};

export const usersApi = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

export const simulateApi = {
  oom: () => api.get('/simulate/oom'),
  cpu: () => api.get('/simulate/cpu'),
  crash: () => api.get('/simulate/crash'),
  dbFailure: () => api.get('/simulate/db-failure'),
  slowResponse: () => api.get('/simulate/slow-response', { timeout: 120000 }),
  logStorm: () => api.get('/simulate/log-storm'),
  readinessFailure: () => api.get('/simulate/readiness-failure'),
  livenessFailure: () => api.get('/simulate/liveness-failure'),
};

export default api;
