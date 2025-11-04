export interface EnviarRespostaRequest {
  estudanteId: string;
  questaoId: number;
  alternativa: number;
  listaId: string;
}

class RespostaService {
  private baseURL = 'http://localhost:8080';

  async enviarResposta(request: EnviarRespostaRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/enviaresposta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao enviar resposta');
      }

      console.log(`Resposta enviada com sucesso para questão ${request.questaoId}`);
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      throw error;
    }
  }

  // Método para converter letra (A, B, C) para índice numérico (0, 1, 2)
  converterLetraParaIndice(letra: string): number {
    return letra.charCodeAt(0) - 65; // A -> 0, B -> 1, C -> 2, etc.
  }

  // Método para converter índice numérico para letra
  converterIndiceParaLetra(indice: number): string {
    return String.fromCharCode(65 + indice); // 0 -> A, 1 -> B, 2 -> C, etc.
  }
}

export const respostaService = new RespostaService();