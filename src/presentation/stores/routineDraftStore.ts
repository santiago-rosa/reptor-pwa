import { create } from 'zustand'
import type { Routine } from '@/domain/entities/Routine'

export interface DraftExercise {
  exerciseId: string
  exerciseName: string
  order: number
  sets: number
  repsMin: number
  repsMax?: number | null
}

export interface RoutineDraftState {
  routineId: string | null
  name: string
  planId: string | null
  exercises: DraftExercise[]
  setName: (name: string) => void
  setPlanId: (planId: string | null) => void
  addExercises: (exercises: Array<{ id: string; name: string }>) => void
  removeExercise: (exerciseId: string) => void
  updateExerciseSets: (exerciseId: string, sets: number) => void
  updateExerciseReps: (exerciseId: string, repsMin: number, repsMax?: number | null) => void
  loadFromRoutine: (routine: Routine) => void
  reset: () => void
}

const initialState = {
  routineId: null,
  name: '',
  planId: null,
  exercises: [] as DraftExercise[],
}

export const useRoutineDraftStore = create<RoutineDraftState>((set) => ({
  ...initialState,

  setName: (name: string) => set({ name }),

  setPlanId: (planId: string | null) => set({ planId }),

  addExercises: (newExercises: Array<{ id: string; name: string }>) =>
    set((state) => {
      const existingIds = new Set(state.exercises.map((e) => e.exerciseId))
      const toAdd = newExercises.filter((e) => !existingIds.has(e.id))

      if (toAdd.length === 0) return state

      let currentOrder = state.exercises.length
      const added: DraftExercise[] = toAdd.map((e) => ({
        exerciseId: e.id,
        exerciseName: e.name,
        order: currentOrder++,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
      }))

      return {
        exercises: [...state.exercises, ...added],
      }
    }),

  removeExercise: (exerciseId: string) =>
    set((state) => ({
      exercises: state.exercises
        .filter((e) => e.exerciseId !== exerciseId)
        .map((e, index) => ({ ...e, order: index })),
    })),

  updateExerciseSets: (exerciseId: string, sets: number) =>
    set((state) => ({
      exercises: state.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? { ...e, sets: Math.max(1, Math.min(10, sets)) }
          : e
      ),
    })),

  updateExerciseReps: (exerciseId: string, repsMin: number, repsMax?: number | null) =>
    set((state) => ({
      exercises: state.exercises.map((e) =>
        e.exerciseId === exerciseId
          ? { ...e, repsMin: Math.max(1, repsMin), repsMax: repsMax ?? null }
          : e
      ),
    })),

  loadFromRoutine: (routine: Routine) =>
    set({
      routineId: routine.id,
      name: routine.name,
      planId: routine.planId ?? null,
      exercises: routine.exercises.map((re, index) => ({
        exerciseId: re.exerciseId,
        exerciseName: re.exerciseName ?? 'Exercise',
        order: re.orderIndex ?? index,
        sets: re.sets,
        repsMin: re.repsMin,
        repsMax: re.repsMax ?? null,
      })),
    }),

  reset: () => set(initialState),
}))
