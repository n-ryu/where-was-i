import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { TaskList } from './TaskList'
import {
  makeTodo,
  sampleInProgressTodo,
  samplePendingTodos,
  sampleCompletedTodos,
} from '@/stories/mocks/todos'

const meta = {
  title: 'Todos/TaskList',
  component: TaskList,
  args: {
    onToggleStatus: fn(),
  },
} satisfies Meta<typeof TaskList>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    inProgressTodo: null,
    pendingTodos: [],
    completedTodos: [],
  },
}

export const PendingOnly: Story = {
  args: {
    inProgressTodo: null,
    pendingTodos: samplePendingTodos,
    completedTodos: [],
  },
}

export const WithInProgress: Story = {
  args: {
    inProgressTodo: sampleInProgressTodo,
    pendingTodos: samplePendingTodos,
    completedTodos: [],
  },
}

export const AllSections: Story = {
  args: {
    inProgressTodo: sampleInProgressTodo,
    pendingTodos: samplePendingTodos,
    completedTodos: sampleCompletedTodos,
  },
}

export const ManyTasks: Story = {
  args: {
    inProgressTodo: sampleInProgressTodo,
    pendingTodos: Array.from({ length: 8 }, (_, i) =>
      makeTodo({ id: `p-${i}`, title: `Pending task ${i + 1}` }),
    ),
    completedTodos: Array.from({ length: 5 }, (_, i) =>
      makeTodo({
        id: `c-${i}`,
        title: `Completed task ${i + 1}`,
        status: 'completed',
      }),
    ),
  },
}
