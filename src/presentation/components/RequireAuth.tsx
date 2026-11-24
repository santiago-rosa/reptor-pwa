import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

export const RequireAuth = () => {
  const { user, loading, loadSession } = useAuthStore();

  // Load session on initial mount only
  useEffect(() => {
    if (!user && !loading) {
      loadSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return null; // optional spinner or placeholder
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};
