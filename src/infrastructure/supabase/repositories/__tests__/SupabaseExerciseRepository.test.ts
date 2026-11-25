import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseExerciseRepository } from '../SupabaseExerciseRepository'
import type { ExerciseRow } from '../../types/ExerciseRow'

describe('SupabaseExerciseRepository', () => {
  it('fetches exercises ordered by name and maps snake_case to camelCase', async () => {
    const mockRows: ExerciseRow[] = [
      {
        id: '1',
        name: 'Bench Press',
        name_en: 'Bench Press',
        name_es: 'Press de banca',
        muscle_groups: ['chest', 'triceps'],
        equipment: 'barbell',
        category: 'strength',
        user_id: 'user-123',
        created_at: '2026-01-01T00:00:00Z',
      },
    ]

    const mockOrder = vi.fn().mockResolvedValue({ data: mockRows, error: null })
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    const mockClient = {
      from: mockFrom,
    } as unknown as SupabaseClient

    const repo = new SupabaseExerciseRepository(mockClient)
    const result = await repo.findAll()

    expect(mockFrom).toHaveBeenCalledWith('exercises')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true })
    expect(result).toEqual([
      {
        id: '1',
        name: 'Bench Press',
        nameEn: 'Bench Press',
        nameEs: 'Press de banca',
        muscleGroups: ['chest', 'triceps'],
        equipment: 'barbell',
        category: 'strength',
        userId: 'user-123',
      },
    ])
  })

  it('throws an error if Supabase query fails', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    })
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    const mockClient = {
      from: mockFrom,
    } as unknown as SupabaseClient

    const repo = new SupabaseExerciseRepository(mockClient)

    await expect(repo.findAll()).rejects.toThrow('Failed to fetch exercises: Database connection failed')
  })
})
