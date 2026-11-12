import api from '../../services/apiClient';
import type { QuestaoRevisao, RevisaoLista } from './types';

/** Nota máxima das listas objetivas (o back devolve a nota já em 0–10). */
const NOTA_MAXIMA = 10;

interface AlternativaDTO { id?: number; ordem?: number; texto?: string }

interface ItemRevisaoDTO {
  questaoId: number;
  tipo: string;
  assunto: string | null;
  cabecalho: string | null;
  enunciado: string;
  alternativas: AlternativaDTO[] | null;
  respostaAluno: number | null;
  gabarito: number | null;
  correta: boolean | null;
  explicacao: string | null;
  /** Questão aberta (FE-201): texto do aluno, nota 0–10 e feedback; nota nula = ainda na fila de correção. */
  textoResposta?: string | null;
  notaQuestao?: number | null;
  feedback?: string | null;
  corrigida?: boolean | null;
}

/** GET /listas/{listaId}/estudantes/{estudanteId}/revisao (RevisaoListaDTO do back). */
interface RevisaoListaDTO {
  listaId: string;
  titulo: string;
  nota: number | null;
  questoes: ItemRevisaoDTO[] | null;
}

export interface RevisaoService {
  get(listaId: string, estudanteId: string, signal?: AbortSignal): Promise<RevisaoLista>;
}

function mapQuestao(q: ItemRevisaoDTO, indice: number): QuestaoRevisao {
  if (q.tipo === 'ABERTA') {
    return {
      tipo: 'ABERTA',
      questaoId: String(q.questaoId),
      numero: indice + 1,
      assunto: q.assunto ? { id: q.assunto, nome: q.assunto } : null,
      enunciado: q.enunciado,
      minhaResposta: q.textoResposta ?? null,
      nota: q.corrigida ? (q.notaQuestao ?? null) : null,
      notaMaxima: NOTA_MAXIMA,
      feedback: q.feedback ?? null,
    };
  }
  const alternativas = [...(q.alternativas ?? [])]
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    .map((a) => a.texto ?? '');
  return {
    tipo: 'OBJETIVA',
    questaoId: String(q.questaoId),
    numero: indice + 1,
    // O back só manda o nome do assunto, sem id: sem id não há link para a evolução.
    assunto: q.assunto ? { id: q.assunto, nome: q.assunto } : null,
    enunciado: q.enunciado,
    alternativas,
    minhaResposta: q.respostaAluno ?? null,
    // Sem gabarito cadastrado: -1 nunca bate com uma resposta, a questão não conta como acerto.
    respostaCerta: q.gabarito ?? -1,
    explicacao: q.explicacao ?? null,
  };
}

export const revisaoService: RevisaoService = {
  async get(listaId, estudanteId, signal) {
    try {
      const { data } = await api.get<RevisaoListaDTO>(
        `/listas/${encodeURIComponent(listaId)}/estudantes/${encodeURIComponent(estudanteId)}/revisao`,
        { signal }
      );
      return {
        listaId: String(data.listaId),
        titulo: data.titulo,
        disciplina: '',
        regraGabarito: 'MANUAL',
        gabaritoLiberado: true,
        liberadoEm: null,
        nota: data.nota ?? null,
        notaMaxima: NOTA_MAXIMA,
        questoes: (data.questoes ?? []).map(mapQuestao),
      };
    } catch (e: any) {
      // 403 = lista não finalizada ou gabarito ainda não liberado pelo professor.
      // O back não envia gabarito nesse caso, então não há dados para mostrar além do aviso.
      if (e?.response?.status === 403) {
        return {
          listaId,
          titulo: '',
          disciplina: '',
          regraGabarito: 'MANUAL',
          gabaritoLiberado: false,
          liberadoEm: null,
          nota: null,
          notaMaxima: NOTA_MAXIMA,
          questoes: [],
        };
      }
      throw e;
    }
  },
};
