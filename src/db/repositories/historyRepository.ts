import { db } from '@/db/schema'
import type { TodoHistoryEvent } from '@/db/schema'
import { classifyEvents } from '@/utils/sessionUtils'
import type { Session } from '@/utils/sessionUtils'

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

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

const insertMidnightSplitEvents = async (
  todoId: string,
  startTime: Date,
  endTime: Date,
): Promise<void> => {
  let current = new Date(startTime)

  while (true) {
    const nextMidnight = new Date(current)
    nextMidnight.setDate(nextMidnight.getDate() + 1)
    nextMidnight.setHours(0, 0, 0, 0)

    if (nextMidnight >= endTime) break

    await db.todoHistory.add({
      id: crypto.randomUUID(),
      todoId,
      eventType: 'stopped',
      fromStatus: 'in_progress',
      toStatus: 'pending',
      timestamp: new Date(nextMidnight.getTime() - 1),
    })
    await db.todoHistory.add({
      id: crypto.randomUUID(),
      todoId,
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: nextMidnight,
    })

    current = nextMidnight
  }
}

export const splitCrossDaySessions = async (): Promise<boolean> => {
  const events = await db.todoHistory.orderBy('timestamp').toArray()
  const items = classifyEvents(events)
  const sessions = items.filter(
    (i): i is Session => i.type === 'session',
  )

  const now = new Date()

  const crossDaySessions = sessions.filter((s) => {
    const end = s.endTime ?? now
    return !isSameDay(s.startTime, end)
  })

  if (crossDaySessions.length === 0) return false

  await db.transaction('rw', [db.todoHistory], async () => {
    for (const session of crossDaySessions) {
      const endTime = session.endTime ?? now
      await insertMidnightSplitEvents(session.todoId, session.startTime, endTime)
    }
  })

  return true
}

export const splitOngoingCrossDaySessions = async (): Promise<boolean> => {
  const inProgressTodos = await db.todos
    .where('status')
    .equals('in_progress')
    .toArray()

  if (inProgressTodos.length === 0) return false

  const now = new Date()
  let changed = false

  await db.transaction('rw', [db.todoHistory], async () => {
    for (const todo of inProgressTodos) {
      const events = await db.todoHistory
        .where('todoId')
        .equals(todo.id)
        .sortBy('timestamp')

      const lastStarted = [...events]
        .reverse()
        .find((e) => e.eventType === 'started')

      if (!lastStarted || isSameDay(lastStarted.timestamp, now)) continue

      await insertMidnightSplitEvents(todo.id, lastStarted.timestamp, now)
      changed = true
    }
  })

  return changed
}
