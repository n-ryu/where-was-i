import styled from 'styled-components'
import { TimelineItem, type TimelineEvent } from './TimelineItem'

export interface TimelineProps {
  events: TimelineEvent[]
}

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
`

const EmptyMessage = styled.div`
  text-align: center;
  color: #999;
  padding: 24px;
`

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <Container>
        <EmptyMessage>오늘의 활동 기록이 없습니다</EmptyMessage>
      </Container>
    )
  }

  // 시간순 정렬
  const sortedEvents = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )

  return (
    <Container>
      {sortedEvents.map((event) => (
        <TimelineItem
          key={`${event.taskId}-${event.eventType}-${event.timestamp.getTime()}`}
          event={event}
        />
      ))}
    </Container>
  )
}
