import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Check current session from backend /api/auth/me
  const checkAuth = useCallback(async () => {
    try {
      setAuthLoading(true);
      const res = await api.getMe();
      if (res && res.success && res.admin) {
        setAdmin(res.admin);
        setIsAuthenticated(true);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      // 401 Unauthorized or offline
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.admin) {
        setAdmin(res.admin);
        setIsAuthenticated(true);
        return { success: true, admin: res.admin };
      }
      return {
        success: false,
        message: res.message || 'Authentication failed'
      };
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to server. Please check your network.';
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout request error:', err);
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    admin,
    isAuthenticated,
    authLoading,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
