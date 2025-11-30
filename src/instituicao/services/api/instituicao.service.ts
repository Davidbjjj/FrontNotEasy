import api, { plainApi } from '../../../services/apiClient';

class InstituicaoService {
  // Use server routes as documented (no extra `/api` prefix expected)

  async registerInstituicao(payload: any) {
    const resp = await api.post('/instituicao/registrar', payload);
    return resp.data;
  }

  async listInstituicoes() {
    const resp = await api.get('/instituicao/listar');
    return resp.data;
  }

  async getInstituicao(id: string) {
    const resp = await api.get(`/instituicao/editar/${id}`);
    return resp.data;
  }

  async deleteInstituicao(id: string) {
    const resp = await api.delete(`/instituicao/deletar/${id}`);
    return resp.status === 204;
  }

  async addPermittedEmails(instituicaoId: string, emails: string[]) {
    const resp = await api.post(`/instituicao/${instituicaoId}/emails-permitidos`, { emails });
    return resp.data;
  }

  async listPermittedEmails(instituicaoId: string) {
    const resp = await api.get(`/instituicao/${instituicaoId}/emails-permitidos`);
    return resp.data as string[];
  }

  async removePermittedEmail(instituicaoId: string, email: string) {
    // DELETE /instituicao/{id}/emails-permitidos?email=xxx
    const resp = await api.delete(`/instituicao/${instituicaoId}/emails-permitidos`, { params: { email } });
    return resp.data;
  }

  async logout() {
    const resp = await api.post('/instituicao/logout');
    return resp.data;
  }

  // Professor registration (public endpoint)
  async registerProfessor(payload: any) {
    // Enviar apenas os campos necessários
    const { nome, dataNascimento, email, senha, materia1Id, materia2Id, instituicaoId } = payload || {};
    const body = { nome, dataNascimento, email, senha, materia1Id, materia2Id, instituicaoId };
    const resp = await plainApi.post('/professor/registrar', body);
    return resp.data;
  }

  // Disciplina creation
  async createDisciplina(payload: any) {
    // Enviar apenas os campos necessários ao backend
    const { nome, instituicaoId, professorId } = payload || {};
    const body = { nome, instituicaoId, professorId };
    const resp = await api.post('/disciplinas', body);
    return resp.data;
  }

  // Student registration
  async registerEstudante(payload: any) {
    const resp = await api.post('/estudante/registrar', payload);
    return resp.data;
  }

  // Matricular estudante
  async addEstudanteToDisciplina(payload: any) {
    const resp = await api.post('/notas-estudante/adicionar', payload);
    return resp.data;
  }

  // Associate professor to disciplina (PUT)
  async associateProfessorToDisciplina(disciplinaId: string, professorId: string) {
    const resp = await api.put(`/disciplina/${disciplinaId}/professor/${professorId}`);
    return resp.data;
  }
}

export const instituicaoService = new InstituicaoService();
