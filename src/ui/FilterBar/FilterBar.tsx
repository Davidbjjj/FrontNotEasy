import React, { useId } from 'react';
import { Button } from '../Button/Button';
import styles from './FilterBar.module.css';

export type FilterField =
  | { type: 'search'; name: string; label: string; placeholder?: string }
  | {
      type: 'select';
      name: string;
      label: string;
      options: { value: string; label: string }[];
      /** Texto da opção "todos" */
      allLabel?: string;
    };

export interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onClear?: () => void;
  /** Ações extras alinhadas à direita (ex.: botão "Novo") */
  actions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  fields,
  values,
  onChange,
  onClear,
  actions,
  className = '',
}) => {
  const baseId = useId();
  const hasActive = fields.some((f) => !!values[f.name]);

  return (
    <form
      className={`${styles.bar} ${className}`}
      role="search"
      onSubmit={(e) => e.preventDefault()}
    >
      {fields.map((field) => {
        const id = `${baseId}-${field.name}`;
        return (
          <div key={field.name} className={styles.field}>
            <label htmlFor={id} className={styles.label}>{field.label}</label>
            {field.type === 'search' ? (
              <input
                id={id}
                type="search"
                className={styles.control}
                value={values[field.name] ?? ''}
                placeholder={field.placeholder}
                onChange={(e) => onChange(field.name, e.target.value)}
              />
            ) : (
              <select
                id={id}
                className={styles.control}
                value={values[field.name] ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
              >
                <option value="">{field.allLabel ?? 'Todos'}</option>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}
          </div>
        );
      })}
      <div className={styles.buttons}>
        {onClear && (
          <Button variant="ghost" onClick={onClear} disabled={!hasActive}>
            Limpar filtros
          </Button>
        )}
        {actions}
      </div>
    </form>
  );
};

export default FilterBar;
