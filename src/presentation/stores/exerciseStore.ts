import { create } from 'zustand'
import type { Exercise } from '@/domain/entities/Exercise'
import { GetAllExercises } from '@/domain/usecases/GetAllExercises'
import { SupabaseExerciseRepository } from '@/infrastructure/supabase/repositories/SupabaseExerciseRepository'
import { supabase } from '@/infrastructure/supabase/client'

export interface ExerciseState {
  exercises: Exercise[]
  loading: boolean
  error: string | null
  fetchExercises: (force?: boolean) => Promise<void>
}

export const createExerciseStore = (getAllExercisesUseCase: GetAllExercises) =>
  create<ExerciseState>((set, get) => ({
    exercises: [],
    loading: false,
    error: null,
    fetchExercises: async (force = false) => {
      if (!force && get().exercises.length > 0) {
        return
      }

      set({ loading: true, error: null })
      try {
        const exercises = await getAllExercisesUseCase.execute()
        set({ exercises, loading: false, error: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch exercises'
        set({ error: message, loading: false })
      }
    },
  }))

const defaultRepository = new SupabaseExerciseRepository(supabase)
const defaultGetAllExercises = new GetAllExercises(defaultRepository)

export const useExerciseStore = createExerciseStore(defaultGetAllExercises)
