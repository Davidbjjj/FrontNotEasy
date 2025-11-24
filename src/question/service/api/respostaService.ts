// src/question/service/api/respostaService.ts

import { QuizResult, RespostaEstudanteQuestaoDTO, RespostasListaDTO } from "../../model/Question.types";
import api from '../../../services/apiClient';

export class RespostaService {
  // use axios instance with baseURL and auth interceptor

  /**
   * Converte letra (A, B, C, D) para índice numérico (0, 1, 2, 3)
   */
  converterLetraParaIndice(answerId: string): number {
    if (!answerId || answerId.length === 0) return 0;
    return answerId.charCodeAt(0) - 65; // A -> 0, B -> 1, etc.
  }

  /**
   * Converte índice numérico para letra (0 -> A, 1 -> B, etc.)
   */
  converterIndiceParaLetra(indice: number): string {
    return String.fromCharCode(65 + indice);
  }

  /**
   * Envia uma resposta individual
   */
  async enviarResposta(resposta: {
    estudanteId: string;
    questaoId: number;
    alternativa: number;
    listaId: string;
  }): Promise<void> {
    try {
      await api.post('/enviaresposta', resposta);
      console.log('Resposta individual enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar resposta individual:', error);
      throw error;
    }
  }

  /**
   * Calcula o resultado final do quiz
   */
  async calcularResultadoFinal(listaId: string, estudanteId: string): Promise<QuizResult> {
    try {
      const response = await api.get(`/listas/${listaId}/estudantes/${estudanteId}/respostas-com-nota`);
      return response.data as QuizResult;
    } catch (error) {
      console.error('Erro ao calcular resultado:', error);
      throw error;
    }
  }

  /**
   * Envia as respostas do estudante para o backend
   */
  async enviarRespostas(respostasDTO: RespostasListaDTO): Promise<void> {
    try {
      // prefer '/respostas/multiplas' as batch endpoint
      await api.post('/respostas/multiplas', respostasDTO);
      console.log('Respostas enviadas com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar respostas:', error);
      throw error;
    }
  }

  /**
   * Busca as respostas de um estudante para uma lista específica
   */
  async buscarRespostasPorLista(
    listaId: string, 
    estudanteId: string
  ): Promise<RespostaEstudanteQuestaoDTO[]> {
    try {
      const response = await api.get(`/lista/${listaId}/estudante/${estudanteId}`);
      return response.data as RespostaEstudanteQuestaoDTO[];
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
      throw error;
    }
  }

  /**
   * Busca o resultado do quiz para um estudante
   */
  async buscarResultadoQuiz(
    listaId: string, 
    estudanteId: string
  ): Promise<QuizResult> {
    try {
      const response = await api.get(`/resultado/lista/${listaId}/estudante/${estudanteId}`);
      return response.data as QuizResult;
    } catch (error) {
      console.error('Erro ao buscar resultado:', error);
      throw error;
    }
  }

  /**
   * Verifica se o estudante já respondeu a lista
   */
  async verificarListaRespondida(
    listaId: string, 
    estudanteId: string
  ): Promise<boolean> {
    try {
      const response = await api.get(`/verificar/lista/${listaId}/estudante/${estudanteId}`);
      return response.data?.respondida || false;
    } catch (error) {
      console.error('Erro ao verificar lista:', error);
      return false;
    }
  }

  // fetch visao do estudante para a lista
  async fetchVisao(listaId: string, estudanteId: string): Promise<any> {
    const res = await api.get(`/listas/${listaId}/estudantes/${estudanteId}/visao`);
    return res.data;
  }

  async finalizarLista(listaId: string, estudanteId: string): Promise<void> {
    await api.post(`/listas/${listaId}/estudantes/${estudanteId}/finalizar`);
  }

  /**
   * Converte respostas do formato frontend para DTO do backend
   */
  converterParaRespostaDTO(
    questaoId: number,
    estudanteId: string,
    nomeEstudante: string,
    alternativa: number,
    correta: boolean
  ): RespostaEstudanteQuestaoDTO {
    return {
      respostaId: 0, // Será gerado pelo backend
      questaoId,
      estudanteId,
      nomeEstudante,
      alternativa,
      correta,
    };
  }

  /**
   * Cria DTO completo para envio de respostas
   */
  criarRespostasListaDTO(
    listaId: string,
    tituloLista: string,
    respostas: RespostaEstudanteQuestaoDTO[]
  ): RespostasListaDTO {
    return {
      listaId,
      tituloLista,
      respostas,
    };
  }
}

// Exporta a instância do serviço
export const respostaService = new RespostaService();