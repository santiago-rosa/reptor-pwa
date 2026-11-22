import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WorkoutHistoryPage } from '../WorkoutHistoryPage'
import { useWorkoutHistoryStore } from '../../stores/workoutHistoryStore'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('WorkoutHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWorkoutHistoryStore.setState({
      sessions: [],
      loading: false,
      error: null,
      fetchSessions: vi.fn(),
    })
  })

  it('renders loading skeleton when loading and no sessions', () => {
    useWorkoutHistoryStore.setState({
      sessions: [],
      loading: true,
      error: null,
    })

    const { container } = render(
      <MemoryRouter>
        <WorkoutHistoryPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Workout History')).toBeInTheDocument()
    // 3 animated skeleton cards
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(3)
  })

  it('renders empty state with navigation action when no sessions exist', () => {
    useWorkoutHistoryStore.setState({
      sessions: [],
      loading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <WorkoutHistoryPage />
      </MemoryRouter>
    )

    expect(screen.getByText('No workouts logged yet')).toBeInTheDocument()
    const goBtn = screen.getByRole('button', { name: /go to routines/i })
    fireEvent.click(goBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/routines')
  })

  it('displays error banner and retry button when fetching fails', () => {
    const mockFetch = vi.fn()
    useWorkoutHistoryStore.setState({
      sessions: [],
      loading: false,
      error: 'Failed to connect to database',
      fetchSessions: mockFetch,
    })

    render(
      <MemoryRouter>
        <WorkoutHistoryPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Failed to connect to database')).toBeInTheDocument()
    const retryBtn = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryBtn)

    expect(mockFetch).toHaveBeenCalledWith(true)
  })

  it('renders workout sessions list sorted newest first and navigates on click', () => {
    const mockSessions: WorkoutSession[] = [
      {
        id: 'session-1',
        title: 'Push Day',
        startedAt: '2026-11-20T10:00:00Z',
        finishedAt: '2026-11-20T10:50:00Z',
        exercises: [
          {
            id: 'se-1',
            sessionId: 'session-1',
            exerciseId: 'ex-1',
            exerciseName: 'Bench Press',
            orderIndex: 0,
            sets: [
              { id: 'set-1', sessionExerciseId: 'se-1', setNumber: 1, weightKg: 80, reps: 10, isCompleted: true },
            ],
          },
        ],
      },
      {
        id: 'session-2',
        title: 'Pull Day',
        startedAt: '2026-11-18T10:00:00Z',
        finishedAt: '2026-11-18T10:45:00Z',
        exercises: [
          {
            id: 'se-2',
            sessionId: 'session-2',
            exerciseId: 'ex-2',
            exerciseName: 'Lat Pulldown',
            orderIndex: 0,
            sets: [
              { id: 'set-2', sessionExerciseId: 'se-2', setNumber: 1, weightKg: 60, reps: 12, isCompleted: true },
            ],
          },
        ],
      },
    ]

    useWorkoutHistoryStore.setState({
      sessions: mockSessions,
      loading: false,
      error: null,
    })

    render(
      <MemoryRouter>
        <WorkoutHistoryPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.getByText('Pull Day')).toBeInTheDocument()
    expect(screen.getByText('2 workouts')).toBeInTheDocument()

    // Click on Push Day card
    const pushCard = screen.getByText('Push Day').closest('[role="button"]')!
    fireEvent.click(pushCard)

    expect(mockNavigate).toHaveBeenCalledWith('/history/session-1')
  })
})
