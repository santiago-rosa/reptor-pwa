import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '../AppLayout'
import { useWorkoutSessionStore } from '../../stores/workoutSessionStore'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWorkoutSessionStore.getState().discard()
  })

  it('does not show resume workout banner when no session is active', () => {
    render(
      <MemoryRouter initialEntries={['/routines']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/routines" element={<div>Routines Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByTestId('resume-workout-banner')).not.toBeInTheDocument()
  })

  it('shows resume workout banner when a session is active and navigates to /session on click', () => {
    useWorkoutSessionStore.getState().startEmpty('Upper Body')

    render(
      <MemoryRouter initialEntries={['/routines']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/routines" element={<div>Routines Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const banner = screen.getByTestId('resume-workout-banner')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent('Upper Body')

    fireEvent.click(screen.getByRole('button', { name: /resume/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/session')
  })
})
