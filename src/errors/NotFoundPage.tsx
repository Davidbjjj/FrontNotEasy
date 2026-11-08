import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../ui/EmptyState/EmptyState';
import { getCurrentUser } from '../auth/auth';
import { getHomeForRole } from '../auth/session';

/** Página 404: o link de volta aponta para o início do papel do usuário. */
const NotFoundPage: React.FC = () => {
  const user = getCurrentUser();
  const home = getHomeForRole(user?.role);
  const label = user ? 'Voltar ao meu início' : 'Voltar ao início';

  return (
    <main style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: 640, margin: '0 auto' }}>
      <EmptyState
        title="Página não encontrada (404)"
        description="O endereço que você tentou abrir não existe ou foi movido."
        action={
          <Link
            to={home}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 'var(--tap-target)',
              padding: '0 var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-blue)',
              color: 'var(--color-on-primary)',
              fontWeight: 'var(--font-weight-bold)',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        }
      />
    </main>
  );
};

export default NotFoundPage;
