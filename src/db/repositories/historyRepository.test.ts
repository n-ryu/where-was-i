import { db } from '@/db/schema'
import {
  addHistoryEvent,
  getHistoryByTodoId,
  getAllHistory,
  getHistoryByDateRange,
} from './historyRepository'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

afterEach(async () => {
  await db.close()
})

describe('historyRepository', () => {
  const baseTodoId = 'test-todo-id'

  describe('addHistoryEvent', () => {
    it('should create a history event with a unique id', async () => {
      const id = await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: new Date(),
      })
      const event = await db.todoHistory.get(id)
      expect(event).toBeDefined()
      expect(event!.todoId).toBe(baseTodoId)
      expect(event!.eventType).toBe('created')
      expect(event!.fromStatus).toBeNull()
      expect(event!.toStatus).toBe('pending')
    })

    it('should generate unique ids for each event', async () => {
      const id1 = await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: new Date(),
      })
      const id2 = await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: new Date(),
      })
      expect(id1).not.toBe(id2)
    })
  })

  describe('getHistoryByTodoId', () => {
    it('should return events for a specific todo sorted by timestamp', async () => {
      const t1 = new Date('2026-01-01T10:00:00')
      const t2 = new Date('2026-01-01T11:00:00')
      const t3 = new Date('2026-01-01T12:00:00')

      await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: t2,
      })
      await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: t1,
      })
      await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'completed',
        fromStatus: 'in_progress',
        toStatus: 'completed',
        timestamp: t3,
      })

      const events = await getHistoryByTodoId(baseTodoId)
      expect(events).toHaveLength(3)
      expect(events[0].eventType).toBe('created')
      expect(events[1].eventType).toBe('started')
      expect(events[2].eventType).toBe('completed')
    })

    it('should not include events from other todos', async () => {
      await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: new Date(),
      })
      await addHistoryEvent({
        todoId: 'other-todo-id',
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: new Date(),
      })

      const events = await getHistoryByTodoId(baseTodoId)
      expect(events).toHaveLength(1)
      expect(events[0].todoId).toBe(baseTodoId)
    })
  })

  describe('getAllHistory', () => {
    it('should return all events sorted by timestamp descending', async () => {
      const t1 = new Date('2026-01-01T10:00:00')
      const t2 = new Date('2026-01-01T11:00:00')

      await addHistoryEvent({
        todoId: 'todo-1',
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: t1,
      })
      await addHistoryEvent({
        todoId: 'todo-2',
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: t2,
      })

      const events = await getAllHistory()
      expect(events).toHaveLength(2)
      expect(events[0].todoId).toBe('todo-2')
      expect(events[1].todoId).toBe('todo-1')
    })

    it('should return an empty array when no events exist', async () => {
      const events = await getAllHistory()
      expect(events).toEqual([])
    })
  })

  describe('getHistoryByDateRange', () => {
    it('should return events within the date range', async () => {
      const t1 = new Date('2026-01-01T10:00:00')
      const t2 = new Date('2026-01-01T14:00:00')
      const t3 = new Date('2026-01-02T10:00:00')

      await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'created',
        fromStatus: null,
        toStatus: 'pending',
        timestamp: t1,
      })
      await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'started',
        fromStatus: 'pending',
        toStatus: 'in_progress',
        timestamp: t2,
      })
      await addHistoryEvent({
        todoId: baseTodoId,
        eventType: 'completed',
        fromStatus: 'in_progress',
        toStatus: 'completed',
        timestamp: t3,
      })

      const rangeStart = new Date('2026-01-01T00:00:00')
      const rangeEnd = new Date('2026-01-01T23:59:59')
      const events = await getHistoryByDateRange(rangeStart, rangeEnd)

      expect(events).toHaveLength(2)
      expect(events[0].eventType).toBe('created')
      expect(events[1].eventType).toBe('started')
    })
  })
})
