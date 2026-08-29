import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectAuthLoading, selectAuthStatus } from '@store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const status = useSelector(selectAuthStatus);
  const authLoading = useSelector(selectAuthLoading);
  const location = useLocation();

  if (status === 'idle' || authLoading) {
    return null;
  }

  // 1) If we know the user is explicitly not logged in, redirect them now
  if (status !== 'authenticated' && !authLoading) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
