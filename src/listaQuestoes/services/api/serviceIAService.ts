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

    // Tentar parsear JSON quando o backend retornar JSON. Alguns endpoints
    // retornam texto simples mesmo com status 200 (por exemplo: "Questões processadas").
    // Para evitar erro de parse que vazaria para a UI, fazemos fallback para texto.
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (err) {
        // Se parsing falhar, leia como texto e normalize
        const txt = await response.text();
        return { message: txt } as any;
      }
    }

    // Se não for JSON, lê como texto e retorna um objeto simples indicando sucesso
    const text = await response.text();
    return { message: text } as any;
  },
};