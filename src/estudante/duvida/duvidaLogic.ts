import type { StatusDuvida, TipoDuvida } from './types';

export const MAX_TEXTO = 1000;
export const MAX_ANEXO_BYTES = 5 * 1024 * 1024;
export const TIPOS_ANEXO = ['image/png', 'image/jpeg', 'application/pdf'];

export const STATUS_LABEL: Record<StatusDuvida, string> = {
  ENVIADA: 'Enviada',
  RESPONDIDA: 'Respondida',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
};

export const TIPO_LABEL: Record<TipoDuvida, string> = {
  DUVIDA: 'Dúvida',
  CONTESTACAO: 'Contestação',
};

/** Retorna a mensagem de erro do formulário, ou null se estiver válido. */
export function validarDuvida(texto: string, anexo: File | null): string | null {
  const t = texto.trim();
  if (t.length < 5) return 'Descreva sua dúvida com pelo menos 5 caracteres.';
  if (t.length > MAX_TEXTO) return `O texto pode ter no máximo ${MAX_TEXTO} caracteres.`;
  if (anexo) {
    if (!TIPOS_ANEXO.includes(anexo.type)) return 'O anexo deve ser PNG, JPG ou PDF.';
    if (anexo.size > MAX_ANEXO_BYTES) return 'O anexo pode ter no máximo 5 MB.';
  }
  return null;
}
