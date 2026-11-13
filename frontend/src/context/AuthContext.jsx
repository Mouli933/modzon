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
      return response.user;
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
        setSessionError('');
        return null;
      }
      setSessionError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  const login = useCallback(async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(response.user);
    setSessionError('');
    return response.user;
  }, []);

  const signup = useCallback(async (details) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(details),
    });
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setUser(null);
    setSessionError('');
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(user);
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      loading: isLoading,
      sessionError,
      login,
      signup,
      logout,
      clearUser,
      refreshUser,
    }),
    [user, isAuthenticated, isLoading, sessionError, login, signup, logout, clearUser, refreshUser],
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
