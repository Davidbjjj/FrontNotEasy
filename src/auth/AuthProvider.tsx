import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginFromResponse, logout as clearLocalLogout, logoutServer, getCurrentUser, isAuthenticated } from './auth';

type AuthContextType = {
  authenticated: boolean;
  user: { role: string; userId: string } | null;
  login: (response: { token: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ role: string; userId: string } | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const cur = getCurrentUser();
    if (cur) {
      setUser({ role: cur.role, userId: cur.userId });
      setAuthenticated(isAuthenticated());
    }
  }, []);

  function login(response: { token: string }) {
    const res = loginFromResponse(response as any);
    setUser({ role: res.role, userId: res.userId });
    setAuthenticated(true);
  }

  async function logout() {
    try {
      // call server to revoke token; result handling done inside logoutServer
      await logoutServer();
    } catch (e) {
      // ignore network errors; proceed to clear local auth state
    } finally {
      // ensure local storage is cleared and state updated
      clearLocalLogout();
      setUser(null);
      setAuthenticated(false);
      // redirect to login page
      try {
        window.location.href = '/login';
      } catch (e) {
        // noop
      }
    }
  }

  // Listen for a global logout event (used by demo pages without provider)
  React.useEffect(() => {
    const handler = () => {
      try {
        logout();
      } catch (e) {
        // noop
      }
    };
    window.addEventListener('app-logout', handler as EventListener);
    return () => window.removeEventListener('app-logout', handler as EventListener);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
