import api from '../../services/apiClient';
import type { RevisaoLista } from './types';

/**
 * Contrato com o back-end: ver docs/review-api.md.
 * Enquanto o endpoint não existe, o mock responde. API real: REACT_APP_REVIEW_MOCK=false
 */
const USE_MOCK = process.env.REACT_APP_REVIEW_MOCK !== 'false';

export interface RevisaoService {
  get(listaId: string, estudanteId: string, signal?: AbortSignal): Promise<RevisaoLista>;
}

const httpService: RevisaoService = {
  async get(listaId, estudanteId, signal) {
    const { data } = await api.get<RevisaoLista>(
      `/listas/${encodeURIComponent(listaId)}/estudantes/${encodeURIComponent(estudanteId)}/revisao`,
      { signal }
    );
    return data;
  },
};

const mockService: RevisaoService = {
  async get(listaId) {
    const data: RevisaoLista = {
      listaId,
      titulo: 'Lista 1 — Funções',
      disciplina: 'Matemática',
      regraGabarito: 'APOS_ENTREGA',
      gabaritoLiberado: true,
      liberadoEm: null,
      nota: 6.5,
      notaMaxima: 10,
      questoes: [
        {
          tipo: 'OBJETIVA', questaoId: 'q1', numero: 1, assunto: { id: 'a1', nome: 'Função afim' },
          enunciado: 'Se f(x) = 2x + 3, quanto vale f(4)?',
          alternativas: ['8', '10', '11', '14'], minhaResposta: 2, respostaCerta: 2,
          explicacao: 'Substituindo x por 4: 2·4 + 3 = 11.',
        },
        {
          tipo: 'OBJETIVA', questaoId: 'q2', numero: 2, assunto: { id: 'a2', nome: 'Função quadrática' },
          enunciado: 'Quais são as raízes de x² − 5x + 6 = 0?',
          alternativas: ['1 e 6', '2 e 3', '−2 e −3', '5 e 6'], minhaResposta: 0, respostaCerta: 1,
          explicacao: 'Soma = 5 e produto = 6, logo as raízes são 2 e 3.',
        },
        {
          tipo: 'OBJETIVA', questaoId: 'q3', numero: 3, assunto: { id: 'a2', nome: 'Função quadrática' },
          enunciado: 'Qual é a coordenada x do vértice de y = x² − 4x + 1?',
          alternativas: ['−2', '2', '4', '1'], minhaResposta: null, respostaCerta: 1,
          explicacao: null,
        },
        {
          tipo: 'ABERTA', questaoId: 'q4', numero: 4, assunto: { id: 'a1', nome: 'Função afim' },
          enunciado: 'Explique com suas palavras o que é o coeficiente angular de uma reta.',
          minhaResposta: 'É a inclinação da reta.', nota: 1.5, notaMaxima: 2,
          feedback: 'Boa definição! Faltou relacionar com a variação de y por unidade de x.',
        },
        {
          tipo: 'ABERTA', questaoId: 'q5', numero: 5, assunto: null,
          enunciado: 'Dê um exemplo do cotidiano que seja modelado por uma função afim.',
          minhaResposta: 'Corrida de táxi: valor fixo mais valor por km.', nota: null, notaMaxima: 2, feedback: null,
        },
      ],
    };
    return new Promise((r) => setTimeout(() => r(data), 250));
  },
};

export const revisaoService: RevisaoService = USE_MOCK ? mockService : httpService;
