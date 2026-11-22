import type { WorkoutSession } from '../entities/WorkoutSession'
import type { IWorkoutSessionRepository } from '../repositories/IWorkoutSessionRepository'

export class GetWorkoutSession {
  private readonly workoutSessionRepository: IWorkoutSessionRepository

  constructor(workoutSessionRepository: IWorkoutSessionRepository) {
    this.workoutSessionRepository = workoutSessionRepository
  }

  async execute(id: string): Promise<WorkoutSession | null> {
    if (!id || !id.trim()) {
      throw new Error('Workout session ID is required')
    }
    return this.workoutSessionRepository.findById(id.trim())
  }
}
