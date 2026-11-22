import { create } from 'zustand'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'
import { GetWorkoutHistory } from '@/domain/usecases/GetWorkoutHistory'
import { SupabaseWorkoutSessionRepository } from '@/infrastructure/supabase/repositories/SupabaseWorkoutSessionRepository'
import { supabase } from '@/infrastructure/supabase/client'

export interface WorkoutHistoryState {
  sessions: WorkoutSession[]
  loading: boolean
  error: string | null
  fetchSessions: (force?: boolean) => Promise<void>
}

export interface WorkoutHistoryStoreUseCases {
  getWorkoutHistory: GetWorkoutHistory
}

export const createWorkoutHistoryStore = (usecases: WorkoutHistoryStoreUseCases) =>
  create<WorkoutHistoryState>((set, get) => ({
    sessions: [],
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
  }))

const defaultRepo = new SupabaseWorkoutSessionRepository(supabase)
export const useWorkoutHistoryStore = createWorkoutHistoryStore({
  getWorkoutHistory: new GetWorkoutHistory(defaultRepo),
})
