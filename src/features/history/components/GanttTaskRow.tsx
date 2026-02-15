import styled from 'styled-components'
import type { TimeBlock, TimeMarker } from '@/stores/historyAtoms'
import { GanttTaskBar } from './GanttTaskBar'
import { GanttEventMarker } from './GanttEventMarker'

interface GanttTaskRowProps {
  todoTitle: string
  blocks: TimeBlock[]
  markers: TimeMarker[]
  hourStart: number
  hourEnd: number
  pixelsPerHour: number
  dayStart: Date
}

const Row = styled.div`
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const TaskLabel = styled.div`
  flex-shrink: 0;
  width: 80px;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`

const BarArea = styled.div<{ $totalWidth: number }>`
  position: relative;
  height: 28px;
  width: ${({ $totalWidth }) => $totalWidth}px;
  flex-shrink: 0;
`

export const GanttTaskRow = ({
  todoTitle,
  blocks,
  markers,
  hourStart,
  hourEnd,
  pixelsPerHour,
  dayStart,
}: GanttTaskRowProps) => {
  const totalWidth = (hourEnd - hourStart) * pixelsPerHour

  return (
    <Row>
      <TaskLabel title={todoTitle}>{todoTitle}</TaskLabel>
      <BarArea $totalWidth={totalWidth}>
        {blocks.map((block, i) => (
          <GanttTaskBar
            key={`block-${block.todoId}-${i}`}
            block={block}
            hourStart={hourStart}
            pixelsPerHour={pixelsPerHour}
            dayStart={dayStart}
          />
        ))}
        {markers.map((marker, i) => (
          <GanttEventMarker
            key={`marker-${marker.todoId}-${i}`}
            marker={marker}
            hourStart={hourStart}
            pixelsPerHour={pixelsPerHour}
            dayStart={dayStart}
          />
        ))}
      </BarArea>
    </Row>
  )
}
