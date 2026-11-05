import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '../auth/auth';
import { EmptyState } from '../ui';
import { SEARCH_TYPE_LABEL, searchTypesForRole } from './searchScope';
import { MIN_QUERY_LENGTH, useGlobalSearch } from './useGlobalSearch';
import { SearchType } from './types';

const ALL = 100;

/** "Ver todos": resultados completos da busca, opcionalmente de um só tipo. */
const SearchPage: React.FC = () => {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const tipo = params.get('tipo') as SearchType | null;
  const role = getCurrentUser()?.role;
  const allowed = useMemo(() => searchTypesForRole(role), [role]);
  const types = useMemo(() => (tipo && allowed.includes(tipo) ? [tipo] : allowed), [tipo, allowed]);
  const { groups, status } = useGlobalSearch(q, types, ALL);

  return (
    <div>
      <h1>Resultados para “{q}”</h1>
      {q.trim().length < MIN_QUERY_LENGTH && (
        <EmptyState title="Digite ao menos 2 caracteres" description="Use o campo de busca no topo da página." />
      )}
      {status === 'loading' && <p role="status">Buscando…</p>}
      {status === 'error' && <p role="alert">Não foi possível buscar agora. Tente novamente.</p>}
      {status === 'done' && groups.length === 0 && (
        <EmptyState title={`Nenhum resultado para “${q}”`} description="Verifique a ortografia ou tente outros termos." />
      )}
      {groups.map((g) => (
        <section key={g.type} aria-label={SEARCH_TYPE_LABEL[g.type]}>
          <h2>{SEARCH_TYPE_LABEL[g.type]} ({g.total})</h2>
          <ul>
            {g.items.map((i) => (
              <li key={i.id}>
                <Link to={i.link}>{i.title}</Link>
                {i.subtitle && <span> — {i.subtitle}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default SearchPage;
