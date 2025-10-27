import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectAuthLoading, selectAuthStatus } from '../store/auth-store/auth.selectors';
import Spinner from '../components/spinner/spinner.component';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const status = useSelector(selectAuthStatus);
  const authLoading = useSelector(selectAuthLoading);

  // 1) If we know the user is explicitly not logged in, redirect them now
  if (status !== 'authenticated' && !authLoading) {
    return <Navigate to="/login" replace />;
  }

  // 3) Otherwise, we either are still loading, or the user is allowed.
  //    In both cases we render the children. If we’re still loading, show a spinner overlay.
  return (
    <div style={{ position: 'relative' }}>
      {children}
      {authLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            zIndex: 10,
          }}
        >
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default ProtectedRoute;
