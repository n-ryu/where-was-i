import { useEffect, useMemo, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import type { TodoStatus } from '@/db/schema'
import {
  historyEventsAtom,
  todoLookupAtom,
  timeBlocksAtom,
  timeMarkersAtom,
  loadHistoryAtom,
  loadTodoLookupAtom,
} from '@/stores/historyAtoms'

export interface IncompleteTodo {
  todoId: string
  todoTitle: string
  lastStatus: TodoStatus
}

export const useHistory = () => {
  const timeBlocks = useAtomValue(timeBlocksAtom)
  const timeMarkers = useAtomValue(timeMarkersAtom)
  const historyEvents = useAtomValue(historyEventsAtom)
  const todoLookup = useAtomValue(todoLookupAtom)
  const loadHistory = useSetAtom(loadHistoryAtom)
  const loadTodoLookup = useSetAtom(loadTodoLookupAtom)
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  useEffect(() => {
    loadHistory()
    loadTodoLookup()
  }, [loadHistory, loadTodoLookup])

  const incompleteTodos = useMemo(() => {
    const dayStart = new Date(selectedDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(selectedDate)
    dayEnd.setHours(23, 59, 59, 999)

    const dayEvents = historyEvents.filter(
      (e) => e.timestamp >= dayStart && e.timestamp <= dayEnd,
    )

    const lastEventByTodo = new Map<string, { toStatus: TodoStatus; timestamp: Date }>()
    for (const event of dayEvents) {
      const existing = lastEventByTodo.get(event.todoId)
      if (!existing || event.timestamp > existing.timestamp) {
        lastEventByTodo.set(event.todoId, {
          toStatus: event.toStatus,
          timestamp: event.timestamp,
        })
      }
    }

    const result: IncompleteTodo[] = []
    for (const [todoId, info] of lastEventByTodo) {
      if (info.toStatus !== 'completed') {
        const title = todoLookup.get(todoId)?.title ?? 'Unknown'
        result.push({ todoId, todoTitle: title, lastStatus: info.toStatus })
      }
    }

    return result
  }, [historyEvents, todoLookup, selectedDate])

  return { timeBlocks, timeMarkers, incompleteTodos, selectedDate, setSelectedDate }
}
