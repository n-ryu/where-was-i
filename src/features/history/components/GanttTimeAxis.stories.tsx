import type { Meta, StoryObj } from '@storybook/react'
import { GanttTimeAxis } from './GanttTimeAxis'

const meta = {
  title: 'History/GanttTimeAxis',
  component: GanttTimeAxis,
} satisfies Meta<typeof GanttTimeAxis>

export default meta
type Story = StoryObj<typeof meta>

export const MorningHours: Story = {
  args: { hourStart: 6, hourEnd: 12, pixelsPerHour: 60 },
}

export const FullDay: Story = {
  args: { hourStart: 0, hourEnd: 24, pixelsPerHour: 60 },
}
