import type { ProcessarPDFResponse } from '../../model/AddQuestionsButton.types';

const API_BASE_URL = 'https://backnoteasy-production.up.railway.app';

export const serviceIAService = {
  async processarPDF(listaId: string, file: File): Promise<ProcessarPDFResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/serviceIA/${listaId}/processar-pdf`, {
      method: 'POST',
      body: formData,
      // Não definir Content-Type manualmente - o browser vai definir automaticamente com boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao processar PDF');
    }

    return response.json();
  },
};