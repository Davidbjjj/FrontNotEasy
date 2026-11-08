import type { ProcessarPDFResponse } from '../../model/AddQuestionsButton.types';

const API_BASE_URL = 'http://localhost:8080';

export const serviceIAService = {
  async processarPDF(listaId: string, file: File): Promise<ProcessarPDFResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Get token from localStorage (saved during login)
    const token = localStorage.getItem('token');

    // DEBUG: Log para verificar se o token existe
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token (first 50 chars):', token ? token.substring(0, 50) + '...' : 'NO TOKEN');

    if (!token) {
      console.error('❌ Token não encontrado no localStorage');
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    console.log('📤 Sending request to:', `${API_BASE_URL}/serviceIA/${listaId}/processar-pdf-com-imagens`);
    console.log('📤 Headers:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Accept': 'application/json',
    });

    const response = await fetch(`${API_BASE_URL}/serviceIA/${listaId}/processar-pdf-com-imagens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
      // Não definir Content-Type manualmente - o browser vai definir automaticamente com boundary
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
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