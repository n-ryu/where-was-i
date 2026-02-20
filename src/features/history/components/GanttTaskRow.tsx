import { useMemo } from 'react'
import styled, { css } from 'styled-components'
import type { TimeBlock, TimeMarker } from '@/stores/historyAtoms'
import type { DayStatus } from './GanttChart'
import { CompletedIcon, ActiveIcon, InProgressIcon, IdleIcon } from '@/components/StatusIcons'
import { GanttTaskBar } from './GanttTaskBar'
import { GanttEventMarker } from './GanttEventMarker'
import { formatDuration } from '@/utils/sessionUtils'

interface GanttTaskRowProps {
  todoId: string
  todoTitle: string
  blocks: TimeBlock[]
  markers: TimeMarker[]
  dayStatus: DayStatus
  isSelected: boolean
  onSelect: (todoId: string) => void
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

const TaskLabel = styled.div<{ $dayStatus: DayStatus; $isSelected: boolean }>`
  flex-shrink: 0;
  width: 80px;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  position: sticky;
  left: 0;
  z-index: 1;
  background: ${({ theme }) => theme.colors.background};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background 150ms ease;

  ${({ $dayStatus, theme }) =>
    $dayStatus === 'completed_today' &&
    css`
      color: ${theme.colors.textSecondary};
      opacity: 0.7;
    `}

  ${({ $dayStatus, theme }) =>
    $dayStatus === 'idle' &&
    css`
      color: ${theme.colors.textSecondary};
    `}

  ${({ $dayStatus, theme }) =>
    ($dayStatus === 'active_today' || $dayStatus === 'in_progress') &&
    css`
      color: ${theme.colors.text};
    `}

  ${({ $isSelected, theme }) =>
    $isSelected &&
    css`
      background: ${theme.colors.primary}11;
      font-weight: 600;
    `}
`

const LabelContent = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
`

const LabelText = styled.span<{ $completed?: boolean }>`
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

const DurationText = styled.span`
  font-size: 0.6rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1;
`

const StatusIconWrapper = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`

const statusIconMap: Record<DayStatus, React.FC<{ size?: number }>> = {
  completed_today: CompletedIcon,
  in_progress: InProgressIcon,
  active_today: ActiveIcon,
  idle: IdleIcon,
}

const BarArea = styled.div<{ $totalWidth: number }>`
  position: relative;
  height: 28px;
  width: ${({ $totalWidth }) => $totalWidth}px;
  flex-shrink: 0;
  align-self: center;
`

const HatchingFill = styled.div`
  position: absolute;
  inset: 4px 0;
  background: url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6L6 0' stroke='%23e2e8f0' stroke-width='1'/%3E%3C/svg%3E");
  border-radius: 2px;
  opacity: 0.8;
`

export const GanttTaskRow = ({
  todoId,
  todoTitle,
  blocks,
  markers,
  dayStatus,
  isSelected,
  onSelect,
  hourStart,
  hourEnd,
  pixelsPerHour,
  dayStart,
}: GanttTaskRowProps) => {
  const totalWidth = (hourEnd - hourStart) * pixelsPerHour
  const Icon = statusIconMap[dayStatus]

  const totalDurationMs = useMemo(() => {
    const now = new Date()
    return blocks.reduce((sum, block) => {
      const end = block.endTime ?? now
      return sum + (end.getTime() - block.startTime.getTime())
    }, 0)
  }, [blocks])

  return (
    <Row>
      <TaskLabel
        $dayStatus={dayStatus}
        $isSelected={isSelected}
        title={todoTitle}
        onClick={() => onSelect(todoId)}
      >
        <StatusIconWrapper>
          <Icon size={12} />
        </StatusIconWrapper>
        <LabelContent>
          <LabelText $completed={dayStatus === 'completed_today'}>{todoTitle}</LabelText>
          <DurationText>{formatDuration(totalDurationMs)}</DurationText>
        </LabelContent>
      </TaskLabel>
      <BarArea $totalWidth={totalWidth}>
        {dayStatus === 'idle' && <HatchingFill />}
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
