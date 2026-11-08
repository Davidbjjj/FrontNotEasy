const API_BASE = 'http://localhost:8080';

export const dashboardService = {
  async getAlunoMetricas(alunoId: string, disciplinaId: string) {
    if (!alunoId || !disciplinaId) throw new Error('alunoId e disciplinaId são obrigatórios');
    const url = `${API_BASE}/api/dashboard/metricas/aluno/${alunoId}/disciplina/${disciplinaId}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text || 'Erro ao buscar métricas do aluno');
    }
    return resp.json();
  }
};
