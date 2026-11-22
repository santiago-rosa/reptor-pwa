import { describe, it, expect, beforeEach } from 'vitest'
import { useRoutineDraftStore } from '../routineDraftStore'
import type { Routine } from '@/domain/entities/Routine'

describe('useRoutineDraftStore', () => {
  beforeEach(() => {
    useRoutineDraftStore.getState().reset()
  })

  it('has clean initial state', () => {
    const state = useRoutineDraftStore.getState()
    expect(state.routineId).toBeNull()
    expect(state.name).toBe('')
    expect(state.planId).toBeNull()
    expect(state.exercises).toEqual([])
  })

  it('sets name and planId', () => {
    useRoutineDraftStore.getState().setName('Leg Day')
    useRoutineDraftStore.getState().setPlanId('plan-1')

    const state = useRoutineDraftStore.getState()
    expect(state.name).toBe('Leg Day')
    expect(state.planId).toBe('plan-1')
  })

  it('adds exercises avoiding duplicates and assigns defaults', () => {
    useRoutineDraftStore.getState().addExercises([
      { id: 'ex-1', name: 'Squat' },
      { id: 'ex-2', name: 'Leg Press' },
    ])

    let state = useRoutineDraftStore.getState()
    expect(state.exercises).toHaveLength(2)
    expect(state.exercises[0]!.exerciseName).toBe('Squat')
    expect(state.exercises[0]!.sets).toBe(3)
    expect(state.exercises[0]!.repsMin).toBe(8)
    expect(state.exercises[0]!.repsMax).toBe(12)

    // Try adding duplicate
    useRoutineDraftStore.getState().addExercises([
      { id: 'ex-1', name: 'Squat' },
      { id: 'ex-3', name: 'Calf Raise' },
    ])

    state = useRoutineDraftStore.getState()
    expect(state.exercises).toHaveLength(3)
    expect(state.exercises.map((e) => e.exerciseId)).toEqual(['ex-1', 'ex-2', 'ex-3'])
  })

  it('removes an exercise and re-indexes orders', () => {
    useRoutineDraftStore.getState().addExercises([
      { id: 'ex-1', name: 'Squat' },
      { id: 'ex-2', name: 'Leg Press' },
      { id: 'ex-3', name: 'Calf Raise' },
    ])

    useRoutineDraftStore.getState().removeExercise('ex-2')

    const state = useRoutineDraftStore.getState()
    expect(state.exercises).toHaveLength(2)
    expect(state.exercises[0]!.exerciseId).toBe('ex-1')
    expect(state.exercises[0]!.order).toBe(0)
    expect(state.exercises[1]!.exerciseId).toBe('ex-3')
    expect(state.exercises[1]!.order).toBe(1)
  })

  it('updates sets clamped between 1 and 10', () => {
    useRoutineDraftStore.getState().addExercises([{ id: 'ex-1', name: 'Bench Press' }])

    useRoutineDraftStore.getState().updateExerciseSets('ex-1', 5)
    expect(useRoutineDraftStore.getState().exercises[0]!.sets).toBe(5)

    // Upper clamp
    useRoutineDraftStore.getState().updateExerciseSets('ex-1', 15)
    expect(useRoutineDraftStore.getState().exercises[0]!.sets).toBe(10)

    // Lower clamp
    useRoutineDraftStore.getState().updateExerciseSets('ex-1', 0)
    expect(useRoutineDraftStore.getState().exercises[0]!.sets).toBe(1)
  })

  it('updates repsMin and repsMax', () => {
    useRoutineDraftStore.getState().addExercises([{ id: 'ex-1', name: 'Bench Press' }])

    useRoutineDraftStore.getState().updateExerciseReps('ex-1', 6, 8)
    const ex = useRoutineDraftStore.getState().exercises[0]!
    expect(ex.repsMin).toBe(6)
    expect(ex.repsMax).toBe(8)
  })

  it('loads from an existing routine and resets cleanly', () => {
    const routine: Routine = {
      id: 'routine-99',
      name: 'Pull Day',
      planId: 'plan-3',
      exercises: [
        {
          exerciseId: 'ex-pullup',
          exerciseName: 'Pull Up',
          orderIndex: 0,
          sets: 4,
          repsMin: 6,
          repsMax: 8,
        },
      ],
    }

    useRoutineDraftStore.getState().loadFromRoutine(routine)

    let state = useRoutineDraftStore.getState()
    expect(state.routineId).toBe('routine-99')
    expect(state.name).toBe('Pull Day')
    expect(state.planId).toBe('plan-3')
    expect(state.exercises).toHaveLength(1)
    expect(state.exercises[0]!.exerciseName).toBe('Pull Up')
    expect(state.exercises[0]!.sets).toBe(4)

    useRoutineDraftStore.getState().reset()
    state = useRoutineDraftStore.getState()
    expect(state.routineId).toBeNull()
    expect(state.name).toBe('')
    expect(state.exercises).toEqual([])
  })
})
