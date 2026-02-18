import { useTheme } from 'styled-components'

interface IconProps {
  size?: number
}

export const CompletedIcon = ({ size = 14 }: IconProps) => {
  const theme = useTheme()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke={theme.colors.accent} strokeWidth="1.5" />
      <path
        d="M5 8.5L7 10.5L11 6"
        stroke={theme.colors.accent}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const ActiveIcon = ({ size = 14 }: IconProps) => {
  const theme = useTheme()
  const cx = 8
  const cy = 8
  const r = 7
  const segments = 8
  const gapAngle = 16
  const color = theme.colors.warning

  const arcs: string[] = []
  for (let i = 0; i < segments; i++) {
    const startDeg = (360 / segments) * i + gapAngle / 2
    const endDeg = (360 / segments) * (i + 1) - gapAngle / 2
    const startRad = ((startDeg - 90) * Math.PI) / 180
    const endRad = ((endDeg - 90) * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    arcs.push(`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`)
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      {arcs.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={i < 6 ? 1 : 0.3}
        />
      ))}
      <line
        x1="8"
        y1="8"
        x2="8"
        y2="5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="8"
        x2="10"
        y2="9.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export const IdleIcon = ({ size = 14 }: IconProps) => {
  const theme = useTheme()
  const color = theme.colors.textSecondary
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1" opacity="0.4" />
      <circle cx="4.5" cy="8" r="1.2" fill={color} />
      <circle cx="8" cy="8" r="1.2" fill={color} />
      <circle cx="11.5" cy="8" r="1.2" fill={color} />
    </svg>
  )
}
