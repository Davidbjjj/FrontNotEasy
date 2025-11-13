import api from '../../../services/apiClient';
import { loginFromResponse, logout as authLogout } from '../../../auth/auth';

export const authService = {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        senha: credentials.password,
        recaptchaToken: credentials.recaptchaToken, // Enviar token ReCAPTCHA
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

  /**
   * Login com Google OAuth
   * @param {string} googleToken - Token JWT do Google
   */
  async loginWithGoogle(googleToken) {
    try {
      const response = await api.post('/auth/login/google', {
        token: googleToken,
      });

      loginFromResponse(response.data);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao fazer login com Google');
    }
  },

  /**
   * Login com GitHub OAuth
   * @param {string} githubCode - Código de autorização do GitHub
   */
  async loginWithGithub(githubCode) {
    try {
      const response = await api.post('/auth/login/github', {
        code: githubCode,
      });

      loginFromResponse(response.data);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao fazer login com GitHub');
    }
  },

  logout() {
    // delegate clearing to centralized auth util
    authLogout();
  },
};