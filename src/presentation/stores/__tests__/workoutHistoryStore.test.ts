import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWorkoutHistoryStore } from '../workoutHistoryStore'
import { GetWorkoutHistory } from '@/domain/usecases/GetWorkoutHistory'
import type { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

describe('workoutHistoryStore', () => {
  let mockRepo: IWorkoutSessionRepository
  let getWorkoutHistory: GetWorkoutHistory
  let store: ReturnType<typeof createWorkoutHistoryStore>

  const sampleSessions: WorkoutSession[] = [
    {
      id: 'session-old',
      title: 'Older Session',
      startedAt: '2026-11-18T10:00:00Z',
      finishedAt: '2026-11-18T10:45:00Z',
      exercises: [],
    },
    {
      id: 'session-new',
      title: 'Newer Session',
      startedAt: '2026-11-20T10:00:00Z',
      finishedAt: '2026-11-20T10:45:00Z',
      exercises: [],
    },
  ]

  beforeEach(() => {
    mockRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue(sampleSessions),
    }
    getWorkoutHistory = new GetWorkoutHistory(mockRepo)
    store = createWorkoutHistoryStore({ getWorkoutHistory })
  })

  it('initializes with default empty state', () => {
    const state = store.getState()
    expect(state.sessions).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('fetches and sorts sessions newest first', async () => {
    await store.getState().fetchSessions()

    const state = store.getState()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.sessions).toHaveLength(2)
    // Newer session should be first
    expect(state.sessions[0]?.id).toBe('session-new')
    expect(state.sessions[1]?.id).toBe('session-old')
  })

  it('does not refetch if sessions already exist unless force=true', async () => {
    await store.getState().fetchSessions()
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1)

    // Call again without force
    await store.getState().fetchSessions(false)
    expect(mockRepo.findAll).toHaveBeenCalledTimes(1)

    // Call again with force=true
    await store.getState().fetchSessions(true)
    expect(mockRepo.findAll).toHaveBeenCalledTimes(2)
  })

  it('handles errors gracefully and updates error state', async () => {
    mockRepo.findAll = vi.fn().mockRejectedValue(new Error('Network error'))
    await store.getState().fetchSessions(true)

    const state = store.getState()
    expect(state.loading).toBe(false)
    expect(state.error).toBe('Network error')
    expect(state.sessions).toEqual([])
  })
})
