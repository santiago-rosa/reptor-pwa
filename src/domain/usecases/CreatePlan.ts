import type { Plan } from '../entities/Plan'
import type { IPlanRepository, CreatePlanInput } from '../repositories/IPlanRepository'

export class CreatePlan {
  private readonly planRepository: IPlanRepository

  constructor(planRepository: IPlanRepository) {
    this.planRepository = planRepository
  }

  async execute(input: CreatePlanInput): Promise<Plan> {
    if (!input.name.trim()) {
      throw new Error('Plan name is required')
    }
    return this.planRepository.save(input)
  }
}
