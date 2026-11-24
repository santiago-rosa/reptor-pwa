import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore, resetUserStores } from '../authStore'
import { useWorkoutHistoryStore } from '../workoutHistoryStore'
import { useRoutineStore } from '../routineStore'
import { usePlanStore } from '../planStore'
import { useWorkoutSessionStore } from '../workoutSessionStore'
import { supabase } from '@/infrastructure/supabase/client'

describe('authStore user isolation & store reset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetUserStores()
    useAuthStore.setState({ user: null, loading: false, error: null })
  })

  it('resetUserStores clears workout sessions, routines, plans, and history', () => {
    // Populate stores with mock data
    useWorkoutHistoryStore.setState({
      sessions: [
        {
          id: 'ws-1',
          title: 'Session 1',
          userId: 'user-1',
          startedAt: new Date(),
          finishedAt: null,
          exercises: [],
        },
      ],
    })
    useRoutineStore.setState({
      routines: [
        {
          id: 'r-1',
          name: 'Chest Routine',
          userId: 'user-1',
          planId: null,
          exercises: [],
        },
      ],
    })
    usePlanStore.setState({
      plans: [
        {
          id: 'p-1',
          name: 'PPL Plan',
          userId: 'user-1',
        },
      ],
    })

    expect(useWorkoutHistoryStore.getState().sessions).toHaveLength(1)
    expect(useRoutineStore.getState().routines).toHaveLength(1)
    expect(usePlanStore.getState().plans).toHaveLength(1)

    // Call reset
    resetUserStores()

    expect(useWorkoutHistoryStore.getState().sessions).toEqual([])
    expect(useRoutineStore.getState().routines).toEqual([])
    expect(usePlanStore.getState().plans).toEqual([])
    expect(useWorkoutSessionStore.getState().activeSession).toBeNull()
  })

  it('resets user stores on signOut', async () => {
    useAuthStore.setState({ user: { id: 'user-1', email: 'user1@example.com' } })
    useWorkoutHistoryStore.setState({
      sessions: [
        {
          id: 'ws-1',
          title: 'Session 1',
          userId: 'user-1',
          startedAt: new Date(),
          finishedAt: null,
          exercises: [],
        },
      ],
    })

    vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({ error: null } as any)

    await useAuthStore.getState().signOut()

    expect(useAuthStore.getState().user).toBeNull()
    expect(useWorkoutHistoryStore.getState().sessions).toEqual([])
  })

  it('resets user stores when a different user logs in', async () => {
    useAuthStore.setState({ user: { id: 'user-1', email: 'user1@example.com' } })
    useRoutineStore.setState({
      routines: [
        {
          id: 'r-1',
          name: 'Routine User 1',
          userId: 'user-1',
          planId: null,
          exercises: [],
        },
      ],
    })

    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: { user: { id: 'user-2', email: 'user2@example.com' } },
      error: null,
    } as any)

    await useAuthStore.getState().signIn('user2@example.com', 'password123')

    expect(useAuthStore.getState().user?.id).toBe('user-2')
    expect(useRoutineStore.getState().routines).toEqual([])
  })
})
