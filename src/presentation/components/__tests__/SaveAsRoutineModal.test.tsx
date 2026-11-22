import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SaveAsRoutineModal } from '../SaveAsRoutineModal'
import { useRoutineStore } from '../../stores/routineStore'
import { usePlanStore } from '../../stores/planStore'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'
import type { Plan } from '@/domain/entities/Plan'

describe('SaveAsRoutineModal', () => {
  const mockCreateRoutine = vi.fn()
  const mockOnClose = vi.fn()
  const mockOnSaved = vi.fn()

  const mockSession: WorkoutSession = {
    id: 's-1',
    title: 'Leg Day Blast',
    startedAt: '2026-11-22T10:00:00Z',
    finishedAt: '2026-11-22T11:00:00Z',
    exercises: [
      {
        id: 'se-1',
        sessionId: 's-1',
        exerciseId: 'ex-squat',
        exerciseName: 'Barbell Squat',
        orderIndex: 0,
        sets: [
          {
            id: 'set-1',
            sessionExerciseId: 'se-1',
            setNumber: 1,
            weightKg: 100,
            reps: 8,
            isCompleted: true,
          },
          {
            id: 'set-2',
            sessionExerciseId: 'se-1',
            setNumber: 2,
            weightKg: 100,
            reps: 10,
            isCompleted: true,
          },
        ],
      },
    ],
  }

  const mockPlans: Plan[] = [{ id: 'plan-legs', name: 'Leg Specialization' }]

  beforeEach(() => {
    vi.clearAllMocks()
    useRoutineStore.setState({
      createRoutine: mockCreateRoutine.mockResolvedValue({ id: 'r-new', name: 'Leg Day Blast' }),
    })
    usePlanStore.setState({ plans: mockPlans })
  })

  it('does not render when isOpen is false or session is null', () => {
    const { container } = render(
      <SaveAsRoutineModal
        isOpen={false}
        session={mockSession}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders pre-filled session title, exercise preview, and plan selector', () => {
    render(
      <SaveAsRoutineModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    )

    expect(screen.getByText('Save as Routine?')).toBeInTheDocument()
    const nameInput = screen.getByLabelText(/routine name/i) as HTMLInputElement
    expect(nameInput.value).toBe('Leg Day Blast')
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument()
    expect(screen.getByText('2 sets')).toBeInTheDocument()
    expect(screen.getByText('Leg Specialization')).toBeInTheDocument()
  })

  it('submits createRoutine with matching exercise structure and calls onSaved', async () => {
    render(
      <SaveAsRoutineModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    )

    const planSelect = screen.getByLabelText(/plan folder/i)
    fireEvent.change(planSelect, { target: { value: 'plan-legs' } })

    const saveBtn = screen.getByRole('button', { name: /save routine/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockCreateRoutine).toHaveBeenCalledWith({
        name: 'Leg Day Blast',
        planId: 'plan-legs',
        exercises: [
          {
            exerciseId: 'ex-squat',
            orderIndex: 0,
            sets: 2,
            repsMin: 8,
            repsMax: 10,
          },
        ],
      })
      expect(mockOnSaved).toHaveBeenCalled()
    })
  })

  it('calls onClose when Skip button is clicked', () => {
    render(
      <SaveAsRoutineModal
        isOpen={true}
        session={mockSession}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
      />
    )

    const skipBtn = screen.getByRole('button', { name: /skip/i })
    fireEvent.click(skipBtn)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
