import { describe, it, expect, vi } from 'vitest'
import { GetWorkoutHistory } from '../GetWorkoutHistory'
import type { IWorkoutSessionRepository } from '../../repositories/IWorkoutSessionRepository'
import type { WorkoutSession } from '../../entities/WorkoutSession'

describe('GetWorkoutHistory', () => {
  it('calls findAll on the repository and returns sessions', async () => {
    const mockSessions: WorkoutSession[] = [
      {
        id: 'session-1',
        title: 'Morning Push',
        startedAt: '2026-11-20T08:00:00Z',
        finishedAt: '2026-11-20T08:45:00Z',
        exercises: [],
      },
      {
        id: 'session-2',
        title: 'Evening Pull',
        startedAt: '2026-11-21T18:00:00Z',
        finishedAt: '2026-11-21T18:50:00Z',
        exercises: [],
      },
    ]

    const mockRepo: IWorkoutSessionRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue(mockSessions),
    }

    const useCase = new GetWorkoutHistory(mockRepo)
    const result = await useCase.execute()

    expect(mockRepo.findAll).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockSessions)
  })

  it('propagates errors thrown by the repository', async () => {
    const mockRepo: IWorkoutSessionRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn().mockRejectedValue(new Error('Database connection failed')),
    }

    const useCase = new GetWorkoutHistory(mockRepo)
    await expect(useCase.execute()).rejects.toThrow('Database connection failed')
  })
})
