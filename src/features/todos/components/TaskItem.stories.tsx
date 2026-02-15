import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { TaskItem } from './TaskItem'
import { makeTodo } from '@/stories/mocks/todos'

const meta = {
  title: 'Todos/TaskItem',
  component: TaskItem,
  args: {
    onToggleStatus: fn(),
  },
} satisfies Meta<typeof TaskItem>

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = {
  args: {
    todo: makeTodo({ id: '1', title: 'Review pull request' }),
  },
}

export const InProgress: Story = {
  args: {
    todo: makeTodo({
      id: '1',
      title: 'Implement user authentication',
      status: 'in_progress',
    }),
  },
}

export const Completed: Story = {
  args: {
    todo: makeTodo({
      id: '1',
      title: 'Design database schema',
      status: 'completed',
    }),
  },
}

export const LongTitle: Story = {
  args: {
    todo: makeTodo({
      id: '1',
      title:
        'This is a very long task title that should demonstrate how the component handles text overflow in a mobile viewport',
    }),
  },
}
