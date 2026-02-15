import { createStore } from 'jotai'
import type { Todo } from '@/db/schema'
import {
  todosAtom,
  inProgressTodoAtom,
  pendingTodosAtom,
  completedTodosAtom,
} from './todoAtoms'

const makeTodo = (
  overrides: Partial<Todo> & { id: string; title: string },
): Todo => ({
  status: 'pending',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
})

describe('todoAtoms', () => {
  describe('inProgressTodoAtom', () => {
    it('should derive the in-progress todo from todos list', () => {
      const store = createStore()
      const inProgressTodo = makeTodo({
        id: '1',
        title: 'In Progress',
        status: 'in_progress',
      })
      store.set(todosAtom, [
        inProgressTodo,
        makeTodo({ id: '2', title: 'Pending' }),
      ])
      expect(store.get(inProgressTodoAtom)).toEqual(inProgressTodo)
    })

    it('should return null when no todo is in progress', () => {
      const store = createStore()
      store.set(todosAtom, [
        makeTodo({ id: '1', title: 'Pending' }),
      ])
      expect(store.get(inProgressTodoAtom)).toBeNull()
    })
  })

  describe('pendingTodosAtom', () => {
    it('should derive pending todos sorted by createdAt descending', () => {
      const store = createStore()
      const older = makeTodo({
        id: '1',
        title: 'Older',
        createdAt: new Date('2025-01-01'),
      })
      const newer = makeTodo({
        id: '2',
        title: 'Newer',
        createdAt: new Date('2025-01-02'),
      })
      store.set(todosAtom, [older, newer])
      const pending = store.get(pendingTodosAtom)
      expect(pending[0].id).toBe('2')
      expect(pending[1].id).toBe('1')
    })
  })

  describe('completedTodosAtom', () => {
    it('should derive completed todos sorted by updatedAt descending', () => {
      const store = createStore()
      const olderCompleted = makeTodo({
        id: '1',
        title: 'Older',
        status: 'completed',
        updatedAt: new Date('2025-01-01'),
      })
      const newerCompleted = makeTodo({
        id: '2',
        title: 'Newer',
        status: 'completed',
        updatedAt: new Date('2025-01-02'),
      })
      store.set(todosAtom, [olderCompleted, newerCompleted])
      const completed = store.get(completedTodosAtom)
      expect(completed[0].id).toBe('2')
      expect(completed[1].id).toBe('1')
    })
  })
})
