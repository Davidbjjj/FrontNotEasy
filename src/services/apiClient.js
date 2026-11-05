import axios from 'axios';
import { logout as authLogout } from '../auth/auth';
import { notifySessionExpired } from '../auth/session';

export const NETWORK_ERROR_EVENT = 'api-network-error';
export const API_BASE = 'http://localhost:8080';

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

    // If sending FormData, remove the default Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
      // Só é "sessão expirada" se havia uma sessão; 401 sem token é credencial inválida
      const hadSession = !!localStorage.getItem('token');
      try {
        authLogout();
      } catch (e) { }
      if (hadSession) notifySessionExpired();
    } else if (err && !err.response && err.request) {
      // Sem resposta do servidor: o ConnectionBanner cuida do aviso e das novas tentativas
      window.dispatchEvent(new CustomEvent(NETWORK_ERROR_EVENT));
    }
    return Promise.reject(err);
  }
);

export default api;
