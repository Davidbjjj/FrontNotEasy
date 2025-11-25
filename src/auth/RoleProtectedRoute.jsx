import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from './auth';

/**
 * RoleProtectedRoute - protege rotas por autenticação e por lista de roles permitidos
 * Uso: <RoleProtectedRoute allowedRoles={["ALUNO"]}><MyComponent /></RoleProtectedRoute>
 */
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/access-denied" replace />;
  }

  const rawRole = getCurrentUser()?.role || localStorage.getItem('role') || '';
  const normalizedRole = String(rawRole).toUpperCase();
  const allowed = (allowedRoles || []).map((r) => String(r).toUpperCase());

  // Treat some roles as equivalent: institutions should have the same access as professors
  const effectiveRoles = [normalizedRole];
  if (normalizedRole === 'INSTITUICAO') {
    effectiveRoles.push('PROFESSOR');
  }

  const isAllowed = effectiveRoles.some((r) => allowed.includes(r));
  if (!isAllowed) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
