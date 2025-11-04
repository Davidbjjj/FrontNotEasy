import { Question, QuestionOption } from '../../model/Question.types';

export interface QuestaoResponseDTO {
  id: number;
  cabecalho: string;
  enunciado: string;
  alternativas: string[];
  gabarito: number;
}

class QuestionService {
  private baseURL = 'http://localhost:8080/listas';

  async getQuestionsByListId(listaId: string): Promise<Question[]> {
    try {
      const response = await fetch(`${this.baseURL}/${listaId}/questoes`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar questões: ${response.status}`);
      }
      
      const questoesDTO: QuestaoResponseDTO[] = await response.json();
      
      // Transformar DTO do backend para o formato do frontend
      return questoesDTO.map((dto, index) => this.transformDTOToQuestion(dto, index, questoesDTO.length));
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      throw error;
    }
  }

  private transformDTOToQuestion(dto: QuestaoResponseDTO, index: number, total: number): Question {
    // Mapear alternativas para o formato do frontend
    const options: QuestionOption[] = dto.alternativas.map((alternativa, altIndex) => ({
      id: String.fromCharCode(65 + altIndex), // A, B, C, D...
      label: String.fromCharCode(65 + altIndex),
      value: String.fromCharCode(65 + altIndex),
      text: alternativa
    }));

    return {
      id: dto.id.toString(),
      title: dto.cabecalho || `Questão ${index + 1}`,
      content: dto.enunciado,
      options: options,
      correctAnswer: String.fromCharCode(65 + dto.gabarito), // Converte número para letra (0 -> A, 1 -> B, etc.)
      explanation: 'Explicação da questão será fornecida aqui.', // Você precisará obter isso do backend
      subject: 'Disciplina', // Você precisará obter isso do backend
      tags: [], // Você precisará obter isso do backend
      difficulty: 'medium', // Você precisará calcular isso ou obter do backend
      progress: Math.round(((index + 1) / total) * 100),
      currentQuestion: index + 1,
      totalQuestions: total
    };
  }
}

export const questionService = new QuestionService();