import type { Meta, StoryObj } from '@storybook/react'
import { GanttChart } from './GanttChart'
import {
  sampleTimeBlocks,
  singleTaskBlocks,
  sampleDate,
} from '@/stories/mocks/history'

const meta = {
  title: 'History/GanttChart',
  component: GanttChart,
  args: {
    selectedDate: sampleDate,
  },
} satisfies Meta<typeof GanttChart>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { timeBlocks: [] },
}

export const SingleTask: Story = {
  args: { timeBlocks: singleTaskBlocks },
}

export const MultipleTasks: Story = {
  args: { timeBlocks: sampleTimeBlocks },
}
