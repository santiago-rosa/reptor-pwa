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

  it('renders active session title and live elapsed timer', () => {
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
    expect(screen.getByText(/1\. Bench Press/i)).toBeInTheDocument()
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
})
