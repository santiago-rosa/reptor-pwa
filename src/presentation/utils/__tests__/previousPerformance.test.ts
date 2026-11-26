import { describe, it, expect } from 'vitest'
import { getPreviousExerciseSets, formatPreviousSetHint } from '../previousPerformance'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

describe('previousPerformance', () => {
  const olderSession: WorkoutSession = {
    id: 's-old',
    title: 'Older Push',
    startedAt: '2026-11-10T10:00:00Z',
    finishedAt: '2026-11-10T11:00:00Z',
    exercises: [
      {
        id: 'se-old',
        exerciseId: 'ex-bench',
        orderIndex: 0,
        sets: [
          { setNumber: 1, weightKg: 75, reps: 8, rpe: 7, isCompleted: true },
          { setNumber: 2, weightKg: 75, reps: 8, rpe: 8, isCompleted: true },
        ],
      },
    ],
  }

  const newerSession: WorkoutSession = {
    id: 's-new',
    title: 'Newer Push',
    startedAt: '2026-11-18T10:00:00Z',
    finishedAt: '2026-11-18T11:00:00Z',
    exercises: [
      {
        id: 'se-new',
        exerciseId: 'ex-bench',
        orderIndex: 0,
        sets: [
          { setNumber: 1, weightKg: 80, reps: 6, rpe: 7, isCompleted: true },
          { setNumber: 2, weightKg: 80, reps: 6, rpe: null, isCompleted: true },
          { setNumber: 3, weightKg: 80, reps: 5, isCompleted: false }, // skipped
        ],
      },
    ],
  }

  const unfinishedSession: WorkoutSession = {
    id: 's-unfinished',
    title: 'Unfinished',
    startedAt: '2026-11-20T10:00:00Z',
    finishedAt: null,
    exercises: [
      {
        id: 'se-unf',
        exerciseId: 'ex-bench',
        orderIndex: 0,
        sets: [{ setNumber: 1, weightKg: 99, reps: 10, isCompleted: true }],
      },
    ],
  }

  it('returns completed sets from the most recent finished session for the exercise', () => {
    const map = getPreviousExerciseSets(
      [olderSession, unfinishedSession, newerSession],
      'ex-bench',
      'current-session'
    )

    expect(map.size).toBe(2)
    expect(map.get(1)?.weightKg).toBe(80)
    expect(map.get(1)?.rpe).toBe(7)
    expect(map.get(2)?.weightKg).toBe(80)
    expect(map.get(3)).toBeUndefined()
    expect(map.get(4)).toBeUndefined()
  })

  it('excludes the current session id if present', () => {
    const map = getPreviousExerciseSets(
      [olderSession, newerSession],
      'ex-bench',
      's-new'
    )

    expect(map.get(1)?.weightKg).toBe(75)
  })

  it('returns empty map when exercise has no previous completed sets', () => {
    const map = getPreviousExerciseSets([olderSession, newerSession], 'ex-squat')
    expect(map.size).toBe(0)
  })

  it('formats previous set hint with and without RPE', () => {
    expect(
      formatPreviousSetHint({ setNumber: 1, weightKg: 80, reps: 6, rpe: 7, isCompleted: true })
    ).toBe('80kg × 6 @ RPE 7')

    expect(
      formatPreviousSetHint({ setNumber: 2, weightKg: 80, reps: 6, rpe: null, isCompleted: true })
    ).toBe('80kg × 6')

    expect(formatPreviousSetHint(undefined)).toBeNull()
  })
})
