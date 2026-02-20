import { useMemo } from 'react'
import styled from 'styled-components'
import type { TimeBlock } from '@/stores/historyAtoms'
import type { Todo } from '@/db/schema'
import { formatDuration } from '@/utils/sessionUtils'

interface TodoDurationSummaryProps {
  timeBlocks: TimeBlock[]
  selectedTodoId: string
  todoLookup: Map<string, Todo>
  onClearFilter: () => void
}

const SectionContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.sm}`};
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const SectionTitle = styled.h2`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const ShowAllButton = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: background 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  &:active {
    transform: scale(0.95);
  }
`

const TodoName = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text};
`

const DayList = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const DayRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const formatDateLabel = (date: Date): string => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = WEEKDAYS[date.getDay()]
  return `${month}/${day} (${weekday})`
}

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

interface DayDuration {
  date: Date
  durationMs: number
}

export const TodoDurationSummary = ({
  timeBlocks,
  selectedTodoId,
  todoLookup,
  onClearFilter,
}: TodoDurationSummaryProps) => {
  const { totalMs, days } = useMemo(() => {
    const now = new Date()
    const filtered = timeBlocks.filter((b) => b.todoId === selectedTodoId)

    let total = 0
    const dayMap = new Map<string, { date: Date; durationMs: number }>()

    for (const block of filtered) {
      const end = block.endTime ?? now
      const ms = end.getTime() - block.startTime.getTime()
      total += ms

      const key = toDateKey(block.startTime)
      const existing = dayMap.get(key)
      if (existing) {
        existing.durationMs += ms
      } else {
        dayMap.set(key, { date: block.startTime, durationMs: ms })
      }
    }

    const sorted: DayDuration[] = [...dayMap.values()].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    )

    return { totalMs: total, days: sorted }
  }, [timeBlocks, selectedTodoId])

  const todo = todoLookup.get(selectedTodoId)
  if (!todo) return null

  return (
    <>
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Todo</SectionTitle>
          <ShowAllButton onClick={onClearFilter}>전체 보기</ShowAllButton>
        </SectionHeader>
        <TodoName>{todo.title}</TodoName>
      </SectionContainer>
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Duration</SectionTitle>
        </SectionHeader>
        <TotalRow>
          <span>총 소요시간</span>
          <span>{formatDuration(totalMs)}</span>
        </TotalRow>
        {days.length > 1 && (
          <DayList>
            {days.map((d) => (
              <DayRow key={toDateKey(d.date)}>
                <span>{formatDateLabel(d.date)}</span>
                <span>{formatDuration(d.durationMs)}</span>
              </DayRow>
            ))}
          </DayList>
        )}
      </SectionContainer>
    </>
  )
}
