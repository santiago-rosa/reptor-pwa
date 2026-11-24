import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseWorkoutSessionRepository } from '../SupabaseWorkoutSessionRepository'
import type { JoinedWorkoutSessionRow } from '../../types/WorkoutSessionRow'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

describe('SupabaseWorkoutSessionRepository', () => {
  it('fetches sessions ordered by started_at desc and maps children', async () => {
    const mockRow: JoinedWorkoutSessionRow = {
      id: 'session-1',
      title: 'Full Body',
      routine_id: 'r-1',
      user_id: 'u-1',
      started_at: '2026-01-01T10:00:00Z',
      finished_at: '2026-01-01T11:00:00Z',
      session_exercises: [
        {
          id: 'se-1',
          session_id: 'session-1',
          exercise_id: 'ex-squat',
          order_index: 0,
          exercises: { name: 'Squat' },
          session_sets: [
            {
              id: 'set-1',
              session_exercise_id: 'se-1',
              set_number: 1,
              weight_kg: 100,
              reps: 5,
              is_completed: true,
            },
          ],
        },
      ],
    }

    const mockOrder = vi.fn().mockResolvedValue({ data: [mockRow], error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    const mockClient = { from: mockFrom } as unknown as SupabaseClient
    const repo = new SupabaseWorkoutSessionRepository(mockClient)

    const result = await repo.findAll()

    expect(mockFrom).toHaveBeenCalledWith('workout_sessions')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user')
    expect(mockOrder).toHaveBeenCalledWith('started_at', { ascending: false })
    expect(result).toHaveLength(1)
    expect(result[0]!.title).toBe('Full Body')
    expect(result[0]!.exercises[0]!.exerciseName).toBe('Squat')
    expect(result[0]!.exercises[0]!.sets[0]!.weightKg).toBe(100)
    expect(result[0]!.exercises[0]!.sets[0]!.isCompleted).toBe(true)
  })

  it('saves session, exercises, and sets via upsert', async () => {
    const sessionToSave: WorkoutSession = {
      id: 'session-2',
      title: 'Arms',
      routineId: null,
      userId: 'u-1',
      startedAt: '2026-01-01T12:00:00Z',
      finishedAt: '2026-01-01T13:00:00Z',
      exercises: [
        {
          id: 'se-2',
          sessionId: 'session-2',
          exerciseId: 'ex-curl',
          exerciseName: 'Bicep Curl',
          orderIndex: 0,
          sets: [
            {
              id: 'set-2',
              sessionExerciseId: 'se-2',
              setNumber: 1,
              weightKg: 15,
              reps: 12,
              isCompleted: true,
            },
          ],
        },
      ],
    }

    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'session-2',
        title: 'Arms',
        started_at: '2026-01-01T12:00:00Z',
        finished_at: '2026-01-01T13:00:00Z',
        session_exercises: [
          {
            id: 'se-2',
            session_id: 'session-2',
            exercise_id: 'ex-curl',
            order_index: 0,
            session_sets: [
              {
                id: 'set-2',
                session_exercise_id: 'se-2',
                set_number: 1,
                weight_kg: 15,
                reps: 12,
                is_completed: true,
              },
            ],
          },
        ],
      },
      error: null,
    })

    const mockChain: any = { maybeSingle: mockMaybeSingle }
    mockChain.eq = vi.fn().mockReturnValue(mockChain)
    const mockSelect = vi.fn().mockReturnValue(mockChain)

    const mockFrom = vi.fn((table: string) => {
      if (table === 'workout_sessions') {
        return {
          upsert: mockUpsert,
          select: mockSelect,
        }
      }
      return {
        upsert: mockUpsert,
      }
    })

    const mockClient = { from: mockFrom } as unknown as SupabaseClient
    const repo = new SupabaseWorkoutSessionRepository(mockClient)

    const result = await repo.save(sessionToSave)

    expect(mockFrom).toHaveBeenCalledWith('workout_sessions')
    expect(mockFrom).toHaveBeenCalledWith('session_exercises')
    expect(mockFrom).toHaveBeenCalledWith('session_sets')
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'session-2')
    expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'test-user')
    expect(result.id).toBe('session-2')
  })
})
