import type { WorkoutSession } from '../entities/WorkoutSession'
import type { IWorkoutSessionRepository } from '../repositories/IWorkoutSessionRepository'

export class FinishSession {
  private readonly workoutSessionRepository: IWorkoutSessionRepository

  constructor(workoutSessionRepository: IWorkoutSessionRepository) {
    this.workoutSessionRepository = workoutSessionRepository
  }

  async execute(session: WorkoutSession): Promise<WorkoutSession> {
    if (!session.id) {
      throw new Error('Session ID is required')
    }

    const finishedSession: WorkoutSession = {
      ...session,
      finishedAt: session.finishedAt ?? new Date(),
    }

    return this.workoutSessionRepository.save(finishedSession)
  }
}
