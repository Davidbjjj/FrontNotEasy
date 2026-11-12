// src/service/api/questoes.service.ts

import { QuestaoEstudante } from '../../model/Question.types';
import api from '../../../services/apiClient';

export class QuestoesService {
  private baseUrl = 'http://localhost:8080';

  async getQuestoesPorEstudante(estudanteId: string): Promise<QuestaoEstudante[]> {
    // `api` envia o Authorization: o back devolve 401 sem token
    const { data } = await api.get(`${this.baseUrl}/listas/estudante/${estudanteId}/questoes`);
    return data;
  }

  async getRespostaQuestao(questaoId: number, estudanteId: string): Promise<{
    alternativa: number;
    correta: boolean;
  }> {
    const { data } = await api.get(
      `${this.baseUrl}/respostas/buscar?questaoId=${questaoId}&estudanteId=${estudanteId}`
    );
    return data;
  }
}

export const questoesService = new QuestoesService();