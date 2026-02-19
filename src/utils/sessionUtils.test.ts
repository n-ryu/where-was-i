import { describe, it, expect } from 'vitest'
import type { TodoHistoryEvent } from '@/db/schema'
import {
  sortEvents,
  classifyEvents,
  isValidTransition,
  canDeleteSession,
  canDeletePointEvent,
  getSessionEditableRange,
  getPointEventEditableRange,
  computeEditTimestamp,
} from './sessionUtils'
import type { Session } from './sessionUtils'

// --- Helpers ---

const mkEvent = (
  overrides: Partial<TodoHistoryEvent> & {
    eventType: TodoHistoryEvent['eventType']
  },
): TodoHistoryEvent => ({
  id: crypto.randomUUID(),
  todoId: 'todo-1',
  fromStatus: null,
  toStatus: 'pending',
  timestamp: new Date('2026-02-19T10:00:00'),
  ...overrides,
})

const mkDate = (h: number, m = 0, s = 0, ms = 0) => {
  const d = new Date('2026-02-19T00:00:00')
  d.setHours(h, m, s, ms)
  return d
}

// --- sortEvents ---

describe('sortEvents', () => {
  it('sorts by timestamp ascending', () => {
    const events = [
      mkEvent({ eventType: 'started', timestamp: mkDate(11) }),
      mkEvent({ eventType: 'created', timestamp: mkDate(9) }),
      mkEvent({ eventType: 'stopped', timestamp: mkDate(12) }),
    ]
    const sorted = sortEvents(events)
    expect(sorted[0].eventType).toBe('created')
    expect(sorted[1].eventType).toBe('started')
    expect(sorted[2].eventType).toBe('stopped')
  })

  it('uses event type priority for same timestamp', () => {
    const ts = mkDate(10)
    const events = [
      mkEvent({ eventType: 'started', timestamp: ts, todoId: 'todo-2' }),
      mkEvent({ eventType: 'stopped', timestamp: ts, todoId: 'todo-1' }),
    ]
    const sorted = sortEvents(events)
    expect(sorted[0].eventType).toBe('stopped')
    expect(sorted[1].eventType).toBe('started')
  })

  it('sorts completed before started at same timestamp', () => {
    const ts = mkDate(10)
    const events = [
      mkEvent({ eventType: 'started', timestamp: ts }),
      mkEvent({ eventType: 'completed', timestamp: ts }),
    ]
    const sorted = sortEvents(events)
    expect(sorted[0].eventType).toBe('completed')
    expect(sorted[1].eventType).toBe('started')
  })
})

// --- classifyEvents ---

describe('classifyEvents', () => {
  it('classifies created as point event', () => {
    const events = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
    ]
    const items = classifyEvents(events)
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('pointEvent')
  })

  it('classifies started+stopped as session', () => {
    const events = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      mkEvent({
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: mkDate(10),
      }),
      mkEvent({
        eventType: 'stopped',
        fromStatus: 'in_progress',
        toStatus: 'pending',
        timestamp: mkDate(11),
      }),
    ]
    const items = classifyEvents(events)
    expect(items).toHaveLength(2)
    expect(items[0].type).toBe('pointEvent') // created
    expect(items[1].type).toBe('session')
    const session = items[1] as Session
    expect(session.startEvent.eventType).toBe('started')
    expect(session.endEvent!.eventType).toBe('stopped')
  })

  it('classifies started+completed(from in_progress) as session', () => {
    const events = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      mkEvent({
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: mkDate(10),
      }),
      mkEvent({
        eventType: 'completed',
        fromStatus: 'in_progress',
        toStatus: 'completed',
        timestamp: mkDate(11),
      }),
    ]
    const items = classifyEvents(events)
    expect(items).toHaveLength(2)
    expect(items[1].type).toBe('session')
    const session = items[1] as Session
    expect(session.endEvent!.eventType).toBe('completed')
  })

  it('classifies completed(from pending) as point event', () => {
    const events = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      mkEvent({
        eventType: 'completed',
        fromStatus: 'pending',
        toStatus: 'completed',
        timestamp: mkDate(10),
      }),
    ]
    const items = classifyEvents(events)
    expect(items).toHaveLength(2)
    expect(items[0].type).toBe('pointEvent') // created
    expect(items[1].type).toBe('pointEvent') // completed from pending
  })

  it('classifies multiple sessions', () => {
    const events = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      mkEvent({
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: mkDate(10),
      }),
      mkEvent({
        eventType: 'stopped',
        fromStatus: 'in_progress',
        toStatus: 'pending',
        timestamp: mkDate(11),
      }),
      mkEvent({
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: mkDate(13),
      }),
      mkEvent({
        eventType: 'stopped',
        fromStatus: 'in_progress',
        toStatus: 'pending',
        timestamp: mkDate(14),
      }),
    ]
    const items = classifyEvents(events)
    expect(items).toHaveLength(3) // 1 point + 2 sessions
    expect(items[0].type).toBe('pointEvent')
    expect(items[1].type).toBe('session')
    expect(items[2].type).toBe('session')
  })

  it('classifies ongoing session', () => {
    const events = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      mkEvent({
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: mkDate(10),
      }),
    ]
    const items = classifyEvents(events)
    expect(items).toHaveLength(2)
    const session = items[1] as Session
    expect(session.type).toBe('session')
    expect(session.endEvent).toBeNull()
    expect(session.endTime).toBeNull()
  })

  it('classifies reopen cycle correctly', () => {
    const events = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      mkEvent({
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: mkDate(10),
      }),
      mkEvent({
        eventType: 'completed',
        fromStatus: 'in_progress',
        toStatus: 'completed',
        timestamp: mkDate(11),
      }),
      mkEvent({
        eventType: 'reopened',
        fromStatus: 'completed',
        toStatus: 'pending',
        timestamp: mkDate(12),
      }),
      mkEvent({
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: mkDate(13),
      }),
      mkEvent({
        eventType: 'stopped',
        fromStatus: 'in_progress',
        toStatus: 'pending',
        timestamp: mkDate(14),
      }),
    ]
    const items = classifyEvents(events)
    // created(point) + session(S→D) + reopened(point) + session(S→P)
    expect(items).toHaveLength(4)
    expect(items[0].type).toBe('pointEvent') // created
    expect(items[1].type).toBe('session') // S→D
    expect(items[2].type).toBe('pointEvent') // reopened
    expect(items[3].type).toBe('session') // S→P
  })
})

// --- isValidTransition ---

describe('isValidTransition', () => {
  it('created requires null state', () => {
    expect(isValidTransition(null, 'created')).toBe(true)
    expect(isValidTransition('pending', 'created')).toBe(false)
  })

  it('started requires pending', () => {
    expect(isValidTransition('pending', 'started')).toBe(true)
    expect(isValidTransition('in_progress', 'started')).toBe(false)
  })

  it('stopped requires in_progress', () => {
    expect(isValidTransition('in_progress', 'stopped')).toBe(true)
    expect(isValidTransition('pending', 'stopped')).toBe(false)
  })

  it('completed accepts pending or in_progress', () => {
    expect(isValidTransition('pending', 'completed')).toBe(true)
    expect(isValidTransition('in_progress', 'completed')).toBe(true)
    expect(isValidTransition('completed', 'completed')).toBe(false)
  })

  it('reopened requires completed', () => {
    expect(isValidTransition('completed', 'reopened')).toBe(true)
    expect(isValidTransition('pending', 'reopened')).toBe(false)
  })
})

// --- canDeleteSession ---

describe('canDeleteSession', () => {
  it('stopped session is always deletable', () => {
    const startEvt = mkEvent({
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: mkDate(10),
    })
    const stopEvt = mkEvent({
      eventType: 'stopped',
      fromStatus: 'in_progress',
      toStatus: 'pending',
      timestamp: mkDate(11),
    })
    const todoEvents = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      startEvt,
      stopEvt,
    ]
    const session: Session = {
      type: 'session',
      todoId: 'todo-1',
      startEvent: startEvt,
      endEvent: stopEvt,
      startTime: startEvt.timestamp,
      endTime: stopEvt.timestamp,
    }
    expect(canDeleteSession(todoEvents, session)).toBe(true)
  })

  it('completed session at end is deletable', () => {
    const startEvt = mkEvent({
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: mkDate(10),
    })
    const compEvt = mkEvent({
      eventType: 'completed',
      fromStatus: 'in_progress',
      toStatus: 'completed',
      timestamp: mkDate(11),
    })
    const todoEvents = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      startEvt,
      compEvt,
    ]
    const session: Session = {
      type: 'session',
      todoId: 'todo-1',
      startEvent: startEvt,
      endEvent: compEvt,
      startTime: startEvt.timestamp,
      endTime: compEvt.timestamp,
    }
    expect(canDeleteSession(todoEvents, session)).toBe(true)
  })

  it('completed session followed by reopened is NOT deletable', () => {
    const startEvt = mkEvent({
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: mkDate(10),
    })
    const compEvt = mkEvent({
      eventType: 'completed',
      fromStatus: 'in_progress',
      toStatus: 'completed',
      timestamp: mkDate(11),
    })
    const todoEvents = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      startEvt,
      compEvt,
      mkEvent({
        eventType: 'reopened',
        fromStatus: 'completed',
        toStatus: 'pending',
        timestamp: mkDate(12),
      }),
    ]
    const session: Session = {
      type: 'session',
      todoId: 'todo-1',
      startEvent: startEvt,
      endEvent: compEvt,
      startTime: startEvt.timestamp,
      endTime: compEvt.timestamp,
    }
    expect(canDeleteSession(todoEvents, session)).toBe(false)
  })

  it('ongoing session is deletable', () => {
    const startEvt = mkEvent({
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: mkDate(10),
    })
    const todoEvents = [
      mkEvent({
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: mkDate(9),
      }),
      startEvt,
    ]
    const session: Session = {
      type: 'session',
      todoId: 'todo-1',
      startEvent: startEvt,
      endEvent: null,
      startTime: startEvt.timestamp,
      endTime: null,
    }
    expect(canDeleteSession(todoEvents, session)).toBe(true)
  })
})

// --- canDeletePointEvent ---

describe('canDeletePointEvent', () => {
  it('created event is never deletable', () => {
    const created = mkEvent({
      eventType: 'created',
      fromStatus: null,
      toStatus: 'pending',
      timestamp: mkDate(9),
    })
    expect(canDeletePointEvent([created], created)).toBe(false)
  })

  it('last completed(from pending) is deletable', () => {
    const created = mkEvent({
      eventType: 'created',
      fromStatus: null,
      toStatus: 'pending',
      timestamp: mkDate(9),
    })
    const completed = mkEvent({
      eventType: 'completed',
      fromStatus: 'pending',
      toStatus: 'completed',
      timestamp: mkDate(10),
    })
    expect(canDeletePointEvent([created, completed], completed)).toBe(true)
  })

  it('completed before reopened is NOT deletable', () => {
    const created = mkEvent({
      eventType: 'created',
      fromStatus: null,
      toStatus: 'pending',
      timestamp: mkDate(9),
    })
    const completed = mkEvent({
      eventType: 'completed',
      fromStatus: 'pending',
      toStatus: 'completed',
      timestamp: mkDate(10),
    })
    const reopened = mkEvent({
      eventType: 'reopened',
      fromStatus: 'completed',
      toStatus: 'pending',
      timestamp: mkDate(11),
    })
    expect(
      canDeletePointEvent([created, completed, reopened], completed),
    ).toBe(false)
  })

  it('last reopened is deletable', () => {
    const created = mkEvent({
      eventType: 'created',
      fromStatus: null,
      toStatus: 'pending',
      timestamp: mkDate(9),
    })
    const completed = mkEvent({
      eventType: 'completed',
      fromStatus: 'pending',
      toStatus: 'completed',
      timestamp: mkDate(10),
    })
    const reopened = mkEvent({
      eventType: 'reopened',
      fromStatus: 'completed',
      toStatus: 'pending',
      timestamp: mkDate(11),
    })
    expect(
      canDeletePointEvent([created, completed, reopened], reopened),
    ).toBe(true)
  })
})

// --- getSessionEditableRange ---

describe('getSessionEditableRange', () => {
  it('returns correct range for a session between events', () => {
    const created = mkEvent({
      eventType: 'created',
      fromStatus: null,
      toStatus: 'pending',
      timestamp: mkDate(9),
    })
    const startEvt = mkEvent({
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: mkDate(10),
    })
    const stopEvt = mkEvent({
      eventType: 'stopped',
      fromStatus: 'in_progress',
      toStatus: 'pending',
      timestamp: mkDate(11),
    })
    const nextStart = mkEvent({
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: mkDate(13),
    })
    const nextStop = mkEvent({
      eventType: 'stopped',
      fromStatus: 'in_progress',
      toStatus: 'pending',
      timestamp: mkDate(14),
    })
    const session: Session = {
      type: 'session',
      todoId: 'todo-1',
      startEvent: startEvt,
      endEvent: stopEvt,
      startTime: startEvt.timestamp,
      endTime: stopEvt.timestamp,
    }
    const range = getSessionEditableRange(
      [created, startEvt, stopEvt, nextStart, nextStop],
      session,
    )
    expect(range.startMin).toEqual(created.timestamp) // 09:00
    expect(range.startMax).toEqual(stopEvt.timestamp) // 11:00
    expect(range.endMin).toEqual(startEvt.timestamp) // 10:00
    expect(range.endMax).toEqual(nextStart.timestamp) // 13:00
  })
})

// --- getPointEventEditableRange ---

describe('getPointEventEditableRange', () => {
  it('returns correct range for created event', () => {
    const created = mkEvent({
      eventType: 'created',
      fromStatus: null,
      toStatus: 'pending',
      timestamp: mkDate(9),
    })
    const started = mkEvent({
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: mkDate(10),
    })
    const range = getPointEventEditableRange([created, started], created)
    expect(range.min).toEqual(new Date(0))
    expect(range.max).toEqual(started.timestamp)
  })
})

// --- computeEditTimestamp ---

describe('computeEditTimestamp', () => {
  const day = new Date('2026-02-19T00:00:00')

  it('uses clean M:00 when strictly between adjacent minutes', () => {
    const result = computeEditTimestamp(
      630, // 10:30
      mkDate(10, 0), // prev at 10:00
      mkDate(11, 0), // next at 11:00
      day,
    )
    expect(result.getHours()).toBe(10)
    expect(result.getMinutes()).toBe(30)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('adds 1ms when same minute as previous', () => {
    const prev = mkDate(10, 30, 15, 500) // 10:30:15.500
    const result = computeEditTimestamp(
      630, // 10:30
      prev,
      mkDate(11, 0),
      day,
    )
    expect(result.getTime()).toBe(prev.getTime() + 1)
  })

  it('subtracts 1ms when same minute as next', () => {
    const next = mkDate(10, 30, 15, 500) // 10:30:15.500
    const result = computeEditTimestamp(
      630, // 10:30
      mkDate(10, 0),
      next,
      day,
    )
    expect(result.getTime()).toBe(next.getTime() - 1)
  })

  it('uses midpoint when both same minute', () => {
    const prev = mkDate(10, 30, 10, 0) // 10:30:10.000
    const next = mkDate(10, 30, 20, 0) // 10:30:20.000
    const result = computeEditTimestamp(630, prev, next, day)
    expect(result.getTime()).toBe(
      Math.floor((prev.getTime() + next.getTime()) / 2),
    )
  })
})
