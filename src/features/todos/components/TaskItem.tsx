import styled, { css } from 'styled-components'
import type { TaskItemProps } from '../types'
import type { TodoStatus } from '@/db/schema'

const ItemContainer = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
`

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.accent};
`

const Body = styled.button<{ $status: TodoStatus }>`
  all: unset;
  flex: 1;
  min-width: 0;
  cursor: ${({ $status }) => ($status === 'completed' ? 'default' : 'pointer')};

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
