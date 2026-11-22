import { describe, it, expect, vi } from 'vitest'
import { CreateRoutine } from '../CreateRoutine'
import type { IRoutineRepository, CreateRoutineInput } from '../../repositories/IRoutineRepository'
import type { Routine } from '../../entities/Routine'

describe('CreateRoutine', () => {
  const mockRoutine: Routine = {
    id: 'r-1',
    name: 'Push Day',
    planId: null,
    userId: 'user-1',
    exercises: [
      {
        exerciseId: 'ex-1',
        orderIndex: 0,
        sets: 3,
        repsMin: 8,
        repsMax: 12,
      },
    ],
  }

  it('creates routine successfully using repository', async () => {
    const input: CreateRoutineInput = {
      name: 'Push Day',
      planId: null,
      userId: 'user-1',
      exercises: [
        {
          exerciseId: 'ex-1',
          orderIndex: 0,
          sets: 3,
          repsMin: 8,
          repsMax: 12,
        },
      ],
    }

    const mockRepo: Partial<IRoutineRepository> = {
      save: vi.fn().mockResolvedValue(mockRoutine),
    }

    const useCase = new CreateRoutine(mockRepo as IRoutineRepository)
    const result = await useCase.execute(input)

    expect(result).toEqual(mockRoutine)
    expect(mockRepo.save).toHaveBeenCalledWith(input)
  })

  it('throws error when routine name is empty', async () => {
    const input: CreateRoutineInput = {
      name: '   ',
      exercises: [],
    }

    const mockRepo: Partial<IRoutineRepository> = {
      save: vi.fn(),
    }

    const useCase = new CreateRoutine(mockRepo as IRoutineRepository)
    await expect(useCase.execute(input)).rejects.toThrow('Routine name is required')
    expect(mockRepo.save).not.toHaveBeenCalled()
  })
})
