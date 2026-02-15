import styled, { keyframes } from 'styled-components'
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

const sectionEnter = keyframes`
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const InProgressSection = styled.section`
  background: ${({ theme }) => theme.colors.accentLight};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  margin: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  animation: ${sectionEnter} 250ms ease-out;
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

const SectionLabel = styled.span<{ $variant?: 'accent' | 'default' | 'muted' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $variant, theme }) =>
    $variant === 'accent'
      ? theme.colors.accent
      : $variant === 'muted'
        ? theme.colors.textSecondary
        : theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const PulseDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  animation: ${pulse} 2s ease-in-out infinite;
`

const Section = styled.section`
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const TaskUl = styled.ul`
  list-style: none;
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xl};
  flex: 1;
  animation: ${fadeIn} 300ms ease-out;
`

const EmptyIcon = styled.span`
  font-size: 2.5rem;
  line-height: 1;
`

const EmptyTitle = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

const EmptyDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
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
        <EmptyState>
          <EmptyIcon aria-hidden="true">&#x1F4CB;</EmptyIcon>
          <EmptyTitle>No tasks yet</EmptyTitle>
          <EmptyDescription>Add your first task below to get started</EmptyDescription>
        </EmptyState>
      </ListContainer>
    )
  }

  return (
    <ListContainer>
      {inProgressTodo && (
        <InProgressSection aria-label="In progress">
          <SectionLabel $variant="accent">
            <PulseDot />
            In Progress
          </SectionLabel>
          <TaskUl>
            <TaskItem todo={inProgressTodo} onToggleStatus={onToggleStatus} />
          </TaskUl>
        </InProgressSection>
      )}
      {pendingTodos.length > 0 && (
        <Section aria-label="Pending tasks">
          <SectionLabel $variant="default">Pending</SectionLabel>
          <TaskUl>
            {pendingTodos.map((todo) => (
              <TaskItem key={todo.id} todo={todo} onToggleStatus={onToggleStatus} />
            ))}
          </TaskUl>
        </Section>
      )}
      {completedTodos.length > 0 && (
        <Section aria-label="Completed tasks">
          <SectionLabel $variant="muted">Completed</SectionLabel>
          <TaskUl>
            {completedTodos.map((todo) => (
              <TaskItem key={todo.id} todo={todo} onToggleStatus={onToggleStatus} />
            ))}
          </TaskUl>
        </Section>
      )}
    </ListContainer>
  )
}
