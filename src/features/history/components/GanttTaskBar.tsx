import styled, { keyframes } from 'styled-components'
import type { TimeBlock } from '@/stores/historyAtoms'

interface GanttTaskBarProps {
  block: TimeBlock
  hourStart: number
  pixelsPerHour: number
  dayStart: Date
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`

const Bar = styled.div<{ $left: number; $width: number; $endReason: string }>`
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) => Math.max($width, 4)}px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $endReason, theme }) =>
    $endReason === 'completed' ? theme.colors.primary : theme.colors.accent};
  opacity: ${({ $endReason }) => ($endReason === 'stopped' ? 0.6 : 1)};
  animation: ${({ $endReason }) =>
    $endReason === 'ongoing' ? pulse : 'none'} 2s ease-in-out infinite;
`

const EndMarker = styled.span<{ $endReason: string }>`
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.6rem;
  line-height: 1;
`

const getHoursFromMidnight = (date: Date, dayStart: Date): number => {
  const midnight = new Date(dayStart)
  midnight.setHours(0, 0, 0, 0)
  return (date.getTime() - midnight.getTime()) / (1000 * 60 * 60)
}

export const GanttTaskBar = ({
  block,
  hourStart,
  pixelsPerHour,
  dayStart,
}: GanttTaskBarProps) => {
  const blockStartHour = getHoursFromMidnight(block.startTime, dayStart)
  const blockEndHour = block.endTime
    ? getHoursFromMidnight(block.endTime, dayStart)
    : getHoursFromMidnight(new Date(), dayStart)

  const left = (blockStartHour - hourStart) * pixelsPerHour
  const width = (blockEndHour - blockStartHour) * pixelsPerHour

  return (
    <Bar $left={left} $width={width} $endReason={block.endReason}>
      {block.endReason === 'completed' && (
        <EndMarker $endReason={block.endReason}>&#x2713;</EndMarker>
      )}
    </Bar>
  )
}
