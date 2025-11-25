import axios from 'axios';
import { logout as authLogout } from '../auth/auth';

const API_BASE = 'https://backnoteasy-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Plain API instance without auth interceptor — use for public endpoints
export const plainApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

// Response interceptor: if unauthorized, clear auth (optional)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err && err.response && err.response.status === 401) {
      try {
        authLogout();
      } catch (e) {}
    }
    return Promise.reject(err);
  }
);

export default api;
