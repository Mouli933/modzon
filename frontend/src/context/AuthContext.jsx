import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiRequest('/auth/me');
      setUser(response.user);
      setSessionError('');
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
        return;
      }
      setSessionError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser().catch((error) => {
      console.error('Unable to restore the authentication session:', error);
    });
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(response.user);
    return response.user;
  }, []);

  const signup = useCallback(async (details) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(details),
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, sessionError, login, signup, logout, refreshUser }),
    [user, isLoading, sessionError, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
