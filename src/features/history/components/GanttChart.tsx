import { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import type { TimeBlock } from '@/stores/historyAtoms'
import { GanttTimeAxis } from './GanttTimeAxis'
import { GanttTaskRow } from './GanttTaskRow'

interface GanttChartProps {
  timeBlocks: TimeBlock[]
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

export const GanttChart = ({ timeBlocks, selectedDate }: GanttChartProps) => {
  const dayBlocks = useMemo(() => {
    return timeBlocks.filter((block) => {
      const blockStart = block.startTime
      const blockEnd = block.endTime ?? new Date()
      return isSameDay(blockStart, selectedDate) || isSameDay(blockEnd, selectedDate)
    })
  }, [timeBlocks, selectedDate])

  const { hourStart, hourEnd, taskGroups } = useMemo(() => {
    if (dayBlocks.length === 0) {
      return { hourStart: 9, hourEnd: 18, taskGroups: new Map<string, TimeBlock[]>() }
    }

    let minHour = 24
    let maxHour = 0

    const groups = new Map<string, TimeBlock[]>()

    for (const block of dayBlocks) {
      const startH = getHoursFromMidnight(block.startTime, selectedDate)
      const endH = block.endTime
        ? getHoursFromMidnight(block.endTime, selectedDate)
        : getHoursFromMidnight(new Date(), selectedDate)

      minHour = Math.min(minHour, startH)
      maxHour = Math.max(maxHour, endH)

      const existing = groups.get(block.todoId) ?? []
      existing.push(block)
      groups.set(block.todoId, existing)
    }

    return {
      hourStart: Math.max(0, Math.floor(minHour) - 1),
      hourEnd: Math.min(24, Math.ceil(maxHour) + 1),
      taskGroups: groups,
    }
  }, [dayBlocks, selectedDate])

  if (dayBlocks.length === 0) {
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
        {Array.from(taskGroups.entries()).map(([todoId, blocks]) => (
          <GanttTaskRow
            key={todoId}
            todoTitle={blocks[0].todoTitle}
            blocks={blocks}
            hourStart={hourStart}
            hourEnd={hourEnd}
            pixelsPerHour={PIXELS_PER_HOUR}
            dayStart={selectedDate}
          />
        ))}
      </ChartInner>
    </ChartContainer>
  )
}
