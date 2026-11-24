import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useEffect } from 'react'
import { supabase } from '../../infrastructure/supabase/client'

export const RequireAuth = () => {
  const { user, loading, loadSession } = useAuthStore()

  // On mount, attempt to restore session if not already in store
  useEffect(() => {
    if (!user && !loading) {
      // loadSession will fetch persisted Supabase session and update the store
      loadSession()
    }
  }, [user, loading, loadSession])

  if (loading) return null // optional spinner
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
} {
  const { user, loading } = useAuthStore()

  // On mount, attempt to restore session if not already in store
  useEffect(() => {
    if (!user) {
      // Use the store's loadSession which fetches persisted Supabase session
      supabase.auth.getSession().then(() => {
        // After supabase updates its internal state, call our store to refresh
        // The store will read supabase.auth.getSession() internally
        // Import useAuthStore inside effect to avoid stale closure
        // (useAuthStore already imported above)
        // We'll call loadSession here
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        // (the store is already defined)
        const { loadSession } = useAuthStore.getState ? useAuthStore.getState() : {} as any;
        if (loadSession) loadSession();
      })
    }
  }, [user])
  useEffect(() => {
    if (!user) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          // we could set user directly, but authStore's signInWithGoogle already handles session fetch
        }
      })
    }
  }, [user])

  if (loading) return null // optional spinner
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
