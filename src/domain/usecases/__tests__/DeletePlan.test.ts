import { describe, it, expect, vi } from 'vitest'
import { DeletePlan } from '../DeletePlan'
import type { IPlanRepository } from '../../repositories/IPlanRepository'

describe('DeletePlan', () => {
  it('calls repository delete with plan ID', async () => {
    const mockRepo: Partial<IPlanRepository> = {
      delete: vi.fn().mockResolvedValue(undefined),
    }

    const useCase = new DeletePlan(mockRepo as IPlanRepository)
    await useCase.execute('p-1')

    expect(mockRepo.delete).toHaveBeenCalledWith('p-1')
  })

  it('throws error when plan ID is empty', async () => {
    const mockRepo: Partial<IPlanRepository> = {
      delete: vi.fn(),
    }

    const useCase = new DeletePlan(mockRepo as IPlanRepository)
    await expect(useCase.execute('')).rejects.toThrow('Plan ID is required')
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })
})
