import { describe, it, expect, vi } from 'vitest'
import { GetAllExercises } from '../GetAllExercises'
import type { IExerciseRepository } from '../../repositories/IExerciseRepository'
import type { Exercise } from '../../entities/Exercise'

describe('GetAllExercises', () => {
  const mockExercises: Exercise[] = [
    {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroups: ['chest', 'triceps'],
      equipment: 'barbell',
      category: 'strength',
    },
    {
      id: 'ex-2',
      name: 'Pull Up',
      muscleGroups: ['back', 'biceps'],
      equipment: 'bodyweight',
      category: 'strength',
    },
  ]

  it('returns exercise list from repository', async () => {
    const mockRepo: IExerciseRepository = {
      findAll: vi.fn().mockResolvedValue(mockExercises),
    }

    const useCase = new GetAllExercises(mockRepo)
    const result = await useCase.execute()

    expect(result).toEqual(mockExercises)
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1)
  })

  it('propagates repository rejection', async () => {
    const mockRepo: IExerciseRepository = {
      findAll: vi.fn().mockRejectedValue(new Error('Database error')),
    }

    const useCase = new GetAllExercises(mockRepo)

    await expect(useCase.execute()).rejects.toThrow('Database error')
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1)
  })
})
