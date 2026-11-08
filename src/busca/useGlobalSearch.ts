import { useEffect, useState } from 'react';
import { searchService } from './searchService';
import { SearchGroup, SearchType } from './types';

export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

export type SearchStatus = 'idle' | 'loading' | 'done' | 'error';

/** Busca com debounce; respostas atrasadas de consultas antigas são descartadas. */
export function useGlobalSearch(query: string, types: SearchType[], limit: number) {
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const q = query.trim();
  const typesKey = types.join(',');

  useEffect(() => {
    if (q.length < MIN_QUERY_LENGTH || types.length === 0) {
      setGroups([]);
      setStatus('idle');
      return undefined;
    }
    setStatus('loading');
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchService
        .search({ q, types, limit }, controller.signal)
        .then((res) => {
          if (controller.signal.aborted) return;
          // Defesa em profundidade: nunca exibe tipos fora do escopo do papel
          setGroups(res.groups.filter((g) => g.items.length > 0 && types.includes(g.type)));
          setStatus('done');
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setGroups([]);
          setStatus('error');
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, typesKey, limit]);

  return { groups, status, query: q };
}
