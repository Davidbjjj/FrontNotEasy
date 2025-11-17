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

  if (!allowed.includes(normalizedRole)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
