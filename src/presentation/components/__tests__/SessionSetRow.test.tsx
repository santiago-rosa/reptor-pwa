import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionSetRow } from '../SessionSetRow'
import type { SessionSet } from '@/domain/entities/WorkoutSession'

describe('SessionSetRow', () => {
  const baseSet: SessionSet = {
    id: 'set-1',
    sessionExerciseId: 'se-1',
    setNumber: 1,
    weightKg: 60,
    reps: 10,
    isCompleted: false,
  }

  it('renders set number, weight, reps, and toggle button', () => {
    render(
      <SessionSetRow
        set={baseSet}
        onUpdate={vi.fn()}
        onToggleLogged={vi.fn()}
      />
    )

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByLabelText(/set 1 weight/i)).toHaveValue(60)
    expect(screen.getByLabelText(/set 1 reps/i)).toHaveValue(10)
  })

  it('triggers onUpdate when weight changes', () => {
    const mockUpdate = vi.fn()
    render(
      <SessionSetRow
        set={baseSet}
        onUpdate={mockUpdate}
        onToggleLogged={vi.fn()}
      />
    )

    const weightInput = screen.getByLabelText(/set 1 weight/i)
    fireEvent.change(weightInput, { target: { value: '65' } })

    expect(mockUpdate).toHaveBeenCalledWith({ weightKg: 65 })
  })

  it('triggers onUpdate when reps changes', () => {
    const mockUpdate = vi.fn()
    render(
      <SessionSetRow
        set={baseSet}
        onUpdate={mockUpdate}
        onToggleLogged={vi.fn()}
      />
    )

    const repsInput = screen.getByLabelText(/set 1 reps/i)
    fireEvent.change(repsInput, { target: { value: '12' } })

    expect(mockUpdate).toHaveBeenCalledWith({ reps: 12 })
  })

  it('triggers onToggleLogged when checkmark is clicked', () => {
    const mockToggle = vi.fn()
    render(
      <SessionSetRow
        set={baseSet}
        onUpdate={vi.fn()}
        onToggleLogged={mockToggle}
      />
    )

    const checkBtn = screen.getByRole('button', { name: /toggle set 1 logged/i })
    fireEvent.click(checkBtn)

    expect(mockToggle).toHaveBeenCalled()
  })

  it('shows green background styling when isCompleted is true', () => {
    const completedSet: SessionSet = { ...baseSet, isCompleted: true }
    render(
      <SessionSetRow
        set={completedSet}
        onUpdate={vi.fn()}
        onToggleLogged={vi.fn()}
      />
    )

    const row = screen.getByTestId('set-row-1')
    expect(row).toHaveClass('bg-emerald-950/30')

    const checkBtn = screen.getByRole('button', { name: /toggle set 1 logged/i })
    expect(checkBtn).toHaveClass('bg-emerald-500')
  })
})
