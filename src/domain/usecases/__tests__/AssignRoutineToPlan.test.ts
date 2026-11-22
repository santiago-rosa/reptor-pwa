import { describe, it, expect, vi } from 'vitest'
import { AssignRoutineToPlan } from '../AssignRoutineToPlan'
import type { IRoutineRepository } from '../../repositories/IRoutineRepository'

describe('AssignRoutineToPlan', () => {
  it('assigns routine to plan using repository', async () => {
    const mockRepo: Partial<IRoutineRepository> = {
      assignToPlan: vi.fn().mockResolvedValue(undefined),
    }

    const useCase = new AssignRoutineToPlan(mockRepo as IRoutineRepository)
    await useCase.execute('r-1', 'plan-1')

    expect(mockRepo.assignToPlan).toHaveBeenCalledWith('r-1', 'plan-1')
  })

  it('unassigns routine when plan ID is null', async () => {
    const mockRepo: Partial<IRoutineRepository> = {
      assignToPlan: vi.fn().mockResolvedValue(undefined),
    }

    const useCase = new AssignRoutineToPlan(mockRepo as IRoutineRepository)
    await useCase.execute('r-1', null)

    expect(mockRepo.assignToPlan).toHaveBeenCalledWith('r-1', null)
  })

  it('throws error when routine ID is empty', async () => {
    const mockRepo: Partial<IRoutineRepository> = {
      assignToPlan: vi.fn(),
    }

    const useCase = new AssignRoutineToPlan(mockRepo as IRoutineRepository)
    await expect(useCase.execute('', 'plan-1')).rejects.toThrow('Routine ID is required')
    expect(mockRepo.assignToPlan).not.toHaveBeenCalled()
  })
})
