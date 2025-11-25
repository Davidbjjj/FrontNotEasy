import api from '../../../services/apiClient';

export interface MediasAlunoDTO {
  estudanteId: string;
  estudanteNome: string;
  media: number; // percentage 0-100 with 2 decimals
  respostasCount: number;
}

export interface ListaMenorMediaDTO {
  listaId: string;
  listaTitulo: string;
  media: number;
  respostasCount: number;
}

export interface AtividadesConcluidasDTO {
  estudanteId: string;
  estudanteNome: string;
  disciplinaId: string;
  disciplinaNome: string;
  atividadesConcluidas: number;
}

const analyticsService = {
  async getMediasAlunos(disciplinaId: string, solicitanteId: string): Promise<MediasAlunoDTO[]> {
    try {
      const resp = await api.get(`/disciplinas/${disciplinaId}/analytics/alunos/medias`, {
        params: { solicitanteId },
      });
      return resp.data as MediasAlunoDTO[];
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Erro ao buscar médias dos alunos';
      throw new Error(message);
    }
  },

  async getListasMenorMedia(disciplinaId: string, solicitanteId: string): Promise<ListaMenorMediaDTO[]> {
    try {
      const resp = await api.get(`/disciplinas/${disciplinaId}/analytics/listas/menor-media`, {
        params: { solicitanteId },
      });
      return resp.data as ListaMenorMediaDTO[];
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Erro ao buscar listas com menor média';
      throw new Error(message);
    }
  },

  async getAtividadesConcluidas(disciplinaId: string, solicitanteId: string): Promise<AtividadesConcluidasDTO[]> {
    try {
      const resp = await api.get(`/disciplinas/${disciplinaId}/analytics/atividades-concluidas`, {
        params: { solicitanteId },
      });
      return resp.data as AtividadesConcluidasDTO[];
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Erro ao buscar atividades concluídas';
      throw new Error(message);
    }
  },
};

export default analyticsService;

export const {
  getMediasAlunos,
  getListasMenorMedia,
  getAtividadesConcluidas,
} = analyticsService;
