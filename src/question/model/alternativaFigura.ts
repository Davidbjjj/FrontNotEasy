/**
 * Alternativas que são figuras (ex.: cinco gráficos A..E). O back manda a imagem dentro da alternativa
 * ({ imagem: { urlPublica } }) e, como texto, só o marcador "a) (figura)", que não deve aparecer na tela.
 */
const MARCADOR_FIGURA = /^\s*(?:[a-e]\s*\)\s*)?\(figura\)\s*$/i;

/** Texto a exibir na alternativa: vazio quando ela é só a figura. */
export const textoDaAlternativa = (texto: string | null | undefined, temImagem: boolean): string =>
  temImagem && MARCADOR_FIGURA.test(texto ?? '') ? '' : (texto ?? '');

/** URL da imagem da alternativa vinda do back (null/undefined se a alternativa não for figura). */
export const urlImagemDaAlternativa = (alternativa: unknown): string | undefined => {
  if (!alternativa || typeof alternativa !== 'object') return undefined;
  const url = (alternativa as { imagem?: { urlPublica?: string } | null }).imagem?.urlPublica;
  return url || undefined;
};

/** URL relativa ("/api/imagens/...") vira absoluta, na origem da API. */
export const urlAbsoluta = (raw: string, base: string | undefined): string =>
  raw.startsWith('/') ? `${base || 'http://localhost:8080'}${raw}` : raw;
