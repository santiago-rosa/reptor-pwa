import { create } from 'zustand'
import type { Plan } from '@/domain/entities/Plan'
import { GetAllPlans } from '@/domain/usecases/GetAllPlans'
import { CreatePlan } from '@/domain/usecases/CreatePlan'
import { UpdatePlan } from '@/domain/usecases/UpdatePlan'
import { DeletePlan } from '@/domain/usecases/DeletePlan'
import { SupabasePlanRepository } from '@/infrastructure/supabase/repositories/SupabasePlanRepository'
import { supabase } from '@/infrastructure/supabase/client'
import { useRoutineStore } from './routineStore'

export interface PlanState {
  plans: Plan[]
  loading: boolean
  error: string | null
  fetchPlans: (force?: boolean) => Promise<void>
  createPlan: (name: string, userId?: string | null) => Promise<Plan>
  renamePlan: (id: string, name: string) => Promise<Plan>
  deletePlan: (id: string) => Promise<void>
}

export interface PlanStoreUseCases {
  getAllPlans: GetAllPlans
  createPlan: CreatePlan
  updatePlan: UpdatePlan
  deletePlan: DeletePlan
  onPlanDeleted?: () => void | Promise<void>
}

export const createPlanStore = (usecases: PlanStoreUseCases) =>
  create<PlanState>((set, get) => ({
    plans: [],
    loading: false,
    error: null,

    fetchPlans: async (force = false) => {
      if (!force && get().plans.length > 0) return

      set({ loading: true, error: null })
      try {
        const plans = await usecases.getAllPlans.execute()
        set({ plans, loading: false, error: null })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch plans'
        set({ error: message, loading: false })
      }
    },

    createPlan: async (name: string, userId?: string | null) => {
      set({ loading: true, error: null })
      try {
        const newPlan = await usecases.createPlan.execute({ name, userId })
        set((state) => ({
          plans: [...state.plans, newPlan],
          loading: false,
          error: null,
        }))
        return newPlan
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create plan'
        set({ error: message, loading: false })
        throw err
      }
    },

    renamePlan: async (id: string, name: string) => {
      set({ loading: true, error: null })
      try {
        const updated = await usecases.updatePlan.execute({ id, name })
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? updated : p)),
          loading: false,
          error: null,
        }))
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to rename plan'
        set({ error: message, loading: false })
        throw err
      }
    },

    deletePlan: async (id: string) => {
      set({ loading: true, error: null })
      try {
        await usecases.deletePlan.execute(id)
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
          loading: false,
          error: null,
        }))

        // Cross-store coordination: refresh routines to detach from deleted plan
        if (usecases.onPlanDeleted) {
          await usecases.onPlanDeleted()
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete plan'
        set({ error: message, loading: false })
        throw err
      }
    },
  }))

const repo = new SupabasePlanRepository(supabase)
export const usePlanStore = createPlanStore({
  getAllPlans: new GetAllPlans(repo),
  createPlan: new CreatePlan(repo),
  updatePlan: new UpdatePlan(repo),
  deletePlan: new DeletePlan(repo),
  onPlanDeleted: () => useRoutineStore.getState().fetchRoutines(true),
})
