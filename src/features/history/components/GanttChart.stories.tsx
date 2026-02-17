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
  sampleActiveTodos,
  singleTaskActiveTodos,
  directCompletionActiveTodos,
  reopenedTaskActiveTodos,
} from '@/stories/mocks/history'

const meta = {
  title: 'History/GanttChart',
  component: GanttChart,
  args: {
    selectedDate: sampleDate,
    timeMarkers: [],
    activeTodos: [],
  },
} satisfies Meta<typeof GanttChart>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: { timeBlocks: [], timeMarkers: [], activeTodos: [] },
}

export const SingleTask: Story = {
  args: {
    timeBlocks: singleTaskBlocks,
    timeMarkers: singleTaskMarkers,
    activeTodos: singleTaskActiveTodos,
  },
}

export const MultipleTasks: Story = {
  args: {
    timeBlocks: sampleTimeBlocks,
    timeMarkers: sampleTimeMarkers,
    activeTodos: sampleActiveTodos,
  },
}

export const DirectCompletion: Story = {
  args: {
    timeBlocks: [],
    timeMarkers: directCompletionMarkers,
    activeTodos: directCompletionActiveTodos,
  },
}

export const ReopenedTask: Story = {
  args: {
    timeBlocks: reopenedTaskBlocks,
    timeMarkers: reopenedTaskMarkers,
    activeTodos: reopenedTaskActiveTodos,
  },
}
