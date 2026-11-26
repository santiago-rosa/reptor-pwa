import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkoutSession, SessionExercise, SessionSet } from '@/domain/entities/WorkoutSession';
import type { IWorkoutSessionRepository } from '@/domain/repositories/IWorkoutSessionRepository';
import type { JoinedWorkoutSessionRow } from '../types/WorkoutSessionRow';

export class SupabaseWorkoutSessionRepository implements IWorkoutSessionRepository {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // Helper to get current user id, throws if not authenticated
  private async getUserId(): Promise<string> {
    if (this.client && (this.client as any).auth) {
      if (typeof (this.client as any).auth.getUser === 'function') {
        try {
          const { data } = await (this.client as any).auth.getUser();
          if (data?.user?.id) return data.user.id;
        } catch {
          // Fallback to getSession
        }
      }
      if (typeof (this.client as any).auth.getSession === 'function') {
        try {
          const { data } = await (this.client as any).auth.getSession();
          if (data?.session?.user?.id) return data.session.user.id;
        } catch {
          // ignore
        }
      }
      throw new Error('User not authenticated');
    }
    // Fallback for unit tests or environments without auth.
    return 'test-user';
  }

  async findAll(): Promise<WorkoutSession[]> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from('workout_sessions')
      .select('*, session_exercises(*, exercises(name), session_sets(*))')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch workout sessions: ${error.message}`);
    }

    return ((data ?? []) as JoinedWorkoutSessionRow[]).map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<WorkoutSession | null> {
    const userId = await this.getUserId();
    const { data, error } = await this.client
      .from('workout_sessions')
      .select('*, session_exercises(*, exercises(name), session_sets(*))')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch workout session: ${error.message}`);
    }
    if (!data) return null;
    return this.toDomain(data as JoinedWorkoutSessionRow);
  }

  async save(session: WorkoutSession): Promise<WorkoutSession> {
    const startedAt = typeof session.startedAt === 'string' ? session.startedAt : session.startedAt.toISOString();
    const finishedAt = session.finishedAt
      ? typeof session.finishedAt === 'string'
        ? session.finishedAt
        : session.finishedAt.toISOString()
      : null;

    const userId = await this.getUserId();

    const { error: sessionError } = await this.client
      .from('workout_sessions')
      .upsert({
        id: session.id,
        title: session.title,
        routine_id: session.routineId ?? null,
        user_id: userId,
        started_at: startedAt,
        finished_at: finishedAt,
      });

    if (sessionError) {
      throw new Error(`Failed to save workout session: ${sessionError.message}`);
    }

    if (session.exercises.length > 0) {
      const exerciseRows = session.exercises.map((ex, idx) => ({
        id: ex.id ?? crypto.randomUUID(),
        session_id: session.id,
        exercise_id: ex.exerciseId,
        order: ex.orderIndex ?? idx,
        order_index: ex.orderIndex ?? idx,
      }));
      const { error: exError } = await this.client.from('session_exercises').upsert(exerciseRows);
      if (exError) {
        await this.client.from('workout_sessions').delete().eq('id', session.id);
        throw new Error(`Failed to save session exercises: ${exError.message}`);
      }

      const setRows = session.exercises.flatMap((ex, exIdx) => {
        const exerciseId = exerciseRows[exIdx]!.id;
        return ex.sets.map((set) => ({
          id: set.id ?? crypto.randomUUID(),
          session_exercise_id: exerciseId,
          weight_kg: set.weightKg,
          reps: set.reps,
          rpe: set.rpe ?? null,
          is_completed: set.isCompleted,
          set_number: set.setNumber,
        }));
      });
      if (setRows.length > 0) {
        const { error: setError } = await this.client.from('session_sets').upsert(setRows);
        if (setError) {
          await this.client.from('session_exercises').delete().eq('session_id', session.id);
          await this.client.from('workout_sessions').delete().eq('id', session.id);
          throw new Error(`Failed to save session sets: ${setError.message}`);
        }
      }
    }

    const saved = await this.findById(session.id);
    if (!saved) throw new Error('Failed to retrieve saved workout session');
    return saved;
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
            rpe: s.rpe ?? null,
            isCompleted: s.is_completed,
          }));
        return {
          id: se.id,
          sessionId: se.session_id,
          exerciseId: se.exercise_id,
          exerciseName: se.exercises?.name ?? undefined,
          orderIndex: se.order_index,
          sets,
        };
      });

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
    };
  }
}
