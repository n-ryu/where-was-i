import styled, { keyframes } from 'styled-components'
import type { IncompleteTodo } from '../hooks/useHistory'

interface IncompleteTodoListProps {
  todos: IncompleteTodo[]
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Container = styled.section`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  animation: ${fadeIn} 200ms ease-out;
`

const SectionLabel = styled.h2`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
`

const StatusBadge = styled.span<{ $status: 'pending' | 'in_progress' }>`
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $status, theme }) =>
    $status === 'in_progress' ? theme.colors.accent : theme.colors.textSecondary};
  background: ${({ $status, theme }) =>
    $status === 'in_progress' ? theme.colors.accentLight : theme.colors.surfaceAlt};
`

const Title = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const IncompleteTodoList = ({ todos }: IncompleteTodoListProps) => {
  if (todos.length === 0) return null

  return (
    <Container aria-label="Incomplete todos">
      <SectionLabel>Incomplete</SectionLabel>
      <List>
        {todos.map((todo) => (
          <Item key={todo.todoId}>
            <StatusBadge
              $status={todo.lastStatus === 'in_progress' ? 'in_progress' : 'pending'}
            >
              {todo.lastStatus === 'in_progress' ? 'In Progress' : 'Pending'}
            </StatusBadge>
            <Title>{todo.todoTitle}</Title>
          </Item>
        ))}
      </List>
    </Container>
  )
}
