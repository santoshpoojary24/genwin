import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Superadmin Route Guard - Protects /admin/*
 * Redirects unauthenticated users to /admin/login
 */
export function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const adminSession = localStorage.getItem('genwin_admin_session');

  if (!adminSession) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Employee Route Guard - Protects /employee/*
 * Allows employees or superadmins, redirects unauthenticated users to /employee/login
 */
export function EmployeeProtectedRoute({ children }) {
  const location = useLocation();
  const staffSession = localStorage.getItem('genwin_employee_session');
  const adminSession = localStorage.getItem('genwin_admin_session');

  if (!staffSession && !adminSession) {
    return <Navigate to="/employee/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Customer Account Route Guard - Protects /account, /checkout
 * Opens LoginModal popup for unauthenticated store customers
 */
export function CustomerProtectedRoute({ children }) {
  const { user, setIsLoginOpen } = useAuth();
  const location = useLocation();
  const localUser = localStorage.getItem('genwin_user');

  React.useEffect(() => {
    if (!user && !localUser) {
      setIsLoginOpen(true);
    }
  }, [user, localUser, setIsLoginOpen]);

  if (!user && !localUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}
