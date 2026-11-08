import api from '../services/apiClient';
import { AppNotification, NotificationPage } from './types';

/**
 * Contrato com o back-end: ver docs/notifications-api.md.
 * Enquanto o endpoint não existe, o mock abaixo responde no lugar dele.
 * Para usar a API real: REACT_APP_NOTIFICATIONS_MOCK=false
 */
const USE_MOCK = process.env.REACT_APP_NOTIFICATIONS_MOCK !== 'false';

export interface NotificationService {
  list(page: number, size: number): Promise<NotificationPage>;
  unreadCount(): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}

// ---------- API real ----------
const httpService: NotificationService = {
  async list(page, size) {
    const { data } = await api.get<NotificationPage>('/notificacoes', {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return data;
  },
  async unreadCount() {
    const { data } = await api.get<{ count: number }>('/notificacoes/nao-lidas/contagem');
    return data.count;
  },
  async markRead(id) {
    await api.patch(`/notificacoes/${encodeURIComponent(id)}/lida`);
  },
  async markAllRead() {
    await api.patch('/notificacoes/lidas');
  },
};

// ---------- Mock ----------
const MINUTE = 60_000;
const SAMPLES: Pick<AppNotification, 'type' | 'title' | 'message' | 'link'>[] = [
  { type: 'LISTA_NOVA', title: 'Nova lista publicada', message: 'Uma nova lista de questões está disponível.', link: '/listas' },
  { type: 'PRAZO', title: 'Prazo se aproximando', message: 'Uma atividade vence amanhã.', link: '/atividades' },
  { type: 'NOTA_LANCADA', title: 'Nota lançada', message: 'Sua nota de uma atividade foi publicada.', link: '/atividades' },
  { type: 'GERAL', title: 'Aviso da instituição', message: 'Confira as novidades da plataforma.', link: null },
];

let mockStore: AppNotification[] | null = null;
function getMockStore(): AppNotification[] {
  if (!mockStore) {
    const now = Date.now();
    mockStore = Array.from({ length: 23 }, (_, i) => {
      const s = SAMPLES[i % SAMPLES.length];
      return {
        id: String(1000 - i),
        ...s,
        read: i >= 6,
        createdAt: new Date(now - i * 47 * MINUTE).toISOString(),
      };
    });
  }
  return mockStore;
}
const delay = <T,>(value: T) => new Promise<T>((r) => setTimeout(() => r(value), 250));

const mockService: NotificationService = {
  async list(page, size) {
    const all = [...getMockStore()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = page * size;
    return delay({
      items: all.slice(start, start + size).map((n) => ({ ...n })),
      page,
      size,
      totalElements: all.length,
      totalPages: Math.max(1, Math.ceil(all.length / size)),
    });
  },
  async unreadCount() {
    return delay(getMockStore().filter((n) => !n.read).length);
  },
  async markRead(id) {
    const n = getMockStore().find((x) => x.id === id);
    if (n) n.read = true;
    return delay(undefined);
  },
  async markAllRead() {
    getMockStore().forEach((n) => {
      n.read = true;
    });
    return delay(undefined);
  },
};

/** Só para o mock: permite a outros mocks (ex.: dúvidas) gerarem uma notificação. */
export function pushMockNotification(n: Pick<AppNotification, 'type' | 'title' | 'message' | 'link'>) {
  if (!USE_MOCK) return;
  getMockStore().unshift({ id: `m${Date.now()}`, ...n, read: false, createdAt: new Date().toISOString() });
}

export const notificationService: NotificationService = USE_MOCK ? mockService : httpService;
