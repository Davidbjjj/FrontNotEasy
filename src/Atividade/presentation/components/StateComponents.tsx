import React from 'react';

interface StateComponentProps {
  message: string;
}

/**
 * Componente de carregamento
 * Exibe spinner e mensagem de status
 */
export const LoadingState: React.FC<StateComponentProps> = ({ message }) => (
  <div className="loading-state" role="status" aria-live="polite">
    <div className="loading-spinner" aria-hidden="true"></div>
    <p>{message}</p>
  </div>
);

/**
 * Componente de erro
 * Exibe mensagem de erro com acessibilidade
 */
export const ErrorState: React.FC<StateComponentProps> = ({ message }) => (
  <div className="error-state" role="alert" aria-live="assertive">
    <p>{message}</p>
  </div>
);

/**
 * Componente de estado vazio
 * Exibe quando não há dados para mostrar
 */
export const EmptyState: React.FC<StateComponentProps> = ({ message }) => (
  <div className="empty-state" role="status">
    <p>{message}</p>
  </div>
);
