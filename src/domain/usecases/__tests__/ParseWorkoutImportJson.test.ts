import { describe, it, expect } from 'vitest'
import { ParseWorkoutImportJson } from '../ParseWorkoutImportJson'
import type { Exercise } from '../../entities/Exercise'

const catalog: Exercise[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Barbell Bench Press',
    nameEn: 'Barbell Bench Press',
    nameEs: 'Press de banca con barra',
    muscleGroups: ['chest'],
    equipment: 'barbell',
    category: 'strength',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Barbell Back Squat',
    nameEn: 'Barbell Back Squat',
    nameEs: 'Sentadilla trasera con barra',
    muscleGroups: ['quadriceps'],
    equipment: 'barbell',
    category: 'strength',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Incline Dumbbell Press',
    nameEn: 'Incline Dumbbell Press',
    nameEs: 'Press inclinado con mancuernas',
    muscleGroups: ['chest'],
    equipment: 'dumbbell',
    category: 'hypertrophy',
  },
]

describe('ParseWorkoutImportJson', () => {
  const parser = new ParseWorkoutImportJson()

  it('parses a valid single routine matched by exact exerciseId', () => {
    const json = JSON.stringify({
      name: 'Upper Push',
      exercises: [
        {
          exerciseId: '00000000-0000-4000-8000-000000000001',
          sets: 4,
          repsMin: 8,
          repsMax: 12,
        },
        {
          exerciseId: '00000000-0000-4000-8000-000000000003',
          sets: 3,
          repsMin: 10,
          repsMax: null,
        },
      ],
    })

    const result = parser.execute(json, catalog)
    expect(result.errors).toEqual([])
    expect(result.warnings).toEqual([])
    expect(result.routines).toHaveLength(1)
    expect(result.routines[0]?.name).toBe('Upper Push')
    expect(result.routines[0]?.exercises[0]).toMatchObject({
      exerciseId: '00000000-0000-4000-8000-000000000001',
      exerciseName: 'Barbell Bench Press',
      matchKind: 'exact_id',
      sets: 4,
      repsMin: 8,
      repsMax: 12,
    })
    expect(result.routines[0]?.exercises[1]?.repsMax).toBeNull()
  })

  it('parses multiple routines and strips markdown code fences', () => {
    const wrapped = [
      '```json',
      JSON.stringify({
        routines: [
          {
            name: 'Day A',
            exercises: [
              {
                exerciseId: '00000000-0000-4000-8000-000000000001',
                sets: 3,
                repsMin: 8,
                repsMax: 8,
              },
            ],
          },
          {
            name: 'Day B',
            exercises: [
              {
                exerciseId: '00000000-0000-4000-8000-000000000002',
                sets: 5,
                repsMin: 5,
              },
            ],
          },
        ],
      }),
      '```',
    ].join('\n')

    const result = parser.execute(wrapped, catalog)
    expect(result.errors).toEqual([])
    expect(result.routines).toHaveLength(2)
    // repsMax === repsMin normalizes to null for clean single-target display
    expect(result.routines[0]?.exercises[0]?.repsMax).toBeNull()
  })

  it('falls back to exact name (including Spanish nameEs) and fuzzy name matching', () => {
    const json = JSON.stringify({
      name: 'Mixed Match',
      exercises: [
        {
          exerciseName: 'Press de banca con barra',
          sets: 3,
          repsMin: 8,
        },
        {
          exerciseName: 'Barbell Back Squats',
          sets: 3,
          repsMin: 6,
        },
      ],
    })

    const result = parser.execute(json, catalog)
    expect(result.errors).toEqual([])
    expect(result.routines[0]?.exercises[0]).toMatchObject({
      exerciseId: '00000000-0000-4000-8000-000000000001',
      matchKind: 'exact_name',
    })
    expect(result.routines[0]?.exercises[1]).toMatchObject({
      exerciseId: '00000000-0000-4000-8000-000000000002',
      matchKind: 'fuzzy_name',
    })
    expect(result.warnings).toHaveLength(1)
  })

  it('returns actionable errors for invalid JSON, bad rep ranges, and unknown exercises', () => {
    expect(parser.execute('{ bad json', catalog).errors[0]).toContain('Invalid JSON syntax')

    const invalidFields = JSON.stringify({
      name: 'Broken Routine',
      exercises: [
        {
          exerciseName: 'Completely Unknown Unicorn Lift',
          sets: 3,
          repsMin: 8,
        },
        {
          exerciseId: '00000000-0000-4000-8000-000000000001',
          sets: 3,
          repsMin: 12,
          repsMax: 8,
        },
      ],
    })

    const result = parser.execute(invalidFields, catalog)
    expect(result.routines).toEqual([])
    expect(result.errors).toHaveLength(2)
    expect(result.errors[0]).toContain('Unknown exercise')
    expect(result.errors[1]).toContain('cannot be less than "repsMin"')
  })
})
