import { create } from 'zustand'
import { supabase } from '../../infrastructure/supabase/client'

export interface AuthState {
  user: any | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) {
      set({ error: error.message, loading: false })
    } else {
      // Supabase will redirect; we just stop loading. Session will be fetched on return.
      set({ loading: false })
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

  refreshSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false })
  },
}))