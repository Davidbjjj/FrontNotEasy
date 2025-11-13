// src/service/api/questoes.service.ts

import { QuestaoEstudante } from '../../model/Question.types';

export class QuestoesService {
  private baseUrl = 'https://backnoteasy-production.up.railway.app';

  async getQuestoesPorEstudante(estudanteId: string): Promise<QuestaoEstudante[]> {
    const response = await fetch(`${this.baseUrl}/listas/estudante/${estudanteId}/questoes`);
    if (!response.ok) throw new Error('Erro ao buscar questões');
    return response.json();
  }

  async getRespostaQuestao(questaoId: number, estudanteId: string): Promise<{
    alternativa: number;
    correta: boolean;
  }> {
    const response = await fetch(
      `${this.baseUrl}/respostas/buscar?questaoId=${questaoId}&estudanteId=${estudanteId}`
    );
    if (!response.ok) throw new Error('Erro ao buscar resposta');
    return response.json();
  }
}

export const questoesService = new QuestoesService();