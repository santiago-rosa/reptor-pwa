import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabasePlanRepository } from '../SupabasePlanRepository'
import type { PlanRow } from '../../types/PlanRow'

describe('SupabasePlanRepository', () => {
  it('fetches all plans ordered by name', async () => {
    const mockPlans: PlanRow[] = [
      { id: 'p-1', name: 'Upper Lower', user_id: 'u-1', created_at: '2026-01-01' },
    ]

    const mockOrder = vi.fn().mockResolvedValue({ data: mockPlans, error: null })
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })

    const mockClient = { from: mockFrom } as unknown as SupabaseClient
    const repo = new SupabasePlanRepository(mockClient)

    const result = await repo.findAll()

    expect(mockFrom).toHaveBeenCalledWith('plans')
    expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true })
    expect(result).toEqual([
      { id: 'p-1', name: 'Upper Lower', userId: 'u-1', createdAt: '2026-01-01', updatedAt: undefined },
    ])
  })

  it('saves a plan and returns mapped domain Plan', async () => {
    const mockCreated: PlanRow = { id: 'p-2', name: 'PPL', user_id: 'u-1' }

    const mockSingle = vi.fn().mockResolvedValue({ data: mockCreated, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert })

    const mockClient = { from: mockFrom } as unknown as SupabaseClient
    const repo = new SupabasePlanRepository(mockClient)

    const result = await repo.save({ name: 'PPL', userId: 'u-1' })

    expect(mockInsert).toHaveBeenCalledWith({ name: 'PPL', user_id: 'u-1' })
    expect(result.id).toBe('p-2')
    expect(result.name).toBe('PPL')
  })
})
