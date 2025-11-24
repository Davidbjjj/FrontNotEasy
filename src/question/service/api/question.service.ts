import { Question, QuestionOption } from '../../model/Question.types';
import api from '../../../services/apiClient';

export interface QuestaoResponseDTO {
  id: number;
  cabecalho: string;
  enunciado: string;
  // backend may return alternativas as array of strings or array of objects { id, ordem, texto }
  alternativas: Array<string | { id?: number | string; ordem?: number; texto?: string }>;
  gabarito: number;
  imagens?: Array<any>;
}

class QuestionService {
  private baseURL = 'https://backnoteasy-production.up.railway.app/listas';

  async getQuestionsByListId(listaId: string): Promise<Question[]> {
    try {
      // Use centralized axios `api` so Authorization header is included
      const url = `${this.baseURL}/${listaId}/questoes`;
      const response = await api.get(url);
      const questoesDTO: QuestaoResponseDTO[] = response.data;

      // Transformar DTO do backend para o formato do frontend
      return questoesDTO.map((dto, index) => this.transformDTOToQuestion(dto, index, questoesDTO.length));
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      throw error;
    }
  }

  private transformDTOToQuestion(dto: QuestaoResponseDTO, index: number, total: number): Question {
    // Mapear alternativas para o formato do frontend
    const options: QuestionOption[] = (dto.alternativas || []).map((alternativa: any, altIndex: number) => {
      const text = typeof alternativa === 'string' ? alternativa : (alternativa?.texto ?? '');
      return {
        id: String.fromCharCode(65 + altIndex), // A, B, C, D...
        label: String.fromCharCode(65 + altIndex),
        value: String.fromCharCode(65 + altIndex),
        text
      } as QuestionOption;
    });

    return {
      id: dto.id.toString(),
      title: dto.cabecalho || `Questão ${index + 1}`,
      content: dto.enunciado,
      options: options,
      correctAnswer: String.fromCharCode(65 + dto.gabarito), // Converte número para letra (0 -> A, 1 -> B, etc.)
      // preserve imagens from backend if provided
      imagens: (dto as any).imagens || [],
      explanation: 'Explicação da questão será fornecida aqui.', // Você precisará obter isso do backend
      subject: 'Disciplina', // Você precisará obter isso do backend
      tags: [], // Você precisará obter isso do backend
      difficulty: 'medium', // Você precisará calcular isso ou obter do backend
      progress: Math.round(((index + 1) / total) * 100),
      currentQuestion: index + 1,
      totalQuestions: total
    };
  }

  // Atualiza uma questão inteira (cabeçalho, enunciado, alternativas, gabarito)
  async updateQuestion(listaId: string, questaoId: string | number, body: { cabecalho: string; enunciado: string; alternativas: string[]; gabarito: number; }): Promise<QuestaoResponseDTO> {
    // Validações locais antes de enviar para a API
    if (!body.alternativas || body.alternativas.length === 0) {
      const err: any = new Error('Campo "alternativas" não pode ser vazio.');
      err.status = 400;
      throw err;
    }

    if (typeof body.gabarito !== 'number' || body.gabarito < 0 || body.gabarito >= body.alternativas.length) {
      const err: any = new Error('Gabarito fora do intervalo de alternativas.');
      err.status = 400;
      throw err;
    }

    try {
      const url = `${this.baseURL}/${listaId}/questoes/${questaoId}`;
      const response = await api.put(url, body);
      return response.data as QuestaoResponseDTO;
    } catch (error: any) {
      // Repassa erro com status quando disponível
      if (error && error.response && error.response.status) {
        const err: any = new Error(error.response.data?.message || 'Erro ao atualizar questão');
        err.status = error.response.status;
        throw err;
      }
      throw error;
    }
  }

  // Deleta uma questão da lista
  async deleteQuestion(listaId: string, questaoId: string | number): Promise<void> {
    try {
      const url = `${this.baseURL}/${listaId}/questoes/${questaoId}`;
      await api.delete(url);
    } catch (error: any) {
      if (error && error.response && error.response.status) {
        const err: any = new Error(error.response.data?.message || 'Erro ao deletar questão');
        err.status = error.response.status;
        throw err;
      }
      throw error;
    }
  }
}

export const questionService = new QuestionService();