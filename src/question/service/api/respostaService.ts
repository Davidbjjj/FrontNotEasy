// src/question/service/api/respostaService.ts

import { QuizResult, RespostaEstudanteQuestaoDTO, RespostasListaDTO } from "../../model/Question.types";

export class RespostaService {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || 'https://backnoteasy-production.up.railway.app';
  }

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
      const response = await fetch(`${this.baseURL}/enviaresposta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resposta),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar resposta: ${response.statusText}`);
      }

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
      const response = await fetch(
        `${this.baseURL}/listas/${listaId}/estudantes/${estudanteId}/respostas-com-nota`
      );

      if (!response.ok) {
        throw new Error(`Erro ao calcular resultado: ${response.statusText}`);
      }

      return await response.json();
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
      const response = await fetch(`${this.baseURL}/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(respostasDTO),
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar respostas: ${response.statusText}`);
      }

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
      const response = await fetch(
        `${this.baseURL}/lista/${listaId}/estudante/${estudanteId}`
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar respostas: ${response.statusText}`);
      }

      return await response.json();
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
      const response = await fetch(
        `${this.baseURL}/resultado/lista/${listaId}/estudante/${estudanteId}`
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar resultado: ${response.statusText}`);
      }

      return await response.json();
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
      const response = await fetch(
        `${this.baseURL}/verificar/lista/${listaId}/estudante/${estudanteId}`
      );

      if (!response.ok) {
        throw new Error(`Erro ao verificar lista: ${response.statusText}`);
      }

      const result = await response.json();
      return result.respondida || false;
    } catch (error) {
      console.error('Erro ao verificar lista:', error);
      return false;
    }
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