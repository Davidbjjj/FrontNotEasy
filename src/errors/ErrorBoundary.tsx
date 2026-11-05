import React from 'react';
import { EmptyState } from '../ui/EmptyState/EmptyState';
import { Button } from '../ui/Button/Button';

interface Props {
  children: React.ReactNode;
  /** Quando muda (ex.: a rota), o erro é limpo automaticamente */
  resetKey?: string;
}

interface State {
  error: Error | null;
  attempt: number;
}

/** Tela de erro genérico com "Tentar de novo" (remonta a árvore filha). */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Erro não tratado na interface:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  retry = () => this.setState((s) => ({ error: null, attempt: s.attempt + 1 }));

  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: 640, margin: '0 auto' }}>
          <EmptyState
            title="Algo deu errado"
            description="Não foi possível mostrar esta tela. Tente de novo; se o problema continuar, recarregue a página ou fale com o suporte."
            action={<Button onClick={this.retry}>Tentar de novo</Button>}
          />
        </div>
      );
    }
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}

export default ErrorBoundary;
