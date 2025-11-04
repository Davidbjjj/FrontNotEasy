import axios from 'axios';

const API_BASE_URL = 'https://backnoteasy-production.up.railway.app/usuarios';

export const userService = {
  async register(userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/cadastro`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

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