import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { WorkoutSession, SessionExercise, SessionSet } from '@/domain/entities/WorkoutSession'
import type { Routine } from '@/domain/entities/Routine'
import { StartSession } from '@/domain/usecases/StartSession'
import { FinishSession } from '@/domain/usecases/FinishSession'
import { SupabaseWorkoutSessionRepository } from '@/infrastructure/supabase/repositories/SupabaseWorkoutSessionRepository'
import { supabase } from '@/infrastructure/supabase/client'
import { idbStorage } from './idbStorage'

export interface WorkoutSessionState {
  activeSession: WorkoutSession | null
  isSaving: boolean
  error: string | null

  startFromRoutine: (routine: Routine, userId?: string | null) => void
  startEmpty: (title?: string, userId?: string | null) => void
  updateSet: (exerciseId: string, setNumber: number, data: { weightKg?: number; reps?: number }) => void
  toggleSetLogged: (exerciseId: string, setNumber: number) => void
  addSet: (exerciseId: string) => void
  removeLastSet: (exerciseId: string) => void
  addExercise: (exercise: { id: string; name: string }) => void
  finishSession: () => Promise<WorkoutSession>
  discard: () => void
}

export interface WorkoutSessionUseCases {
  startSession: StartSession
  finishSession: FinishSession
}

export const createWorkoutSessionStore = (
  usecases: WorkoutSessionUseCases,
  customStorage = idbStorage
) =>
  create<WorkoutSessionState>()(
    persist(
      (set, get) => ({
        activeSession: null,
        isSaving: false,
        error: null,

        startFromRoutine: (routine: Routine, userId?: string | null) => {
          const session = usecases.startSession.execute({ routine, userId })
          set({ activeSession: session, error: null })
        },

        startEmpty: (title?: string, userId?: string | null) => {
          const session = usecases.startSession.execute({ title, userId })
          set({ activeSession: session, error: null })
        },

        updateSet: (exerciseId: string, setNumber: number, data: { weightKg?: number; reps?: number }) => {
          set((state) => {
            if (!state.activeSession) return state

            const exercises = state.activeSession.exercises.map((ex) => {
              if (ex.exerciseId !== exerciseId) return ex

              const sets = ex.sets.map((s) => {
                if (s.setNumber !== setNumber) return s
                return {
                  ...s,
                  weightKg: data.weightKg !== undefined ? Math.max(0, data.weightKg) : s.weightKg,
                  reps: data.reps !== undefined ? Math.max(0, data.reps) : s.reps,
                }
              })

              return { ...ex, sets }
            })

            return {
              activeSession: { ...state.activeSession, exercises },
            }
          })
        },

        toggleSetLogged: (exerciseId: string, setNumber: number) => {
          set((state) => {
            if (!state.activeSession) return state

            const exercises = state.activeSession.exercises.map((ex) => {
              if (ex.exerciseId !== exerciseId) return ex

              const sets = ex.sets.map((s) =>
                s.setNumber === setNumber ? { ...s, isCompleted: !s.isCompleted } : s
              )

              return { ...ex, sets }
            })

            return {
              activeSession: { ...state.activeSession, exercises },
            }
          })
        },

        addSet: (exerciseId: string) => {
          set((state) => {
            if (!state.activeSession) return state

            const exercises = state.activeSession.exercises.map((ex) => {
              if (ex.exerciseId !== exerciseId) return ex

              const lastSet = ex.sets[ex.sets.length - 1]
              const newSetNumber = ex.sets.length + 1
              const newSet: SessionSet = {
                id: crypto.randomUUID(),
                sessionExerciseId: ex.id,
                setNumber: newSetNumber,
                weightKg: lastSet ? lastSet.weightKg : 0,
                reps: lastSet ? lastSet.reps : 10,
                isCompleted: false,
              }

              return { ...ex, sets: [...ex.sets, newSet] }
            })

            return {
              activeSession: { ...state.activeSession, exercises },
            }
          })
        },

        removeLastSet: (exerciseId: string) => {
          set((state) => {
            if (!state.activeSession) return state

            const exercises = state.activeSession.exercises.map((ex) => {
              if (ex.exerciseId !== exerciseId || ex.sets.length <= 1) return ex
              return { ...ex, sets: ex.sets.slice(0, -1) }
            })

            return {
              activeSession: { ...state.activeSession, exercises },
            }
          })
        },

        addExercise: (exercise: { id: string; name: string }) => {
          set((state) => {
            if (!state.activeSession) return state

            const sessionExerciseId = crypto.randomUUID()
            const initialSet: SessionSet = {
              id: crypto.randomUUID(),
              sessionExerciseId,
              setNumber: 1,
              weightKg: 0,
              reps: 10,
              isCompleted: false,
            }

            const newExercise: SessionExercise = {
              id: sessionExerciseId,
              sessionId: state.activeSession.id,
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              orderIndex: state.activeSession.exercises.length,
              sets: [initialSet],
            }

            return {
              activeSession: {
                ...state.activeSession,
                exercises: [...state.activeSession.exercises, newExercise],
              },
            }
          })
        },

        finishSession: async () => {
          const session = get().activeSession
          if (!session) {
            throw new Error('No active workout session to finish')
          }

          set({ isSaving: true, error: null })
          try {
            const saved = await usecases.finishSession.execute(session)
            set({ activeSession: null, isSaving: false, error: null })
            return saved
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to finish session'
            set({ error: message, isSaving: false })
            throw err
          }
        },

        discard: () => {
          set({ activeSession: null, isSaving: false, error: null })
        },
      }),
      {
        name: 'workout-session',
        storage: createJSONStorage(() => customStorage),
        partialize: (state) => ({ activeSession: state.activeSession } as WorkoutSessionState),
      }
    )
  )

const repo = new SupabaseWorkoutSessionRepository(supabase)
export const useWorkoutSessionStore = createWorkoutSessionStore({
  startSession: new StartSession(),
  finishSession: new FinishSession(repo),
})
