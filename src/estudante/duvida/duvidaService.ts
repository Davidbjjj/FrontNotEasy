import api from '../../services/apiClient';
import { pushMockNotification } from '../../notifications/notificationService';
import type { Duvida, NovaDuvida } from './types';

/**
 * Contrato com o back-end: ver docs/doubt-api.md.
 * Enquanto o endpoint não existe, o mock responde. API real: REACT_APP_DOUBT_MOCK=false
 */
const USE_MOCK = process.env.REACT_APP_DOUBT_MOCK !== 'false';

export interface DuvidaService {
  listar(listaId: string, signal?: AbortSignal): Promise<Duvida[]>;
  criar(nova: NovaDuvida): Promise<Duvida>;
}

const httpService: DuvidaService = {
  async listar(listaId, signal) {
    const { data } = await api.get<Duvida[]>(`/listas/${encodeURIComponent(listaId)}/duvidas`, { signal });
    return data;
  },
  async criar({ listaId, questaoId, tipo, texto, anexo }) {
    const form = new FormData();
    form.append('questaoId', questaoId);
    form.append('tipo', tipo);
    form.append('texto', texto);
    if (anexo) form.append('anexo', anexo);
    const { data } = await api.post<Duvida>(`/listas/${encodeURIComponent(listaId)}/duvidas`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

const REPLY_DELAY_MS = 8000;
const mockStore: Duvida[] = [];
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 250));

const mockService: DuvidaService = {
  async listar(listaId) {
    return delay(mockStore.filter((d) => d.listaId === listaId).map((d) => ({ ...d })));
  },
  async criar({ listaId, questaoId, tipo, texto, anexo }) {
    const d: Duvida = {
      id: `d${Date.now()}`, listaId, questaoId, tipo, texto,
      anexoNome: anexo?.name ?? null, status: 'ENVIADA',
      criadaEm: new Date().toISOString(), resposta: null, respondidaEm: null,
    };
    mockStore.push(d);
    // Simula o professor respondendo, para exercitar status e notificação.
    setTimeout(() => {
      d.status = tipo === 'DUVIDA' ? 'RESPONDIDA' : 'ACEITA';
      d.resposta = tipo === 'DUVIDA'
        ? 'Veja a explicação da questão e refaça o cálculo passo a passo.'
        : 'Você tem razão, a nota será revisada.';
      d.respondidaEm = new Date().toISOString();
      pushMockNotification({
        type: 'DUVIDA_RESPONDIDA',
        title: tipo === 'DUVIDA' ? 'Sua dúvida foi respondida' : 'Sua contestação foi analisada',
        message: 'O professor respondeu. Toque para ver.',
        link: `/listas/${listaId}/revisao`,
      });
    }, REPLY_DELAY_MS);
    return delay({ ...d });
  },
};

export const duvidaService: DuvidaService = USE_MOCK ? mockService : httpService;
