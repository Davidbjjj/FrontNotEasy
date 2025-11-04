import axios from "axios";
import { createDesempenhoModel } from "../model/dashboardModels";

const API_BASE_URL = "https://noteasy-backend.onrender.com";

export const DesempenhoService = {
  async buscarDesempenho(listId, estudanteId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/listas/${listId}/estudantes/${estudanteId}/respostas-com-nota`
      );
      // Aqui você colocará o retorno real da API
      return createDesempenhoModel(response.data);
    } catch (error) {
      console.error("Erro ao buscar desempenho:", error);
      throw error;
    }
  },
};
