import { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import type { TimeBlock, TimeMarker } from '@/stores/historyAtoms'
import type { Todo, TodoHistoryEvent } from '@/db/schema'
import { GanttTimeAxis } from './GanttTimeAxis'
import { GanttTaskRow } from './GanttTaskRow'

export type DayStatus = 'completed_today' | 'active_today' | 'idle'

interface GanttChartProps {
  timeBlocks: TimeBlock[]
  timeMarkers: TimeMarker[]
  todos: Map<string, Todo>
  historyEvents: TodoHistoryEvent[]
  selectedDate: Date
}

const PIXELS_PER_HOUR = 60

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const ChartContainer = styled.div`
  flex: 1;
  overflow: auto;
  animation: ${fadeIn} 200ms ease-out;
`

const ChartInner = styled.div`
  display: flex;
  flex-direction: column;
  min-width: fit-content;
`

const TimeAxisRow = styled.div`
  display: flex;
`

const TimeAxisLabel = styled.div`
  flex-shrink: 0;
  width: 80px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  animation: ${fadeIn} 300ms ease-out;
`

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const getHoursFromMidnight = (date: Date, dayStart: Date): number => {
  const midnight = new Date(dayStart)
  midnight.setHours(0, 0, 0, 0)
  return (date.getTime() - midnight.getTime()) / (1000 * 60 * 60)
}

const endOfDay = (date: Date): Date => {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

export const GanttChart = ({
  timeBlocks,
  timeMarkers,
  todos,
  historyEvents,
  selectedDate,
}: GanttChartProps) => {
  const dayBlocks = useMemo(() => {
    return timeBlocks.filter((block) => {
      const blockStart = block.startTime
      const blockEnd = block.endTime ?? new Date()
      return isSameDay(blockStart, selectedDate) || isSameDay(blockEnd, selectedDate)
    })
  }, [timeBlocks, selectedDate])

  const dayMarkers = useMemo(() => {
    return timeMarkers.filter((marker) => isSameDay(marker.timestamp, selectedDate))
  }, [timeMarkers, selectedDate])

  const dayEventsByTodo = useMemo(() => {
    const map = new Map<string, TodoHistoryEvent[]>()
    for (const event of historyEvents) {
      if (isSameDay(event.timestamp, selectedDate)) {
        const existing = map.get(event.todoId) ?? []
        existing.push(event)
        map.set(event.todoId, existing)
      }
    }
    return map
  }, [historyEvents, selectedDate])

  const { hourStart, hourEnd, taskGroups, markerGroups, allTodoIds, dayStatusMap } =
    useMemo(() => {
      let minHour = 24
      let maxHour = 0
      let hasTimeData = false

      const blockGroups = new Map<string, TimeBlock[]>()
      for (const block of dayBlocks) {
        hasTimeData = true
        const startH = getHoursFromMidnight(block.startTime, selectedDate)
        const endH = block.endTime
          ? getHoursFromMidnight(block.endTime, selectedDate)
          : getHoursFromMidnight(new Date(), selectedDate)

        minHour = Math.min(minHour, startH)
        maxHour = Math.max(maxHour, endH)

        const existing = blockGroups.get(block.todoId) ?? []
        existing.push(block)
        blockGroups.set(block.todoId, existing)
      }

      const mGroups = new Map<string, TimeMarker[]>()
      for (const marker of dayMarkers) {
        hasTimeData = true
        const h = getHoursFromMidnight(marker.timestamp, selectedDate)
        minHour = Math.min(minHour, h)
        maxHour = Math.max(maxHour, h)

        const existing = mGroups.get(marker.todoId) ?? []
        existing.push(marker)
        mGroups.set(marker.todoId, existing)
      }

      const activeTodoIds = new Set([...blockGroups.keys(), ...mGroups.keys()])
      const statusMap = new Map<string, DayStatus>()

      for (const todoId of activeTodoIds) {
        const todo = todos.get(todoId)
        const markers = mGroups.get(todoId) ?? []
        const hasNonDimmedCompleted = markers.some(
          (m) => m.eventType === 'completed' && !m.dimmed,
        )

        if (todo?.status === 'completed' && hasNonDimmedCompleted) {
          statusMap.set(todoId, 'completed_today')
        } else {
          statusMap.set(todoId, 'active_today')
        }
      }

      const selectedDayEnd = endOfDay(selectedDate)
      const idleTodoIds: string[] = []
      for (const [todoId, todo] of todos) {
        if (activeTodoIds.has(todoId)) continue
        if (todo.status === 'completed') continue
        if (todo.createdAt > selectedDayEnd) continue

        const todayEvents = dayEventsByTodo.get(todoId) ?? []
        const hasNonCreatedEvent = todayEvents.some((e) => e.eventType !== 'created')
        if (hasNonCreatedEvent) {
          activeTodoIds.add(todoId)
          statusMap.set(todoId, 'active_today')
        } else {
          statusMap.set(todoId, 'idle')
          idleTodoIds.push(todoId)
        }
      }

      const computedHourStart = hasTimeData ? Math.max(0, Math.floor(minHour) - 1) : 9
      const computedHourEnd = hasTimeData ? Math.min(24, Math.ceil(maxHour) + 1) : 18

      const allIds = [...Array.from(activeTodoIds), ...idleTodoIds]
      const statusOrder: Record<DayStatus, number> = {
        completed_today: 0,
        active_today: 1,
        idle: 2,
      }
      allIds.sort(
        (a, b) =>
          statusOrder[statusMap.get(a) ?? 'idle'] - statusOrder[statusMap.get(b) ?? 'idle'],
      )

      return {
        hourStart: computedHourStart,
        hourEnd: computedHourEnd,
        taskGroups: blockGroups,
        markerGroups: mGroups,
        allTodoIds: allIds,
        dayStatusMap: statusMap,
      }
    }, [dayBlocks, dayMarkers, dayEventsByTodo, todos, selectedDate])

  if (allTodoIds.length === 0) {
    return <EmptyState>No activity on this day</EmptyState>
  }

  return (
    <ChartContainer>
      <ChartInner>
        <TimeAxisRow>
          <TimeAxisLabel />
          <GanttTimeAxis
            hourStart={hourStart}
            hourEnd={hourEnd}
            pixelsPerHour={PIXELS_PER_HOUR}
          />
        </TimeAxisRow>
        {allTodoIds.map((todoId) => {
          const blocks = taskGroups.get(todoId) ?? []
          const markers = markerGroups.get(todoId) ?? []
          const todo = todos.get(todoId)
          const title =
            todo?.title ?? blocks[0]?.todoTitle ?? markers[0]?.todoTitle ?? 'Unknown'
          const dayStatus = dayStatusMap.get(todoId) ?? 'idle'
          return (
            <GanttTaskRow
              key={todoId}
              todoTitle={title}
              blocks={blocks}
              markers={markers}
              dayStatus={dayStatus}
              hourStart={hourStart}
              hourEnd={hourEnd}
              pixelsPerHour={PIXELS_PER_HOUR}
              dayStart={selectedDate}
            />
          )
        })}
      </ChartInner>
    </ChartContainer>
  )
}
