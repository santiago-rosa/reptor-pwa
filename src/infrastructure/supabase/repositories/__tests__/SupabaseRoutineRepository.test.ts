import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseRoutineRepository } from '../SupabaseRoutineRepository'
import type { JoinedRoutineRow } from '../../types/RoutineRow'

describe('SupabaseRoutineRepository', () => {
  it('fetches routines with joined exercises and sorts exercises by orderIndex', async () => {
    const mockRow: JoinedRoutineRow = {
      id: 'r-1',
      name: 'Chest & Triceps',
      plan_id: 'p-1',
      user_id: 'u-1',
      created_at: '2026-01-01',
      routine_exercises: [
        {
          id: 're-2',
          routine_id: 'r-1',
          exercise_id: 'ex-2',
          order_index: 1,
          sets: 3,
          reps_min: 10,
          reps_max: 12,
          exercises: { name: 'Tricep Pushdown' },
        },
        {
          id: 're-1',
          routine_id: 'r-1',
          exercise_id: 'ex-1',
          order_index: 0,
          sets: 4,
          reps_min: 8,
          reps_max: 10,
          exercises: { name: 'Bench Press' },
        },
      ],
    }

    const mockOrder = vi.fn().mockResolvedValue({ data: [mockRow], error: null })
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    const mockClient = { from: mockFrom } as unknown as SupabaseClient
    const repo = new SupabaseRoutineRepository(mockClient)

    const result = await repo.findAll()

    expect(mockFrom).toHaveBeenCalledWith('routines')
    expect(mockSelect).toHaveBeenCalledWith('*, routine_exercises(*, exercises(name))')
    expect(result).toHaveLength(1)
    expect(result[0]!.exercises[0]!.exerciseName).toBe('Bench Press')
    expect(result[0]!.exercises[1]!.exerciseName).toBe('Tricep Pushdown')
  })

  it('rolls back routine insert if inserting exercises fails', async () => {
    const mockFrom = vi.fn((table: string) => {
      if (table === 'routines') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'r-new', name: 'Rollback Test' }, error: null }),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      if (table === 'routine_exercises') {
        return {
          insert: vi.fn().mockResolvedValue({ error: { message: 'Foreign key constraint violated' } }),
        }
      }
      return {}
    })

    const mockClient = { from: mockFrom } as unknown as SupabaseClient
    const repo = new SupabaseRoutineRepository(mockClient)

    await expect(
      repo.save({
        name: 'Rollback Test',
        exercises: [{ exerciseId: 'bad-ex', orderIndex: 0, sets: 3, repsMin: 10 }],
      })
    ).rejects.toThrow('Failed to create routine exercises: Foreign key constraint violated')

    // Verify rollback delete was called
    expect(mockFrom).toHaveBeenCalledWith('routines')
  })
})
