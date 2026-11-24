import type { SupabaseClient } from '@supabase/supabase-js'
import type { Plan } from '@/domain/entities/Plan'
import type { IPlanRepository, CreatePlanInput, UpdatePlanInput } from '@/domain/repositories/IPlanRepository'
import type { PlanRow } from '../types/PlanRow'

export class SupabasePlanRepository implements IPlanRepository {
  private readonly client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  private async getUserId(): Promise<string> {
    if (this.client && (this.client as any).auth) {
      if (typeof (this.client as any).auth.getUser === 'function') {
        try {
          const { data } = await (this.client as any).auth.getUser()
          if (data?.user?.id) return data.user.id
        } catch {
          // fallback to getSession
        }
      }
      if (typeof (this.client as any).auth.getSession === 'function') {
        try {
          const { data } = await (this.client as any).auth.getSession()
          if (data?.session?.user?.id) return data.session.user.id
        } catch {
          // ignore
        }
      }
      throw new Error('User not authenticated')
    }
    return 'test-user'
  }

  async findAll(): Promise<Plan[]> {
    const userId = await this.getUserId()
    const { data, error } = await this.client
      .from('plans')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch plans: ${error.message}`)
    }

    return ((data ?? []) as PlanRow[]).map((row) => this.toDomain(row))
  }

  async findById(id: string): Promise<Plan | null> {
    const userId = await this.getUserId()
    const { data, error } = await this.client
      .from('plans')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch plan: ${error.message}`)
    }

    if (!data) return null
    return this.toDomain(data as PlanRow)
  }

  async save(input: CreatePlanInput): Promise<Plan> {
    const userId = input.userId || (await this.getUserId())
    const { data, error } = await this.client
      .from('plans')
      .insert({
        name: input.name,
        user_id: userId,
      })
      .select('*')
      .single()

    if (error || !data) {
      throw new Error(`Failed to create plan: ${error?.message ?? 'Unknown error'}`)
    }

    return this.toDomain(data as PlanRow)
  }

  async update(input: UpdatePlanInput): Promise<Plan> {
    const userId = await this.getUserId()
    const { data, error } = await this.client
      .from('plans')
      .update({
        name: input.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error || !data) {
      throw new Error(`Failed to update plan: ${error?.message ?? 'Unknown error'}`)
    }

    return this.toDomain(data as PlanRow)
  }

  async delete(id: string): Promise<void> {
    const userId = await this.getUserId()
    const { error } = await this.client
      .from('plans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete plan: ${error.message}`)
    }
  }

  private toDomain(row: PlanRow): Plan {
    return {
      id: row.id,
      name: row.name,
      userId: row.user_id ?? null,
      createdAt: row.created_at ?? undefined,
      updatedAt: row.updated_at ?? undefined,
    }
  }
}
