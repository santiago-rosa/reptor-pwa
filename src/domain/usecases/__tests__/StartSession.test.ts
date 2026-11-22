import { describe, it, expect } from 'vitest'
import { StartSession } from '../StartSession'
import type { Routine } from '../../entities/Routine'

describe('StartSession', () => {
  it('creates an in-memory quick workout when no routine is provided', () => {
    const useCase = new StartSession()
    const session = useCase.execute()

    expect(session.id).toBeDefined()
    expect(session.title).toBe('Quick Workout')
    expect(session.routineId).toBeNull()
    expect(session.startedAt).toBeInstanceOf(Date)
    expect(session.finishedAt).toBeNull()
    expect(session.exercises).toHaveLength(0)
  })

  it('pre-populates exercises and sets when routine is provided', () => {
    const mockRoutine: Routine = {
      id: 'routine-1',
      name: 'Push Day',
      userId: 'u-1',
      exercises: [
        {
          id: 're-1',
          exerciseId: 'ex-bench',
          exerciseName: 'Bench Press',
          orderIndex: 0,
          sets: 3,
          repsMin: 8,
          repsMax: 10,
        },
      ],
    }

    const useCase = new StartSession()
    const session = useCase.execute({ routine: mockRoutine, userId: 'u-1' })

    expect(session.title).toBe('Push Day')
    expect(session.routineId).toBe('routine-1')
    expect(session.userId).toBe('u-1')
    expect(session.exercises).toHaveLength(1)
    expect(session.exercises[0]!.exerciseName).toBe('Bench Press')
    expect(session.exercises[0]!.sets).toHaveLength(3)
    expect(session.exercises[0]!.sets[0]!.reps).toBe(8)
    expect(session.exercises[0]!.sets[0]!.isCompleted).toBe(false)
  })
})
