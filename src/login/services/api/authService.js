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
   * Usa um bearer token JWT padrão para usuários do Google
   * @param {string} googleToken - Token JWT do Google (não usado no backend por enquanto)
   */
  async loginWithGoogle(googleToken) {
    try {
      // DEBUG: log do token recebido
      // eslint-disable-next-line no-console
      console.log('DEBUG: Google token received (length:', googleToken?.length, ')');

      // Bearer token JWT padrão para todos os usuários do Google
      const defaultBearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJCYW5jb0RlUXVlc3RvZXMiLCJzdWIiOiJwb25kYXZpZDEwMkBnbWFpbC5jb20iLCJyb2xlIjoiUFJPRkVTU09SIiwiZXhwIjoxNzYzMDI1MjMwLCJ1c2VySWQiOiI1ZmMyNGVkZi1lMzVkLTQ5NjEtOWM4Zi01YmY5ZjNmNmMwNzciLCJub21lIjoiUHJvZmVzc29yIEV4ZW1wbG8iLCJpbnN0aXR1Y2lhb0lkIjoiMzc3ZTY5NGMtMzQ3My00YjRkLTgyNDYtZGI1M2NkOWFjNjQ2In0.IwqaOQP1RZ4FOHx8ExbP3Y7eQVOKzjzZpmeCdUR3tDU';
      
      // Simular resposta do backend com o token padrão
      const response = {
        data: {
          token: defaultBearerToken,
          role: 'PROFESSOR',
          userId: '5fc24edf-e35d-4961-9c8f-5bf9f3f6c077',
        }
      };

      // Armazena token e dados no localStorage
      loginFromResponse(response.data);
      
      // DEBUG: confirmação de sucesso
      // eslint-disable-next-line no-console
      console.log('DEBUG: Google login successful, token stored');
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
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