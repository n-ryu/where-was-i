import type { Meta, StoryObj } from '@storybook/react'
import styled from 'styled-components'
import { Timeline } from '../components/Timeline'
import type { TimelineEvent } from '../components/TimelineItem'

// LogPage는 useLiveQuery를 사용하므로, 페이지를 직접 렌더링하지 않고
// 핵심 UI인 Timeline을 사용하여 스토리를 구성합니다.

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

interface LogPageLayoutProps {
  events: TimelineEvent[]
}

function LogPageLayout({ events }: LogPageLayoutProps) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[today.getDay()]
  const dateStr = `${year}년 ${month}월 ${day}일 (${weekday})`

  return (
    <Container>
      <Header>
        <Title>오늘의 기록</Title>
        <DateText>{dateStr}</DateText>
      </Header>
      <Timeline events={events} />
    </Container>
  )
}

const meta: Meta<typeof LogPageLayout> = {
  title: 'Pages/LogPage',
  component: LogPageLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof LogPageLayout>

const baseTime = new Date()
baseTime.setHours(9, 0, 0, 0)

export const Empty: Story = {
  args: {
    events: [],
  },
}

export const WithEvents: Story = {
  args: {
    events: [
      {
        taskId: 'task-1',
        taskTitle: '아침 회의',
        eventType: 'started',
        timestamp: new Date(baseTime.getTime()),
      },
      {
        taskId: 'task-1',
        taskTitle: '아침 회의',
        eventType: 'completed',
        timestamp: new Date(baseTime.getTime() + 60 * 60 * 1000),
      },
      {
        taskId: 'task-2',
        taskTitle: '코드 리뷰',
        eventType: 'started',
        timestamp: new Date(baseTime.getTime() + 90 * 60 * 1000),
      },
      {
        taskId: 'task-2',
        taskTitle: '코드 리뷰',
        eventType: 'paused',
        timestamp: new Date(baseTime.getTime() + 120 * 60 * 1000),
      },
      {
        taskId: 'task-3',
        taskTitle: '문서 작성',
        eventType: 'started',
        timestamp: new Date(baseTime.getTime() + 150 * 60 * 1000),
      },
    ],
  },
}

export const BusyDay: Story = {
  args: {
    events: Array.from({ length: 20 }, (_, i) => ({
      taskId: `task-${Math.floor(i / 2) + 1}`,
      taskTitle: `과업 ${Math.floor(i / 2) + 1}`,
      eventType: (i % 2 === 0
        ? 'started'
        : 'completed') as TimelineEvent['eventType'],
      timestamp: new Date(baseTime.getTime() + i * 20 * 60 * 1000),
    })),
  },
}
