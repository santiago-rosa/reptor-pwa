import { describe, it, expect, vi } from 'vitest'
import { createExerciseStore } from '../exerciseStore'
import { GetAllExercises } from '@/domain/usecases/GetAllExercises'
import type { IExerciseRepository } from '@/domain/repositories/IExerciseRepository'
import type { Exercise } from '@/domain/entities/Exercise'

describe('useExerciseStore', () => {
  const mockExercises: Exercise[] = [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroups: ['chest', 'triceps'],
      equipment: 'barbell',
      category: 'strength',
    },
  ]

  it('has initial state', () => {
    const mockRepo: IExerciseRepository = {
      findAll: vi.fn(),
    }
    const store = createExerciseStore(new GetAllExercises(mockRepo))
    const state = store.getState()

    expect(state.exercises).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('fetches exercises and updates state successfully', async () => {
    const mockRepo: IExerciseRepository = {
      findAll: vi.fn().mockResolvedValue(mockExercises),
    }
    const store = createExerciseStore(new GetAllExercises(mockRepo))

    await store.getState().fetchExercises()

    const state = store.getState()
    expect(state.exercises).toEqual(mockExercises)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('handles fetch error and sets error message', async () => {
    const mockRepo: IExerciseRepository = {
      findAll: vi.fn().mockRejectedValue(new Error('Network error')),
    }
    const store = createExerciseStore(new GetAllExercises(mockRepo))

    await store.getState().fetchExercises()

    const state = store.getState()
    expect(state.exercises).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBe('Network error')
  })

  it('skips fetching if already loaded and force is not set', async () => {
    const mockRepo: IExerciseRepository = {
      findAll: vi.fn().mockResolvedValue(mockExercises),
    }
    const store = createExerciseStore(new GetAllExercises(mockRepo))

    await store.getState().fetchExercises()
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1)

    // Call again without force
    await store.getState().fetchExercises()
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1)

    // Call with force = true
    await store.getState().fetchExercises(true)
    expect(mockRepo.findAll).toHaveBeenCalledTimes(2)
  })
})
