import React, { useEffect } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3500 }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <div className={styles.message}>{message}</div>
      <button className={styles.close} onClick={onClose} aria-label="Fechar aviso">×</button>
    </div>
  );
};

export default Toast;
