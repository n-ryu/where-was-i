import type { Meta, StoryObj } from '@storybook/react'
import styled from 'styled-components'
import { GanttTaskBar } from './GanttTaskBar'
import { makeTimeBlock, sampleDate } from '@/stories/mocks/history'

const BarContainer = styled.div`
  position: relative;
  height: 28px;
  width: 360px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`

const meta = {
  title: 'History/GanttTaskBar',
  component: GanttTaskBar,
  decorators: [
    (Story) => (
      <BarContainer>
        <Story />
      </BarContainer>
    ),
  ],
  args: {
    hourStart: 8,
    pixelsPerHour: 60,
    dayStart: sampleDate,
  },
} satisfies Meta<typeof GanttTaskBar>

export default meta
type Story = StoryObj<typeof meta>

export const Stopped: Story = {
  args: {
    block: makeTimeBlock({
      todoId: '1',
      todoTitle: 'Task A',
      startTime: new Date('2025-06-01T09:00:00'),
      endTime: new Date('2025-06-01T11:00:00'),
      endReason: 'stopped',
    }),
  },
}

export const Completed: Story = {
  args: {
    block: makeTimeBlock({
      todoId: '1',
      todoTitle: 'Task A',
      startTime: new Date('2025-06-01T09:00:00'),
      endTime: new Date('2025-06-01T11:00:00'),
      endReason: 'completed',
    }),
  },
}

export const Ongoing: Story = {
  args: {
    block: makeTimeBlock({
      todoId: '1',
      todoTitle: 'Task A',
      startTime: new Date('2025-06-01T10:00:00'),
      endTime: null,
      endReason: 'ongoing',
    }),
  },
}
