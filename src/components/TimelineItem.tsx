import styled from 'styled-components'
import type { TaskEventType } from '../types'

export interface TimelineEvent {
  taskId: string
  taskTitle: string
  eventType: TaskEventType
  timestamp: Date
}

export interface TimelineItemProps {
  event: TimelineEvent
}

const Container = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`

const Time = styled.div`
  width: 50px;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
`

const Content = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  word-break: break-word;
`

const EventLabel = styled.span<{ $type: TaskEventType }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  background: ${(props) => {
    switch (props.$type) {
      case 'started':
        return '#e3f2fd'
      case 'completed':
        return '#e8f5e9'
      case 'paused':
        return '#fff3e0'
      case 'cancelled':
        return '#ffebee'
      default:
        return '#f5f5f5'
    }
  }};
  color: ${(props) => {
    switch (props.$type) {
      case 'started':
        return '#1976d2'
      case 'completed':
        return '#388e3c'
      case 'paused':
        return '#f57c00'
      case 'cancelled':
        return '#d32f2f'
      default:
        return '#666'
    }
  }};
`

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

function getEventLabel(eventType: TaskEventType): string {
  switch (eventType) {
    case 'started':
      return '시작'
    case 'completed':
      return '완료'
    case 'paused':
      return '일시정지'
    case 'cancelled':
      return '취소'
  }
}

export function TimelineItem({ event }: TimelineItemProps) {
  return (
    <Container>
      <Time>{formatTime(event.timestamp)}</Time>
      <Content>
        <Title>{event.taskTitle}</Title>
        <EventLabel $type={event.eventType}>
          {getEventLabel(event.eventType)}
        </EventLabel>
      </Content>
    </Container>
  )
}
