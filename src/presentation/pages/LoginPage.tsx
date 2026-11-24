
import { useNavigate } from 'react-router-dom'

import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'



export const LoginPage = () => {
  const { signInWithGoogle, loading, error, user } = useAuthStore()
  const navigate = useNavigate()

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

      // After OAuth redirect, sync Supabase session into our auth store
  useEffect(() => {
    const sync = async () => {
      await useAuthStore.getState().refreshSession()
      const { user } = useAuthStore.getState()
      if (user) navigate('/')
    }
    sync()
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
