import { db } from '@/db/schema'
import {
  addTodo,
  getAllTodos,
  startTodo,
  stopTodo,
  completeTodo,
  reopenTodo,
} from './todoRepository'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

afterEach(async () => {
  await db.close()
})

describe('todoRepository', () => {
  describe('addTodo', () => {
    it('should create a new todo with pending status', async () => {
      const id = await addTodo('Test task')
      const todo = await db.todos.get(id)
      expect(todo).toBeDefined()
      expect(todo!.title).toBe('Test task')
      expect(todo!.status).toBe('pending')
    })

    it('should set createdAt and updatedAt to current time', async () => {
      const before = new Date()
      const id = await addTodo('Test task')
      const after = new Date()
      const todo = await db.todos.get(id)
      expect(todo!.createdAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      )
      expect(todo!.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
      expect(todo!.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      )
      expect(todo!.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should generate a unique id', async () => {
      const id1 = await addTodo('Task 1')
      const id2 = await addTodo('Task 2')
      expect(id1).not.toBe(id2)
    })
  })

  describe('getAllTodos', () => {
    it('should return all todos', async () => {
      await addTodo('Task 1')
      await addTodo('Task 2')
      await addTodo('Task 3')
      const todos = await getAllTodos()
      expect(todos).toHaveLength(3)
    })

    it('should return an empty array when no todos exist', async () => {
      const todos = await getAllTodos()
      expect(todos).toEqual([])
    })
  })

  describe('startTodo', () => {
    it('should set the target todo to in_progress', async () => {
      const id = await addTodo('Test task')
      await startTodo(id)
      const todo = await db.todos.get(id)
      expect(todo!.status).toBe('in_progress')
    })

    it('should demote the current in_progress todo to pending when starting another', async () => {
      const id1 = await addTodo('Task 1')
      const id2 = await addTodo('Task 2')
      await startTodo(id1)
      await startTodo(id2)
      const todo1 = await db.todos.get(id1)
      const todo2 = await db.todos.get(id2)
      expect(todo1!.status).toBe('pending')
      expect(todo2!.status).toBe('in_progress')
    })

    it('should handle starting a todo when no other todo is in_progress', async () => {
      const id = await addTodo('Test task')
      await startTodo(id)
      const todo = await db.todos.get(id)
      expect(todo!.status).toBe('in_progress')
      const allTodos = await getAllTodos()
      const inProgressCount = allTodos.filter(
        (t) => t.status === 'in_progress',
      ).length
      expect(inProgressCount).toBe(1)
    })
  })

  describe('stopTodo', () => {
    it('should set the todo back to pending', async () => {
      const id = await addTodo('Test task')
      await startTodo(id)
      await stopTodo(id)
      const todo = await db.todos.get(id)
      expect(todo!.status).toBe('pending')
    })

    it('should update the updatedAt timestamp', async () => {
      const id = await addTodo('Test task')
      await startTodo(id)
      const todoBefore = await db.todos.get(id)
      await new Promise((r) => setTimeout(r, 10))
      await stopTodo(id)
      const todoAfter = await db.todos.get(id)
      expect(todoAfter!.updatedAt.getTime()).toBeGreaterThan(
        todoBefore!.updatedAt.getTime(),
      )
    })
  })

  describe('completeTodo', () => {
    it('should set the todo to completed', async () => {
      const id = await addTodo('Test task')
      await completeTodo(id)
      const todo = await db.todos.get(id)
      expect(todo!.status).toBe('completed')
    })

    it('should complete an in_progress todo', async () => {
      const id = await addTodo('Test task')
      await startTodo(id)
      await completeTodo(id)
      const todo = await db.todos.get(id)
      expect(todo!.status).toBe('completed')
    })
  })

  describe('reopenTodo', () => {
    it('should set a completed todo back to pending', async () => {
      const id = await addTodo('Test task')
      await completeTodo(id)
      await reopenTodo(id)
      const todo = await db.todos.get(id)
      expect(todo!.status).toBe('pending')
    })
  })
})
