import { QuestionList } from '../../model/QuestionList.types';

export interface ListaResponseDTO {
  id: number;
  titulo: string;
  professorNome: string;
}

class QuestionListService {
  private baseURL = 'http://localhost:8082/listas'; 

  async getAllQuestionLists(): Promise<QuestionList[]> {
    try {
      const response = await fetch(this.baseURL);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar listas: ${response.status}`);
      }
      
      const listaDTOs: ListaResponseDTO[] = await response.json();
      
      // Transformar DTO do backend para o formato do frontend
      return listaDTOs.map(dto => this.transformDTOToQuestionList(dto));
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      throw error;
    }
  }

  private transformDTOToQuestionList(dto: ListaResponseDTO): QuestionList {
    // Mapeamento básico - você precisará ajustar conforme os campos reais do seu backend
    return {
      id: dto.id.toString(),
      title: dto.titulo,
      professor: {
        id: '1', // Você precisará obter isso do backend
        name: dto.professorNome
      },
      subject: {
        id: 'default', // Você precisará obter isso do backend
        name: 'Disciplina Padrão' // Você precisará obter isso do backend
      },
      questionsCompleted: 0, // Você precisará calcular isso
      totalQuestions: 0, // Você precisará obter isso do backend
      tags: [], // Você precisará obter isso do backend
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export const questionListService = new QuestionListService();