import api from '../../services/apiClient';
import type { StudentDashboard } from './types';

/**
 * Contrato com o back-end: ver docs/student-dashboard-api.md.
 * Enquanto o endpoint não existe, o mock abaixo responde no lugar dele.
 * Para usar a API real: REACT_APP_STUDENT_DASHBOARD_MOCK=false
 */
const USE_MOCK = process.env.REACT_APP_STUDENT_DASHBOARD_MOCK !== 'false';

export interface StudentDashboardService {
  get(estudanteId: string, signal?: AbortSignal): Promise<StudentDashboard>;
}

const httpService: StudentDashboardService = {
  async get(estudanteId, signal) {
    const { data } = await api.get<StudentDashboard>(
      `/estudante/${encodeURIComponent(estudanteId)}/dashboard`,
      { signal }
    );
    return data;
  },
};

// ---------- Mock ----------
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const mockService: StudentDashboardService = {
  async get() {
    const now = Date.now();
    const iso = (offset: number) => new Date(now + offset).toISOString();
    const data: StudentDashboard = {
      totalDisciplinas: 3,
      proximasListas: [
        { id: 'l3', titulo: 'Lista 3 — Cinemática', disciplina: 'Física', prazo: iso(5 * DAY), respondidas: 0, total: 10 },
        { id: 'l1', titulo: 'Lista 1 — Funções', disciplina: 'Matemática', prazo: iso(30 * HOUR), respondidas: 4, total: 8 },
        { id: 'l6', titulo: 'Lista 6 — Estequiometria', disciplina: 'Química', prazo: null, respondidas: 0, total: 12 },
        { id: 'l2', titulo: 'Lista 2 — Geometria plana', disciplina: 'Matemática', prazo: iso(2 * HOUR), respondidas: 0, total: 6 },
      ],
      ultimasNotas: [
        { listaId: 'l0', titulo: 'Lista 0 — Revisão', disciplina: 'Matemática', nota: 8.5, notaMaxima: 10, corrigidaEm: iso(-1 * DAY) },
        { listaId: 'l9', titulo: 'Lista 9 — Ótica', disciplina: 'Física', nota: 6, notaMaxima: 10, corrigidaEm: iso(-4 * DAY) },
        { listaId: 'l8', titulo: 'Lista 8 — Leitura', disciplina: 'Português', nota: 9.5, notaMaxima: 10, corrigidaEm: iso(-9 * DAY) },
      ],
      sequencia: { atual: 4, recorde: 12, ativoHoje: false },
      emAndamento: { listaId: 'l1', titulo: 'Lista 1 — Funções', disciplina: 'Matemática', respondidas: 4, total: 8 },
    };
    return new Promise((r) => setTimeout(() => r(data), 250));
  },
};

export const studentDashboardService: StudentDashboardService = USE_MOCK ? mockService : httpService;
