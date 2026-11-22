import { describe, it, expect, vi } from 'vitest'
import { createPlanStore } from '../planStore'
import { GetAllPlans } from '@/domain/usecases/GetAllPlans'
import { CreatePlan } from '@/domain/usecases/CreatePlan'
import { UpdatePlan } from '@/domain/usecases/UpdatePlan'
import { DeletePlan } from '@/domain/usecases/DeletePlan'
import type { IPlanRepository } from '@/domain/repositories/IPlanRepository'
import type { Plan } from '@/domain/entities/Plan'

describe('usePlanStore', () => {
  const mockPlan: Plan = {
    id: 'p-1',
    name: 'PPL Routine Folder',
  }

  const setupStore = (mockRepo: Partial<IPlanRepository>, onPlanDeleted?: () => void) => {
    const fullRepo = mockRepo as IPlanRepository
    return createPlanStore({
      getAllPlans: new GetAllPlans(fullRepo),
      createPlan: new CreatePlan(fullRepo),
      updatePlan: new UpdatePlan(fullRepo),
      deletePlan: new DeletePlan(fullRepo),
      onPlanDeleted,
    })
  }

  it('has initial state', () => {
    const store = setupStore({})
    expect(store.getState().plans).toEqual([])
    expect(store.getState().loading).toBe(false)
    expect(store.getState().error).toBeNull()
  })

  it('fetches plans and updates state', async () => {
    const store = setupStore({
      findAll: vi.fn().mockResolvedValue([mockPlan]),
    })

    await store.getState().fetchPlans()

    expect(store.getState().plans).toEqual([mockPlan])
    expect(store.getState().loading).toBe(false)
  })

  it('creates plan and appends to state', async () => {
    const store = setupStore({
      save: vi.fn().mockResolvedValue(mockPlan),
    })

    const created = await store.getState().createPlan('PPL Routine Folder')

    expect(created).toEqual(mockPlan)
    expect(store.getState().plans).toContainEqual(mockPlan)
  })

  it('renames plan in state', async () => {
    const updated = { ...mockPlan, name: 'Upper Lower Split' }
    const store = setupStore({
      update: vi.fn().mockResolvedValue(updated),
    })
    store.setState({ plans: [mockPlan] })

    await store.getState().renamePlan('p-1', 'Upper Lower Split')

    expect(store.getState().plans[0]!.name).toBe('Upper Lower Split')
  })

  it('deletes plan and triggers cross-store callback', async () => {
    const onPlanDeleted = vi.fn()
    const store = setupStore(
      {
        delete: vi.fn().mockResolvedValue(undefined),
      },
      onPlanDeleted
    )
    store.setState({ plans: [mockPlan] })

    await store.getState().deletePlan('p-1')

    expect(store.getState().plans).toHaveLength(0)
    expect(onPlanDeleted).toHaveBeenCalledTimes(1)
  })
})
