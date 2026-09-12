import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserProfile } from '../schemas/auth';
import {
  POST_emailLogin,
  POST_facebookLogin,
  POST_verifyEmail,
  POST_refreshToken,
  POST_logout,
} from '../../backend/routes';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
  
  loginWithEmail: (email: string) => Promise<void>;
  loginWithFacebook: (accessToken: string, facebookId: string, email?: string, name?: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token && !!user;

  const clearError = useCallback(() => setError(null), []);

  const loginWithEmail = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await POST_emailLogin(email);
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('authToken', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithFacebook = useCallback(
    async (accessToken: string, facebookId: string, email?: string, name?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await POST_facebookLogin(accessToken, facebookId, email, name);
        if (response.success) {
          setUser(response.user);
          setToken(response.token);
          localStorage.setItem('authToken', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Facebook login failed');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyEmail = useCallback(async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await POST_verifyEmail(email, code);
      if (response.success) {
        setUser(response.user);
        setToken(response.token);
        localStorage.setItem('authToken', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Email verification failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    try {
      const response = await POST_refreshToken(refreshToken);
      if (response.success) {
        setToken(response.token);
        localStorage.setItem('authToken', response.token);
      } else {
        // Refresh failed, logout user
        await logout();
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      await logout();
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setIsLoading(true);

    try {
      await POST_logout();

      if (window.FB) {
        await new Promise<void>((resolve) => {
          window.FB?.getLoginStatus((response) => {
            if (response.status === 'connected') {
              window.FB?.logout(resolve);
            } else {
              resolve();
            }
          });
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optionally restore session on mount
  useEffect(() => {
    if (token && !user) {
      // TODO: Validate token and fetch user profile
    }
  }, [token, user]);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    token,
    isAuthenticated,
    loginWithEmail,
    loginWithFacebook,
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
