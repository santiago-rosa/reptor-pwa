import type { WorkoutSession } from '../entities/WorkoutSession'

export interface IWorkoutSessionRepository {
  save(session: WorkoutSession): Promise<WorkoutSession>
  findById(id: string): Promise<WorkoutSession | null>
  findAll(): Promise<WorkoutSession[]>
}
