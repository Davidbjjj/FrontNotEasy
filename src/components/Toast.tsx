import React, { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  title?: string;
  message: string;
  variant?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'info',
  onClose,
  duration = 4000,
  actionLabel,
  onAction,
}) => {
  useEffect(() => {
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={`${styles.toast} ${styles[variant]}`} role="status" aria-live="polite">
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
      </div>
      <div className={styles.actions}>
        {actionLabel && onAction && (
          <button className={styles.action} onClick={onAction}>{actionLabel}</button>
        )}
        <button className={styles.close} onClick={onClose} aria-label="Fechar aviso">×</button>
      </div>
    </div>
  );
};

export default Toast;
