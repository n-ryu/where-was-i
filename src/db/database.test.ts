import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from './database'
import type { Task } from '../types'

describe('Database', () => {
  beforeEach(async () => {
    await db.open()
  })

  afterEach(async () => {
    await db.tasks.clear()
  })

  describe('초기화', () => {
    it('데이터베이스를 생성할 수 있다', () => {
      expect(db.name).toBe('where-was-i-db')
    })

    it('tasks 테이블이 존재한다', () => {
      expect(db.tasks).toBeDefined()
    })
  })

  describe('Task 테이블', () => {
    const sampleTask: Task = {
      id: 'task-1',
      title: '아침 조깅하기',
      status: 'pending',
      date: '2025-01-15',
      events: [],
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
    }

    it('Task를 추가할 수 있다', async () => {
      const id = await db.tasks.add(sampleTask)
      expect(id).toBe('task-1')
    })

    it('Task를 ID로 조회할 수 있다', async () => {
      await db.tasks.add(sampleTask)
      const task = await db.tasks.get('task-1')
      expect(task).toMatchObject({
        id: 'task-1',
        title: '아침 조깅하기',
        status: 'pending',
      })
    })

    it('Task를 날짜로 조회할 수 있다', async () => {
      await db.tasks.add(sampleTask)
      await db.tasks.add({
        ...sampleTask,
        id: 'task-2',
        title: '저녁 독서',
        date: '2025-01-15',
      })
      await db.tasks.add({
        ...sampleTask,
        id: 'task-3',
        title: '다른 날 과업',
        date: '2025-01-16',
      })
      const tasks = await db.tasks.where('date').equals('2025-01-15').toArray()
      expect(tasks).toHaveLength(2)
    })

    it('Task를 수정할 수 있다', async () => {
      await db.tasks.add(sampleTask)
      await db.tasks.update('task-1', { status: 'in_progress' })
      const task = await db.tasks.get('task-1')
      expect(task?.status).toBe('in_progress')
    })

    it('Task를 삭제할 수 있다', async () => {
      await db.tasks.add(sampleTask)
      await db.tasks.delete('task-1')
      const task = await db.tasks.get('task-1')
      expect(task).toBeUndefined()
    })

    it('Task에 Event를 추가할 수 있다', async () => {
      await db.tasks.add(sampleTask)
      const task = await db.tasks.get('task-1')
      const newEvent = {
        eventType: 'started' as const,
        timestamp: new Date(),
      }
      await db.tasks.update('task-1', {
        events: [...(task?.events || []), newEvent],
      })
      const updatedTask = await db.tasks.get('task-1')
      expect(updatedTask?.events).toHaveLength(1)
      expect(updatedTask?.events[0].eventType).toBe('started')
    })
  })
})
