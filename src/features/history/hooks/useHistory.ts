import { useEffect, useMemo, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  timeBlocksAtom,
  timeMarkersAtom,
  loadHistoryAtom,
  loadTodoLookupAtom,
} from '@/stores/historyAtoms'

export interface IncompleteTodo {
  todoId: string
  todoTitle: string
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export const useHistory = () => {
  const timeBlocks = useAtomValue(timeBlocksAtom)
  const timeMarkers = useAtomValue(timeMarkersAtom)
  const loadHistory = useSetAtom(loadHistoryAtom)
  const loadTodoLookup = useSetAtom(loadTodoLookupAtom)
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  useEffect(() => {
    loadHistory()
    loadTodoLookup()
  }, [loadHistory, loadTodoLookup])

  const incompleteTodos = useMemo(() => {
    const activeTodoIds = new Set<string>()
    const todoTitles = new Map<string, string>()

    for (const block of timeBlocks) {
      const blockStart = block.startTime
      const blockEnd = block.endTime ?? new Date()
      if (
        isSameDay(blockStart, selectedDate) ||
        isSameDay(blockEnd, selectedDate)
      ) {
        activeTodoIds.add(block.todoId)
        todoTitles.set(block.todoId, block.todoTitle)
      }
    }

    const completedTodoIds = new Set<string>()
    for (const marker of timeMarkers) {
      if (
        marker.eventType === 'completed' &&
        !marker.dimmed &&
        isSameDay(marker.timestamp, selectedDate)
      ) {
        completedTodoIds.add(marker.todoId)
      }
    }

    return Array.from(activeTodoIds)
      .filter((id) => !completedTodoIds.has(id))
      .map((id) => ({ todoId: id, todoTitle: todoTitles.get(id) ?? 'Unknown' }))
  }, [timeBlocks, timeMarkers, selectedDate])

  return { timeBlocks, timeMarkers, selectedDate, setSelectedDate, incompleteTodos }
}
