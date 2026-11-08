import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { EmptyState } from '../EmptyState/EmptyState';
import { Button } from '../Button/Button';
import styles from './ChartWrapper.module.css';

export interface ChartWrapperProps {
  title: string;
  /** Resumo textual do gráfico, lido por leitores de tela */
  description?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: boolean;
  emptyMessage?: string;
  /** Um gráfico do recharts (LineChart, BarChart...) */
  children: React.ReactElement;
  className?: string;
}

/**
 * Padroniza título, dimensionamento responsivo e os estados
 * carregando/erro/vazio de qualquer gráfico recharts.
 */
export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  description,
  height = 280,
  loading = false,
  error = null,
  onRetry,
  empty = false,
  emptyMessage = 'Não há dados para este período.',
  children,
  className = '',
}) => {
  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className={styles.loading} role="status" style={{ height }}>
        Carregando gráfico…
      </div>
    );
  } else if (error) {
    body = (
      <div className={styles.error} role="alert" style={{ minHeight: height }}>
        <p>{error}</p>
        {onRetry && <Button variant="secondary" onClick={onRetry}>Tentar de novo</Button>}
      </div>
    );
  } else if (empty) {
    body = <EmptyState compact title="Sem dados" description={emptyMessage} />;
  } else {
    body = (
      <div role="img" aria-label={description ? `${title}. ${description}` : title} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    );
  }

  return (
    <figure className={`${styles.root} ${className}`}>
      <figcaption className={styles.title}>{title}</figcaption>
      {body}
    </figure>
  );
};

export default ChartWrapper;
