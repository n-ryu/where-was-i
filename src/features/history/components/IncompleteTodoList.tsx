import styled, { keyframes } from 'styled-components'
import type { IncompleteTodo } from '../hooks/useHistory'

interface IncompleteTodoListProps {
  todos: IncompleteTodo[]
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Container = styled.div`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  animation: ${fadeIn} 200ms ease-out;
`

const SectionLabel = styled.span`
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const List = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 2px 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text};
`

const Circle = styled.span`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
`

const Title = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const IncompleteTodoList = ({ todos }: IncompleteTodoListProps) => {
  if (todos.length === 0) return null

  return (
    <Container>
      <SectionLabel>Incomplete</SectionLabel>
      <List>
        {todos.map((todo) => (
          <Item key={todo.todoId}>
            <Circle />
            <Title>{todo.todoTitle}</Title>
          </Item>
        ))}
      </List>
    </Container>
  )
}
