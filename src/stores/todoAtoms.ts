import { atom } from 'jotai'
import type { Todo, TodoHistoryEvent } from '@/db/schema'
import {
  getAllTodos,
  addTodo as addTodoToDb,
  startTodo as startTodoInDb,
  stopTodo as stopTodoInDb,
  completeTodo as completeTodoInDb,
  reopenTodo as reopenTodoInDb,
} from '@/db/repositories/todoRepository'
import { getHistoryByDateRange } from '@/db/repositories/historyRepository'

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

// Today's events for categorization
export const todayEventsAtom = atom<TodoHistoryEvent[]>([])

const loadTodayEvents = async (): Promise<TodoHistoryEvent[]> => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return getHistoryByDateRange(start, end)
}

export const loadTodayEventsAtom = atom(null, async (_get, set) => {
  const events = await loadTodayEvents()
  set(todayEventsAtom, events)
})

const todayEventsByTodoAtom = atom((get) => {
  const events = get(todayEventsAtom)
  const map = new Map<string, TodoHistoryEvent[]>()
  for (const event of events) {
    const existing = map.get(event.todoId) ?? []
    existing.push(event)
    map.set(event.todoId, existing)
  }
  return map
})

export const completedTodayTodosAtom = atom((get) => {
  const todos = get(todosAtom)
  const eventsByTodo = get(todayEventsByTodoAtom)
  return todos
    .filter(
      (t) =>
        t.status === 'completed' &&
        (eventsByTodo.get(t.id) ?? []).some((e) => e.eventType === 'completed'),
    )
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
})

export const activeTodayTodosAtom = atom((get) => {
  const todos = get(todosAtom)
  return todos
    .filter((t) => t.status === 'in_progress')
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
})

export const idleTodosAtom = atom((get) => {
  const todos = get(todosAtom)
  return todos
    .filter((t) => t.status === 'pending')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

export const addTodoAtom = atom(null, async (_get, set, title: string) => {
  await addTodoToDb(title)
  const [todos, events] = await Promise.all([getAllTodos(), loadTodayEvents()])
  set(todosAtom, todos)
  set(todayEventsAtom, events)
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
    const [todos, events] = await Promise.all([getAllTodos(), loadTodayEvents()])
    set(todosAtom, todos)
    set(todayEventsAtom, events)
  },
)
