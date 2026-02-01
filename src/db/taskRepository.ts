import { db } from './database'
import type { Task, TaskStatus, TaskEventType, TaskEvent } from '../types'

export interface CreateTaskInput {
  title: string
  date: string
  memo?: string
  goalId?: string
}

export interface UpdateTaskInput {
  title?: string
  memo?: string
  goalId?: string
  status?: TaskStatus
  date?: string
}

function generateId(): string {
  return crypto.randomUUID()
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = new Date()
  const task: Task = {
    id: generateId(),
    title: input.title,
    status: 'pending',
    goalId: input.goalId,
    memo: input.memo,
    date: input.date,
    events: [],
    createdAt: now,
    updatedAt: now,
  }

  await db.tasks.add(task)
  return task
}

export async function getTask(id: string): Promise<Task | undefined> {
  return db.tasks.get(id)
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task | undefined> {
  const task = await db.tasks.get(id)
  if (!task) return undefined

  const updatedTask: Task = {
    ...task,
    ...input,
    updatedAt: new Date(),
  }

  await db.tasks.put(updatedTask)
  return updatedTask
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id)
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  return db.tasks.where('date').equals(date).toArray()
}

export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  return db.tasks.where('status').equals(status).toArray()
}

export async function getTasksByGoalId(goalId: string): Promise<Task[]> {
  return db.tasks.where('goalId').equals(goalId).toArray()
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task | undefined> {
  return updateTask(id, { status })
}

export async function addTaskEvent(
  id: string,
  eventType: TaskEventType,
  memo?: string
): Promise<Task | undefined> {
  const task = await db.tasks.get(id)
  if (!task) return undefined

  const event: TaskEvent = {
    eventType,
    memo,
    timestamp: new Date(),
  }

  const updatedTask: Task = {
    ...task,
    events: [...task.events, event],
    updatedAt: new Date(),
  }

  await db.tasks.put(updatedTask)
  return updatedTask
}
