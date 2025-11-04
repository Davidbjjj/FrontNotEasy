import axios from 'axios';

const API_BASE_URL = 'https://backnoteasy-production.up.railway.app/professores';

export const teacherService = {
  async register(teacherData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/cadastro`, teacherData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log('Professor cadastrado com sucesso:', response.data);
        return response.data;
      } else {
        throw new Error('Erro ao cadastrar professor');
      }
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Erro ao cadastrar professor');
      } else {
        throw new Error('Erro de conexão');
      }
    }
  },

  async getTeachers() {
    // Outros métodos relacionados a professores
  }
};