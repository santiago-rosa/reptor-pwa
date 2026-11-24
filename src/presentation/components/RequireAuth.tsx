import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

export const RequireAuth = () => {
  const { user, loading, loadSession } = useAuthStore();

  // Restore session on mount if not already loaded
  useEffect(() => {
    if (!user && !loading) {
      loadSession();
    }
  }, [user, loading, loadSession]);

  if (loading) return null; // optional spinner or placeholder
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};
