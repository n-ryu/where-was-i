import type { Meta, StoryObj } from '@storybook/react'
import { TimelineItem } from './TimelineItem'

const meta: Meta<typeof TimelineItem> = {
  title: 'Components/TimelineItem',
  component: TimelineItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TimelineItem>

const baseTimestamp = new Date()
baseTimestamp.setHours(9, 30, 0, 0)

export const Started: Story = {
  args: {
    event: {
      taskId: 'task-1',
      taskTitle: '아침 회의 참석하기',
      eventType: 'started',
      timestamp: baseTimestamp,
    },
  },
}

export const Completed: Story = {
  args: {
    event: {
      taskId: 'task-1',
      taskTitle: '프로젝트 문서 작성 완료',
      eventType: 'completed',
      timestamp: new Date(baseTimestamp.getTime() + 60 * 60 * 1000),
    },
  },
}

export const Paused: Story = {
  args: {
    event: {
      taskId: 'task-2',
      taskTitle: '코드 리뷰 진행 중',
      eventType: 'paused',
      timestamp: new Date(baseTimestamp.getTime() + 90 * 60 * 1000),
    },
  },
}

export const Cancelled: Story = {
  args: {
    event: {
      taskId: 'task-3',
      taskTitle: '취소된 미팅',
      eventType: 'cancelled',
      timestamp: new Date(baseTimestamp.getTime() + 120 * 60 * 1000),
    },
  },
}

export const LongTitle: Story = {
  args: {
    event: {
      taskId: 'task-4',
      taskTitle:
        '이것은 매우 긴 제목을 가진 과업입니다. 제목이 길어지면 어떻게 표시되는지 확인하기 위한 테스트입니다.',
      eventType: 'started',
      timestamp: baseTimestamp,
    },
  },
}
