import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  loginProvider: 'email' | 'facebook';
  facebookId?: string;
  createdAt: string;
  lastLogin: string;
}

const DEMO_EMAIL = 'demo@identify.app';
const DEMO_PASSWORD = 'identify123';
const SESSION_KEY = 'identify-demo-user';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
  
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem(SESSION_KEY);
    return savedUser ? (JSON.parse(savedUser) as UserProfile) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token && !!user;

  const clearError = useCallback(() => setError(null), []);

  const saveUser = useCallback((nextUser: UserProfile) => {
    const sessionToken = `demo-session-${Date.now()}`;
    setUser(nextUser);
    setToken(sessionToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
  }, []);

  const loginWithEmail = useCallback(async (email: string, password = '') => {
    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('Use the demo email and password shown below to continue.');
    } else {
      const now = new Date().toISOString();
      saveUser({
        id: 'demo-user',
        email: DEMO_EMAIL,
        name: 'Demo User',
        loginProvider: 'email',
        createdAt: now,
        lastLogin: now,
      });
    }
    setIsLoading(false);
  }, [saveUser]);

  const loginWithFacebook = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    const now = new Date().toISOString();
    saveUser({
      id: 'demo-facebook-user',
      email: 'facebook.demo@identify.app',
      name: 'Facebook Demo User',
      loginProvider: 'facebook',
      facebookId: 'demo-facebook-id',
      createdAt: now,
      lastLogin: now,
    });
    setIsLoading(false);
  }, [saveUser]);

  const signupWithEmail = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
    } else {
      const now = new Date().toISOString();
      saveUser({ id: 'demo-user', email, name, loginProvider: 'email', createdAt: now, lastLogin: now });
    }
    setIsLoading(false);
  }, [saveUser]);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    void email;
    void code;
  }, []);

  const refreshToken = useCallback(async () => {
    if (user) setToken(localStorage.getItem(SESSION_KEY));
  }, [user]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    token,
    isAuthenticated,
    loginWithEmail,
    loginWithFacebook,
    signupWithEmail,
    verifyEmail,
    refreshToken,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
