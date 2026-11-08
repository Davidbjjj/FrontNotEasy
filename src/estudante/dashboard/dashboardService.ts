import api from '../../services/apiClient';
import type { StudentDashboard } from './types';

/** Contrato com o back-end: ver docs/student-dashboard-api.md. */
export interface StudentDashboardService {
  get(estudanteId: string, signal?: AbortSignal): Promise<StudentDashboard>;
}

export const studentDashboardService: StudentDashboardService = {
  async get(estudanteId, signal) {
    const { data } = await api.get<StudentDashboard>(
      `/estudantes/${encodeURIComponent(estudanteId)}/dashboard`,
      { signal }
    );
    return data;
  },
};
