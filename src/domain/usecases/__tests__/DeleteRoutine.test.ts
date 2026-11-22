import { describe, it, expect, vi } from 'vitest'
import { DeleteRoutine } from '../DeleteRoutine'
import type { IRoutineRepository } from '../../repositories/IRoutineRepository'

describe('DeleteRoutine', () => {
  it('calls repository delete with routine ID', async () => {
    const mockRepo: Partial<IRoutineRepository> = {
      delete: vi.fn().mockResolvedValue(undefined),
    }

    const useCase = new DeleteRoutine(mockRepo as IRoutineRepository)
    await useCase.execute('r-1')

    expect(mockRepo.delete).toHaveBeenCalledWith('r-1')
  })

  it('throws error when routine ID is empty', async () => {
    const mockRepo: Partial<IRoutineRepository> = {
      delete: vi.fn(),
    }

    const useCase = new DeleteRoutine(mockRepo as IRoutineRepository)
    await expect(useCase.execute('')).rejects.toThrow('Routine ID is required')
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })
})
