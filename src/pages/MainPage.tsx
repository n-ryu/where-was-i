import styled from 'styled-components'
import { useTodos } from '@/features/todos/hooks/useTodos'
import { TaskList } from '@/features/todos/components/TaskList'
import { TaskInput } from '@/features/todos/components/TaskInput'

const PageContainer = styled.div`
  max-width: 768px;
  margin: 0 auto;
  height: 100dvh;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.lg};
`

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const MainPage = () => {
  const { inProgressTodo, pendingTodos, completedTodos, addTodo, toggleStatus } =
    useTodos()

  return (
    <PageContainer>
      <Header>
        <Title>where was i</Title>
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
