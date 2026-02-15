import styled from 'styled-components'
import type { Todo } from '@/db/schema'
import type { TodoAction } from '../types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  inProgressTodo: Todo | null
  pendingTodos: Todo[]
  completedTodos: Todo[]
  onToggleStatus: (params: { id: string; action: TodoAction }) => void
}

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`

const InProgressSection = styled.section`
  background: ${({ theme }) => theme.colors.accentLight};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  margin: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
`

const SectionLabel = styled.span`
  display: block;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const TaskUl = styled.ul`
  list-style: none;
`

const EmptyState = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => theme.spacing.xl};
`

export const TaskList = ({
  inProgressTodo,
  pendingTodos,
  completedTodos,
  onToggleStatus,
}: TaskListProps) => {
  const isEmpty = !inProgressTodo && pendingTodos.length === 0 && completedTodos.length === 0

  if (isEmpty) {
    return (
      <ListContainer>
        <EmptyState>No tasks yet. Add one below!</EmptyState>
      </ListContainer>
    )
  }

  return (
    <ListContainer>
      {inProgressTodo && (
        <InProgressSection aria-label="In progress">
          <SectionLabel>In Progress</SectionLabel>
          <TaskUl>
            <TaskItem todo={inProgressTodo} onToggleStatus={onToggleStatus} />
          </TaskUl>
        </InProgressSection>
      )}
      {pendingTodos.length > 0 && (
        <section aria-label="Pending tasks">
          <TaskUl>
            {pendingTodos.map((todo) => (
              <TaskItem key={todo.id} todo={todo} onToggleStatus={onToggleStatus} />
            ))}
          </TaskUl>
        </section>
      )}
      {completedTodos.length > 0 && (
        <section aria-label="Completed tasks">
          <TaskUl>
            {completedTodos.map((todo) => (
              <TaskItem key={todo.id} todo={todo} onToggleStatus={onToggleStatus} />
            ))}
          </TaskUl>
        </section>
      )}
    </ListContainer>
  )
}
