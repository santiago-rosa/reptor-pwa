import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SessionDetailPage } from '../SessionDetailPage'
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

describe('SessionDetailPage', () => {
  const sampleSession: WorkoutSession = {
    id: 'session-123',
    title: 'Leg Day Annihilation',
    startedAt: '2026-11-20T10:00:00Z',
    finishedAt: '2026-11-20T11:00:00Z',
    exercises: [
      {
        id: 'se-1',
        sessionId: 'session-123',
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Squat',
        orderIndex: 0,
        sets: [
          {
            id: 'set-1',
            sessionExerciseId: 'se-1',
            setNumber: 1,
            weightKg: 100,
            reps: 10,
            rpe: 8.5,
            isCompleted: true,
          },
          {
            id: 'set-2',
            sessionExerciseId: 'se-1',
            setNumber: 2,
            weightKg: 110,
            reps: 8,
            isCompleted: true,
          },
          {
            id: 'set-3',
            sessionExerciseId: 'se-1',
            setNumber: 3,
            weightKg: 120,
            reps: 5,
            isCompleted: false,
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useWorkoutHistoryStore.setState({
      sessions: [],
      selectedSession: null,
      loading: false,
      error: null,
      fetchSessionById: vi.fn(),
      clearSelectedSession: vi.fn(),
    })
  })

  it('renders loading skeleton when fetching', () => {
    useWorkoutHistoryStore.setState({
      selectedSession: null,
      loading: true,
    })

    const { container } = render(
      <MemoryRouter initialEntries={['/history/session-123']}>
        <Routes>
          <Route path="/history/:id" element={<SessionDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders not found state when session does not exist', () => {
    useWorkoutHistoryStore.setState({
      selectedSession: null,
      loading: false,
    })

    render(
      <MemoryRouter initialEntries={['/history/unknown']}>
        <Routes>
          <Route path="/history/:id" element={<SessionDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Workout Session Not Found')).toBeInTheDocument()
    const backBtn = screen.getByRole('button', { name: /back to history/i })
    fireEvent.click(backBtn)

    expect(mockNavigate).toHaveBeenCalledWith('/history')
  })

  it('renders full session details including metrics and exercise sets', () => {
    useWorkoutHistoryStore.setState({
      selectedSession: sampleSession,
      loading: false,
    })

    render(
      <MemoryRouter initialEntries={['/history/session-123']}>
        <Routes>
          <Route path="/history/:id" element={<SessionDetailPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Leg Day Annihilation')).toBeInTheDocument()
    expect(screen.getByText('1h')).toBeInTheDocument() // 60 min
    expect(screen.getByText('2')).toBeInTheDocument() // 2 completed sets
    expect(screen.getAllByText(/1,880 kg/i)).toHaveLength(2) // 100*10 + 110*8 = 1880 (top summary + exercise header)
    expect(screen.getByText('Barbell Squat')).toBeInTheDocument()

    // Check set rows
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('#3')).toBeInTheDocument()
    expect(screen.getByText('RPE')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
    expect(screen.getAllByText('Done')).toHaveLength(2)
    expect(screen.getByText('Skipped')).toBeInTheDocument()

    // Test back button
    const backBtn = screen.getByRole('button', { name: /back to history/i })
    fireEvent.click(backBtn)
    expect(mockNavigate).toHaveBeenCalledWith('/history')
  })
})
