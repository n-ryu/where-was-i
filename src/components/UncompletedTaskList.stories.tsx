import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn, userEvent, within } from '@storybook/test'
import { UncompletedTaskList } from './UncompletedTaskList'
import type { Task } from '../types'

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: '어제 미완료 과업 1',
    status: 'pending',
    date: '2025-01-30',
    events: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    title: '어제 미완료 과업 2',
    status: 'in_progress',
    date: '2025-01-30',
    events: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-3',
    title: '그저께 미완료 과업',
    status: 'pending',
    date: '2025-01-29',
    events: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const meta: Meta<typeof UncompletedTaskList> = {
  title: 'Components/UncompletedTaskList',
  component: UncompletedTaskList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onToggle: fn(),
  },
}

export default meta
type Story = StoryObj<typeof UncompletedTaskList>

export const Empty: Story = {
  args: {
    tasks: [],
    selectedIds: new Set(),
  },
}

export const WithTasks: Story = {
  args: {
    tasks: mockTasks,
    selectedIds: new Set(),
  },
}

export const WithSelection: Story = {
  args: {
    tasks: mockTasks,
    selectedIds: new Set(['task-1', 'task-3']),
  },
}

// 인터랙티브 스토리를 위한 래퍼
function InteractiveWrapper({
  tasks,
  initialSelectedIds,
}: {
  tasks: Task[]
  initialSelectedIds: Set<string>
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds)

  const handleToggle = (taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  return (
    <UncompletedTaskList
      tasks={tasks}
      selectedIds={selectedIds}
      onToggle={handleToggle}
    />
  )
}

export const ToggleSelection: Story = {
  render: () => (
    <InteractiveWrapper tasks={mockTasks} initialSelectedIds={new Set()} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 첫 번째 과업 클릭하여 선택
    const firstTask = canvas.getByText('어제 미완료 과업 1')
    await userEvent.click(firstTask)

    // 두 번째 과업 클릭하여 선택
    const secondTask = canvas.getByText('어제 미완료 과업 2')
    await userEvent.click(secondTask)

    // 첫 번째 과업 다시 클릭하여 선택 해제
    await userEvent.click(firstTask)
  },
}
