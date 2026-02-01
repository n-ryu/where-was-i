import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'
import { Timeline } from '../components/Timeline'
import type { TimelineEvent } from '../components/TimelineItem'
import * as taskRepository from '../db/taskRepository'

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
`

const Header = styled.header`
  margin-bottom: 24px;
`

const Title = styled.h1`
  font-size: 24px;
  margin: 0 0 8px 0;
`

const DateText = styled.p`
  color: #666;
  margin: 0;
`

const LoadingContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  text-align: center;
  color: #666;
`

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDateKorean(dateString: string): string {
  // YYYY-MM-DD 형식을 로컬 타임존으로 파싱
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${year}년 ${month}월 ${day}일 (${weekday})`
}

export function LogPage() {
  const today = getTodayString()

  const tasks = useLiveQuery(
    () => taskRepository.getTasksByDate(today),
    [today]
  )

  if (tasks === undefined) {
    return <LoadingContainer>로딩 중...</LoadingContainer>
  }

  // 모든 Task의 events를 TimelineEvent로 변환
  const timelineEvents: TimelineEvent[] = tasks.flatMap((task) =>
    task.events.map((event) => ({
      taskId: task.id,
      taskTitle: task.title,
      eventType: event.eventType,
      timestamp: event.timestamp,
    }))
  )

  return (
    <Container>
      <Header>
        <Title>오늘의 기록</Title>
        <DateText>{formatDateKorean(today)}</DateText>
      </Header>

      <Timeline events={timelineEvents} />
    </Container>
  )
}
