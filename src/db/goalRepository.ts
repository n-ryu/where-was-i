import { db } from './database'
import type { Goal } from '../types'

export interface CreateGoalInput {
  title: string
}

export interface UpdateGoalInput {
  title?: string
  isActive?: boolean
}

function generateId(): string {
  return crypto.randomUUID()
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const now = new Date()
  const goal: Goal = {
    id: generateId(),
    title: input.title,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }

  await db.goals.add(goal)
  return goal
}

export async function getGoal(id: string): Promise<Goal | undefined> {
  return db.goals.get(id)
}

export async function updateGoal(
  id: string,
  input: UpdateGoalInput
): Promise<Goal | undefined> {
  const goal = await db.goals.get(id)
  if (!goal) return undefined

  const updatedGoal: Goal = {
    ...goal,
    ...input,
    updatedAt: new Date(),
  }

  await db.goals.put(updatedGoal)
  return updatedGoal
}

export async function deleteGoal(id: string): Promise<void> {
  await db.goals.delete(id)
}

export async function getAllGoals(): Promise<Goal[]> {
  return db.goals.toArray()
}

export async function getActiveGoals(): Promise<Goal[]> {
  return db.goals.filter((goal) => goal.isActive).toArray()
}

export async function getInactiveGoals(): Promise<Goal[]> {
  return db.goals.filter((goal) => !goal.isActive).toArray()
}

export async function setGoalActive(
  id: string,
  isActive: boolean
): Promise<Goal | undefined> {
  return updateGoal(id, { isActive })
}
