import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RoutineLibraryPage } from '../RoutineLibraryPage'
import { useRoutineStore } from '../../stores/routineStore'
import { usePlanStore } from '../../stores/planStore'
import { useWorkoutSessionStore } from '../../stores/workoutSessionStore'
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

describe('RoutineLibraryPage', () => {
  const mockFetchRoutines = vi.fn().mockResolvedValue(undefined)
  const mockFetchPlans = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    useRoutineStore.setState({
      routines: [],
      loading: false,
      error: null,
      fetchRoutines: mockFetchRoutines,
    })
    usePlanStore.setState({
      plans: [],
      loading: false,
      error: null,
      fetchPlans: mockFetchPlans,
    })
    useWorkoutSessionStore.getState().discard()
  })

  it('renders empty state when library has no routines or plans', async () => {
    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No routines yet')).toBeInTheDocument()
    })

    expect(
      screen.getByText('Create your first routine to start tracking your sets and reps.')
    ).toBeInTheDocument()
  })

  it('renders plans first and loose routines second', () => {
    const mockPlan: Plan = { id: 'p-1', name: 'Upper / Lower Split' }
    const mockPlanRoutine: Routine = {
      id: 'r-1',
      name: 'Upper Power',
      planId: 'p-1',
      exercises: [{ exerciseId: 'e-1', exerciseName: 'Bench Press', orderIndex: 0, sets: 4, repsMin: 6 }],
    }
    const mockLooseRoutine: Routine = {
      id: 'r-2',
      name: 'Full Body Quick',
      planId: null,
      exercises: [{ exerciseId: 'e-2', exerciseName: 'Squat', orderIndex: 0, sets: 3, repsMin: 10 }],
    }

    usePlanStore.setState({ plans: [mockPlan], loading: false })
    useRoutineStore.setState({ routines: [mockPlanRoutine, mockLooseRoutine], loading: false })

    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Upper / Lower Split')).toBeInTheDocument()
    expect(screen.getByText('Upper Power')).toBeInTheDocument()
    expect(screen.getByText('Full Body Quick')).toBeInTheDocument()
  })

  it('clicking start on a routine starts session and navigates to /session', () => {
    const mockRoutine: Routine = {
      id: 'r-1',
      name: 'Push Routine',
      planId: null,
      exercises: [],
    }
    useRoutineStore.setState({ routines: [mockRoutine], loading: false })

    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    // Click the specific "Start" button for the routine card
    const startBtns = screen.getAllByRole('button', { name: /^start$/i })
    fireEvent.click(startBtns[0]!)

    expect(useWorkoutSessionStore.getState().activeSession?.title).toBe('Push Routine')
    expect(mockNavigate).toHaveBeenCalledWith('/session')
  })

  it('clicking start empty starts quick workout and navigates to /session', () => {
    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    const startEmptyBtn = screen.getByRole('button', { name: /start empty/i })
    fireEvent.click(startEmptyBtn)

    expect(useWorkoutSessionStore.getState().activeSession?.title).toBe('Quick Workout')
    expect(mockNavigate).toHaveBeenCalledWith('/session')
  })

  it('clicking routine menu opens context menu, edit navigates to edit page', () => {
    const mockRoutine: Routine = {
      id: 'r-1',
      name: 'Push Routine',
      planId: null,
      exercises: [],
    }
    useRoutineStore.setState({ routines: [mockRoutine], loading: false })

    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    const menuBtn = screen.getByRole('button', { name: /routine menu/i })
    fireEvent.click(menuBtn)

    expect(screen.getByText('Routine options')).toBeInTheDocument()

    const editBtn = screen.getByRole('button', { name: /edit routine/i })
    fireEvent.click(editBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/routines/r-1/edit')
  })

  it('deleting routine from context menu prompts confirmation and removes routine', async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined)
    const mockRoutine: Routine = {
      id: 'r-1',
      name: 'Push Routine',
      planId: null,
      exercises: [],
    }
    useRoutineStore.setState({
      routines: [mockRoutine],
      loading: false,
      deleteRoutine: mockDelete,
    })

    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    const menuBtn = screen.getByRole('button', { name: /routine menu/i })
    fireEvent.click(menuBtn)

    const deleteBtn = screen.getByRole('button', { name: /delete routine/i })
    fireEvent.click(deleteBtn)

    expect(screen.getByText(/are you sure you want to delete this routine/i)).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /confirm delete/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('r-1')
    })
  })

  it('clicking + Plan opens CreatePlanModal and creates plan', async () => {
    const mockCreatePlan = vi.fn().mockResolvedValue({ id: 'p-new', name: 'New Split' })
    usePlanStore.setState({ createPlan: mockCreatePlan })

    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    const addPlanBtn = screen.getByRole('button', { name: /\+ plan/i })
    fireEvent.click(addPlanBtn)

    expect(screen.getByText('New Plan Folder')).toBeInTheDocument()

    const input = screen.getByLabelText(/folder name/i)
    fireEvent.change(input, { target: { value: 'New Split' } })

    const createSubmitBtn = screen.getByRole('button', { name: /^create$/i })
    fireEvent.click(createSubmitBtn)

    await waitFor(() => {
      expect(mockCreatePlan).toHaveBeenCalledWith('New Split')
    })
  })

  it('renames plan via plan folder menu', async () => {
    const mockRenamePlan = vi.fn().mockResolvedValue({ id: 'p-1', name: 'Upper Lower Renamed' })
    const mockPlan: Plan = { id: 'p-1', name: 'Upper / Lower' }
    usePlanStore.setState({ plans: [mockPlan], renamePlan: mockRenamePlan })

    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    const planMenuBtn = screen.getByRole('button', { name: /plan menu/i })
    fireEvent.click(planMenuBtn)

    const renameBtn = screen.getByRole('button', { name: /rename/i })
    fireEvent.click(renameBtn)

    expect(screen.getByText('Rename Plan')).toBeInTheDocument()

    const input = screen.getByLabelText(/folder name/i)
    fireEvent.change(input, { target: { value: 'Upper Lower Renamed' } })

    const saveBtn = screen.getByRole('button', { name: /^save$/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(mockRenamePlan).toHaveBeenCalledWith('p-1', 'Upper Lower Renamed')
    })
  })

  it('deletes plan folder with confirmation', async () => {
    const mockDeletePlan = vi.fn().mockResolvedValue(undefined)
    const mockPlan: Plan = { id: 'p-1', name: 'Upper / Lower' }
    usePlanStore.setState({ plans: [mockPlan], deletePlan: mockDeletePlan })

    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    const planMenuBtn = screen.getByRole('button', { name: /plan menu/i })
    fireEvent.click(planMenuBtn)

    const deleteBtn = screen.getByRole('button', { name: /^delete$/i })
    fireEvent.click(deleteBtn)

    expect(screen.getByText('Delete Plan Folder')).toBeInTheDocument()

    // Click confirm delete in the modal
    const confirmDeleteBtn = screen.getByRole('button', { name: /^delete$/i })
    fireEvent.click(confirmDeleteBtn)

    await waitFor(() => {
      expect(mockDeletePlan).toHaveBeenCalledWith('p-1')
    })
  })

  it('moves routine to plan via routine context menu and AssignPlanModal', async () => {
    const mockAssignToPlan = vi.fn().mockResolvedValue(undefined)
    const mockPlan: Plan = { id: 'p-1', name: 'Upper / Lower' }
    const mockRoutine: Routine = { id: 'r-1', name: 'Bench Focus', planId: null, exercises: [] }

    usePlanStore.setState({ plans: [mockPlan] })
    useRoutineStore.setState({
      routines: [mockRoutine],
      assignRoutineToPlan: mockAssignToPlan,
    })

    render(
      <BrowserRouter>
        <RoutineLibraryPage />
      </BrowserRouter>
    )

    const menuBtn = screen.getByRole('button', { name: /routine menu/i })
    fireEvent.click(menuBtn)

    const moveBtn = screen.getByRole('button', { name: /move to plan/i })
    fireEvent.click(moveBtn)

    expect(screen.getByText('Move to Plan')).toBeInTheDocument()

    // Select the plan button inside AssignPlanModal
    const planButtons = screen.getAllByText('Upper / Lower')
    // The second occurrence is inside the AssignPlanModal
    const targetPlanBtn = planButtons[planButtons.length - 1]!.closest('button')!
    fireEvent.click(targetPlanBtn)

    await waitFor(() => {
      expect(mockAssignToPlan).toHaveBeenCalledWith('r-1', 'p-1')
    })
  })
})
