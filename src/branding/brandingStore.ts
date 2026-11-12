import { useEffect, useState } from 'react';
import { aplicarCorPrincipal } from '../instituicao/gestao/gestaoLogic';
import { gestaoService } from '../instituicao/gestao/gestaoService';
import type { Branding } from '../instituicao/gestao/gestaoService';

/** Identidade visual da instituição de quem está logado (FE-309): cor nos tokens do FE-001 e logo no topo. */
let atual: Branding = { corPrincipal: null, logoUrl: null };
const ouvintes = new Set<(b: Branding) => void>();

export function notificarBranding(b: Branding) {
  atual = b;
  aplicarCorPrincipal(b.corPrincipal);
  ouvintes.forEach((fn) => fn(b));
}

export function useBranding(): Branding {
  const [b, setB] = useState(atual);
  useEffect(() => {
    ouvintes.add(setB);
    setB(atual);
    return () => { ouvintes.delete(setB); };
  }, []);
  return b;
}

let ultimoToken: string | null | undefined;

/** Busca o branding quando o usuário logado muda; sem sessão, volta ao tema padrão. */
export async function sincronizarBranding(): Promise<void> {
  let token: string | null = null;
  try { token = localStorage.getItem('token'); } catch { /* sem storage */ }
  if (token === ultimoToken) return;
  ultimoToken = token;
  if (!token) {
    notificarBranding({ corPrincipal: null, logoUrl: null });
    return;
  }
  try {
    notificarBranding(await gestaoService.minhaBranding());
  } catch {
    /* sem branding: fica o tema padrão */
  }
}
