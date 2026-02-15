import type { Meta, StoryObj } from '@storybook/react'
import { fn } from 'storybook/test'
import { TaskList } from '@/features/todos/components/TaskList'
import { TaskInput } from '@/features/todos/components/TaskInput'
import { PageContainer, Header, Title, HistoryButton } from './MainPage'
import {
  makeTodo,
  sampleInProgressTodo,
  samplePendingTodos,
  sampleCompletedTodos,
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
        inProgressTodo={sampleInProgressTodo}
        pendingTodos={samplePendingTodos}
        completedTodos={sampleCompletedTodos}
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
        inProgressTodo={null}
        pendingTodos={[]}
        completedTodos={[]}
        onToggleStatus={fn()}
      />
      <TaskInput onAddTodo={fn()} />
    </PageContainer>
  ),
}

export const OnlyPending: Story = {
  render: () => (
    <PageContainer>
      <Header>
        <Title>where was i</Title>
        <HistoryButton onClick={fn()} aria-label="View history">
          &#x1f552;
        </HistoryButton>
      </Header>
      <TaskList
        inProgressTodo={null}
        pendingTodos={samplePendingTodos}
        completedTodos={[]}
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
        inProgressTodo={sampleInProgressTodo}
        pendingTodos={Array.from({ length: 8 }, (_, i) =>
          makeTodo({ id: `p-${i}`, title: `Pending task ${i + 1}` }),
        )}
        completedTodos={Array.from({ length: 5 }, (_, i) =>
          makeTodo({
            id: `c-${i}`,
            title: `Completed task ${i + 1}`,
            status: 'completed',
          }),
        )}
        onToggleStatus={fn()}
      />
      <TaskInput onAddTodo={fn()} />
    </PageContainer>
  ),
}
