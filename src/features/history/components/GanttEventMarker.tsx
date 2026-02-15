import styled, { useTheme } from 'styled-components'
import type { TimeMarker } from '@/stores/historyAtoms'

interface GanttEventMarkerProps {
  marker: TimeMarker
  hourStart: number
  pixelsPerHour: number
  dayStart: Date
}

const MarkerLine = styled.div<{ $left: number; $color: string; $dimmed: boolean }>`
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: ${({ $left }) => $left}px;
  width: 2px;
  background: ${({ $color }) => $color};
  opacity: ${({ $dimmed }) => ($dimmed ? 0.3 : 0.8)};
`

const MarkerDiamond = styled.div<{ $left: number; $color: string; $dimmed: boolean }>`
  position: absolute;
  top: 50%;
  left: ${({ $left }) => $left}px;
  width: 8px;
  height: 8px;
  background: ${({ $color }) => $color};
  opacity: ${({ $dimmed }) => ($dimmed ? 0.3 : 1)};
  transform: translate(-50%, -50%) rotate(45deg);
  border-radius: 1px;
  z-index: 1;
`

const getHoursFromMidnight = (date: Date, dayStart: Date): number => {
  const midnight = new Date(dayStart)
  midnight.setHours(0, 0, 0, 0)
  return (date.getTime() - midnight.getTime()) / (1000 * 60 * 60)
}

export const GanttEventMarker = ({
  marker,
  hourStart,
  pixelsPerHour,
  dayStart,
}: GanttEventMarkerProps) => {
  const theme = useTheme()
  const markerHour = getHoursFromMidnight(marker.timestamp, dayStart)
  const left = (markerHour - hourStart) * pixelsPerHour
  const color =
    marker.eventType === 'reopened' ? theme.colors.warning : theme.colors.primary

  return (
    <>
      <MarkerLine $left={left} $color={color} $dimmed={marker.dimmed} />
      <MarkerDiamond $left={left + 1} $color={color} $dimmed={marker.dimmed} />
    </>
  )
}
