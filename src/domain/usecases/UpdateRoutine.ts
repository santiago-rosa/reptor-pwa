import type { Routine } from '../entities/Routine'
import type { IRoutineRepository, UpdateRoutineInput } from '../repositories/IRoutineRepository'

export class UpdateRoutine {
  private readonly routineRepository: IRoutineRepository

  constructor(routineRepository: IRoutineRepository) {
    this.routineRepository = routineRepository
  }

  async execute(input: UpdateRoutineInput): Promise<Routine> {
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error('Routine name cannot be empty')
    }
    return this.routineRepository.update(input)
  }
}
