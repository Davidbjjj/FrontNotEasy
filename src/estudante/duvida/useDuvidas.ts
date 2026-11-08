import { useCallback, useEffect, useState } from 'react';
import { duvidaService } from './duvidaService';
import type { Duvida, NovaDuvida } from './types';

const POLL_MS = 30_000;

export function useDuvidas(listaId: string | undefined, enabled: boolean) {
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);

  useEffect(() => {
    if (!listaId || !enabled) return undefined;
    const controller = new AbortController();
    const load = () =>
      duvidaService
        .listar(listaId, controller.signal)
        .then((d) => { if (!controller.signal.aborted) setDuvidas(d); })
        .catch(() => { /* a lista de dúvidas é secundária; falha silenciosa */ });
    load();
    const id = window.setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    return () => { controller.abort(); window.clearInterval(id); };
  }, [listaId, enabled]);

  const criar = useCallback(async (nova: NovaDuvida) => {
    const d = await duvidaService.criar(nova);
    setDuvidas((prev) => [...prev, d]);
    return d;
  }, []);

  return { duvidas, criar };
}
