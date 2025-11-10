import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginFromResponse, logout as doLogout, getCurrentUser, isAuthenticated } from './auth';

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

  function logout() {
    doLogout();
    setUser(null);
    setAuthenticated(false);
  }

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
