import { describe, it, expect, vi } from 'vitest'
import { CreatePlan } from '../CreatePlan'
import type { IPlanRepository, CreatePlanInput } from '../../repositories/IPlanRepository'
import type { Plan } from '../../entities/Plan'

describe('CreatePlan', () => {
  const mockPlan: Plan = {
    id: 'p-1',
    name: 'PPL Hypertrophy',
    userId: 'user-1',
  }

  it('creates plan successfully using repository', async () => {
    const input: CreatePlanInput = {
      name: 'PPL Hypertrophy',
      userId: 'user-1',
    }

    const mockRepo: Partial<IPlanRepository> = {
      save: vi.fn().mockResolvedValue(mockPlan),
    }

    const useCase = new CreatePlan(mockRepo as IPlanRepository)
    const result = await useCase.execute(input)

    expect(result).toEqual(mockPlan)
    expect(mockRepo.save).toHaveBeenCalledWith(input)
  })

  it('throws error when plan name is empty', async () => {
    const input: CreatePlanInput = {
      name: '   ',
    }

    const mockRepo: Partial<IPlanRepository> = {
      save: vi.fn(),
    }

    const useCase = new CreatePlan(mockRepo as IPlanRepository)
    await expect(useCase.execute(input)).rejects.toThrow('Plan name is required')
    expect(mockRepo.save).not.toHaveBeenCalled()
  })
})
