import type { Meta, StoryObj } from '@storybook/react'
import { fn, userEvent, within } from 'storybook/test'
import { TaskInput } from './TaskInput'

const meta = {
  title: 'Todos/TaskInput',
  component: TaskInput,
  args: {
    onAddTodo: fn(),
  },
} satisfies Meta<typeof TaskInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithValue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('textbox'), 'New task idea')
  },
}

export const Submitting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByRole('textbox'), 'New task idea{Enter}')
  },
}
