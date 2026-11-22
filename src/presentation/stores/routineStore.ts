import { create } from 'zustand'
import type { Routine } from '@/domain/entities/Routine'
import type { CreateRoutineInput, UpdateRoutineInput } from '@/domain/repositories/IRoutineRepository'
import { GetAllRoutines } from '@/domain/usecases/GetAllRoutines'
import { CreateRoutine } from '@/domain/usecases/CreateRoutine'
import { UpdateRoutine } from '@/domain/usecases/UpdateRoutine'
import { DeleteRoutine } from '@/domain/usecases/DeleteRoutine'
import { AssignRoutineToPlan } from '@/domain/usecases/AssignRoutineToPlan'
import { SupabaseRoutineRepository } from '@/infrastructure/supabase/repositories/SupabaseRoutineRepository'
import { supabase } from '@/infrastructure/supabase/client'

export interface RoutineState {
  routines: Routine[]
  loading: boolean
  error: string | null
  fetchRoutines: (force?: boolean) => Promise<void>
  createRoutine: (input: CreateRoutineInput) => Promise<Routine>
  updateRoutine: (input: UpdateRoutineInput) => Promise<Routine>
  deleteRoutine: (id: string) => Promise<void>
  assignRoutineToPlan: (routineId: string, planId: string) => Promise<void>
  removeFromPlan: (routineId: string) => Promise<void>
}

export interface RoutineStoreUseCases {
  getAllRoutines: GetAllRoutines
  createRoutine: CreateRoutine
  updateRoutine: UpdateRoutine
  deleteRoutine: DeleteRoutine
  assignRoutineToPlan: AssignRoutineToPlan
}

export const createRoutineStore = (usecases: RoutineStoreUseCases) =>
  create<RoutineState>((set, get) => ({
    routines: [],
    loading: false,
    error: null,

    fetchRoutines: async (force = false) => {
      if (!force && get().routines.length > 0) return

      set({ loading: true, error: null })
      try {
        const routines = await usecases.getAllRoutines.execute()
        set({ routines, loading: false, error: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch routines'
        set({ error: message, loading: false })
      }
    },

    createRoutine: async (input: CreateRoutineInput) => {
      set({ loading: true, error: null })
      try {
        const newRoutine = await usecases.createRoutine.execute(input)
        set((state) => ({
          routines: [newRoutine, ...state.routines],
          loading: false,
          error: null,
        }))
        return newRoutine
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create routine'
        set({ error: message, loading: false })
        throw err
      }
    },

    updateRoutine: async (input: UpdateRoutineInput) => {
      set({ loading: true, error: null })
      try {
        const updated = await usecases.updateRoutine.execute(input)
        set((state) => ({
          routines: state.routines.map((r) => (r.id === updated.id ? updated : r)),
          loading: false,
          error: null,
        }))
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update routine'
        set({ error: message, loading: false })
        throw err
      }
    },

    deleteRoutine: async (id: string) => {
      set({ loading: true, error: null })
      try {
        await usecases.deleteRoutine.execute(id)
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
          loading: false,
          error: null,
        }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete routine'
        set({ error: message, loading: false })
        throw err
      }
    },

    assignRoutineToPlan: async (routineId: string, planId: string) => {
      set({ loading: true, error: null })
      try {
        await usecases.assignRoutineToPlan.execute(routineId, planId)
        set((state) => ({
          routines: state.routines.map((r) => (r.id === routineId ? { ...r, planId } : r)),
          loading: false,
          error: null,
        }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to assign routine to plan'
        set({ error: message, loading: false })
        throw err
      }
    },

    removeFromPlan: async (routineId: string) => {
      set({ loading: true, error: null })
      try {
        await usecases.assignRoutineToPlan.execute(routineId, null)
        set((state) => ({
          routines: state.routines.map((r) => (r.id === routineId ? { ...r, planId: null } : r)),
          loading: false,
          error: null,
        }))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove routine from plan'
        set({ error: message, loading: false })
        throw err
      }
    },
  }))

const repo = new SupabaseRoutineRepository(supabase)
export const useRoutineStore = createRoutineStore({
  getAllRoutines: new GetAllRoutines(repo),
  createRoutine: new CreateRoutine(repo),
  updateRoutine: new UpdateRoutine(repo),
  deleteRoutine: new DeleteRoutine(repo),
  assignRoutineToPlan: new AssignRoutineToPlan(repo),
})
