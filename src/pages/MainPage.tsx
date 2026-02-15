import styled from 'styled-components'
import { useTodos } from '@/features/todos/hooks/useTodos'
import { TaskList } from '@/features/todos/components/TaskList'
import { TaskInput } from '@/features/todos/components/TaskInput'

export const PageContainer = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background};

  @media (min-width: 431px) {
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.08);
  }
`

export const Header = styled.header`
  flex-shrink: 0;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const HistoryButton = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.25rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color 150ms ease, background 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface};
  }

  &:active {
    transform: scale(0.93);
  }
`

interface MainPageProps {
  onNavigateToHistory: () => void
}

export const MainPage = ({ onNavigateToHistory }: MainPageProps) => {
  const { inProgressTodo, pendingTodos, completedTodos, addTodo, toggleStatus } =
    useTodos()

  return (
    <PageContainer>
      <Header>
        <Title>where was i</Title>
        <HistoryButton
          onClick={onNavigateToHistory}
          aria-label="View history"
        >
          &#x1f552;
        </HistoryButton>
      </Header>
      <TaskList
        inProgressTodo={inProgressTodo}
        pendingTodos={pendingTodos}
        completedTodos={completedTodos}
        onToggleStatus={toggleStatus}
      />
      <TaskInput onAddTodo={addTodo} />
    </PageContainer>
  )
}
