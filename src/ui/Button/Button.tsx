import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'dependent';
  /** 'lg' = 64px de altura, padrão dos formulários do Figma */
  size?: 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  size = 'md',
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    className={`${styles.btn} ${styles[variant]} ${size === 'lg' ? styles.lg : ''} ${className}`}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
