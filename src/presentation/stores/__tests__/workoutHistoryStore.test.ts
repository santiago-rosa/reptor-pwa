import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createWorkoutHistoryStore } from '../workoutHistoryStore'
import { GetWorkoutHistory } from '@/domain/usecases/GetWorkoutHistory'
import { GetWorkoutSession } from '@/domain/usecases/GetWorkoutSession'
import type { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

describe('workoutHistoryStore', () => {
  let mockRepo: IWorkoutSessionRepository
  let getWorkoutHistory: GetWorkoutHistory
  let getWorkoutSession: GetWorkoutSession
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
      findById: vi.fn().mockImplementation((id: string) => {
        const found = sampleSessions.find((s) => s.id === id)
        return Promise.resolve(found ?? null)
      }),
      findAll: vi.fn().mockResolvedValue(sampleSessions),
    }
    getWorkoutHistory = new GetWorkoutHistory(mockRepo)
    getWorkoutSession = new GetWorkoutSession(mockRepo)
    store = createWorkoutHistoryStore({ getWorkoutHistory, getWorkoutSession })
  })

  it('initializes with default empty state', () => {
    const state = store.getState()
    expect(state.sessions).toEqual([])
    expect(state.selectedSession).toBeNull()
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

  it('fetches single session by ID and updates selectedSession', async () => {
    const session = await store.getState().fetchSessionById('session-new')

    expect(session?.id).toBe('session-new')
    expect(store.getState().selectedSession?.id).toBe('session-new')
    expect(store.getState().loading).toBe(false)
  })

  it('clears selectedSession when clearSelectedSession is called', async () => {
    await store.getState().fetchSessionById('session-new')
    expect(store.getState().selectedSession).not.toBeNull()

    store.getState().clearSelectedSession()
    expect(store.getState().selectedSession).toBeNull()
  })

  it('handles fetchSessionById error gracefully', async () => {
    mockRepo.findById = vi.fn().mockRejectedValue(new Error('Failed to find'))
    const session = await store.getState().fetchSessionById('error-id')

    expect(session).toBeNull()
    expect(store.getState().error).toBe('Failed to find')
    expect(store.getState().loading).toBe(false)
  })
})
