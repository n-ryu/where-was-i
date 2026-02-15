import { db } from '@/db/schema'
import type { Todo } from '@/db/schema'

export const getAllTodos = async (): Promise<Todo[]> => {
  return db.todos.toArray()
}

export const addTodo = async (title: string): Promise<string> => {
  const id = crypto.randomUUID()
  const now = new Date()
  await db.todos.add({
    id,
    title,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  })
  return id
}

export const startTodo = async (id: string): Promise<void> => {
  await db.transaction('rw', db.todos, async () => {
    const currentInProgress = await db.todos
      .where('status')
      .equals('in_progress')
      .first()
    if (currentInProgress) {
      await db.todos.update(currentInProgress.id, {
        status: 'pending',
        updatedAt: new Date(),
      })
    }
    await db.todos.update(id, {
      status: 'in_progress',
      updatedAt: new Date(),
    })
  })
}

export const stopTodo = async (id: string): Promise<void> => {
  await db.todos.update(id, { status: 'pending', updatedAt: new Date() })
}

export const completeTodo = async (id: string): Promise<void> => {
  await db.todos.update(id, { status: 'completed', updatedAt: new Date() })
}

export const reopenTodo = async (id: string): Promise<void> => {
  await db.todos.update(id, { status: 'pending', updatedAt: new Date() })
}
