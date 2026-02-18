import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { TaskList } from '@/features/todos/components/TaskList'
import { TaskInput } from '@/features/todos/components/TaskInput'
import { PageContainer, Header, Title, HistoryButton } from './MainPage'
import {
  makeTodo,
  sampleActiveTodayTodos,
  sampleIdleTodos,
  sampleCompletedTodayTodos,
} from '@/stories/mocks/todos'

const meta = {
  title: 'Pages/MainPage',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AllSections: Story = {
  render: () => (
    <PageContainer>
      <Header>
        <Title>where was i</Title>
        <HistoryButton onClick={fn()} aria-label="View history">
          &#x1f552;
        </HistoryButton>
      </Header>
      <TaskList
        completedTodayTodos={sampleCompletedTodayTodos}
        activeTodayTodos={sampleActiveTodayTodos}
        idleTodos={sampleIdleTodos}
        onToggleStatus={fn()}
      />
      <TaskInput onAddTodo={fn()} />
    </PageContainer>
  ),
}

export const EmptyState: Story = {
  render: () => (
    <PageContainer>
      <Header>
        <Title>where was i</Title>
        <HistoryButton onClick={fn()} aria-label="View history">
          &#x1f552;
        </HistoryButton>
      </Header>
      <TaskList
        completedTodayTodos={[]}
        activeTodayTodos={[]}
        idleTodos={[]}
        onToggleStatus={fn()}
      />
      <TaskInput onAddTodo={fn()} />
    </PageContainer>
  ),
}

export const OnlyIdle: Story = {
  render: () => (
    <PageContainer>
      <Header>
        <Title>where was i</Title>
        <HistoryButton onClick={fn()} aria-label="View history">
          &#x1f552;
        </HistoryButton>
      </Header>
      <TaskList
        completedTodayTodos={[]}
        activeTodayTodos={[]}
        idleTodos={sampleIdleTodos}
        onToggleStatus={fn()}
      />
      <TaskInput onAddTodo={fn()} />
    </PageContainer>
  ),
}

export const ManyTasks: Story = {
  render: () => (
    <PageContainer>
      <Header>
        <Title>where was i</Title>
        <HistoryButton onClick={fn()} aria-label="View history">
          &#x1f552;
        </HistoryButton>
      </Header>
      <TaskList
        completedTodayTodos={sampleCompletedTodayTodos}
        activeTodayTodos={[
          makeTodo({
            id: 'active-ip',
            title: 'Currently working on this',
            status: 'in_progress',
          }),
          ...Array.from({ length: 4 }, (_, i) =>
            makeTodo({ id: `a-${i}`, title: `Active task ${i + 1}` }),
          ),
        ]}
        idleTodos={Array.from({ length: 6 }, (_, i) =>
          makeTodo({ id: `idle-${i}`, title: `Idle task ${i + 1}` }),
        )}
        onToggleStatus={fn()}
      />
      <TaskInput onAddTodo={fn()} />
    </PageContainer>
  ),
}
