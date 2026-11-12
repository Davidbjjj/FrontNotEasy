import { useEffect, useState } from 'react';
import { gestaoService } from './gestaoService';
import type { MinhasPermissoes } from './gestaoService';

/**
 * Permissões do usuário logado (FE-306), buscadas uma vez por sessão e compartilhadas entre o menu principal
 * e a área da instituição. Só professor/instituição têm matriz; para os demais devolve null.
 */
let cache: { token: string | null; dados: MinhasPermissoes | null; pronto: boolean } = { token: null, dados: null, pronto: false };
const ouvintes = new Set<() => void>();

const tokenAtual = (): string | null => {
  try { return localStorage.getItem('token'); } catch { return null; }
};
const papelAtual = (): string => {
  try { return (localStorage.getItem('role') || '').toUpperCase(); } catch { return ''; }
};

function emitir() { ouvintes.forEach((fn) => fn()); }

export function limparPermissoes() {
  cache = { token: null, dados: null, pronto: false };
  emitir();
}

async function carregar() {
  const token = tokenAtual();
  if (cache.token === token && (cache.pronto || cache.token === null)) return;
  cache = { token, dados: null, pronto: false };
  if (!token || !['PROFESSOR', 'INSTITUICAO'].includes(papelAtual())) {
    cache = { token, dados: null, pronto: true };
    emitir();
    return;
  }
  try {
    cache = { token, dados: await gestaoService.minhasPermissoes(), pronto: true };
  } catch {
    cache = { token, dados: null, pronto: true };
  }
  emitir();
}

export function usePermissoes(): { dados: MinhasPermissoes | null; pronto: boolean; tem: (p: string) => boolean } {
  const [, forcar] = useState(0);
  useEffect(() => {
    const fn = () => forcar((n) => n + 1);
    ouvintes.add(fn);
    void carregar();
    return () => { ouvintes.delete(fn); };
  }, []);
  // login/logout trocam o token: revalida na próxima renderização
  if (cache.token !== tokenAtual()) void carregar();
  return {
    dados: cache.dados,
    pronto: cache.pronto,
    tem: (p: string) => !cache.pronto || cache.dados == null || cache.dados.permissoes.includes(p),
  };
}
