import { describe, it, expect, vi } from 'vitest'
import { FinishSession } from '../FinishSession'
import type { IWorkoutSessionRepository } from '../../repositories/IWorkoutSessionRepository'
import type { WorkoutSession } from '../../entities/WorkoutSession'

describe('FinishSession', () => {
  const mockActiveSession: WorkoutSession = {
    id: 'session-123',
    title: 'Leg Day',
    startedAt: new Date(Date.now() - 3600000),
    finishedAt: null,
    exercises: [],
  }

  it('stamps finishedAt and saves session to repository', async () => {
    const mockRepo: Partial<IWorkoutSessionRepository> = {
      save: vi.fn().mockImplementation((s: WorkoutSession) => Promise.resolve(s)),
    }

    const useCase = new FinishSession(mockRepo as IWorkoutSessionRepository)
    const result = await useCase.execute(mockActiveSession)

    expect(result.finishedAt).toBeInstanceOf(Date)
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'session-123',
        finishedAt: expect.any(Date),
      })
    )
  })

  it('throws error when session has no ID', async () => {
    const mockRepo: Partial<IWorkoutSessionRepository> = {
      save: vi.fn(),
    }

    const useCase = new FinishSession(mockRepo as IWorkoutSessionRepository)
    await expect(
      useCase.execute({ ...mockActiveSession, id: '' })
    ).rejects.toThrow('Session ID is required')

    expect(mockRepo.save).not.toHaveBeenCalled()
  })
})
