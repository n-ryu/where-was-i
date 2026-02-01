import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { TaskList } from './TaskList'
import type { Task } from '../types'

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

const meta: Meta<typeof TaskList> = {
  title: 'Components/TaskList',
  component: TaskList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onBatchStatusChange: fn(),
    onUpdate: fn(),
    onDelete: fn(),
  },
}

export default meta
type Story = StoryObj<typeof TaskList>

export const Empty: Story = {
  args: {
    tasks: [],
  },
}

export const WithTasks: Story = {
  args: {
    tasks: mockTasks,
  },
}

export const AllPending: Story = {
  args: {
    tasks: mockTasks
      .filter((t) => t.status !== 'in_progress')
      .map((t) => ({ ...t, status: 'pending' as const, events: [] })),
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

export const SingleInProgress: Story = {
  args: {
    tasks: [
      {
        id: 'task-1',
        title: '현재 진행 중인 과업',
        status: 'in_progress',
        date: '2025-01-31',
        events: [
          {
            eventType: 'started',
            timestamp: new Date(now.getTime() - 15 * 60 * 1000),
          },
        ],
        createdAt: now,
        updatedAt: now,
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
