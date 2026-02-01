import type { Meta, StoryObj } from '@storybook/react'
import { Timeline } from './Timeline'
import type { TimelineEvent } from './TimelineItem'

const meta: Meta<typeof Timeline> = {
  title: 'Components/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof Timeline>

const baseTime = new Date()
baseTime.setHours(9, 0, 0, 0)

const mockEvents: TimelineEvent[] = [
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
    taskTitle: '문서 작성',
    eventType: 'started',
    timestamp: new Date(baseTime.getTime() + 90 * 60 * 1000),
  },
  {
    taskId: 'task-2',
    taskTitle: '문서 작성',
    eventType: 'paused',
    timestamp: new Date(baseTime.getTime() + 120 * 60 * 1000),
  },
  {
    taskId: 'task-3',
    taskTitle: '코드 리뷰',
    eventType: 'started',
    timestamp: new Date(baseTime.getTime() + 150 * 60 * 1000),
  },
  {
    taskId: 'task-4',
    taskTitle: '긴급 미팅',
    eventType: 'cancelled',
    timestamp: new Date(baseTime.getTime() + 180 * 60 * 1000),
  },
]

export const Empty: Story = {
  args: {
    events: [],
  },
}

export const WithEvents: Story = {
  args: {
    events: mockEvents,
  },
}

export const SingleEvent: Story = {
  args: {
    events: [mockEvents[0]],
  },
}

export const AllCompleted: Story = {
  args: {
    events: [
      {
        taskId: 'task-1',
        taskTitle: '과업 1',
        eventType: 'started',
        timestamp: new Date(baseTime.getTime()),
      },
      {
        taskId: 'task-1',
        taskTitle: '과업 1',
        eventType: 'completed',
        timestamp: new Date(baseTime.getTime() + 30 * 60 * 1000),
      },
      {
        taskId: 'task-2',
        taskTitle: '과업 2',
        eventType: 'started',
        timestamp: new Date(baseTime.getTime() + 60 * 60 * 1000),
      },
      {
        taskId: 'task-2',
        taskTitle: '과업 2',
        eventType: 'completed',
        timestamp: new Date(baseTime.getTime() + 90 * 60 * 1000),
      },
    ],
  },
}

export const ManyEvents: Story = {
  args: {
    events: Array.from({ length: 15 }, (_, i) => ({
      taskId: `task-${Math.floor(i / 2) + 1}`,
      taskTitle: `과업 ${Math.floor(i / 2) + 1}`,
      eventType: (i % 2 === 0
        ? 'started'
        : 'completed') as TimelineEvent['eventType'],
      timestamp: new Date(baseTime.getTime() + i * 30 * 60 * 1000),
    })),
  },
}
