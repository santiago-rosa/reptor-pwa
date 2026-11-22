import type { SupabaseClient } from '@supabase/supabase-js'
import type { WorkoutSession, SessionExercise, SessionSet } from '@/domain/entities/WorkoutSession'
import type { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository'
import type { JoinedWorkoutSessionRow } from '../types/WorkoutSessionRow'

export class SupabaseWorkoutSessionRepository implements IWorkoutSessionRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async findAll(): Promise<WorkoutSession[]> {
    const { data, error } = await this.client
      .from('workout_sessions')
      .select('*, session_exercises(*, exercises(name), session_sets(*))')
      .order('started_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch workout sessions: ${error.message}`)
    }

    return ((data ?? []) as JoinedWorkoutSessionRow[]).map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<WorkoutSession | null> {
    const { data, error } = await this.client
      .from('workout_sessions')
      .select('*, session_exercises(*, exercises(name), session_sets(*))')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch workout session: ${error.message}`)
    }

    if (!data) return null
    return this.toDomain(data as JoinedWorkoutSessionRow)
  }

  async save(session: WorkoutSession): Promise<WorkoutSession> {
    const startedAt = typeof session.startedAt === 'string'
      ? session.startedAt
      : session.startedAt.toISOString()

    const finishedAt = session.finishedAt
      ? typeof session.finishedAt === 'string'
        ? session.finishedAt
        : session.finishedAt.toISOString()
      : null

    // 1. Upsert session header
    const { error: sessionError } = await this.client
      .from('workout_sessions')
      .upsert({
        id: session.id,
        title: session.title,
        routine_id: session.routineId ?? null,
        user_id: session.userId ?? null,
        started_at: startedAt,
        finished_at: finishedAt,
      })

    if (sessionError) {
      throw new Error(`Failed to save workout session: ${sessionError.message}`)
    }

    // 2. Batch upsert exercises
    if (session.exercises.length > 0) {
      const exerciseRows = session.exercises.map((se) => ({
        id: se.id || crypto.randomUUID(),
        session_id: session.id,
        exercise_id: se.exerciseId,
        order_index: se.orderIndex,
      }))

      const { error: exerciseError } = await this.client
        .from('session_exercises')
        .upsert(exerciseRows)

      if (exerciseError) {
        throw new Error(`Failed to save session exercises: ${exerciseError.message}`)
      }

      // 3. Batch upsert sets
      const setRows = session.exercises.flatMap((se, exIdx) => {
        const sessionExerciseId = exerciseRows[exIdx]!.id
        return se.sets.map((s) => ({
          id: s.id || crypto.randomUUID(),
          session_exercise_id: sessionExerciseId,
          set_number: s.setNumber,
          weight_kg: s.weightKg,
          reps: s.reps,
          is_completed: s.isCompleted,
        }))
      })

      if (setRows.length > 0) {
        const { error: setsError } = await this.client
          .from('session_sets')
          .upsert(setRows)

        if (setsError) {
          throw new Error(`Failed to save session sets: ${setsError.message}`)
        }
      }
    }

    const saved = await this.findById(session.id)
    if (!saved) {
      throw new Error('Failed to retrieve saved workout session')
    }

    return saved
  }

  private toDomain(row: JoinedWorkoutSessionRow): WorkoutSession {
    const exercises: SessionExercise[] = (row.session_exercises ?? [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((se) => {
        const sets: SessionSet[] = (se.session_sets ?? [])
          .slice()
          .sort((a, b) => a.set_number - b.set_number)
          .map((s) => ({
            id: s.id,
            sessionExerciseId: s.session_exercise_id,
            setNumber: s.set_number,
            weightKg: s.weight_kg,
            reps: s.reps,
            isCompleted: s.is_completed,
          }))

        return {
          id: se.id,
          sessionId: se.session_id,
          exerciseId: se.exercise_id,
          exerciseName: se.exercises?.name ?? undefined,
          orderIndex: se.order_index,
          sets,
        }
      })

    return {
      id: row.id,
      title: row.title,
      routineId: row.routine_id ?? null,
      userId: row.user_id ?? null,
      startedAt: row.started_at,
      finishedAt: row.finished_at ?? null,
      exercises,
      createdAt: row.created_at ?? undefined,
      updatedAt: row.updated_at ?? undefined,
    }
  }
}
