import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';

/**
 * ProtectedRoute - Wrapper component for protecting routes
 * Redirects to /access-denied if user is not authenticated
 * 
 * Usage:
 * <Route path="/protected" element={<ProtectedRoute><YourComponent /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
