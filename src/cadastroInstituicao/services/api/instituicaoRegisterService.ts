import { plainApi } from '../../../services/apiClient';
import type { InstituicaoRegisterData, InstituicaoRegisterResponse } from '../../model/InstituicaoModel';

class InstituicaoRegisterService {
  async registerInstituicao(data: InstituicaoRegisterData): Promise<InstituicaoRegisterResponse> {
    try {
      const response = await plainApi.post('/instituicao/registrar', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Erro ao cadastrar instituição';
      throw new Error(errorMessage);
    }
  }
}

export const instituicaoRegisterService = new InstituicaoRegisterService();
