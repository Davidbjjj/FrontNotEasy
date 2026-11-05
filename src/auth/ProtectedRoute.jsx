import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, logout } from './auth';
import { notifySessionExpired } from './session';

/**
 * ProtectedRoute - Wrapper component for protecting routes
 * - Sem sessão: redireciona para /access-denied
 * - Sessão expirada (token ainda no storage, mas vencido): limpa a sessão e
 *   mostra o aviso de "sessão expirada" com retorno para a página atual
 *
 * Usage:
 * <Route path="/protected" element={<ProtectedRoute><YourComponent /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const expired = !authenticated && !!localStorage.getItem('token');

  useEffect(() => {
    if (expired) {
      logout();
      notifySessionExpired(`${location.pathname}${location.search}${location.hash}`);
    }
  }, [expired, location]);

  if (expired) return null;

  if (!authenticated) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
