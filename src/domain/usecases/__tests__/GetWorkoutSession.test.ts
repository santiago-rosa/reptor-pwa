import { describe, it, expect, vi } from 'vitest'
import { GetWorkoutSession } from '../GetWorkoutSession'
import type { IWorkoutSessionRepository } from '../../repositories/IWorkoutSessionRepository'
import type { WorkoutSession } from '../../entities/WorkoutSession'

describe('GetWorkoutSession', () => {
  const mockSession: WorkoutSession = {
    id: 'session-123',
    title: 'Leg Day',
    startedAt: '2026-11-20T10:00:00Z',
    finishedAt: '2026-11-20T11:00:00Z',
    exercises: [],
  }

  it('fetches a workout session by ID successfully', async () => {
    const mockRepo: IWorkoutSessionRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(mockSession),
      findAll: vi.fn(),
    }

    const useCase = new GetWorkoutSession(mockRepo)
    const result = await useCase.execute('session-123')

    expect(mockRepo.findById).toHaveBeenCalledWith('session-123')
    expect(result).toEqual(mockSession)
  })

  it('returns null when session is not found', async () => {
    const mockRepo: IWorkoutSessionRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
    }

    const useCase = new GetWorkoutSession(mockRepo)
    const result = await useCase.execute('session-non-existent')

    expect(mockRepo.findById).toHaveBeenCalledWith('session-non-existent')
    expect(result).toBeNull()
  })

  it('throws an error if empty session ID is provided', async () => {
    const mockRepo: IWorkoutSessionRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    }

    const useCase = new GetWorkoutSession(mockRepo)
    await expect(useCase.execute('')).rejects.toThrow('Workout session ID is required')
    await expect(useCase.execute('   ')).rejects.toThrow('Workout session ID is required')
    expect(mockRepo.findById).not.toHaveBeenCalled()
  })
})
