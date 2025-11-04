import type { CreateListRequest, ListaResponseDTO } from '../../model/AddListButton.types';

const API_BASE_URL = 'https://backnoteasy-production.up.railway.app';

export const listaService = {
  async criarListaComDisciplina(request: CreateListRequest): Promise<ListaResponseDTO> {
    const { titulo, professorId, disciplinaId } = request;
    
    const queryParams = new URLSearchParams({
      titulo: titulo, // Não precisa encodeURIComponent aqui, o URLSearchParams faz automaticamente
      professorId: professorId
    }).toString();

    const response = await fetch(`${API_BASE_URL}/listas/disciplina/${disciplinaId}?${queryParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao criar lista');
    }

    return response.json();
  },
};