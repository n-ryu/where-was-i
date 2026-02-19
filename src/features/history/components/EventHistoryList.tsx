import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { css, keyframes } from 'styled-components'
import { useSetAtom } from 'jotai'
import type { Todo, TodoHistoryEvent, TodoHistoryEventType } from '@/db/schema'
import {
  classifyEvents,
  computeEditTimestamp,
  detectSessionConflicts,
  resolveConflicts,
  getSessionEditableRange,
  getPointEventEditableRange,
  canDeleteSession,
  canDeletePointEvent,
} from '@/utils/sessionUtils'
import type { HistoryItem, Session, PointEvent, SessionConflict } from '@/utils/sessionUtils'
import { updateEventTimeAtom, deleteHistoryItemAtom } from '@/stores/historyAtoms'
import { useLongPress } from '@/hooks/useLongPress'
import { TimeEditDialog } from './TimeEditDialog'

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

const formatTimeValue = (date: Date): string => formatTime(date)

const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
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

const ItemRow = styled.li<{ $pressing?: boolean; $highlighted?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} 0`};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: background 150ms ease, transform 150ms ease;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;

  & + & {
    border-top: 1px solid ${({ theme }) => theme.colors.surface};
  }

  ${({ $pressing, theme }) =>
    $pressing &&
    css`
      background: ${theme.colors.surface};
      transform: scale(0.97);
    `}

  ${({ $highlighted, theme }) =>
    $highlighted &&
    css`
      background: ${theme.colors.primary}11;
    `}
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

// --- Context Menu ---

const menuEnter = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`

const MenuOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
`

const Menu = styled.div`
  position: fixed;
  z-index: 101;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 120px;
  overflow: hidden;
  animation: ${menuEnter} 150ms ease-out;
`

const MenuItem = styled.button<{ $danger?: boolean }>`
  all: unset;
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: 0.9rem;
  cursor: pointer;
  color: ${({ $danger }) => ($danger ? '#ef4444' : 'inherit')};
  transition: background 100ms ease;

  &:hover,
  &:active {
    background: ${({ theme }) => theme.colors.surface};
  }
`

// --- Row Components ---

const SessionRow = ({
  session,
  title,
  highlighted,
  onLongPress,
}: {
  session: Session
  title: string
  highlighted: boolean
  onLongPress: (pos: { x: number; y: number }) => void
}) => {
  const { isPressing, ...longPressHandlers } = useLongPress({ onLongPress })
  const endType = session.endEvent?.eventType ?? null

  return (
    <ItemRow $pressing={isPressing} $highlighted={highlighted} {...longPressHandlers}>
      <TimeLabel>{formatTime(session.startTime)}</TimeLabel>
      <EventBadge $colorKey={EVENT_TYPE_COLOR_KEYS['started']}>
        {EVENT_TYPE_LABELS['started']}
      </EventBadge>
      <Arrow>→</Arrow>
      {session.endEvent ? (
        <>
          <TimeLabel>{formatTime(session.endTime!)}</TimeLabel>
          <EventBadge $colorKey={EVENT_TYPE_COLOR_KEYS[endType!]}>
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
  highlighted,
  onLongPress,
}: {
  pointEvent: PointEvent
  title: string
  highlighted: boolean
  onLongPress: (pos: { x: number; y: number }) => void
}) => {
  const { isPressing, ...longPressHandlers } = useLongPress({ onLongPress })

  return (
    <ItemRow $pressing={isPressing} $highlighted={highlighted} {...longPressHandlers}>
      <TimeLabel>{formatTime(pointEvent.timestamp)}</TimeLabel>
      <EventBadge $colorKey={EVENT_TYPE_COLOR_KEYS[pointEvent.event.eventType]}>
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
    if (isSameDay(item.startTime, date)) return true
    if (item.endTime && isSameDay(item.endTime, date)) return true
    return false
  }
  return isSameDay(item.timestamp, date)
}

// --- Main Component ---

export const EventHistoryList = ({
  historyEvents,
  todos,
  selectedDate,
  selectedTodoId,
  onClearFilter,
}: EventHistoryListProps) => {
  const updateEventTime = useSetAtom(updateEventTimeAtom)
  const deleteHistoryItem = useSetAtom(deleteHistoryItemAtom)

  const allItems = useMemo(() => classifyEvents(historyEvents), [historyEvents])

  const items = useMemo(() => {
    const dayItems = allItems.filter((item) => isItemInDay(item, selectedDate))
    return selectedTodoId
      ? dayItems.filter((item) => item.todoId === selectedTodoId)
      : dayItems
  }, [allItems, selectedDate, selectedTodoId])

  const allSessions = useMemo(
    () => allItems.filter((i): i is Session => i.type === 'session'),
    [allItems],
  )

  // Context menu state
  const menuRef = useRef<HTMLDivElement>(null)

  const [menuState, setMenuState] = useState<{
    item: HistoryItem
    position: { x: number; y: number }
  } | null>(null)

  // Adjust menu position to stay within viewport
  useEffect(() => {
    const menu = menuRef.current
    if (!menu || !menuState) return

    const rect = menu.getBoundingClientRect()
    const { innerWidth, innerHeight } = window

    let x = menuState.position.x
    let y = menuState.position.y

    if (x + rect.width > innerWidth) {
      x = innerWidth - rect.width - 8
    }
    if (y + rect.height > innerHeight) {
      y = innerHeight - rect.height - 8
    }

    menu.style.left = `${x}px`
    menu.style.top = `${y}px`
  }, [menuState])

  // Edit dialog state
  const [editItem, setEditItem] = useState<HistoryItem | null>(null)
  const [conflicts, setConflicts] = useState<SessionConflict[] | null>(null)
  const [pendingSave, setPendingSave] = useState<{
    startTime: string
    endTime: string | null
  } | null>(null)

  const handleLongPress = useCallback(
    (item: HistoryItem) => (pos: { x: number; y: number }) => {
      setMenuState({ item, position: pos })
    },
    [],
  )

  const closeMenu = useCallback(() => setMenuState(null), [])

  const handleEdit = useCallback(() => {
    if (!menuState) return
    setEditItem(menuState.item)
    setConflicts(null)
    setPendingSave(null)
    closeMenu()
  }, [menuState, closeMenu])

  const canDeleteItem = useCallback(
    (item: HistoryItem): boolean => {
      const todoEvents = historyEvents.filter((e) => e.todoId === item.todoId)
      if (item.type === 'session') {
        return canDeleteSession(todoEvents, item)
      }
      return canDeletePointEvent(todoEvents, item.event)
    },
    [historyEvents],
  )

  const handleDelete = useCallback(async () => {
    if (!menuState) return
    const item = menuState.item
    closeMenu()

    const label =
      item.type === 'session'
        ? `작업 세션 (${formatTime(item.startTime)}${item.endTime ? `–${formatTime(item.endTime)}` : ''})`
        : `${EVENT_TYPE_LABELS[(item as PointEvent).event.eventType]} 이벤트 (${formatTime(item.timestamp)})`

    if (!window.confirm(`${label}을(를) 삭제하시겠습니까?`)) return

    if (item.type === 'session') {
      await deleteHistoryItem({
        todoId: item.todoId,
        startEventId: item.startEvent.id,
        endEventId: item.endEvent?.id ?? null,
        isSession: true,
      })
    } else {
      await deleteHistoryItem({
        todoId: item.todoId,
        startEventId: item.event.id,
        endEventId: null,
        isSession: false,
      })
    }
  }, [menuState, closeMenu, deleteHistoryItem])

  const getEditableRange = useCallback(
    (item: HistoryItem) => {
      const todoEvents = historyEvents.filter((e) => e.todoId === item.todoId)
      if (item.type === 'session') {
        const range = getSessionEditableRange(todoEvents, item)
        return {
          startMin: formatTimeValue(range.startMin),
          startMax: formatTimeValue(range.startMax),
          endMin: formatTimeValue(range.endMin),
          endMax: formatTimeValue(range.endMax),
        }
      }
      const range = getPointEventEditableRange(todoEvents, item.event)
      return {
        startMin: formatTimeValue(range.min),
        startMax: formatTimeValue(range.max),
        endMin: '00:00',
        endMax: '23:59',
      }
    },
    [historyEvents],
  )

  const handleSave = useCallback(
    async (startTime: string, endTime: string | null) => {
      if (!editItem) return

      if (editItem.type === 'session') {
        const session = editItem as Session
        const todoEvents = historyEvents.filter((e) => e.todoId === session.todoId)
        const prevEvent = todoEvents.find(
          (e) =>
            e.timestamp.getTime() < session.startTime.getTime() &&
            e.id !== session.startEvent.id,
        )
        const nextEvent = session.endEvent
          ? todoEvents.find(
              (e) =>
                e.timestamp.getTime() > session.endTime!.getTime() &&
                e.id !== session.endEvent!.id,
            )
          : null

        const newStart = computeEditTimestamp(
          timeToMinutes(startTime),
          prevEvent?.timestamp ?? null,
          session.endEvent ? null : null,
          selectedDate,
        )
        const newEnd = endTime
          ? computeEditTimestamp(
              timeToMinutes(endTime),
              null,
              nextEvent?.timestamp ?? null,
              selectedDate,
            )
          : null

        // Check conflicts
        if (newEnd) {
          const detected = detectSessionConflicts(
            { todoId: session.todoId, startTime: newStart, endTime: newEnd },
            allSessions.filter(
              (s) => s.startEvent.id !== session.startEvent.id,
            ),
          )
          if (detected.length > 0) {
            setConflicts(detected)
            setPendingSave({ startTime, endTime })
            return
          }
        }

        await updateEventTime({
          eventId: session.startEvent.id,
          todoId: session.todoId,
          eventType: 'started',
          newTimestamp: newStart,
        })
        if (session.endEvent && newEnd) {
          await updateEventTime({
            eventId: session.endEvent.id,
            todoId: session.todoId,
            eventType: session.endEvent.eventType,
            newTimestamp: newEnd,
          })
        }
      } else {
        const pe = editItem as PointEvent
        const todoEvents = historyEvents.filter((e) => e.todoId === pe.todoId)
        const sorted = [...todoEvents].sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        )
        const idx = sorted.findIndex((e) => e.id === pe.event.id)
        const prev = idx > 0 ? sorted[idx - 1] : null
        const next = idx < sorted.length - 1 ? sorted[idx + 1] : null

        const newTimestamp = computeEditTimestamp(
          timeToMinutes(startTime),
          prev?.timestamp ?? null,
          next?.timestamp ?? null,
          selectedDate,
        )
        await updateEventTime({
          eventId: pe.event.id,
          todoId: pe.todoId,
          eventType: pe.event.eventType,
          newTimestamp,
        })
      }

      setEditItem(null)
      setConflicts(null)
      setPendingSave(null)
    },
    [editItem, historyEvents, selectedDate, allSessions, updateEventTime],
  )

  const handleResolveConflicts = useCallback(async () => {
    if (!editItem || editItem.type !== 'session' || !conflicts || !pendingSave) return
    const session = editItem as Session

    const todoEvents = historyEvents.filter((e) => e.todoId === session.todoId)
    const prevEvent = todoEvents.find(
      (e) =>
        e.timestamp.getTime() < session.startTime.getTime() &&
        e.id !== session.startEvent.id,
    )
    const nextEvent = session.endEvent
      ? todoEvents.find(
          (e) =>
            e.timestamp.getTime() > session.endTime!.getTime() &&
            e.id !== session.endEvent!.id,
        )
      : null

    const newStart = computeEditTimestamp(
      timeToMinutes(pendingSave.startTime),
      prevEvent?.timestamp ?? null,
      null,
      selectedDate,
    )
    const newEnd = pendingSave.endTime
      ? computeEditTimestamp(
          timeToMinutes(pendingSave.endTime),
          null,
          nextEvent?.timestamp ?? null,
          selectedDate,
        )
      : null

    // Resolve conflicts
    if (newEnd) {
      const { updates } = resolveConflicts(
        { startTime: newStart, endTime: newEnd },
        conflicts,
      )
      for (const u of updates) {
        await updateEventTime({
          eventId: u.eventId,
          todoId: '',
          eventType: '',
          newTimestamp: u.newTimestamp,
        })
      }
    }

    // Apply the main edit
    await updateEventTime({
      eventId: session.startEvent.id,
      todoId: session.todoId,
      eventType: 'started',
      newTimestamp: newStart,
    })
    if (session.endEvent && newEnd) {
      await updateEventTime({
        eventId: session.endEvent.id,
        todoId: session.todoId,
        eventType: session.endEvent.eventType,
        newTimestamp: newEnd,
      })
    }

    setEditItem(null)
    setConflicts(null)
    setPendingSave(null)
  }, [editItem, conflicts, pendingSave, historyEvents, selectedDate, updateEventTime])

  const editRange = editItem ? getEditableRange(editItem) : null

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
            const title = todos.get(item.todoId)?.title ?? 'Unknown'
            const key = getItemKey(item)
            const isHighlighted = menuState !== null && getItemKey(menuState.item) === key
            return item.type === 'session' ? (
              <SessionRow
                key={key}
                session={item}
                title={title}
                highlighted={isHighlighted}
                onLongPress={handleLongPress(item)}
              />
            ) : (
              <PointEventRow
                key={key}
                pointEvent={item}
                title={title}
                highlighted={isHighlighted}
                onLongPress={handleLongPress(item)}
              />
            )
          })}
        </ItemList>
      )}

      {menuState &&
        createPortal(
          <>
            <MenuOverlay onClick={closeMenu} />
            <Menu ref={menuRef} style={{ left: menuState.position.x, top: menuState.position.y }}>
              <MenuItem onClick={handleEdit}>시간 수정</MenuItem>
              {canDeleteItem(menuState.item) && (
                <MenuItem $danger onClick={handleDelete}>
                  삭제
                </MenuItem>
              )}
            </Menu>
          </>,
          document.body,
        )}

      {editItem && editRange && (
        <TimeEditDialog
          item={editItem}
          todoTitle={todos.get(editItem.todoId)?.title ?? 'Unknown'}
          startMin={editRange.startMin}
          startMax={editRange.startMax}
          endMin={editRange.endMin}
          endMax={editRange.endMax}
          onSave={handleSave}
          onClose={() => {
            setEditItem(null)
            setConflicts(null)
            setPendingSave(null)
          }}
          conflicts={conflicts}
          onResolveConflicts={handleResolveConflicts}
        />
      )}
    </SectionContainer>
  )
}
