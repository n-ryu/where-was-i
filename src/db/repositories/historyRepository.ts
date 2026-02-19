import { db } from '@/db/schema'
import type { TodoHistoryEvent } from '@/db/schema'

export const updateEventTimestamp = async (
  eventId: string,
  newTimestamp: Date,
): Promise<void> => {
  await db.todoHistory.update(eventId, { timestamp: newTimestamp })
}

export const updateCreatedEventTimestamp = async (
  eventId: string,
  todoId: string,
  newTimestamp: Date,
): Promise<void> => {
  await db.transaction('rw', [db.todos, db.todoHistory], async () => {
    await db.todoHistory.update(eventId, { timestamp: newTimestamp })
    await db.todos.update(todoId, {
      createdAt: newTimestamp,
      updatedAt: new Date(),
    })
  })
}

export const addHistoryEvent = async (
  event: Omit<TodoHistoryEvent, 'id'>,
): Promise<string> => {
  const id = crypto.randomUUID()
  await db.todoHistory.add({ id, ...event })
  return id
}

export const getHistoryByTodoId = async (
  todoId: string,
): Promise<TodoHistoryEvent[]> => {
  return db.todoHistory.where('todoId').equals(todoId).sortBy('timestamp')
}

export const getAllHistory = async (): Promise<TodoHistoryEvent[]> => {
  return db.todoHistory.orderBy('timestamp').reverse().toArray()
}

export const getHistoryByDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<TodoHistoryEvent[]> => {
  return db.todoHistory
    .where('timestamp')
    .between(startDate, endDate)
    .sortBy('timestamp')
}
