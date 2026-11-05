import React from 'react';
import styles from './KpiCard.module.css';

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  /** Variação em relação ao período anterior, em %, ex.: 4.2 ou -1.5 */
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  deltaLabel = 'vs. período anterior',
  icon,
  loading = false,
  className = '',
}) => {
  const trend = delta === undefined || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down';
  const arrow = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '■';
  const trendText = trend === 'up' ? 'aumento' : trend === 'down' ? 'queda' : 'sem variação';

  return (
    <section
      className={`${styles.card} ${className}`}
      aria-label={label}
      aria-busy={loading || undefined}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      </div>
      {loading ? (
        <div className={styles.skeleton} aria-hidden="true" />
      ) : (
        <div className={styles.value}>{value}</div>
      )}
      {!loading && delta !== undefined && (
        <div className={`${styles.delta} ${styles[trend]}`}>
          <span aria-hidden="true">{arrow}</span>
          <span>
            <span className="sr-only">{trendText} de </span>
            {Math.abs(delta).toLocaleString('pt-BR')}%
          </span>
          <span className={styles.deltaLabel}>{deltaLabel}</span>
        </div>
      )}
    </section>
  );
};

export default KpiCard;
