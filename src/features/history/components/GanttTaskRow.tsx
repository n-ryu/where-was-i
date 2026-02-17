import styled, { css } from 'styled-components'
import type { TimeBlock, TimeMarker } from '@/stores/historyAtoms'
import type { TodoDayStatus } from '../types'
import { GanttTaskBar } from './GanttTaskBar'
import { GanttEventMarker } from './GanttEventMarker'

interface GanttTaskRowProps {
  todoTitle: string
  dayStatus: TodoDayStatus
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

const TaskLabel = styled.div<{ $dayStatus: TodoDayStatus }>`
  flex-shrink: 0;
  width: 80px;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: 0.75rem;
  font-weight: 500;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 4px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  ${({ $dayStatus, theme }) =>
    $dayStatus === 'completed' &&
    css`
      color: ${theme.colors.textSecondary};
      opacity: 0.7;
    `}

  ${({ $dayStatus, theme }) =>
    $dayStatus === 'incomplete' &&
    css`
      color: ${theme.colors.text};
    `}

  ${({ $dayStatus, theme }) =>
    $dayStatus === 'inactive' &&
    css`
      color: ${theme.colors.textSecondary};
      opacity: 0.6;
    `}
`

const StatusIcon = styled.span<{ $dayStatus: TodoDayStatus }>`
  flex-shrink: 0;
  line-height: 1;

  ${({ $dayStatus, theme }) =>
    $dayStatus === 'completed' &&
    css`
      color: ${theme.colors.accent};
      font-size: 0.7rem;
    `}

  ${({ $dayStatus, theme }) =>
    $dayStatus === 'incomplete' &&
    css`
      color: ${theme.colors.warning};
      font-size: 0.5rem;
    `}

  ${({ $dayStatus, theme }) =>
    $dayStatus === 'inactive' &&
    css`
      color: ${theme.colors.textSecondary};
      font-size: 0.625rem;
      letter-spacing: -1px;
    `}
`

const TitleText = styled.span<{ $completed: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  ${({ $completed }) =>
    $completed &&
    css`
      text-decoration: line-through;
    `}
`

const BarArea = styled.div<{ $totalWidth: number }>`
  position: relative;
  height: 28px;
  width: ${({ $totalWidth }) => $totalWidth}px;
  flex-shrink: 0;
`

const HatchedArea = styled.div`
  position: absolute;
  inset: 4px 0;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 3px,
    ${({ theme }) => theme.colors.border} 3px,
    ${({ theme }) => theme.colors.border} 4px
  );
  opacity: 0.5;
  border-radius: ${({ theme }) => theme.radii.sm};
`

const statusIcons: Record<TodoDayStatus, string> = {
  completed: '\u2713',
  incomplete: '\u25CF',
  inactive: '\u2026',
}

export const GanttTaskRow = ({
  todoTitle,
  dayStatus,
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
      <TaskLabel $dayStatus={dayStatus} title={todoTitle}>
        <StatusIcon $dayStatus={dayStatus}>
          {statusIcons[dayStatus]}
        </StatusIcon>
        <TitleText $completed={dayStatus === 'completed'}>{todoTitle}</TitleText>
      </TaskLabel>
      <BarArea $totalWidth={totalWidth}>
        {dayStatus === 'inactive' && <HatchedArea />}
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
