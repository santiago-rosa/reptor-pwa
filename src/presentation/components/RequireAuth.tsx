import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useEffect } from 'react'
import { supabase } from '../../infrastructure/supabase/client'

export const RequireAuth = () => {
  const { user, loading, error, signInWithGoogle } = useAuthStore()

  // On mount, attempt to restore session if not already in store
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
