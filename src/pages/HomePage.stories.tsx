import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import styled from 'styled-components'
import { TaskList, type TaskStatusChange } from '../components/TaskList'
import { FloatingInput } from '../components/FloatingInput'
import type { Task } from '../types'

// HomePage는 useLiveQuery와 useNavigate를 사용하므로,
// 핵심 UI 컴포넌트를 조합하여 스토리를 구성합니다.

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 140px;
  min-height: 100vh;
  position: relative;
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

interface HomePageLayoutProps {
  tasks: Task[]
  onBatchStatusChange: (changes: TaskStatusChange[]) => void
  onUpdate: (id: string, input: { title?: string }) => void
  onDelete: (id: string) => void
  onCreate: (title: string) => void
}

function HomePageLayout({
  tasks,
  onBatchStatusChange,
  onUpdate,
  onDelete,
  onCreate,
}: HomePageLayoutProps) {
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
        <Title>오늘의 할 일</Title>
        <DateText>{dateStr}</DateText>
      </Header>

      <section>
        <TaskList
          tasks={tasks}
          onBatchStatusChange={onBatchStatusChange}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </section>

      <FloatingInput placeholder="새 과업을 입력하세요" onSubmit={onCreate} />
    </Container>
  )
}

const meta: Meta<typeof HomePageLayout> = {
  title: 'Pages/HomePage',
  component: HomePageLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBatchStatusChange: fn(),
    onUpdate: fn(),
    onDelete: fn(),
    onCreate: fn(),
  },
}

export default meta
type Story = StoryObj<typeof HomePageLayout>

const now = new Date()
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: '이메일 확인하기',
    status: 'completed',
    date: '2025-01-31',
    events: [
      { eventType: 'started', timestamp: twoHoursAgo },
      { eventType: 'completed', timestamp: oneHourAgo },
    ],
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    updatedAt: oneHourAgo,
  },
  {
    id: 'task-2',
    title: '회의 준비하기',
    status: 'in_progress',
    date: '2025-01-31',
    events: [
      {
        eventType: 'started',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
      },
    ],
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
  },
  {
    id: 'task-3',
    title: '보고서 작성하기',
    status: 'pending',
    date: '2025-01-31',
    events: [],
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'task-4',
    title: '점심 약속',
    status: 'pending',
    date: '2025-01-31',
    events: [],
    createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
  },
]

export const Default: Story = {
  args: {
    tasks: mockTasks,
  },
}

export const Empty: Story = {
  args: {
    tasks: [],
  },
}

export const AllCompleted: Story = {
  args: {
    tasks: mockTasks.map((t) => ({
      ...t,
      status: 'completed' as const,
      events: [
        { eventType: 'started' as const, timestamp: twoHoursAgo },
        { eventType: 'completed' as const, timestamp: oneHourAgo },
      ],
    })),
  },
}

export const SingleTask: Story = {
  args: {
    tasks: [
      {
        id: 'task-1',
        title: '오늘 할 일',
        status: 'in_progress',
        date: '2025-01-31',
        events: [{ eventType: 'started', timestamp: new Date() }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
}

export const ManyTasks: Story = {
  args: {
    tasks: Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i + 1}`,
      title: `과업 ${i + 1}`,
      status:
        i === 0
          ? ('in_progress' as const)
          : i < 3
            ? ('completed' as const)
            : ('pending' as const),
      date: '2025-01-31',
      events:
        i === 0
          ? [{ eventType: 'started' as const, timestamp: new Date() }]
          : i < 3
            ? [
                { eventType: 'started' as const, timestamp: twoHoursAgo },
                { eventType: 'completed' as const, timestamp: oneHourAgo },
              ]
            : [],
      createdAt: new Date(now.getTime() - (10 - i) * 30 * 60 * 1000),
      updatedAt: new Date(now.getTime() - (10 - i) * 30 * 60 * 1000),
    })),
  },
}
