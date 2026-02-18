import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { TaskList } from './TaskList'
import {
  makeTodo,
  sampleActiveTodayTodos,
  sampleIdleTodos,
  sampleCompletedTodayTodos,
} from '@/stories/mocks/todos'

const meta = {
  title: 'Todos/TaskList',
  component: TaskList,
  args: {
    onToggleStatus: fn(),
    onDelete: fn(),
    onUpdateTitle: fn(),
  },
} satisfies Meta<typeof TaskList>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    completedTodayTodos: [],
    activeTodayTodos: [],
    idleTodos: [],
  },
}

export const IdleOnly: Story = {
  args: {
    completedTodayTodos: [],
    activeTodayTodos: [],
    idleTodos: sampleIdleTodos,
  },
}

export const WithActive: Story = {
  args: {
    completedTodayTodos: [],
    activeTodayTodos: sampleActiveTodayTodos,
    idleTodos: sampleIdleTodos,
  },
}

export const AllSections: Story = {
  args: {
    completedTodayTodos: sampleCompletedTodayTodos,
    activeTodayTodos: sampleActiveTodayTodos,
    idleTodos: sampleIdleTodos,
  },
}

export const ManyTasks: Story = {
  args: {
    completedTodayTodos: Array.from({ length: 3 }, (_, i) =>
      makeTodo({
        id: `c-${i}`,
        title: `Completed task ${i + 1}`,
        status: 'completed',
      }),
    ),
    activeTodayTodos: [
      makeTodo({
        id: 'active-ip',
        title: 'Currently working on this',
        status: 'in_progress',
      }),
      ...Array.from({ length: 3 }, (_, i) =>
        makeTodo({ id: `a-${i}`, title: `Active task ${i + 1}` }),
      ),
    ],
    idleTodos: Array.from({ length: 5 }, (_, i) =>
      makeTodo({ id: `idle-${i}`, title: `Idle task ${i + 1}` }),
    ),
  },
}
