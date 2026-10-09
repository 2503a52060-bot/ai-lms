import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../services/mockData';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('lms_user');
      const savedToken = localStorage.getItem('lms_token');
      return savedToken && savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('lms_token')));

  // Validate session on app initialization
  useEffect(() => {
    const verifyStoredSession = async () => {
      const savedToken = localStorage.getItem('lms_token');
      if (!savedToken) {
        setUser(null);
        localStorage.removeItem('lms_user');
        localStorage.removeItem('lms_token');
        setLoading(false);
        return;
      }

      try {
        const response = await api.getProfile();
        if (response.data && response.data.id) {
          setUser(response.data);
          localStorage.setItem('lms_user', JSON.stringify(response.data));
        } else {
          throw new Error('Invalid user profile');
        }
      } catch (err) {
        // Backend rejected token or token expired
        setUser(null);
        localStorage.removeItem('lms_user');
        localStorage.removeItem('lms_token');
      } finally {
        setLoading(false);
      }
    };

    verifyStoredSession();
  }, []);

  const login = async (email, password, role = 'student') => {
    setLoading(true);
    try {
      const response = await api.login(email, password, role);
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error(response.data?.detail || 'Login failed');
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Invalid email or password';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.register(userData);
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      throw new Error(response.data?.detail || 'Registration failed');
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Registration error';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // Listen to browser navigation and pageshow to invalidate unauthenticated back-navigation
  useEffect(() => {
    const handleAuthCheck = () => {
      const savedToken = localStorage.getItem('lms_token');
      if (!savedToken && user) {
        setUser(null);
      }
    };
    window.addEventListener('pageshow', handleAuthCheck);
    window.addEventListener('storage', handleAuthCheck);
    return () => {
      window.removeEventListener('pageshow', handleAuthCheck);
      window.removeEventListener('storage', handleAuthCheck);
    };
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_token');
    sessionStorage.clear();
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
  };

  const refreshProfile = async () => {
    try {
      const response = await api.getProfile();
      if (response.data && response.data.id) {
        setUser(response.data);
        localStorage.setItem('lms_user', JSON.stringify(response.data));
        return response.data;
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
    return null;
  };

  // Normalize role: treat teacher and faculty as faculty
  const normalizedRole = user?.role === 'teacher' ? 'faculty' : (user?.role || 'student');
  const token = localStorage.getItem('lms_token');
  const hasValidAuth = Boolean(user && token);

  const value = {
    user,
    role: normalizedRole,
    isAuthenticated: hasValidAuth,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    refreshProfile
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
