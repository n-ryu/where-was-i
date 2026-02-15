import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DayPicker } from '@/features/history/components/DayPicker'
import { GanttChart } from '@/features/history/components/GanttChart'
import { PageContainer, Header, BackButton, Title } from './HistoryPage'
import { sampleTimeBlocks, sampleTimeMarkers, sampleDate } from '@/stories/mocks/history'

const meta = {
  title: 'Pages/HistoryPage',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const WithActivity: Story = {
  render: () => (
    <PageContainer>
      <Header>
        <BackButton onClick={fn()} aria-label="Go back">
          &larr;
        </BackButton>
        <Title>History</Title>
      </Header>
      <DayPicker selectedDate={sampleDate} onDateChange={fn()} />
      <GanttChart timeBlocks={sampleTimeBlocks} timeMarkers={sampleTimeMarkers} selectedDate={sampleDate} />
    </PageContainer>
  ),
}

export const NoActivity: Story = {
  render: () => (
    <PageContainer>
      <Header>
        <BackButton onClick={fn()} aria-label="Go back">
          &larr;
        </BackButton>
        <Title>History</Title>
      </Header>
      <DayPicker selectedDate={sampleDate} onDateChange={fn()} />
      <GanttChart timeBlocks={[]} timeMarkers={[]} selectedDate={sampleDate} />
    </PageContainer>
  ),
}
