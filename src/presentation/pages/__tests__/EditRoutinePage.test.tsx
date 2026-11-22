import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { EditRoutinePage } from '../EditRoutinePage'
import { useRoutineStore } from '../../stores/routineStore'
import { useRoutineDraftStore } from '../../stores/routineDraftStore'
import { usePlanStore } from '../../stores/planStore'
import type { Routine } from '@/domain/entities/Routine'
import type { Plan } from '@/domain/entities/Plan'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('EditRoutinePage', () => {
  const mockUpdateRoutine = vi.fn()
  const mockDeleteRoutine = vi.fn()
  const mockFetchRoutines = vi.fn().mockResolvedValue(undefined)
  const mockFetchPlans = vi.fn().mockResolvedValue(undefined)

  const existingRoutine: Routine = {
    id: 'routine-123',
    name: 'Chest & Shoulders',
    planId: 'plan-1',
    exercises: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        orderIndex: 0,
        sets: 4,
        repsMin: 8,
        repsMax: 10,
      },
    ],
  }

  const existingPlans: Plan[] = [
    { id: 'plan-1', name: 'Hypertrophy Block' },
    { id: 'plan-2', name: 'Strength Block' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    useRoutineDraftStore.getState().reset()

    useRoutineStore.setState({
      routines: [existingRoutine],
      loading: false,
      error: null,
      fetchRoutines: mockFetchRoutines,
      updateRoutine: mockUpdateRoutine.mockResolvedValue({
        ...existingRoutine,
        name: 'Updated Routine Name',
      }),
      deleteRoutine: mockDeleteRoutine.mockResolvedValue(undefined),
    })

    usePlanStore.setState({
      plans: existingPlans,
      loading: false,
      error: null,
      fetchPlans: mockFetchPlans,
    })
  })

  it('pre-fills existing routine name, exercises, sets, reps, and plan on mount', () => {
    render(
      <MemoryRouter initialEntries={['/routines/routine-123/edit']}>
        <Routes>
          <Route path="/routines/:id/edit" element={<EditRoutinePage />} />
        </Routes>
      </MemoryRouter>
    )

    const nameInput = screen.getByLabelText(/routine name/i) as HTMLInputElement
    expect(nameInput.value).toBe('Chest & Shoulders')

    const planSelect = screen.getByLabelText(/plan folder/i) as HTMLSelectElement
    expect(planSelect.value).toBe('plan-1')

    expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByDisplayValue('8')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
  })

  it('updates routine and submits via routineStore.updateRoutine', async () => {
    render(
      <MemoryRouter initialEntries={['/routines/routine-123/edit']}>
        <Routes>
          <Route path="/routines/:id/edit" element={<EditRoutinePage />} />
        </Routes>
      </MemoryRouter>
    )

    const nameInput = screen.getByLabelText(/routine name/i)
    fireEvent.change(nameInput, { target: { value: 'Chest Heavy Day' } })

    const saveButton = screen.getByRole('button', { name: /^save$/i })
    expect(saveButton).not.toBeDisabled()

    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateRoutine).toHaveBeenCalledWith({
        id: 'routine-123',
        name: 'Chest Heavy Day',
        planId: 'plan-1',
        exercises: [
          {
            exerciseId: 'ex-1',
            orderIndex: 0,
            sets: 4,
            repsMin: 8,
            repsMax: 10,
          },
        ],
      })
    })

    expect(mockNavigate).toHaveBeenCalledWith('/routines')
  })

  it('prompts delete confirmation and deletes routine via deleteRoutine', async () => {
    render(
      <MemoryRouter initialEntries={['/routines/routine-123/edit']}>
        <Routes>
          <Route path="/routines/:id/edit" element={<EditRoutinePage />} />
        </Routes>
      </MemoryRouter>
    )

    const deleteBtn = screen.getByRole('button', { name: /delete routine/i })
    fireEvent.click(deleteBtn)

    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockDeleteRoutine).toHaveBeenCalledWith('routine-123')
    })

    expect(mockNavigate).toHaveBeenCalledWith('/routines')
  })
})
