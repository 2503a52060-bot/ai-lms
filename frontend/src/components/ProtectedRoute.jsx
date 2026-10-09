import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleAuthRedirect = () => {
      const currentToken = localStorage.getItem('lms_token');
      if (!currentToken) {
        window.location.replace('/login');
      }
    };
    window.addEventListener('pageshow', handleAuthRedirect);
    window.addEventListener('storage', handleAuthRedirect);
    return () => {
      window.removeEventListener('pageshow', handleAuthRedirect);
      window.removeEventListener('storage', handleAuthRedirect);
    };
  }, []);

  const savedToken = localStorage.getItem('lms_token');

  if (loading) {
    return <LoadingSpinner message="Checking authentication session..." />;
  }

  if (!isAuthenticated || !savedToken) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (role === 'teacher' ? 'faculty' : role)?.toLowerCase();
  const normalizedAllowed = allowedRoles.map(r => (r === 'teacher' ? 'faculty' : r).toLowerCase());

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole)) {
    // Redirect strictly to the user's role dashboard if attempting to access another role's section
    const defaultRoute = userRole === 'admin'
      ? '/admin/dashboard'
      : userRole === 'faculty'
      ? '/faculty/dashboard'
      : '/student/dashboard';

    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
