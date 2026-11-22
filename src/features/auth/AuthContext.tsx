/* eslint-disable react-refresh/only-export-components -- hook and provider are intentionally colocated */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type AuthUser, type LoginValues } from './authService';

interface AuthContextValue {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'guest';
  signIn: (values: LoginValues) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');

  useEffect(() => {
    let active = true;
    authService
      .session()
      .then(({ user: sessionUser }) => {
        if (!active) return;
        setUser(sessionUser);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus('guest');
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (values: LoginValues) => {
    const { user: nextUser } = await authService.login(values);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus('guest');
    }
  }, []);

  const value = useMemo(() => ({ user, status, signIn, signOut }), [user, status, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
