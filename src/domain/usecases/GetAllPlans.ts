import type { Plan } from '../entities/Plan'
import type { IPlanRepository } from '../repositories/IPlanRepository'

export class GetAllPlans {
  private readonly planRepository: IPlanRepository

  constructor(planRepository: IPlanRepository) {
    this.planRepository = planRepository
  }

  async execute(): Promise<Plan[]> {
    return this.planRepository.findAll()
  }
}
