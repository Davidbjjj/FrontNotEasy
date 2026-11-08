import React from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: string;
  /** Orientação do que fazer em seguida */
  description?: string;
  icon?: React.ReactNode;
  /** Botões/links de ação (ex.: "Criar lista") */
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  compact = false,
  className = '',
}) => (
  <div
    className={`${styles.root} ${compact ? styles.compact : ''} ${className}`}
    role="status"
  >
    {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
    <h3 className={styles.title}>{title}</h3>
    {description && <p className={styles.description}>{description}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);

export default EmptyState;
