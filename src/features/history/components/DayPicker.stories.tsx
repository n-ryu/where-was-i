import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DayPicker } from './DayPicker'

const meta = {
  title: 'History/DayPicker',
  component: DayPicker,
  args: {
    onDateChange: fn(),
  },
} satisfies Meta<typeof DayPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Today: Story = {
  args: { selectedDate: new Date() },
}

export const Yesterday: Story = {
  args: {
    selectedDate: (() => {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      return d
    })(),
  },
}

export const PastDate: Story = {
  args: { selectedDate: new Date('2025-05-28') },
}
