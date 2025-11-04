import api from "./api";

// Recebe o id da lista e do estudante e retorna o JSON
export async function buscarListaPorEstudante(listId, estudanteId) {
  try {
    const response = await api.get(`/listas/${listId}/estudantes/${estudanteId}/respostas-com-nota`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados da lista:", error);
    return null;
  }
}
