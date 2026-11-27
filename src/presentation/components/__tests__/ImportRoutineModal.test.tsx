import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImportRoutineModal } from '../ImportRoutineModal'
import type { Exercise } from '@/domain/entities/Exercise'

const catalog: Exercise[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Barbell Bench Press',
    muscleGroups: ['chest'],
    equipment: 'barbell',
    category: 'strength',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Barbell Back Squat',
    muscleGroups: ['quadriceps'],
    equipment: 'barbell',
    category: 'strength',
  },
]

describe('ImportRoutineModal', () => {
  it('validates pasted JSON, shows preview, and saves routine', async () => {
    const onSaveRoutines = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ImportRoutineModal
        isOpen={true}
        exercises={catalog}
        onClose={onClose}
        onSaveRoutines={onSaveRoutines}
      />,
    )

    const textarea = screen.getByLabelText('Routine JSON')
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          name: 'Push Day',
          exercises: [
            {
              exerciseId: '00000000-0000-4000-8000-000000000001',
              sets: 4,
              repsMin: 8,
              repsMax: 12,
            },
          ],
        }),
      },
    })

    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument()
    expect(screen.getByText('4 × 8–12 reps')).toBeInTheDocument()

    const saveBtn = screen.getByRole('button', { name: 'Save Routine' })
    expect(saveBtn).toBeEnabled()
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(onSaveRoutines).toHaveBeenCalledWith([
        {
          name: 'Push Day',
          exercises: [
            {
              exerciseId: '00000000-0000-4000-8000-000000000001',
              orderIndex: 0,
              sets: 4,
              repsMin: 8,
              repsMax: 12,
            },
          ],
        },
      ])
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows validation errors and keeps save disabled for invalid JSON or unknown exercises', () => {
    render(
      <ImportRoutineModal
        isOpen={true}
        exercises={catalog}
        onClose={vi.fn()}
        onSaveRoutines={vi.fn()}
      />,
    )

    const textarea = screen.getByLabelText('Routine JSON')
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          name: 'Bad Routine',
          exercises: [
            {
              exerciseName: 'Nonexistent Exercise XYZ',
              sets: 3,
              repsMin: 10,
            },
          ],
        }),
      },
    })

    expect(screen.getByText(/Validation Errors/)).toBeInTheDocument()
    expect(screen.getByText(/Unknown exercise/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Routine' })).toBeDisabled()
  })

  it('supports fuzzy matching and Save & Start for a single routine', async () => {
    const onSaveAndStart = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <ImportRoutineModal
        isOpen={true}
        exercises={catalog}
        onClose={onClose}
        onSaveRoutines={vi.fn()}
        onSaveAndStartRoutine={onSaveAndStart}
      />,
    )

    const textarea = screen.getByLabelText('Routine JSON')
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          name: 'Leg Day',
          exercises: [
            {
              exerciseName: 'Barbell Back Squats',
              sets: 3,
              repsMin: 5,
            },
          ],
        }),
      },
    })

    expect(screen.getByText('Fuzzy')).toBeInTheDocument()
    expect(screen.getByText('3 × 5 reps')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save & Start' }))

    await waitFor(() => {
      expect(onSaveAndStart).toHaveBeenCalledWith({
        name: 'Leg Day',
        exercises: [
          {
            exerciseId: '00000000-0000-4000-8000-000000000002',
            orderIndex: 0,
            sets: 3,
            repsMin: 5,
            repsMax: null,
          },
        ],
      })
      expect(onClose).toHaveBeenCalled()
    })
  })
})
