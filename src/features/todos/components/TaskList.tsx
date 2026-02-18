import styled, { keyframes } from 'styled-components'
import type { Todo } from '@/db/schema'
import type { TodoAction } from '../types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  completedTodayTodos: Todo[]
  activeTodayTodos: Todo[]
  idleTodos: Todo[]
  onToggleStatus: (params: { id: string; action: TodoAction }) => void
  onDelete: (id: string) => void
  onUpdateTitle: (params: { id: string; title: string }) => void
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

const ActiveSection = styled.section`
  background: ${({ theme }) => theme.colors.accentLight};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
  margin: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  animation: ${sectionEnter} 250ms ease-out;
`

const SectionLabel = styled.span<{ $variant?: 'accent' | 'default' | 'muted' }>`
  display: block;
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
  completedTodayTodos,
  activeTodayTodos,
  idleTodos,
  onToggleStatus,
  onDelete,
  onUpdateTitle,
}: TaskListProps) => {
  const isEmpty =
    completedTodayTodos.length === 0 &&
    activeTodayTodos.length === 0 &&
    idleTodos.length === 0

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
      {activeTodayTodos.length > 0 && (
        <ActiveSection aria-label="Active tasks">
          <SectionLabel $variant="accent">Active</SectionLabel>
          <TaskUl>
            {activeTodayTodos.map((todo) => (
              <TaskItem key={todo.id} todo={todo} onToggleStatus={onToggleStatus} onDelete={onDelete} onUpdateTitle={onUpdateTitle} />
            ))}
          </TaskUl>
        </ActiveSection>
      )}
      {idleTodos.length > 0 && (
        <Section aria-label="Idle tasks">
          <SectionLabel $variant="default">Idle</SectionLabel>
          <TaskUl>
            {idleTodos.map((todo) => (
              <TaskItem key={todo.id} todo={todo} onToggleStatus={onToggleStatus} onDelete={onDelete} onUpdateTitle={onUpdateTitle} />
            ))}
          </TaskUl>
        </Section>
      )}
      {completedTodayTodos.length > 0 && (
        <Section aria-label="Completed tasks">
          <SectionLabel $variant="muted">Completed Today</SectionLabel>
          <TaskUl>
            {completedTodayTodos.map((todo) => (
              <TaskItem key={todo.id} todo={todo} onToggleStatus={onToggleStatus} onDelete={onDelete} onUpdateTitle={onUpdateTitle} />
            ))}
          </TaskUl>
        </Section>
      )}
    </ListContainer>
  )
}
