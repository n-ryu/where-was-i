import { atom } from 'jotai'
import type { Todo, TodoHistoryEvent } from '@/db/schema'
import { getAllHistory } from '@/db/repositories/historyRepository'
import { getAllTodos } from '@/db/repositories/todoRepository'

export const historyEventsAtom = atom<TodoHistoryEvent[]>([])

export const loadHistoryAtom = atom(null, async (_get, set) => {
  const events = await getAllHistory()
  set(historyEventsAtom, events)
})

export const todoLookupAtom = atom<Map<string, Todo>>(new Map())

export const loadTodoLookupAtom = atom(null, async (_get, set) => {
  const todos = await getAllTodos()
  const map = new Map(todos.map((t) => [t.id, t]))
  set(todoLookupAtom, map)
})

export interface TimeBlock {
  todoId: string
  todoTitle: string
  startTime: Date
  endTime: Date | null
  endReason: 'stopped' | 'completed' | 'ongoing'
}

export const timeBlocksAtom = atom<TimeBlock[]>((get) => {
  const events = get(historyEventsAtom)
  const todoLookup = get(todoLookupAtom)

  const sorted = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )

  const openStarts = new Map<string, TodoHistoryEvent>()
  const blocks: TimeBlock[] = []

  for (const event of sorted) {
    const title = todoLookup.get(event.todoId)?.title ?? 'Unknown'

    if (event.eventType === 'started') {
      openStarts.set(event.todoId, event)
    } else if (
      event.eventType === 'stopped' ||
      event.eventType === 'completed'
    ) {
      const startEvent = openStarts.get(event.todoId)
      if (startEvent) {
        blocks.push({
          todoId: event.todoId,
          todoTitle: title,
          startTime: startEvent.timestamp,
          endTime: event.timestamp,
          endReason: event.eventType === 'completed' ? 'completed' : 'stopped',
        })
        openStarts.delete(event.todoId)
      }
    }
  }

  for (const [todoId, startEvent] of openStarts) {
    const title = todoLookup.get(todoId)?.title ?? 'Unknown'
    blocks.push({
      todoId,
      todoTitle: title,
      startTime: startEvent.timestamp,
      endTime: null,
      endReason: 'ongoing',
    })
  }

  return blocks.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
})
