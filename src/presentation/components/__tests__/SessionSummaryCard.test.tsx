import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  SessionSummaryCard,
  formatSessionDate,
  calculateSessionDuration,
  calculateSessionMetrics,
} from '../SessionSummaryCard'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

describe('SessionSummaryCard Helper Functions', () => {
  it('formats dates into readable format', () => {
    const formatted = formatSessionDate('2026-11-20T10:00:00Z')
    expect(formatted).toBe('Fri, Nov 20')
  })

  it('calculates duration in minutes and hours', () => {
    expect(
      calculateSessionDuration('2026-11-20T10:00:00Z', '2026-11-20T10:45:00Z')
    ).toBe('45m')

    expect(
      calculateSessionDuration('2026-11-20T10:00:00Z', '2026-11-20T10:00:20Z')
    ).toBe('< 1m')

    expect(
      calculateSessionDuration('2026-11-20T10:00:00Z', '2026-11-20T11:30:00Z')
    ).toBe('1h 30m')

    expect(calculateSessionDuration('2026-11-20T10:00:00Z', null)).toBe('—')
  })

  it('calculates total sets and volume from completed sets', () => {
    const session: WorkoutSession = {
      id: 's-1',
      title: 'Chest Day',
      startedAt: '2026-11-20T10:00:00Z',
      exercises: [
        {
          id: 'se-1',
          sessionId: 's-1',
          exerciseId: 'ex-1',
          exerciseName: 'Bench Press',
          orderIndex: 0,
          sets: [
            { id: 'set-1', sessionExerciseId: 'se-1', setNumber: 1, weightKg: 80, reps: 10, isCompleted: true },
            { id: 'set-2', sessionExerciseId: 'se-1', setNumber: 2, weightKg: 85, reps: 8, isCompleted: true },
            { id: 'set-3', sessionExerciseId: 'se-1', setNumber: 3, weightKg: 90, reps: 5, isCompleted: false },
          ],
        },
      ],
    }

    const metrics = calculateSessionMetrics(session)
    expect(metrics.totalSets).toBe(2)
    // 80*10 + 85*8 = 800 + 680 = 1480
    expect(metrics.totalVolumeKg).toBe(1480)
  })
})

describe('SessionSummaryCard Component', () => {
  const mockSession: WorkoutSession = {
    id: 's-100',
    title: 'Upper Body Blast',
    startedAt: '2026-11-20T10:00:00Z',
    finishedAt: '2026-11-20T10:52:00Z',
    exercises: [
      {
        id: 'se-1',
        sessionId: 's-100',
        exerciseId: 'ex-1',
        exerciseName: 'Bench Press',
        orderIndex: 0,
        sets: [
          { id: 'set-1', sessionExerciseId: 'se-1', setNumber: 1, weightKg: 100, reps: 10, isCompleted: true },
        ],
      },
      {
        id: 'se-2',
        sessionId: 's-100',
        exerciseId: 'ex-2',
        exerciseName: 'Barbell Row',
        orderIndex: 1,
        sets: [
          { id: 'set-2', sessionExerciseId: 'se-2', setNumber: 1, weightKg: 80, reps: 10, isCompleted: true },
        ],
      },
    ],
  }

  it('renders session title, duration, sets, volume, and exercises preview', () => {
    render(<SessionSummaryCard session={mockSession} />)

    expect(screen.getByText('Upper Body Blast')).toBeInTheDocument()
    expect(screen.getByText('Fri, Nov 20')).toBeInTheDocument()
    expect(screen.getByText('52m')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // 2 sets
    expect(screen.getByText(/1,800 kg/i)).toBeInTheDocument() // 100*10 + 80*10 = 1800
    expect(screen.getByText(/Bench Press, Barbell Row/i)).toBeInTheDocument()
  })

  it('triggers onClick when clicked or with keyboard Enter', () => {
    const handleClick = vi.fn()
    render(<SessionSummaryCard session={mockSession} onClick={handleClick} />)

    const card = screen.getByRole('button')
    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(2)
  })
})
