import { atom } from 'jotai'
import type { Todo } from '@/db/schema'
import {
  getAllTodos,
  addTodo as addTodoToDb,
  startTodo as startTodoInDb,
  stopTodo as stopTodoInDb,
  completeTodo as completeTodoInDb,
  reopenTodo as reopenTodoInDb,
} from '@/db/repositories/todoRepository'

export const todosAtom = atom<Todo[]>([])

export const loadTodosAtom = atom(null, async (_get, set) => {
  const todos = await getAllTodos()
  set(todosAtom, todos)
})

export const inProgressTodoAtom = atom((get) => {
  return get(todosAtom).find((t) => t.status === 'in_progress') ?? null
})

export const pendingTodosAtom = atom((get) => {
  return get(todosAtom)
    .filter((t) => t.status === 'pending')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

export const completedTodosAtom = atom((get) => {
  return get(todosAtom)
    .filter((t) => t.status === 'completed')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
})

export const addTodoAtom = atom(null, async (_get, set, title: string) => {
  await addTodoToDb(title)
  const todos = await getAllTodos()
  set(todosAtom, todos)
})

type TodoAction = 'start' | 'stop' | 'complete' | 'reopen'

export const toggleTodoStatusAtom = atom(
  null,
  async (_get, set, params: { id: string; action: TodoAction }) => {
    const { id, action } = params
    switch (action) {
      case 'start':
        await startTodoInDb(id)
        break
      case 'stop':
        await stopTodoInDb(id)
        break
      case 'complete':
        await completeTodoInDb(id)
        break
      case 'reopen':
        await reopenTodoInDb(id)
        break
    }
    const todos = await getAllTodos()
    set(todosAtom, todos)
  },
)
