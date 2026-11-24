import { create } from 'zustand';
import { supabase } from '../../infrastructure/supabase/client';
import { useWorkoutSessionStore } from './workoutSessionStore';
import { useWorkoutHistoryStore } from './workoutHistoryStore';
import { useRoutineStore } from './routineStore';
import { usePlanStore } from './planStore';
import { useRoutineDraftStore } from './routineDraftStore';

export const resetUserStores = () => {
  useWorkoutSessionStore.getState().discard();
  useWorkoutHistoryStore.setState({ sessions: [], selectedSession: null, error: null });
  useRoutineStore.setState({ routines: [], error: null });
  usePlanStore.setState({ plans: [], error: null });
  useRoutineDraftStore.getState().reset();
};

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL },
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
      const newUser = data.user ?? null;
      if (get().user && newUser?.id !== get().user?.id) {
        resetUserStores();
      }
      set({ user: newUser, loading: false });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null });
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      const newUser = data.user ?? null;
      if (get().user && newUser?.id !== get().user?.id) {
        resetUserStores();
      }
      set({ user: newUser, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut();
    resetUserStores();
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
      const newUser = data.session?.user ?? null;
      if (get().user && newUser?.id !== get().user?.id) {
        resetUserStores();
      }
      set({ user: newUser, loading: false });
    }
  },

  refreshSession: async () => {
    const { data } = await supabase.auth.getSession();
    const newUser = data.session?.user ?? null;
    if (get().user && newUser?.id !== get().user?.id) {
      resetUserStores();
    }
    set({ user: newUser, loading: false });
  },
}));

// Listen to Supabase auth events to keep stores clean across auth state changes
if (supabase?.auth?.onAuthStateChange) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      resetUserStores();
      useAuthStore.setState({ user: null, loading: false });
    } else if (session?.user) {
      const currentUser = useAuthStore.getState().user;
      if (currentUser && currentUser.id !== session.user.id) {
        resetUserStores();
      }
      useAuthStore.setState({ user: session.user, loading: false });
    }
  });
}
