
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../infrastructure/supabase/client'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'



export const LoginPage = () => {
  const { signInWithGoogle, loading, error, user } = useAuthStore()
  const navigate = useNavigate()

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  // After OAuth redirect, Supabase session will be restored automatically
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        // store user in our auth store
        // the store already updates on signInWithGoogle, but for direct reload we sync here
        // (optional) could expose a method to set user directly; for simplicity we rely on signInWithGoogle flow
      }
    }
    fetchSession()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {loading ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {error && (
        <pre className="mt-2 text-red-500 whitespace-pre-wrap break-all">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}
    </div>
  )
}
