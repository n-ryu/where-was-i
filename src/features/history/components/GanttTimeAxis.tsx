import styled from 'styled-components'

interface GanttTimeAxisProps {
  hourStart: number
  hourEnd: number
  pixelsPerHour: number
}

const AxisContainer = styled.div`
  position: relative;
  height: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const HourLabel = styled.span<{ $left: number }>`
  position: absolute;
  left: ${({ $left }) => $left}px;
  top: 4px;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.fonts.mono};
  transform: translateX(-50%);
`

const formatHour = (hour: number): string => {
  const h = Math.floor(hour)
  return `${h.toString().padStart(2, '0')}:00`
}

export const GanttTimeAxis = ({
  hourStart,
  hourEnd,
  pixelsPerHour,
}: GanttTimeAxisProps) => {
  const hours: number[] = []
  for (let h = Math.ceil(hourStart); h <= Math.floor(hourEnd); h++) {
    hours.push(h)
  }

  return (
    <AxisContainer>
      {hours.map((hour) => (
        <HourLabel key={hour} $left={(hour - hourStart) * pixelsPerHour}>
          {formatHour(hour)}
        </HourLabel>
      ))}
    </AxisContainer>
  )
}
