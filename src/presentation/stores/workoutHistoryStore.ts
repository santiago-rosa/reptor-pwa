import { create } from 'zustand'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'
import { GetWorkoutHistory } from '@/domain/usecases/GetWorkoutHistory'
import { GetWorkoutSession } from '@/domain/usecases/GetWorkoutSession'
import { SupabaseWorkoutSessionRepository } from '@/infrastructure/supabase/repositories/SupabaseWorkoutSessionRepository'
import { supabase } from '@/infrastructure/supabase/client'

export interface WorkoutHistoryState {
  sessions: WorkoutSession[]
  selectedSession: WorkoutSession | null
  loading: boolean
  error: string | null
  fetchSessions: (force?: boolean) => Promise<void>
  fetchSessionById: (id: string) => Promise<WorkoutSession | null>
  clearSelectedSession: () => void
}

export interface WorkoutHistoryStoreUseCases {
  getWorkoutHistory: GetWorkoutHistory
  getWorkoutSession: GetWorkoutSession
}

export const createWorkoutHistoryStore = (usecases: WorkoutHistoryStoreUseCases) =>
  create<WorkoutHistoryState>((set, get) => ({
    sessions: [],
    selectedSession: null,
    loading: false,
    error: null,

    fetchSessions: async (force = false) => {
      if (!force && get().sessions.length > 0) return

      set({ loading: true, error: null })
      try {
        const sessions = await usecases.getWorkoutHistory.execute()
        // Sort newest first by startedAt
        const sorted = [...sessions].sort((a, b) => {
          const timeA = new Date(a.startedAt).getTime()
          const timeB = new Date(b.startedAt).getTime()
          return timeB - timeA
        })
        set({ sessions: sorted, loading: false, error: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch workout history'
        set({ error: message, loading: false })
      }
    },

    fetchSessionById: async (id: string) => {
      // If already cached in sessions and has exercises, we can set as initial selectedSession
      const existing = get().sessions.find((s) => s.id === id)
      if (existing) {
        set({ selectedSession: existing })
      }

      set({ loading: true, error: null })
      try {
        const session = await usecases.getWorkoutSession.execute(id)
        set({ selectedSession: session, loading: false, error: null })
        return session
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch workout session'
        set({ error: message, loading: false })
        return null
      }
    },

    clearSelectedSession: () => set({ selectedSession: null }),
  }))

const defaultRepo = new SupabaseWorkoutSessionRepository(supabase)
export const useWorkoutHistoryStore = createWorkoutHistoryStore({
  getWorkoutHistory: new GetWorkoutHistory(defaultRepo),
  getWorkoutSession: new GetWorkoutSession(defaultRepo),
})
