import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from './database'
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getTasksByDate,
  getTasksByStatus,
  getTasksByGoalId,
  updateTaskStatus,
  addTaskEvent,
} from './taskRepository'

describe('TaskRepository', () => {
  beforeEach(async () => {
    await db.open()
  })

  afterEach(async () => {
    await db.tasks.clear()
  })

  describe('CRUD', () => {
    it('Task를 생성할 수 있다', async () => {
      const task = await createTask({
        title: '아침 운동',
        date: '2025-01-15',
      })

      expect(task.id).toBeDefined()
      expect(task.title).toBe('아침 운동')
      expect(task.status).toBe('pending')
      expect(task.date).toBe('2025-01-15')
      expect(task.events).toEqual([])
      expect(task.createdAt).toBeInstanceOf(Date)
    })

    it('Task를 ID로 조회할 수 있다', async () => {
      const created = await createTask({
        title: '독서하기',
        date: '2025-01-15',
      })
      const task = await getTask(created.id)

      expect(task).toBeDefined()
      expect(task?.title).toBe('독서하기')
    })

    it('존재하지 않는 Task 조회 시 undefined를 반환한다', async () => {
      const task = await getTask('non-existent-id')
      expect(task).toBeUndefined()
    })

    it('Task를 수정할 수 있다', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2025-01-15T10:00:00'))

      const created = await createTask({
        title: '원래 제목',
        date: '2025-01-15',
      })

      vi.setSystemTime(new Date('2025-01-15T10:00:01'))
      const updated = await updateTask(created.id, { title: '수정된 제목' })

      expect(updated?.title).toBe('수정된 제목')
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        created.updatedAt.getTime()
      )

      vi.useRealTimers()
    })

    it('Task를 삭제할 수 있다', async () => {
      const created = await createTask({
        title: '삭제할 과업',
        date: '2025-01-15',
      })
      await deleteTask(created.id)
      const task = await getTask(created.id)

      expect(task).toBeUndefined()
    })
  })

  describe('목록 조회', () => {
    beforeEach(async () => {
      await createTask({ title: '과업 1', date: '2025-01-15' })
      await createTask({
        title: '과업 2',
        date: '2025-01-15',
        goalId: 'goal-1',
      })
      await createTask({ title: '과업 3', date: '2025-01-16' })
      const task4 = await createTask({ title: '과업 4', date: '2025-01-15' })
      await updateTaskStatus(task4.id, 'in_progress')
    })

    it('특정 날짜의 Task를 조회할 수 있다', async () => {
      const tasks = await getTasksByDate('2025-01-15')
      expect(tasks).toHaveLength(3)
    })

    it('특정 상태의 Task를 조회할 수 있다', async () => {
      const pendingTasks = await getTasksByStatus('pending')
      expect(pendingTasks).toHaveLength(3)

      const inProgressTasks = await getTasksByStatus('in_progress')
      expect(inProgressTasks).toHaveLength(1)
    })

    it('특정 Goal에 연결된 Task를 조회할 수 있다', async () => {
      const tasks = await getTasksByGoalId('goal-1')
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('과업 2')
    })
  })

  describe('상태 변경', () => {
    it('Task 상태를 변경할 수 있다', async () => {
      const task = await createTask({ title: '과업', date: '2025-01-15' })
      const updated = await updateTaskStatus(task.id, 'in_progress')

      expect(updated?.status).toBe('in_progress')
    })

    it('상태 변경 시 updatedAt이 갱신된다', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2025-01-15T10:00:00'))

      const task = await createTask({ title: '과업', date: '2025-01-15' })

      vi.setSystemTime(new Date('2025-01-15T10:00:01'))
      const updated = await updateTaskStatus(task.id, 'completed')

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        task.updatedAt.getTime()
      )

      vi.useRealTimers()
    })
  })

  describe('TaskEvent', () => {
    it('Task에 started 이벤트를 추가할 수 있다', async () => {
      const task = await createTask({ title: '과업', date: '2025-01-15' })
      const updated = await addTaskEvent(task.id, 'started')

      expect(updated?.events).toHaveLength(1)
      expect(updated?.events[0].eventType).toBe('started')
      expect(updated?.events[0].timestamp).toBeInstanceOf(Date)
    })

    it('Task에 paused 이벤트를 추가할 수 있다', async () => {
      const task = await createTask({ title: '과업', date: '2025-01-15' })
      await addTaskEvent(task.id, 'started')
      const updated = await addTaskEvent(task.id, 'paused')

      expect(updated?.events).toHaveLength(2)
      expect(updated?.events[1].eventType).toBe('paused')
    })

    it('Task에 completed 이벤트를 추가할 수 있다', async () => {
      const task = await createTask({ title: '과업', date: '2025-01-15' })
      const updated = await addTaskEvent(task.id, 'completed')

      expect(updated?.events[0].eventType).toBe('completed')
    })

    it('Task에 cancelled 이벤트를 추가할 수 있다', async () => {
      const task = await createTask({ title: '과업', date: '2025-01-15' })
      const updated = await addTaskEvent(task.id, 'cancelled')

      expect(updated?.events[0].eventType).toBe('cancelled')
    })
  })
})
