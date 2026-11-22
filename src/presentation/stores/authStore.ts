import { create } from 'zustand'
import { supabase } from '../../infrastructure/supabase/client'

export interface AuthState {
  user: any | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) {
      set({ error: error.message, loading: false })
    } else {
      // Supabase will redirect back to the app; on return we can fetch the session
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user ?? null, loading: false })
    }
  },
  signOut: async () => {
    set({ loading: true })
    const { error } = await supabase.auth.signOut()
    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ user: null, loading: false })
    }
  },
}))
