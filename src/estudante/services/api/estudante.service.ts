import { plainApi } from '../../../services/apiClient';

export interface EstudanteCreate {
  nome: string;
  dataNascimento: string; // YYYY-MM-DD
  email: string;
  senha: string;
  instituicaoId: string;
}

/**
 * Registra um estudante no backend.
 * POST /estudante/registrar
 * @param estudante Dados do estudante
 * @returns objeto retornado pela API
 *
 * Exemplo de payload:
 * {
 *   nome: 'Maria Santos',
 *   dataNascimento: '2002-08-20',
 *   email: 'maria.santos@universidade.edu.br',
 *   senha: 'Senha@456',
 *   instituicaoId: '550e8400-e29b-41d4-a716-446655440000'
 * }
 */
export async function registerEstudante(estudante: EstudanteCreate): Promise<any> {
  if (!estudante) throw new Error('estudante é obrigatório');

  try {
    // Garantir que apenas os campos necessários sejam enviados ao backend
    const { nome, dataNascimento, email, senha, instituicaoId } = estudante as EstudanteCreate;
    const payload = { nome, dataNascimento, email, senha, instituicaoId };

    const resp = await plainApi.post('/estudante/registrar', payload);
    return resp.data;
  } catch (err: any) {
    // Normalizar mensagem de erro
    const message = err?.response?.data?.message || err.message || 'Erro ao registrar estudante';
    throw new Error(message);
  }
}

export default { registerEstudante };
