import type { Meta, StoryObj } from '@storybook/react'
import { GanttTaskRow } from './GanttTaskRow'
import { makeTimeBlock, makeTimeMarker, sampleDate } from '@/stories/mocks/history'

const meta = {
  title: 'History/GanttTaskRow',
  component: GanttTaskRow,
  args: {
    hourStart: 8,
    hourEnd: 18,
    pixelsPerHour: 60,
    dayStart: sampleDate,
    markers: [],
    dayStatus: 'incomplete',
  },
} satisfies Meta<typeof GanttTaskRow>

export default meta
type Story = StoryObj<typeof meta>

export const SingleBlock: Story = {
  args: {
    todoTitle: 'Design schema',
    dayStatus: 'completed',
    blocks: [
      makeTimeBlock({
        todoId: '1',
        todoTitle: 'Design schema',
        startTime: new Date('2025-06-01T09:00:00'),
        endTime: new Date('2025-06-01T11:00:00'),
        endReason: 'stopped',
      }),
    ],
    markers: [
      makeTimeMarker({
        todoId: '1',
        todoTitle: 'Design schema',
        timestamp: new Date('2025-06-01T11:00:00'),
      }),
    ],
  },
}

export const MultipleBlocks: Story = {
  args: {
    todoTitle: 'Implement auth',
    dayStatus: 'incomplete',
    blocks: [
      makeTimeBlock({
        todoId: '1',
        todoTitle: 'Implement auth',
        startTime: new Date('2025-06-01T09:00:00'),
        endTime: new Date('2025-06-01T11:30:00'),
        endReason: 'stopped',
      }),
      makeTimeBlock({
        todoId: '1',
        todoTitle: 'Implement auth',
        startTime: new Date('2025-06-01T13:00:00'),
        endTime: new Date('2025-06-01T15:00:00'),
        endReason: 'stopped',
      }),
    ],
    markers: [],
  },
}

export const Completed: Story = {
  args: {
    todoTitle: 'Quick fix',
    dayStatus: 'completed',
    blocks: [],
    markers: [
      makeTimeMarker({
        todoId: '1',
        todoTitle: 'Quick fix',
        timestamp: new Date('2025-06-01T10:30:00'),
      }),
    ],
  },
}

export const Inactive: Story = {
  args: {
    todoTitle: 'Update README',
    dayStatus: 'inactive',
    blocks: [],
    markers: [],
  },
}
