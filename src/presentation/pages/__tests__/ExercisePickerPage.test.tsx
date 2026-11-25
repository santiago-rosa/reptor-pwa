import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ExercisePickerPage } from '../ExercisePickerPage'
import { useExerciseStore } from '@/presentation/stores/exerciseStore'
import { useRoutineDraftStore } from '@/presentation/stores/routineDraftStore'
import { useWorkoutSessionStore } from '@/presentation/stores/workoutSessionStore'
import type { Exercise } from '@/domain/entities/Exercise'
import type { WorkoutSession } from '@/domain/entities/WorkoutSession'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Barbell Bench Press',
    muscleGroups: ['chest', 'triceps'],
    equipment: 'barbell',
  },
  {
    id: 'ex-2',
    name: 'Incline Dumbbell Press',
    muscleGroups: ['chest', 'shoulders'],
    equipment: 'dumbbell',
  },
  {
    id: 'ex-3',
    name: 'Pull Up',
    muscleGroups: ['back', 'biceps'],
    equipment: 'bodyweight',
  },
]

describe('ExercisePickerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useRoutineDraftStore.getState().reset()
    useWorkoutSessionStore.setState({ activeSession: null })

    useExerciseStore.setState({
      exercises: mockExercises,
      loading: false,
      error: null,
      fetchExercises: vi.fn().mockResolvedValue(undefined),
    })
  })

  it('renders exercises grouped by muscle group and displays equipment', () => {
    render(
      <MemoryRouter initialEntries={['/exercises/pick?mode=routine']}>
        <Routes>
          <Route path="/exercises/pick" element={<ExercisePickerPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Select Exercises')).toBeInTheDocument()
    expect(screen.getByText('Chest')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Incline Dumbbell Press')).toBeInTheDocument()
    expect(screen.getByText('Pull Up')).toBeInTheDocument()
  })

  it('filters exercises in real-time using search input', () => {
    render(
      <MemoryRouter initialEntries={['/exercises/pick?mode=routine']}>
        <Routes>
          <Route path="/exercises/pick" element={<ExercisePickerPage />} />
        </Routes>
      </MemoryRouter>
    )

    const searchInput = screen.getByPlaceholderText('Search exercises by name...')
    fireEvent.change(searchInput, { target: { value: 'pull' } })

    expect(screen.getByText('Pull Up')).toBeInTheDocument()
    expect(screen.queryByText('Barbell Bench Press')).not.toBeInTheDocument()
    expect(screen.queryByText('Incline Dumbbell Press')).not.toBeInTheDocument()

    // Clear search
    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)

    expect(screen.getByText('Barbell Bench Press')).toBeInTheDocument()
  })

  it('marks already added exercises as Added and disables them in routine mode', () => {
    // Pre-add ex-1 to routine draft
    useRoutineDraftStore.getState().addExercises([{ id: 'ex-1', name: 'Barbell Bench Press' }])

    render(
      <MemoryRouter initialEntries={['/exercises/pick?mode=routine']}>
        <Routes>
          <Route path="/exercises/pick" element={<ExercisePickerPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Added')).toBeInTheDocument()

    // Clicking ex-1 should not select it
    const ex1Row = screen.getByText('Barbell Bench Press').closest('[role="button"]')!
    fireEvent.click(ex1Row)

    const addButton = screen.getByRole('button', { name: /Add 0 exercises/i })
    expect(addButton).toBeDisabled()
  })

  it('selects multiple exercises and adds them to routine draft store', async () => {
    render(
      <MemoryRouter initialEntries={['/exercises/pick?mode=routine']}>
        <Routes>
          <Route path="/exercises/pick" element={<ExercisePickerPage />} />
        </Routes>
      </MemoryRouter>
    )

    const ex2Row = screen.getByText('Incline Dumbbell Press').closest('[role="button"]')!
    const ex3Row = screen.getByText('Pull Up').closest('[role="button"]')!

    fireEvent.click(ex2Row)
    expect(screen.getByRole('button', { name: /Add 1 exercise$/i })).not.toBeDisabled()

    fireEvent.click(ex3Row)
    const addButton = screen.getByRole('button', { name: /Add 2 exercises/i })
    expect(addButton).not.toBeDisabled()

    fireEvent.click(addButton)

    const draftExercises = useRoutineDraftStore.getState().exercises
    expect(draftExercises).toHaveLength(2)
    expect(draftExercises.map((e) => e.exerciseId)).toEqual(['ex-2', 'ex-3'])
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('selects exercise and adds it to active workout session in session mode', async () => {
    const mockSession: WorkoutSession = {
      id: 'session-1',
      title: 'Current Workout',
      startedAt: '2026-11-21T10:00:00Z',
      exercises: [
        {
          id: 'se-1',
          sessionId: 'session-1',
          exerciseId: 'ex-1',
          exerciseName: 'Barbell Bench Press',
          orderIndex: 0,
          sets: [],
        },
      ],
    }

    useWorkoutSessionStore.setState({ activeSession: mockSession })

    render(
      <MemoryRouter initialEntries={['/exercises/pick?mode=session']}>
        <Routes>
          <Route path="/exercises/pick" element={<ExercisePickerPage />} />
        </Routes>
      </MemoryRouter>
    )

    // ex-1 is already in session
    expect(screen.getByText('Added')).toBeInTheDocument()

    // Select ex-2
    const ex2Row = screen.getByText('Incline Dumbbell Press').closest('[role="button"]')!
    fireEvent.click(ex2Row)

    const addButton = screen.getByRole('button', { name: /Add 1 exercise$/i })
    fireEvent.click(addButton)

    const sessionExercises = useWorkoutSessionStore.getState().activeSession?.exercises
    expect(sessionExercises).toHaveLength(2)
    expect(sessionExercises?.map((e) => e.exerciseId)).toEqual(['ex-1', 'ex-2'])
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('searches by Spanish name and displays bilingual name and muscle group label', () => {
    useExerciseStore.setState({
      exercises: [
        {
          id: 'ex-bi-1',
          name: 'Flat Barbell Bench Press',
          nameEn: 'Flat Barbell Bench Press',
          nameEs: 'Press de banca plano con barra',
          muscleGroups: ['chest', 'Pecho / Chest'],
          equipment: 'barbell',
        },
      ],
    })

    render(
      <MemoryRouter initialEntries={['/exercises/pick?mode=routine']}>
        <Routes>
          <Route path="/exercises/pick" element={<ExercisePickerPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Pecho / Chest')).toBeInTheDocument()
    expect(screen.getByText('Press de banca plano con barra')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search exercises by name...')
    fireEvent.change(searchInput, { target: { value: 'plano con barra' } })

    expect(screen.getByText('Flat Barbell Bench Press')).toBeInTheDocument()
  })
})
