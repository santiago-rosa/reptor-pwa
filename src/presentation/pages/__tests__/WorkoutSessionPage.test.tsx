import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { WorkoutSessionPage, formatTimer } from '../WorkoutSessionPage'
import { useWorkoutSessionStore } from '../../stores/workoutSessionStore'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('formatTimer', () => {
  it('formats seconds into MM:SS format', () => {
    expect(formatTimer(0)).toBe('00:00')
    expect(formatTimer(59)).toBe('00:59')
    expect(formatTimer(65)).toBe('01:05')
    expect(formatTimer(600)).toBe('10:00')
  })

  it('formats hours into HH:MM:SS format when over 1 hour', () => {
    expect(formatTimer(3600)).toBe('01:00:00')
    expect(formatTimer(3665)).toBe('01:01:05')
  })
})

describe('WorkoutSessionPage', () => {
  const baseSession: WorkoutSession = {
    id: 'session-123',
    title: 'Chest & Back Workout',
    startedAt: new Date(Date.now() - 125 * 1000).toISOString(), // 2 minutes 5 seconds ago
    exercises: [
      {
        id: 'se-1',
        sessionId: 'session-123',
        exerciseId: 'ex-1',
        exerciseName: 'Bench Press',
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
        ],
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useWorkoutSessionStore.getState().discard()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('redirects to /routines if active session is null', () => {
    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/routines', { replace: true })
  })

  it('renders active session title, live elapsed timer, and exercise cards', () => {
    useWorkoutSessionStore.setState({ activeSession: baseSession })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Chest & Back Workout')).toBeInTheDocument()
    expect(screen.getByTestId('session-timer')).toHaveTextContent('02:05')
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByTestId('set-row-1')).toBeInTheDocument()
  })

  it('ticks timer forward every second', () => {
    vi.useFakeTimers()
    const now = 1000000
    vi.setSystemTime(now)

    const sessionWithKnownStart: WorkoutSession = {
      ...baseSession,
      startedAt: new Date(now).toISOString(),
    }
    useWorkoutSessionStore.setState({ activeSession: sessionWithKnownStart })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('session-timer')).toHaveTextContent('00:00')

    // Advance 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('session-timer')).toHaveTextContent('00:05')
  })

  it('updates set weight and reps in the store when inputs change', () => {
    useWorkoutSessionStore.setState({ activeSession: baseSession })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    const weightInput = screen.getByLabelText(/set 1 weight/i)
    fireEvent.change(weightInput, { target: { value: '90' } })

    const repsInput = screen.getByLabelText(/set 1 reps/i)
    fireEvent.change(repsInput, { target: { value: '10' } })

    const updatedSet = useWorkoutSessionStore.getState().activeSession?.exercises[0]?.sets[0]
    expect(updatedSet?.weightKg).toBe(90)
    expect(updatedSet?.reps).toBe(10)
  })

  it('toggles set completion status in store when check button is clicked', () => {
    useWorkoutSessionStore.setState({ activeSession: baseSession })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    const checkBtn = screen.getByRole('button', { name: /toggle set 1 logged/i })
    fireEvent.click(checkBtn)

    const updatedSet = useWorkoutSessionStore.getState().activeSession?.exercises[0]?.sets[0]
    expect(updatedSet?.isCompleted).toBe(false)
  })

  it('adds and removes sets via store actions', () => {
    useWorkoutSessionStore.setState({ activeSession: baseSession })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    const addSetBtn = screen.getByRole('button', { name: /add set/i })
    fireEvent.click(addSetBtn)

    expect(screen.getByTestId('set-row-2')).toBeInTheDocument()
    expect(useWorkoutSessionStore.getState().activeSession?.exercises[0]?.sets).toHaveLength(2)

    const removeBtn = screen.getByRole('button', { name: /remove last set/i })
    fireEvent.click(removeBtn)

    expect(screen.queryByTestId('set-row-2')).not.toBeInTheDocument()
    expect(useWorkoutSessionStore.getState().activeSession?.exercises[0]?.sets).toHaveLength(1)
  })

  it('prompts confirmation when Discard is clicked and discards session on confirm', () => {
    useWorkoutSessionStore.setState({ activeSession: baseSession })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    const discardBtn = screen.getByRole('button', { name: /^discard$/i })
    fireEvent.click(discardBtn)

    expect(screen.getByText('Discard Workout?')).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /discard workout/i })
    fireEvent.click(confirmBtn)

    expect(useWorkoutSessionStore.getState().activeSession).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/routines', { replace: true })
  })

  it('cancels discard when cancel is clicked in confirmation modal', () => {
    useWorkoutSessionStore.setState({ activeSession: baseSession })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    const discardBtn = screen.getByRole('button', { name: /^discard$/i })
    fireEvent.click(discardBtn)

    expect(screen.getByText('Discard Workout?')).toBeInTheDocument()

    const cancelBtn = screen.getByRole('button', { name: /^cancel$/i })
    fireEvent.click(cancelBtn)

    expect(screen.queryByText('Discard Workout?')).not.toBeInTheDocument()
    expect(useWorkoutSessionStore.getState().activeSession).not.toBeNull()
  })

  it('navigates to exercise picker in session mode when + Add Exercise is clicked', () => {
    useWorkoutSessionStore.setState({ activeSession: baseSession })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    const addExerciseBtn = screen.getByRole('button', { name: /\+ add exercise/i })
    fireEvent.click(addExerciseBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/exercises/pick?mode=session')
  })

  it('renders empty session placeholder with Add Exercise button when session has 0 exercises', () => {
    const emptySession: WorkoutSession = {
      ...baseSession,
      exercises: [],
    }
    useWorkoutSessionStore.setState({ activeSession: emptySession })

    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<WorkoutSessionPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('No exercises in this session.')).toBeInTheDocument()

    const addExerciseBtn = screen.getByRole('button', { name: /\+ add exercise/i })
    fireEvent.click(addExerciseBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/exercises/pick?mode=session')
  })
})
