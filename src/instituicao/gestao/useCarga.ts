import { useCallback, useEffect, useState } from 'react';
import { mensagemErro } from '../../professor/professorService';

/** Carrega um recurso com loading/erro/recarregar e cancelamento ao trocar as dependências. */
export function useCarga<T>(carregar: (signal: AbortSignal) => Promise<T>, deps: ReadonlyArray<unknown>, erroPadrao: string) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const c = new AbortController();
    setCarregando(true);
    setErro(null);
    carregar(c.signal)
      .then((d) => { if (!c.signal.aborted) setDados(d); })
      .catch((e) => { if (!c.signal.aborted) setErro(mensagemErro(e, erroPadrao)); })
      .finally(() => { if (!c.signal.aborted) setCarregando(false); });
    return () => c.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tentativa]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);
  return { dados, setDados, erro, carregando, recarregar };
}
