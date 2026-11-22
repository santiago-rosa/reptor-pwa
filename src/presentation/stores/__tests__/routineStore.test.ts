import { describe, it, expect, vi } from 'vitest'
import { createRoutineStore } from '../routineStore'
import { GetAllRoutines } from '@/domain/usecases/GetAllRoutines'
import { CreateRoutine } from '@/domain/usecases/CreateRoutine'
import { UpdateRoutine } from '@/domain/usecases/UpdateRoutine'
import { DeleteRoutine } from '@/domain/usecases/DeleteRoutine'
import { AssignRoutineToPlan } from '@/domain/usecases/AssignRoutineToPlan'
import type { IRoutineRepository } from '@/domain/repositories/IRoutineRepository'
import type { Routine } from '@/domain/entities/Routine'

describe('useRoutineStore', () => {
  const mockRoutine: Routine = {
    id: 'r-1',
    name: 'Chest & Arms',
    planId: null,
    exercises: [],
  }

  const setupStore = (mockRepo: Partial<IRoutineRepository>) => {
    const fullRepo = mockRepo as IRoutineRepository
    return createRoutineStore({
      getAllRoutines: new GetAllRoutines(fullRepo),
      createRoutine: new CreateRoutine(fullRepo),
      updateRoutine: new UpdateRoutine(fullRepo),
      deleteRoutine: new DeleteRoutine(fullRepo),
      assignRoutineToPlan: new AssignRoutineToPlan(fullRepo),
    })
  }

  it('has initial state', () => {
    const store = setupStore({})
    expect(store.getState().routines).toEqual([])
    expect(store.getState().loading).toBe(false)
    expect(store.getState().error).toBeNull()
  })

  it('fetches routines successfully', async () => {
    const store = setupStore({
      findAll: vi.fn().mockResolvedValue([mockRoutine]),
    })

    await store.getState().fetchRoutines()

    expect(store.getState().routines).toEqual([mockRoutine])
    expect(store.getState().loading).toBe(false)
  })

  it('creates routine and prepends to list', async () => {
    const store = setupStore({
      save: vi.fn().mockResolvedValue(mockRoutine),
    })

    const created = await store.getState().createRoutine({
      name: 'Chest & Arms',
      exercises: [],
    })

    expect(created).toEqual(mockRoutine)
    expect(store.getState().routines).toContainEqual(mockRoutine)
  })

  it('updates routine in place', async () => {
    const updated = { ...mockRoutine, name: 'Chest Day (Updated)' }
    const store = setupStore({
      update: vi.fn().mockResolvedValue(updated),
    })
    store.setState({ routines: [mockRoutine] })

    await store.getState().updateRoutine({ id: 'r-1', name: 'Chest Day (Updated)' })

    expect(store.getState().routines[0]!.name).toBe('Chest Day (Updated)')
  })

  it('deletes routine from list', async () => {
    const store = setupStore({
      delete: vi.fn().mockResolvedValue(undefined),
    })
    store.setState({ routines: [mockRoutine] })

    await store.getState().deleteRoutine('r-1')

    expect(store.getState().routines).toHaveLength(0)
  })

  it('assigns and removes routine from plan', async () => {
    const store = setupStore({
      assignToPlan: vi.fn().mockResolvedValue(undefined),
    })
    store.setState({ routines: [mockRoutine] })

    await store.getState().assignRoutineToPlan('r-1', 'plan-99')
    expect(store.getState().routines[0]!.planId).toBe('plan-99')

    await store.getState().removeFromPlan('r-1')
    expect(store.getState().routines[0]!.planId).toBeNull()
  })
})
