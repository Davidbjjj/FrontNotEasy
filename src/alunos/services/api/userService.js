import api from '../../../services/apiClient';

const API_BASE_PATH = '/usuarios';

export const userService = {
  async register(userData) {
    try {
      const response = await api.post(`${API_BASE_PATH}/cadastro`, userData);

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Erro ao cadastrar usuário');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Erro ao cadastrar');
      } else {
        throw new Error('Erro de conexão');
      }
    }
  },

  async getUsers() {
    // Outros métodos relacionados a usuários
  }
};