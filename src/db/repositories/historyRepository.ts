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

export const deleteSession = async (
  todoId: string,
  startEventId: string,
  endEventId: string | null,
): Promise<void> => {
  await db.transaction('rw', [db.todos, db.todoHistory], async () => {
    const events = await db.todoHistory
      .where('todoId')
      .equals(todoId)
      .sortBy('timestamp')

    const startIdx = events.findIndex((e) => e.id === startEventId)
    const lastDeletedIdx = endEventId
      ? events.findIndex((e) => e.id === endEventId)
      : startIdx
    const prevEvent = startIdx > 0 ? events[startIdx - 1] : null
    const nextEvent =
      lastDeletedIdx < events.length - 1 ? events[lastDeletedIdx + 1] : null

    await db.todoHistory.delete(startEventId)
    if (endEventId) {
      await db.todoHistory.delete(endEventId)
    }

    if (nextEvent) {
      await db.todoHistory.update(nextEvent.id, {
        fromStatus: prevEvent ? prevEvent.toStatus : null,
      })
    }

    if (!nextEvent) {
      const newStatus = prevEvent ? prevEvent.toStatus : 'pending'
      await db.todos.update(todoId, { status: newStatus, updatedAt: new Date() })
    }
  })
}

export const deletePointEvent = async (
  todoId: string,
  eventId: string,
): Promise<void> => {
  await db.transaction('rw', [db.todos, db.todoHistory], async () => {
    const events = await db.todoHistory
      .where('todoId')
      .equals(todoId)
      .sortBy('timestamp')

    const idx = events.findIndex((e) => e.id === eventId)
    const prevEvent = idx > 0 ? events[idx - 1] : null
    const nextEvent = idx < events.length - 1 ? events[idx + 1] : null

    await db.todoHistory.delete(eventId)

    if (nextEvent) {
      await db.todoHistory.update(nextEvent.id, {
        fromStatus: prevEvent ? prevEvent.toStatus : null,
      })
    }

    if (!nextEvent) {
      const newStatus = prevEvent ? prevEvent.toStatus : 'pending'
      await db.todos.update(todoId, { status: newStatus, updatedAt: new Date() })
    }
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
