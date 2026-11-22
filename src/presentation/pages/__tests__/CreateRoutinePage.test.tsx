import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CreateRoutinePage } from '../CreateRoutinePage'
import { useRoutineDraftStore } from '../../stores/routineDraftStore'
import { useRoutineStore } from '../../stores/routineStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CreateRoutinePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRoutineDraftStore.getState().reset()
  })

  it('save button is disabled when name is empty or exercise count is 0', () => {
    render(
      <BrowserRouter>
        <CreateRoutinePage />
      </BrowserRouter>
    )

    const saveButtons = screen.getAllByRole('button', { name: /save/i })
    expect(saveButtons[0]).toBeDisabled()
    expect(saveButtons[1]).toBeDisabled()

    // Enter name only
    fireEvent.change(screen.getByPlaceholderText(/chest & triceps/i), {
      target: { value: 'Push Day' },
    })

    expect(saveButtons[0]).toBeDisabled()
  })

  it('save button is enabled when name and exercises are provided', () => {
    useRoutineDraftStore.getState().setName('Leg Day')
    useRoutineDraftStore.getState().addExercises([{ id: 'ex-1', name: 'Barbell Squat' }])

    render(
      <BrowserRouter>
        <CreateRoutinePage />
      </BrowserRouter>
    )

    const saveButtons = screen.getAllByRole('button', { name: /save/i })
    expect(saveButtons[0]).not.toBeDisabled()
    expect(saveButtons[1]).not.toBeDisabled()
  })

  it('sets counter enforces 1 to 10 limits', () => {
    useRoutineDraftStore.getState().setName('Chest')
    useRoutineDraftStore.getState().addExercises([{ id: 'ex-bench', name: 'Bench Press' }])

    render(
      <BrowserRouter>
        <CreateRoutinePage />
      </BrowserRouter>
    )

    const decBtn = screen.getByRole('button', { name: /decrease sets/i })
    const incBtn = screen.getByRole('button', { name: /increase sets/i })

    // Defaults to 3 sets
    expect(screen.getByText('3')).toBeInTheDocument()

    // Click decrease twice -> 1 set, then decrease should be disabled
    fireEvent.click(decBtn)
    fireEvent.click(decBtn)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(decBtn).toBeDisabled()

    // Increase up to 10
    for (let i = 0; i < 9; i++) {
      fireEvent.click(incBtn)
    }
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(incBtn).toBeDisabled()
  })

  it('saves routine successfully and navigates back', async () => {
    const mockCreateRoutine = vi.fn().mockResolvedValue({ id: 'r-created', name: 'Arm Blitz', exercises: [] })
    useRoutineStore.setState({ createRoutine: mockCreateRoutine })

    useRoutineDraftStore.getState().setName('Arm Blitz')
    useRoutineDraftStore.getState().addExercises([{ id: 'ex-curl', name: 'Bicep Curl' }])

    render(
      <BrowserRouter>
        <CreateRoutinePage />
      </BrowserRouter>
    )

    const bottomSaveBtn = screen.getByRole('button', { name: /save routine/i })
    fireEvent.click(bottomSaveBtn)

    await waitFor(() => {
      expect(mockCreateRoutine).toHaveBeenCalledWith({
        name: 'Arm Blitz',
        planId: null,
        exercises: [
          expect.objectContaining({
            exerciseId: 'ex-curl',
            orderIndex: 0,
            sets: 3,
            repsMin: 8,
          }),
        ],
      })
      expect(mockNavigate).toHaveBeenCalledWith('/routines')
    })
  })
})
