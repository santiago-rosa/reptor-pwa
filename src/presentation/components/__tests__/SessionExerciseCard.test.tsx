import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionExerciseCard } from '../SessionExerciseCard'
import type { SessionExercise } from '@/domain/entities/WorkoutSession'

describe('SessionExerciseCard', () => {
  const baseExercise: SessionExercise = {
    id: 'se-1',
    sessionId: 'session-1',
    exerciseId: 'ex-1',
    exerciseName: 'Barbell Bench Press',
    orderIndex: 0,
    sets: [
      {
        id: 'set-1',
        sessionExerciseId: 'se-1',
        setNumber: 1,
        weightKg: 80,
        reps: 8,
        isCompleted: true,
      },
      {
        id: 'set-2',
        sessionExerciseId: 'se-1',
        setNumber: 2,
        weightKg: 80,
        reps: 8,
        isCompleted: false,
      },
    ],
  }

  it('renders exercise title, sets summary, column headers, and rows', () => {
    render(
      <SessionExerciseCard
        exercise={baseExercise}
        onUpdateSet={vi.fn()}
        onToggleSetLogged={vi.fn()}
        onAddSet={vi.fn()}
        onRemoveLastSet={vi.fn()}
      />
    )

    expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument()
    expect(screen.getByText('1 / 2 completed')).toBeInTheDocument()
    expect(screen.getByText('Set')).toBeInTheDocument()
    expect(screen.getByText('Kg')).toBeInTheDocument()
    expect(screen.getByText('Reps')).toBeInTheDocument()
    expect(screen.getByText('RPE')).toBeInTheDocument()
    expect(screen.getByTestId('set-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('set-row-2')).toBeInTheDocument()
  })

  it('clicking Add Set triggers onAddSet', () => {
    const mockAddSet = vi.fn()
    render(
      <SessionExerciseCard
        exercise={baseExercise}
        onUpdateSet={vi.fn()}
        onToggleSetLogged={vi.fn()}
        onAddSet={mockAddSet}
        onRemoveLastSet={vi.fn()}
      />
    )

    const addSetBtn = screen.getByRole('button', { name: /add set/i })
    fireEvent.click(addSetBtn)

    expect(mockAddSet).toHaveBeenCalled()
  })

  it('clicking Remove last set triggers onRemoveLastSet', () => {
    const mockRemoveLastSet = vi.fn()
    render(
      <SessionExerciseCard
        exercise={baseExercise}
        onUpdateSet={vi.fn()}
        onToggleSetLogged={vi.fn()}
        onAddSet={vi.fn()}
        onRemoveLastSet={mockRemoveLastSet}
      />
    )

    const removeBtn = screen.getByRole('button', { name: /remove last set/i })
    fireEvent.click(removeBtn)

    expect(mockRemoveLastSet).toHaveBeenCalled()
  })

  it('hides Remove last set button when only 1 set exists', () => {
    const singleSetExercise: SessionExercise = {
      ...baseExercise,
      sets: [baseExercise.sets[0]!],
    }

    render(
      <SessionExerciseCard
        exercise={singleSetExercise}
        onUpdateSet={vi.fn()}
        onToggleSetLogged={vi.fn()}
        onAddSet={vi.fn()}
        onRemoveLastSet={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /remove last set/i })).not.toBeInTheDocument()
  })
})
