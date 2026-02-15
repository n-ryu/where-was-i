import styled from 'styled-components'
import { useHistory } from '@/features/history/hooks/useHistory'
import { DayPicker } from '@/features/history/components/DayPicker'
import { GanttChart } from '@/features/history/components/GanttChart'

export const PageContainer = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};

  @media (min-width: 431px) {
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.08);
  }
`

export const Header = styled.header`
  flex-shrink: 0;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const BackButton = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.25rem;
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

export const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

interface HistoryPageProps {
  onNavigateBack: () => void
}

export const HistoryPage = ({ onNavigateBack }: HistoryPageProps) => {
  const { timeBlocks, selectedDate, setSelectedDate } = useHistory()

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={onNavigateBack} aria-label="Go back">
          &larr;
        </BackButton>
        <Title>History</Title>
      </Header>
      <DayPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <GanttChart timeBlocks={timeBlocks} selectedDate={selectedDate} />
    </PageContainer>
  )
}
