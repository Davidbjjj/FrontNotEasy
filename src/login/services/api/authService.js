import api from '../../../services/apiClient';
import { loginFromResponse, logout as authLogout } from '../../../auth/auth';

const API_URL = 'http://localhost:8080';

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        senha: credentials.password,
      });

      // IMPORTANT: populate localStorage ONLY from decoded token (role and userId)
      // loginFromResponse will decode the token and store token, role and userId
      loginFromResponse(response.data);

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error('E-mail ou senha incorretos');
      } else {
        throw new Error('Erro ao tentar realizar login');
      }
    }
  },

  logout() {
    // delegate clearing to centralized auth util
    authLogout();
  },
};