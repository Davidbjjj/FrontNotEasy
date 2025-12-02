import { QuestionList } from '../../model/QuestionList.types';

export interface ListaResponseDTO {
  id: number;
  titulo: string;
  professorNome: string;
  disciplinaNome?: string;
  disciplinaId?: string;
  totalQuestoes?: number;
  questoesRespondidas?: number;
}

class QuestionListService {
  // Base da rota de listas; estudante será concatenado dinamicamente
  private baseURL = 'https://backnoteasy-production.up.railway.app/listas';

  async getAllQuestionLists(): Promise<QuestionList[]> {
    try {
      const role = (localStorage.getItem('role') || '').toUpperCase();
      const userId = localStorage.getItem('userId') || '';

      let url = this.baseURL;
      if (role === 'PROFESSOR' && userId) {
        // Quando for professor, buscamos as listas do professor
        url = `${this.baseURL}/professor/${userId}`;
      } else if (role === 'INSTITUICAO' && userId) {
        // Quando for instituição, buscamos as listas da instituição
        url = `${this.baseURL}/instituicao/${userId}`;
      } else if (userId) {
        // Por padrão, se existir userId, assumimos estudante
        url = `${this.baseURL}/estudante/${userId}`;
      }

      const response = await fetch(url);

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
    // Tentar obter disciplina do localStorage se não vier do backend
    let disciplinaNome = dto.disciplinaNome;
    let disciplinaId = dto.disciplinaId;
    
    if (!disciplinaNome) {
      try {
        const listaDisciplinas = JSON.parse(localStorage.getItem('listaDisciplinas') || '{}');
        const disciplinaInfo = listaDisciplinas[dto.id];
        if (disciplinaInfo) {
          disciplinaNome = disciplinaInfo.disciplinaNome;
          disciplinaId = disciplinaInfo.disciplinaId;
        }
      } catch (e) {
        console.error('Erro ao recuperar disciplina da lista:', e);
      }
    }
    
    return {
      id: dto.id.toString(),
      title: dto.titulo,
      professor: {
        id: '1',
        name: dto.professorNome
      },
      subject: {
        id: disciplinaId || 'default',
        name: disciplinaNome || 'Sem disciplina'
      },
      questionsCompleted: dto.questoesRespondidas || 0,
      totalQuestions: dto.totalQuestoes || 0,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export const questionListService = new QuestionListService();
