import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getCurrentUser } from '../auth/auth';
import { MIN_QUERY_LENGTH, useGlobalSearch } from './useGlobalSearch';
import { SEARCH_TYPE_LABEL, searchTypesForRole } from './searchScope';
import { SearchType } from './types';
import styles from './GlobalSearch.module.css';

export const GROUP_LIMIT = 5;

interface Option {
  key: string;
  label: string;
  subtitle?: string | null;
  link: string;
  seeAll?: boolean;
}

export const searchPageLink = (q: string, tipo?: SearchType) =>
  `/busca?q=${encodeURIComponent(q)}${tipo ? `&tipo=${tipo}` : ''}`;

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const role = getCurrentUser()?.role;
  const types = useMemo(() => searchTypesForRole(role), [role]);

  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { groups, status, query } = useGlobalSearch(value, types, GROUP_LIMIT);

  // Lista plana das opções navegáveis (itens + "ver todos"), na ordem visual
  const options = useMemo<Option[]>(
    () =>
      groups.flatMap((g) => [
        ...g.items.map((i) => ({
          key: `${g.type}-${i.id}`,
          label: i.title,
          subtitle: i.subtitle,
          link: i.link,
        })),
        ...(g.total > g.items.length
          ? [{
              key: `${g.type}-all`,
              label: `Ver todos em ${SEARCH_TYPE_LABEL[g.type]} (${g.total})`,
              link: searchPageLink(query, g.type),
              seeAll: true,
            }]
          : []),
      ]),
    [groups, query]
  );

  useEffect(() => setActive(-1), [options]);

  // Atalho: Ctrl/Cmd+K (ou "/" fora de campos de texto) foca a busca
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const go = useCallback(
    (link: string) => {
      setOpen(false);
      setValue('');
      inputRef.current?.blur();
      navigate(link);
    },
    [navigate]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (options.length === 0) return;
      e.preventDefault();
      setOpen(true);
      const n = options.length;
      setActive((a) => (e.key === 'ArrowDown' ? (a + 1) % n : a <= 0 ? n - 1 : a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && options[active]) go(options[active].link);
      else if (query.length >= MIN_QUERY_LENGTH) go(searchPageLink(query));
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      } else {
        setValue('');
        inputRef.current?.blur();
      }
    }
  };

  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`gs-opt-${active}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);

  if (types.length === 0) return null;

  const showPanel = open && query.length >= MIN_QUERY_LENGTH;
  const listId = 'gs-listbox';
  let optIndex = -1;

  return (
    <div className={styles.root} ref={rootRef} role="search" data-tour="global-search">
      <Search size={18} className={styles.icon} aria-hidden="true" />
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        role="combobox"
        value={value}
        placeholder="Buscar listas, questões, alunos…"
        aria-label="Busca global"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `gs-opt-${active}` : undefined}
        aria-keyshortcuts="Control+K Meta+K /"
        autoComplete="off"
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <kbd className={styles.kbd} aria-hidden="true">{isMac ? '⌘K' : 'Ctrl K'}</kbd>

      {showPanel && (
        <div className={styles.panel}>
          <div id={listId} role="listbox" aria-label="Resultados da busca">
            {groups.map((g) => (
              <div key={g.type} role="group" aria-label={SEARCH_TYPE_LABEL[g.type]}>
                <div className={styles.groupTitle} aria-hidden="true">{SEARCH_TYPE_LABEL[g.type]}</div>
                {options
                  .filter((o) => o.key.startsWith(`${g.type}-`))
                  .map((o) => {
                    optIndex += 1;
                    const idx = optIndex;
                    return (
                      <div
                        key={o.key}
                        id={`gs-opt-${idx}`}
                        role="option"
                        aria-selected={idx === active}
                        className={`${styles.option} ${o.seeAll ? styles.seeAll : ''} ${idx === active ? styles.active : ''}`}
                        onMouseEnter={() => setActive(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => go(o.link)}
                      >
                        <span className={styles.label}>{o.label}</span>
                        {o.subtitle && <span className={styles.subtitle}>{o.subtitle}</span>}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
          <div className={styles.status} role="status" aria-live="polite">
            {status === 'loading' && groups.length === 0 && 'Buscando…'}
            {status === 'error' && 'Não foi possível buscar agora. Tente novamente.'}
            {status === 'done' && groups.length === 0 && `Nenhum resultado para “${query}”. Verifique a ortografia ou tente outros termos.`}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
