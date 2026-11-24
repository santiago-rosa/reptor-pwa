import { create } from 'zustand';
import { supabase } from '../../infrastructure/supabase/client';

export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      // Supabase redirects; we stop loading. Session will be loaded on return.
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ user: data.user ?? null, loading: false });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      // After sign‑up Supabase may send a confirmation email; treat as signed‑in.
      set({ user: data.user ?? null, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ user: null, loading: false });
    }
  },

  loadSession: async () => {
    set({ loading: true });
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ user: data.session?.user ?? null, loading: false });
    }
  },

  refreshSession: async () => {
    const { data } = await supabase.auth.getSession();
    set({ user: data.session?.user ?? null, loading: false });
  },
}));
