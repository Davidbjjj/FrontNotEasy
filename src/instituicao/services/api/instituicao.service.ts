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

  // Update professor information
  async updateProfessor(professorId: string, payload: any) {
    const { nome, dataNascimento, materia1Id, materia2Id, instituicaoId } = payload || {};
    const body = { nome, dataNascimento, materia1Id, materia2Id, instituicaoId };
    const resp = await api.put(`/professor/${professorId}`, body);
    return resp.data;
  }

  // List professors from institution
  async listProfessores(instituicaoId: string) {
    const resp = await api.get(`/professor/instituicao/${instituicaoId}`);
    return resp.data;
  }

  // Delete professor
  async deleteProfessor(professorId: string) {
    const resp = await api.delete(`/professor/deletar/${professorId}`);
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

  // Update disciplina
  async updateDisciplina(disciplinaId: string, payload: any) {
    const { nome, professorId, instituicaoId } = payload || {};
    const body = { nome, professorId, instituicaoId };
    const resp = await api.put(`/disciplinas/${disciplinaId}`, body);
    return resp.data;
  }

  // Delete disciplina
  async deleteDisciplina(disciplinaId: string) {
    const resp = await api.delete(`/disciplinas/${disciplinaId}`);
    return resp.data;
  }

  // Student registration
  async registerEstudante(payload: any) {
    const resp = await api.post('/estudante/registrar', payload);
    return resp.data;
  }

  // List students from institution
  async listEstudantes(instituicaoId: string) {
    const resp = await api.get(`/estudantes/instituicao/${instituicaoId}`);
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
