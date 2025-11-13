import api from '../../../services/apiClient';
import { loginFromResponse, logout as authLogout } from '../../../auth/auth';

export const authService = {
  async login(credentials) {
    try {
      const payload = {
        email: credentials.email,
        senha: credentials.password,
        recaptchaToken: credentials.recaptchaToken, // Enviar token ReCAPTCHA
      };

      // Remove any accidental secret fields before sending (safety net)
      const sanitizedPayload = { ...payload };
      const removedKeys = [];
      Object.keys(sanitizedPayload).forEach((k) => {
        if (k.toLowerCase().includes('secret')) {
          removedKeys.push(k);
          delete sanitizedPayload[k];
        }
      });

      // DEBUG: log payload being sent to backend (remove in production)
      // eslint-disable-next-line no-console
      console.log('DEBUG authService.login payload (sanitized):', sanitizedPayload, 'removedKeys:', removedKeys);

      const response = await api.post('/auth/login', sanitizedPayload);

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