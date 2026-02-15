import styled, { css, keyframes } from 'styled-components'
import type { TaskItemProps } from '../types'
import type { TodoStatus } from '@/db/schema'

const taskEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const ItemContainer = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  animation: ${taskEnter} 200ms ease-out;
  transition: background 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.accent};
  transition: transform 150ms ease;

  &:active {
    transform: scale(0.85);
  }
`

const Body = styled.button<{ $status: TodoStatus }>`
  all: unset;
  flex: 1;
  min-width: 0;
  cursor: ${({ $status }) => ($status === 'completed' ? 'default' : 'pointer')};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: color 200ms ease, opacity 200ms ease, background 100ms ease;

  &:active {
    background: ${({ theme }) => theme.colors.surface};
  }

  ${({ $status, theme }) =>
    $status === 'in_progress' &&
    css`
      font-weight: 700;
      color: ${theme.colors.text};
    `}

  ${({ $status, theme }) =>
    $status === 'completed' &&
    css`
      text-decoration: line-through;
      color: ${theme.colors.textSecondary};
      opacity: 0.7;
    `}
`

export const TaskItem = ({ todo, onToggleStatus }: TaskItemProps) => {
  const handleCheckboxChange = () => {
    if (todo.status === 'completed') {
      onToggleStatus({ id: todo.id, action: 'reopen' })
    } else {
      onToggleStatus({ id: todo.id, action: 'complete' })
    }
  }

  const handleBodyClick = () => {
    if (todo.status === 'pending') {
      onToggleStatus({ id: todo.id, action: 'start' })
    } else if (todo.status === 'in_progress') {
      onToggleStatus({ id: todo.id, action: 'stop' })
    }
  }

  return (
    <ItemContainer>
      <Checkbox
        type="checkbox"
        checked={todo.status === 'completed'}
        onChange={handleCheckboxChange}
        aria-label={`Mark ${todo.title} as ${todo.status === 'completed' ? 'incomplete' : 'complete'}`}
      />
      <Body
        $status={todo.status}
        onClick={todo.status !== 'completed' ? handleBodyClick : undefined}
        tabIndex={todo.status === 'completed' ? -1 : 0}
      >
        {todo.title}
      </Body>
    </ItemContainer>
  )
}
