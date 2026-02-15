import { db } from '@/db/schema'
import type { Todo } from '@/db/schema'
import { addHistoryEvent } from './historyRepository'

export const getAllTodos = async (): Promise<Todo[]> => {
  return db.todos.toArray()
}

export const addTodo = async (title: string): Promise<string> => {
  const id = crypto.randomUUID()
  const now = new Date()
  await db.transaction('rw', [db.todos, db.todoHistory], async () => {
    await db.todos.add({
      id,
      title,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })
    await addHistoryEvent({
      todoId: id,
      eventType: 'created',
      fromStatus: null,
      toStatus: 'pending',
      timestamp: now,
    })
  })
  return id
}

export const startTodo = async (id: string): Promise<void> => {
  await db.transaction('rw', [db.todos, db.todoHistory], async () => {
    const now = new Date()
    const currentInProgress = await db.todos
      .where('status')
      .equals('in_progress')
      .first()
    if (currentInProgress) {
      await db.todos.update(currentInProgress.id, {
        status: 'pending',
        updatedAt: now,
      })
      await addHistoryEvent({
        todoId: currentInProgress.id,
        eventType: 'stopped',
        fromStatus: 'in_progress',
        toStatus: 'pending',
        timestamp: now,
      })
    }
    await db.todos.update(id, {
      status: 'in_progress',
      updatedAt: now,
    })
    await addHistoryEvent({
      todoId: id,
      eventType: 'started',
      fromStatus: 'pending',
      toStatus: 'in_progress',
      timestamp: now,
    })
  })
}

export const stopTodo = async (id: string): Promise<void> => {
  const now = new Date()
  await db.transaction('rw', [db.todos, db.todoHistory], async () => {
    await db.todos.update(id, { status: 'pending', updatedAt: now })
    await addHistoryEvent({
      todoId: id,
      eventType: 'stopped',
      fromStatus: 'in_progress',
      toStatus: 'pending',
      timestamp: now,
    })
  })
}

export const completeTodo = async (id: string): Promise<void> => {
  const now = new Date()
  await db.transaction('rw', [db.todos, db.todoHistory], async () => {
    const todo = await db.todos.get(id)
    await db.todos.update(id, { status: 'completed', updatedAt: now })
    await addHistoryEvent({
      todoId: id,
      eventType: 'completed',
      fromStatus: todo?.status ?? 'pending',
      toStatus: 'completed',
      timestamp: now,
    })
  })
}

export const reopenTodo = async (id: string): Promise<void> => {
  const now = new Date()
  await db.transaction('rw', [db.todos, db.todoHistory], async () => {
    await db.todos.update(id, { status: 'pending', updatedAt: now })
    await addHistoryEvent({
      todoId: id,
      eventType: 'reopened',
      fromStatus: 'completed',
      toStatus: 'pending',
      timestamp: now,
    })
  })
}
