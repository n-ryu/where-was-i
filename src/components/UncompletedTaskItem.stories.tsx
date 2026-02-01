import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { UncompletedTaskItem } from './UncompletedTaskItem'

const meta: Meta<typeof UncompletedTaskItem> = {
  title: 'Components/UncompletedTaskItem',
  component: UncompletedTaskItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onToggle: fn(),
  },
}

export default meta
type Story = StoryObj<typeof UncompletedTaskItem>

const mockTask = {
  id: 'task-1',
  title: '미완료된 과업입니다',
  status: 'pending' as const,
  date: '2025-01-30',
  events: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const Default: Story = {
  args: {
    task: mockTask,
    isSelected: false,
  },
}

export const Selected: Story = {
  args: {
    task: mockTask,
    isSelected: true,
  },
}

export const LongTitle: Story = {
  args: {
    task: {
      ...mockTask,
      title:
        '이것은 매우 긴 제목을 가진 미완료 과업입니다. 제목이 길어지면 어떻게 표시되는지 확인합니다.',
    },
    isSelected: false,
  },
}

export const InProgressTask: Story = {
  args: {
    task: {
      ...mockTask,
      status: 'in_progress',
      title: '진행 중이던 과업',
    },
    isSelected: false,
  },
}
