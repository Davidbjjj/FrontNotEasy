import api from '../../../services/apiClient';

const API_BASE_PATH = '/professores';

export const teacherService = {
  async register(teacherData) {
    try {
      const response = await api.post(`${API_BASE_PATH}/cadastro`, teacherData);

      if (response.status === 200 || response.status === 201) {
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