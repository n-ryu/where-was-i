import type { Meta, StoryObj } from '@storybook/react'
import { GanttChart } from './GanttChart'
import {
  sampleTimeBlocks,
  sampleTimeMarkers,
  singleTaskBlocks,
  singleTaskMarkers,
  directCompletionMarkers,
  reopenedTaskBlocks,
  reopenedTaskMarkers,
  sampleDate,
} from '@/stories/mocks/history'

const meta = {
  title: 'History/GanttChart',
  component: GanttChart,
  args: {
    selectedDate: sampleDate,
    timeMarkers: [],
  },
} satisfies Meta<typeof GanttChart>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { timeBlocks: [], timeMarkers: [] },
}

export const SingleTask: Story = {
  args: { timeBlocks: singleTaskBlocks, timeMarkers: singleTaskMarkers },
}

export const MultipleTasks: Story = {
  args: { timeBlocks: sampleTimeBlocks, timeMarkers: sampleTimeMarkers },
}

export const DirectCompletion: Story = {
  args: { timeBlocks: [], timeMarkers: directCompletionMarkers },
}

export const ReopenedTask: Story = {
  args: { timeBlocks: reopenedTaskBlocks, timeMarkers: reopenedTaskMarkers },
}
