import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWorkoutSessionStore } from '../workoutSessionStore'
import { StartSession } from '@/domain/usecases/StartSession'
import { FinishSession } from '@/domain/usecases/FinishSession'
import type { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository'
import type { Routine } from '@/domain/entities/Routine'
import type { StateStorage } from 'zustand/middleware'

describe('useWorkoutSessionStore', () => {
  const memoryMap = new Map<string, string>()
  const mockStorage: StateStorage = {
    getItem: (name) => memoryMap.get(name) ?? null,
    setItem: (name, val) => {
      memoryMap.set(name, val)
    },
    removeItem: (name) => {
      memoryMap.delete(name)
    },
  }

  const mockRepo: IWorkoutSessionRepository = {
    save: vi.fn().mockImplementation((s) => Promise.resolve(s)),
    findById: vi.fn(),
    findAll: vi.fn(),
  }

  let store: ReturnType<typeof createWorkoutSessionStore>

  beforeEach(() => {
    vi.clearAllMocks()
    memoryMap.clear()
    store = createWorkoutSessionStore(
      {
        startSession: new StartSession(),
        finishSession: new FinishSession(mockRepo),
      },
      mockStorage
    )
  })

  it('has initial state', () => {
    const state = store.getState()
    expect(state.activeSession).toBeNull()
    expect(state.isSaving).toBe(false)
    expect(state.error).toBeNull()
  })

  it('starts an empty session', () => {
    store.getState().startEmpty('Arm Blaster')
    const state = store.getState()
    expect(state.activeSession).not.toBeNull()
    expect(state.activeSession?.title).toBe('Arm Blaster')
    expect(state.activeSession?.exercises).toEqual([])
  })

  it('starts a session from a routine', () => {
    const routine: Routine = {
      id: 'r-1',
      name: 'Legs',
      exercises: [
        {
          exerciseId: 'ex-squat',
          exerciseName: 'Squat',
          orderIndex: 0,
          sets: 3,
          repsMin: 5,
        },
      ],
    }

    store.getState().startFromRoutine(routine)
    const session = store.getState().activeSession!
    expect(session.title).toBe('Legs')
    expect(session.routineId).toBe('r-1')
    expect(session.exercises).toHaveLength(1)
    expect(session.exercises[0]!.sets).toHaveLength(3)
  })

  it('updates set weight, reps, and rpe', () => {
    store.getState().startEmpty()
    store.getState().addExercise({ id: 'ex-1', name: 'Bench Press' })

    store.getState().updateSet('ex-1', 1, { weightKg: 80, reps: 6, rpe: 8.5 })

    const session = store.getState().activeSession!
    expect(session.exercises[0]!.sets[0]!.weightKg).toBe(80)
    expect(session.exercises[0]!.sets[0]!.reps).toBe(6)
    expect(session.exercises[0]!.sets[0]!.rpe).toBe(8.5)
  })

  it('toggles set logged completion', () => {
    store.getState().startEmpty()
    store.getState().addExercise({ id: 'ex-1', name: 'Bench Press' })

    expect(store.getState().activeSession!.exercises[0]!.sets[0]!.isCompleted).toBe(false)

    store.getState().toggleSetLogged('ex-1', 1)
    expect(store.getState().activeSession!.exercises[0]!.sets[0]!.isCompleted).toBe(true)

    store.getState().toggleSetLogged('ex-1', 1)
    expect(store.getState().activeSession!.exercises[0]!.sets[0]!.isCompleted).toBe(false)
  })

  it('adds and removes set with constraint', () => {
    store.getState().startEmpty()
    store.getState().addExercise({ id: 'ex-1', name: 'Deadlift' })
    store.getState().updateSet('ex-1', 1, { weightKg: 140, reps: 5 })

    // Add set copies previous weight and reps
    store.getState().addSet('ex-1')
    let ex = store.getState().activeSession!.exercises[0]!
    expect(ex.sets).toHaveLength(2)
    expect(ex.sets[1]!.setNumber).toBe(2)
    expect(ex.sets[1]!.weightKg).toBe(140)

    // Remove last set
    store.getState().removeLastSet('ex-1')
    ex = store.getState().activeSession!.exercises[0]!
    expect(ex.sets).toHaveLength(1)

    // Cannot remove when only 1 set remains
    store.getState().removeLastSet('ex-1')
    ex = store.getState().activeSession!.exercises[0]!
    expect(ex.sets).toHaveLength(1)
  })

  it('finishes session and clears active session', async () => {
    store.getState().startEmpty('Chest Day')
    const saved = await store.getState().finishSession()

    expect(saved.title).toBe('Chest Day')
    expect(saved.finishedAt).toBeInstanceOf(Date)
    expect(store.getState().activeSession).toBeNull()
    expect(store.getState().isSaving).toBe(false)
  })

  it('discards active session', () => {
    store.getState().startEmpty('Morning Workout')
    expect(store.getState().activeSession).not.toBeNull()

    store.getState().discard()
    expect(store.getState().activeSession).toBeNull()
  })

  it('prevents adding duplicate exercises to active session', () => {
    store.getState().startEmpty('Morning Workout')
    store.getState().addExercise({ id: 'ex-1', name: 'Deadlift' })
    expect(store.getState().activeSession!.exercises).toHaveLength(1)

    // Attempt to add same exercise
    store.getState().addExercise({ id: 'ex-1', name: 'Deadlift' })
    expect(store.getState().activeSession!.exercises).toHaveLength(1)

    // Add different exercise
    store.getState().addExercise({ id: 'ex-2', name: 'Squat' })
    expect(store.getState().activeSession!.exercises).toHaveLength(2)
  })

  it('rehydrates active session from async storage and sets _hasHydrated', async () => {
    const asyncMap = new Map<string, string>()
    const asyncStorage: StateStorage = {
      getItem: async (name) => asyncMap.get(name) ?? null,
      setItem: async (name, val) => {
        asyncMap.set(name, val)
      },
      removeItem: async (name) => {
        asyncMap.delete(name)
      },
    }

    const firstStore = createWorkoutSessionStore(
      {
        startSession: new StartSession(),
        finishSession: new FinishSession(mockRepo),
      },
      asyncStorage
    )
    firstStore.getState().startEmpty('Leg Day')
    firstStore.getState().addExercise({ id: 'ex-squat', name: 'Squat' })
    firstStore.getState().updateSet('ex-squat', 1, { weightKg: 100, reps: 5 })

    // Wait for async persist write
    await new Promise((r) => setTimeout(r, 10))

    // Simulate reopening app with a fresh store instance reading the same storage
    const reopenedStore = createWorkoutSessionStore(
      {
        startSession: new StartSession(),
        finishSession: new FinishSession(mockRepo),
      },
      asyncStorage
    )

    await vi.waitFor(() => {
      expect(reopenedStore.getState()._hasHydrated).toBe(true)
    })

    const restored = reopenedStore.getState().activeSession
    expect(restored?.title).toBe('Leg Day')
    expect(restored?.exercises[0]?.sets[0]?.weightKg).toBe(100)
    expect(restored?.exercises[0]?.sets[0]?.reps).toBe(5)
  })
})
