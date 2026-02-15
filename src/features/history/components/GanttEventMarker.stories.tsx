import type { Meta, StoryObj } from '@storybook/react'
import styled from 'styled-components'
import { GanttEventMarker } from './GanttEventMarker'
import { makeTimeMarker, sampleDate } from '@/stories/mocks/history'

const MarkerContainer = styled.div`
  position: relative;
  height: 28px;
  width: 360px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`

const meta = {
  title: 'History/GanttEventMarker',
  component: GanttEventMarker,
  decorators: [
    (Story) => (
      <MarkerContainer>
        <Story />
      </MarkerContainer>
    ),
  ],
  args: {
    hourStart: 8,
    pixelsPerHour: 60,
    dayStart: sampleDate,
  },
} satisfies Meta<typeof GanttEventMarker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    marker: makeTimeMarker({
      todoId: '1',
      todoTitle: 'Task A',
      timestamp: new Date('2025-06-01T11:00:00'),
    }),
  },
}

export const EarlyMorning: Story = {
  args: {
    marker: makeTimeMarker({
      todoId: '1',
      todoTitle: 'Task A',
      timestamp: new Date('2025-06-01T08:30:00'),
    }),
  },
}

export const LateAfternoon: Story = {
  args: {
    marker: makeTimeMarker({
      todoId: '1',
      todoTitle: 'Task A',
      timestamp: new Date('2025-06-01T13:30:00'),
    }),
  },
}

export const Reopened: Story = {
  args: {
    marker: makeTimeMarker({
      todoId: '1',
      todoTitle: 'Task A',
      timestamp: new Date('2025-06-01T11:00:00'),
      eventType: 'reopened',
    }),
  },
}

export const DimmedCompleted: Story = {
  args: {
    marker: makeTimeMarker({
      todoId: '1',
      todoTitle: 'Task A',
      timestamp: new Date('2025-06-01T11:00:00'),
      dimmed: true,
    }),
  },
}
