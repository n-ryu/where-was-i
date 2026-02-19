import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { DayPicker } from '@/features/history/components/DayPicker'
import { GanttChart } from '@/features/history/components/GanttChart'
import { EventHistoryList } from '@/features/history/components/EventHistoryList'
import { PageContainer, Header, BackButton, Title } from './HistoryPage'
import {
  sampleTimeBlocks,
  sampleTimeMarkers,
  sampleTodos,
  sampleHistoryEvents,
  sampleDate,
} from '@/stories/mocks/history'

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
      <GanttChart
        timeBlocks={sampleTimeBlocks}
        timeMarkers={sampleTimeMarkers}
        todos={sampleTodos}
        historyEvents={sampleHistoryEvents}
        selectedDate={sampleDate}
        selectedTodoId={null}
        onSelectTodo={fn()}
      />
      <EventHistoryList
        historyEvents={sampleHistoryEvents}
        todos={sampleTodos}
        selectedDate={sampleDate}
        selectedTodoId={null}
        onClearFilter={fn()}
      />
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
      <GanttChart
        timeBlocks={[]}
        timeMarkers={[]}
        todos={new Map()}
        historyEvents={[]}
        selectedDate={sampleDate}
        selectedTodoId={null}
        onSelectTodo={fn()}
      />
      <EventHistoryList
        historyEvents={[]}
        todos={new Map()}
        selectedDate={sampleDate}
        selectedTodoId={null}
        onClearFilter={fn()}
      />
    </PageContainer>
  ),
}
