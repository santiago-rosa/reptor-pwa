import type { Plan } from '../entities/Plan'
import type { IPlanRepository, UpdatePlanInput } from '../repositories/IPlanRepository'

export class UpdatePlan {
  private readonly planRepository: IPlanRepository

  constructor(planRepository: IPlanRepository) {
    this.planRepository = planRepository
  }

  async execute(input: UpdatePlanInput): Promise<Plan> {
    if (!input.id) {
      throw new Error('Plan ID is required')
    }
    if (!input.name.trim()) {
      throw new Error('Plan name cannot be empty')
    }
    return this.planRepository.update(input)
  }
}
