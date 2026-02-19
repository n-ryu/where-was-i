import { useMemo } from 'react'
import styled from 'styled-components'
import type { Todo, TodoHistoryEvent, TodoHistoryEventType } from '@/db/schema'
import { classifyEvents } from '@/utils/sessionUtils'
import type { HistoryItem, Session, PointEvent } from '@/utils/sessionUtils'

interface EventHistoryListProps {
  historyEvents: TodoHistoryEvent[]
  todos: Map<string, Todo>
  selectedDate: Date
  selectedTodoId: string | null
  onClearFilter: () => void
}

const EVENT_TYPE_LABELS: Record<TodoHistoryEventType, string> = {
  created: '생성',
  started: '시작',
  stopped: '중지',
  completed: '완료',
  reopened: '재오픈',
}

const EVENT_TYPE_COLOR_KEYS: Record<TodoHistoryEventType, string> = {
  created: 'textSecondary',
  started: 'accent',
  stopped: 'warning',
  completed: 'primary',
  reopened: 'warning',
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const formatTime = (date: Date) => {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

// --- Styled Components ---

const SectionContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.lg}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
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
  background: none;
  border: none;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: background 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  &:active {
    transform: scale(0.95);
  }
`

const ItemList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const ItemRow = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} 0`};

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.surface};
  }
`

const TimeLabel = styled.span`
  flex-shrink: 0;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 40px;
`

const Arrow = styled.span`
  flex-shrink: 0;
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const EventBadge = styled.span<{ $colorKey: string }>`
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme, $colorKey }) => theme.colors[$colorKey as keyof typeof theme.colors]};
  background: ${({ theme, $colorKey }) =>
    `${theme.colors[$colorKey as keyof typeof theme.colors]}18`};
  width: 42px;
  text-align: center;
`

const TodoTitle = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
`

const OngoingLabel = styled.span`
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => `${theme.colors.accent}18`};
`

const EmptyMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`

// --- Row Components ---

const SessionRow = ({
  session,
  title,
}: {
  session: Session
  title: string
}) => {
  const endType = session.endEvent?.eventType ?? null
  const startColorKey = EVENT_TYPE_COLOR_KEYS['started']
  const endColorKey = endType ? EVENT_TYPE_COLOR_KEYS[endType] : null

  return (
    <ItemRow>
      <TimeLabel>{formatTime(session.startTime)}</TimeLabel>
      <EventBadge $colorKey={startColorKey}>
        {EVENT_TYPE_LABELS['started']}
      </EventBadge>
      <Arrow>→</Arrow>
      {session.endEvent ? (
        <>
          <TimeLabel>{formatTime(session.endTime!)}</TimeLabel>
          <EventBadge $colorKey={endColorKey!}>
            {EVENT_TYPE_LABELS[endType!]}
          </EventBadge>
        </>
      ) : (
        <OngoingLabel>진행중</OngoingLabel>
      )}
      <TodoTitle>{title}</TodoTitle>
    </ItemRow>
  )
}

const PointEventRow = ({
  pointEvent,
  title,
}: {
  pointEvent: PointEvent
  title: string
}) => {
  const colorKey = EVENT_TYPE_COLOR_KEYS[pointEvent.event.eventType]
  return (
    <ItemRow>
      <TimeLabel>{formatTime(pointEvent.timestamp)}</TimeLabel>
      <EventBadge $colorKey={colorKey}>
        {EVENT_TYPE_LABELS[pointEvent.event.eventType]}
      </EventBadge>
      <TodoTitle>{title}</TodoTitle>
    </ItemRow>
  )
}

// --- Helpers ---

const getItemKey = (item: HistoryItem): string =>
  item.type === 'session' ? `session-${item.startEvent.id}` : `point-${item.event.id}`

const isItemInDay = (item: HistoryItem, date: Date): boolean => {
  if (item.type === 'session') {
    // Show session if its start or end falls on this day
    if (isSameDay(item.startTime, date)) return true
    if (item.endTime && isSameDay(item.endTime, date)) return true
    return false
  }
  return isSameDay(item.timestamp, date)
}

const isItemForTodo = (item: HistoryItem, todoId: string): boolean =>
  item.todoId === todoId

// --- Main Component ---

export const EventHistoryList = ({
  historyEvents,
  todos,
  selectedDate,
  selectedTodoId,
  onClearFilter,
}: EventHistoryListProps) => {
  const items = useMemo(() => {
    const allItems = classifyEvents(historyEvents)

    const dayItems = allItems.filter((item) => isItemInDay(item, selectedDate))

    return selectedTodoId
      ? dayItems.filter((item) => isItemForTodo(item, selectedTodoId))
      : dayItems
  }, [historyEvents, selectedDate, selectedTodoId])

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>Events</SectionTitle>
        {selectedTodoId !== null && (
          <ShowAllButton onClick={onClearFilter}>전체 보기</ShowAllButton>
        )}
      </SectionHeader>
      {items.length === 0 ? (
        <EmptyMessage>No events on this day</EmptyMessage>
      ) : (
        <ItemList>
          {items.map((item) => {
            const todoId = item.todoId
            const title = todos.get(todoId)?.title ?? 'Unknown'
            return item.type === 'session' ? (
              <SessionRow key={getItemKey(item)} session={item} title={title} />
            ) : (
              <PointEventRow key={getItemKey(item)} pointEvent={item} title={title} />
            )
          })}
        </ItemList>
      )}
    </SectionContainer>
  )
}
