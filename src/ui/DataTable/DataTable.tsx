import React, { useMemo, useState } from 'react';
import { EmptyState } from '../EmptyState/EmptyState';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  /** Como ler o valor da linha (usado para exibir e ordenar). Padrão: row[key] */
  accessor?: (row: T) => string | number | null | undefined;
  /** Renderização customizada da célula */
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  /** Descrição da tabela para leitores de tela */
  caption: string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

function valueOf<T>(col: Column<T>, row: T): string | number | null | undefined {
  return col.accessor ? col.accessor(row) : ((row as any)[col.key] as any);
}

/**
 * Tabela acessível. Em telas estreitas (<= 768px) cada linha vira um card:
 * a classe .table muda para display:block e cada célula mostra o cabeçalho via data-label.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  loading = false,
  emptyTitle = 'Nada por aqui ainda',
  emptyDescription,
  emptyAction,
  onRowClick,
  className = '',
}: DataTableProps<T>): React.ReactElement {
  const [sort, setSort] = useState<SortState>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = valueOf(col, a);
      const vb = valueOf(col, b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * factor;
      return String(va).localeCompare(String(vb), 'pt-BR', { numeric: true }) * factor;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        Carregando…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sort?.key === col.key ? sort.dir : null;
              return (
                <th
                  key={col.key}
                  scope="col"
                  style={{ textAlign: col.align }}
                  aria-sort={
                    active ? (active === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.header}
                      <span aria-hidden="true" className={styles.sortIcon}>
                        {active === 'asc' ? '▲' : active === 'desc' ? '▼' : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const clickable = !!onRowClick;
            return (
              <tr
                key={rowKey(row)}
                className={clickable ? styles.clickable : undefined}
                onClick={clickable ? () => onRowClick!(row) : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onRowClick!(row);
                        }
                      }
                    : undefined
                }
                tabIndex={clickable ? 0 : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} data-label={col.header} style={{ textAlign: col.align }}>
                    {col.render ? col.render(row) : (valueOf(col, row) ?? '—')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
