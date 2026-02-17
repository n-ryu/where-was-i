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
import type { ActiveTodo, TodoDayStatus } from '../types'

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export const useHistory = () => {
  const historyEvents = useAtomValue(historyEventsAtom)
  const todoLookup = useAtomValue(todoLookupAtom)
  const timeBlocks = useAtomValue(timeBlocksAtom)
  const timeMarkers = useAtomValue(timeMarkersAtom)
  const loadHistory = useSetAtom(loadHistoryAtom)
  const loadTodoLookup = useSetAtom(loadTodoLookupAtom)
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  useEffect(() => {
    loadHistory()
    loadTodoLookup()
  }, [loadHistory, loadTodoLookup])

  const activeTodos = useMemo(() => {
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const eventsByTodo = new Map<
      string,
      { todoId: string; timestamps: Date[]; toStatuses: TodoStatus[] }
    >()
    for (const event of historyEvents) {
      let entry = eventsByTodo.get(event.todoId)
      if (!entry) {
        entry = { todoId: event.todoId, timestamps: [], toStatuses: [] }
        eventsByTodo.set(event.todoId, entry)
      }
      entry.timestamps.push(event.timestamp)
      entry.toStatuses.push(event.toStatus)
    }

    const result: ActiveTodo[] = []

    for (const [todoId, entry] of eventsByTodo) {
      const indices = entry.timestamps
        .map((_, i) => i)
        .sort(
          (a, b) =>
            entry.timestamps[a].getTime() - entry.timestamps[b].getTime(),
        )

      let statusAtStartOfDay: TodoStatus | null = null
      let firstEventTime: Date | null = null
      for (const i of indices) {
        if (!firstEventTime) firstEventTime = entry.timestamps[i]
        if (entry.timestamps[i] < startOfDay) {
          statusAtStartOfDay = entry.toStatuses[i]
        }
      }

      if (statusAtStartOfDay === 'completed') continue
      if (firstEventTime && firstEventTime > endOfDay) continue

      const title = todoLookup.get(todoId)?.title ?? 'Unknown'

      const hasBlocks = timeBlocks.some((b) => {
        const blockStart = b.startTime
        const blockEnd = b.endTime ?? new Date()
        return (
          b.todoId === todoId &&
          (isSameDay(blockStart, selectedDate) ||
            isSameDay(blockEnd, selectedDate))
        )
      })

      const completedOnDay = timeMarkers.some(
        (m) =>
          m.todoId === todoId &&
          m.eventType === 'completed' &&
          !m.dimmed &&
          isSameDay(m.timestamp, selectedDate),
      )

      let dayStatus: TodoDayStatus
      if (completedOnDay) {
        dayStatus = 'completed'
      } else if (hasBlocks) {
        dayStatus = 'incomplete'
      } else {
        dayStatus = 'inactive'
      }

      result.push({ todoId, todoTitle: title, dayStatus })
    }

    return result
  }, [historyEvents, todoLookup, timeBlocks, timeMarkers, selectedDate])

  return { timeBlocks, timeMarkers, selectedDate, setSelectedDate, activeTodos }
}
