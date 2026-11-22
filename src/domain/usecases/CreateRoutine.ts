import type { Routine } from '../entities/Routine'
import type { IRoutineRepository, CreateRoutineInput } from '../repositories/IRoutineRepository'

export class CreateRoutine {
  private readonly routineRepository: IRoutineRepository

  constructor(routineRepository: IRoutineRepository) {
    this.routineRepository = routineRepository
  }

  async execute(input: CreateRoutineInput): Promise<Routine> {
    if (!input.name.trim()) {
      throw new Error('Routine name is required')
    }
    return this.routineRepository.save(input)
  }
}
