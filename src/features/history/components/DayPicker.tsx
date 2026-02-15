import styled from 'styled-components'
import type { DayPickerProps } from '../types'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.colors.surfaceAlt};
`

const NavButton = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color 150ms ease, background 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface};
  }

  &:active {
    transform: scale(0.93);
  }
`

const DateLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  min-width: 160px;
  text-align: center;
`

const formatDate = (date: Date): string => {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, yesterday)) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const DayPicker = ({ selectedDate, onDateChange }: DayPickerProps) => {
  const goBack = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    onDateChange(prev)
  }

  const goForward = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    onDateChange(next)
  }

  return (
    <Container>
      <NavButton onClick={goBack} aria-label="Previous day">
        &lsaquo;
      </NavButton>
      <DateLabel>{formatDate(selectedDate)}</DateLabel>
      <NavButton onClick={goForward} aria-label="Next day">
        &rsaquo;
      </NavButton>
    </Container>
  )
}
