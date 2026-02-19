import type {
  TodoHistoryEvent,
  TodoHistoryEventType,
  TodoStatus,
} from '@/db/schema'

// --- Types ---

export interface Session {
  type: 'session'
  todoId: string
  startEvent: TodoHistoryEvent
  endEvent: TodoHistoryEvent | null
  startTime: Date
  endTime: Date | null
}

export interface PointEvent {
  type: 'pointEvent'
  todoId: string
  event: TodoHistoryEvent
  timestamp: Date
}

export type HistoryItem = Session | PointEvent

// --- Sort ---

export const EVENT_SORT_PRIORITY: Record<TodoHistoryEventType, number> = {
  stopped: 0,
  completed: 1,
  reopened: 2,
  created: 3,
  started: 4,
}

export const sortEvents = (
  events: TodoHistoryEvent[],
): TodoHistoryEvent[] => {
  return [...events].sort((a, b) => {
    const timeDiff = a.timestamp.getTime() - b.timestamp.getTime()
    if (timeDiff !== 0) return timeDiff
    return EVENT_SORT_PRIORITY[a.eventType] - EVENT_SORT_PRIORITY[b.eventType]
  })
}

// --- Classification ---

export const classifyEvents = (
  events: TodoHistoryEvent[],
): HistoryItem[] => {
  const sorted = sortEvents(events)
  const openStarts = new Map<string, TodoHistoryEvent>()
  const items: HistoryItem[] = []

  for (const event of sorted) {
    if (event.eventType === 'started') {
      openStarts.set(event.todoId, event)
    } else if (
      event.eventType === 'stopped' ||
      (event.eventType === 'completed' &&
        event.fromStatus === 'in_progress')
    ) {
      const startEvent = openStarts.get(event.todoId)
      if (startEvent) {
        items.push({
          type: 'session',
          todoId: event.todoId,
          startEvent,
          endEvent: event,
          startTime: startEvent.timestamp,
          endTime: event.timestamp,
        })
        openStarts.delete(event.todoId)
      }
    } else {
      // created, completed(from pending), reopened → point events
      items.push({
        type: 'pointEvent',
        todoId: event.todoId,
        event,
        timestamp: event.timestamp,
      })
    }
  }

  // Remaining open starts become ongoing sessions
  for (const [todoId, startEvent] of openStarts) {
    items.push({
      type: 'session',
      todoId,
      startEvent,
      endEvent: null,
      startTime: startEvent.timestamp,
      endTime: null,
    })
  }

  // Sort all items by time
  return items.sort((a, b) => {
    const timeA =
      a.type === 'session' ? a.startTime.getTime() : a.timestamp.getTime()
    const timeB =
      b.type === 'session' ? b.startTime.getTime() : b.timestamp.getTime()
    return timeA - timeB
  })
}

// --- Validation ---

export const isValidTransition = (
  state: TodoStatus | null,
  eventType: TodoHistoryEventType,
): boolean => {
  switch (eventType) {
    case 'created':
      return state === null
    case 'started':
      return state === 'pending'
    case 'stopped':
      return state === 'in_progress'
    case 'completed':
      return state === 'pending' || state === 'in_progress'
    case 'reopened':
      return state === 'completed'
  }
}

// --- Deletion checks ---

export const canDeleteSession = (
  todoEvents: TodoHistoryEvent[],
  session: Session,
): boolean => {
  const sorted = sortEvents(
    todoEvents.filter((e) => e.todoId === session.todoId),
  )

  // Ongoing session: always deletable (just removes started event)
  if (session.endEvent === null) return true

  // Stopped session (started+stopped): always deletable
  if (session.endEvent.eventType === 'stopped') return true

  // Completed session (started+completed): check if reopened follows
  const endIdx = sorted.findIndex((e) => e.id === session.endEvent!.id)
  if (endIdx === -1) return false

  // If completed is the last event, or no reopened follows → deletable
  if (endIdx === sorted.length - 1) return true
  return sorted[endIdx + 1].eventType !== 'reopened'
}

export const canDeletePointEvent = (
  todoEvents: TodoHistoryEvent[],
  event: TodoHistoryEvent,
): boolean => {
  if (event.eventType === 'created') return false

  const sorted = sortEvents(
    todoEvents.filter((e) => e.todoId === event.todoId),
  )
  const index = sorted.findIndex((e) => e.id === event.id)
  if (index === -1) return false

  // Last event: always deletable
  if (index === sorted.length - 1) return true

  // Middle event: check if skipping it preserves valid transition
  const preState = sorted[index - 1].toStatus
  return isValidTransition(preState, sorted[index + 1].eventType)
}

// --- Editable ranges ---

export interface TimeRange {
  min: Date
  max: Date
}

export interface SessionEditableRange {
  startMin: Date
  startMax: Date
  endMin: Date
  endMax: Date
}

export const getSessionEditableRange = (
  todoEvents: TodoHistoryEvent[],
  session: Session,
): SessionEditableRange => {
  const sorted = sortEvents(
    todoEvents.filter((e) => e.todoId === session.todoId),
  )
  const startIdx = sorted.findIndex((e) => e.id === session.startEvent.id)
  const now = new Date()

  const startMin =
    startIdx > 0 ? sorted[startIdx - 1].timestamp : new Date(0)
  const endTime = session.endTime ?? now

  if (session.endEvent === null) {
    // Ongoing session: only start is editable
    return { startMin, startMax: now, endMin: now, endMax: now }
  }

  const endIdx = sorted.findIndex((e) => e.id === session.endEvent!.id)
  const endMax =
    endIdx < sorted.length - 1 ? sorted[endIdx + 1].timestamp : now

  return {
    startMin,
    startMax: endTime,
    endMin: session.startTime,
    endMax,
  }
}

export const getPointEventEditableRange = (
  todoEvents: TodoHistoryEvent[],
  event: TodoHistoryEvent,
): TimeRange => {
  const sorted = sortEvents(
    todoEvents.filter((e) => e.todoId === event.todoId),
  )
  const index = sorted.findIndex((e) => e.id === event.id)
  const now = new Date()

  const min = index > 0 ? sorted[index - 1].timestamp : new Date(0)
  const max =
    index < sorted.length - 1 ? sorted[index + 1].timestamp : now

  return { min, max }
}

// --- Timestamp computation ---

const getMinuteValue = (date: Date): number =>
  date.getHours() * 60 + date.getMinutes()

export const computeEditTimestamp = (
  minutesSinceMidnight: number,
  prevTimestamp: Date | null,
  nextTimestamp: Date | null,
  selectedDate: Date,
): Date => {
  const base = new Date(selectedDate)
  base.setHours(Math.floor(minutesSinceMidnight / 60), minutesSinceMidnight % 60, 0, 0)

  const prevMinute = prevTimestamp ? getMinuteValue(prevTimestamp) : -1
  const nextMinute = nextTimestamp ? getMinuteValue(nextTimestamp) : 1440

  if (minutesSinceMidnight > prevMinute && minutesSinceMidnight < nextMinute) {
    return base
  }

  if (
    minutesSinceMidnight === prevMinute &&
    minutesSinceMidnight === nextMinute &&
    prevTimestamp &&
    nextTimestamp
  ) {
    // Both same minute: use midpoint
    return new Date(
      Math.floor(
        (prevTimestamp.getTime() + nextTimestamp.getTime()) / 2,
      ),
    )
  }

  if (minutesSinceMidnight === prevMinute && prevTimestamp) {
    return new Date(prevTimestamp.getTime() + 1)
  }

  if (minutesSinceMidnight === nextMinute && nextTimestamp) {
    return new Date(nextTimestamp.getTime() - 1)
  }

  return base
}
