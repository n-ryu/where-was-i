import { useState, useCallback } from 'react'
import styled, { css, keyframes } from 'styled-components'
import type { TaskItemProps } from '../types'
import type { TodoStatus } from '@/db/schema'
import { useLongPress } from '@/hooks/useLongPress'
import { ContextMenu } from './ContextMenu'

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

const ItemContainer = styled.li<{
  $pressing?: boolean
  $highlighted?: boolean
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radii.sm};
  animation: ${taskEnter} 200ms ease-out;
  transition: background 150ms ease, transform 150ms ease;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  ${({ $pressing, theme }) =>
    $pressing &&
    css`
      background: ${theme.colors.surface};
      transform: scale(0.97);
    `}

  ${({ $highlighted, theme }) =>
    $highlighted &&
    css`
      background: ${theme.colors.primary}11;
    `}
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
  -webkit-user-select: none;
  user-select: none;
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

const EditInput = styled.input<{ $status: TodoStatus }>`
  all: unset;
  flex: 1;
  min-width: 0;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 1.5px 0 ${({ theme }) => theme.colors.primary};
  caret-color: ${({ theme }) => theme.colors.primary};

  ${({ $status }) =>
    $status === 'in_progress' &&
    css`
      font-weight: 700;
    `}
`

const ConfirmButton = styled.button`
  all: unset;
  flex-shrink: 0;
  padding: ${({ theme }) => `0 ${theme.spacing.xs}`};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: opacity 150ms ease;

  &:active {
    opacity: 0.6;
  }
`

export const TaskItem = ({
  todo,
  onToggleStatus,
  onDelete,
  onUpdateTitle,
}: TaskItemProps) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)

  const handleLongPress = useCallback(
    (position: { x: number; y: number }) => {
      setMenuPos(position)
    },
    [],
  )

  const { didLongPressRef, isPressing, ...longPressHandlers } = useLongPress({
    onLongPress: handleLongPress,
  })

  const handleCheckboxChange = () => {
    if (todo.status === 'completed') {
      onToggleStatus({ id: todo.id, action: 'reopen' })
    } else {
      onToggleStatus({ id: todo.id, action: 'complete' })
    }
  }

  const handleBodyClick = () => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false
      return
    }
    if (todo.status === 'pending') {
      onToggleStatus({ id: todo.id, action: 'start' })
    } else if (todo.status === 'in_progress') {
      onToggleStatus({ id: todo.id, action: 'stop' })
    }
  }

  const handleEdit = () => {
    setMenuPos(null)
    setEditValue(todo.title)
    setIsEditing(true)
  }

  const handleEditConfirm = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== todo.title) {
      onUpdateTitle({ id: todo.id, title: trimmed })
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditValue(todo.title)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditConfirm()
    if (e.key === 'Escape') handleEditCancel()
  }

  const handleDelete = () => {
    setMenuPos(null)
    onDelete(todo.id)
  }

  if (isEditing) {
    return (
      <ItemContainer>
        <Checkbox
          type="checkbox"
          checked={todo.status === 'completed'}
          disabled
          aria-label={`Mark ${todo.title} as ${todo.status === 'completed' ? 'incomplete' : 'complete'}`}
        />
        <EditInput
          $status={todo.status}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleEditKeyDown}
          autoFocus
        />
        <ConfirmButton
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleEditConfirm}
          aria-label="Confirm edit"
        >
          완료
        </ConfirmButton>
      </ItemContainer>
    )
  }

  return (
    <ItemContainer $pressing={isPressing} $highlighted={!!menuPos} {...longPressHandlers}>
      <Checkbox
        type="checkbox"
        checked={todo.status === 'completed'}
        onChange={handleCheckboxChange}
        aria-label={`Mark ${todo.title} as ${todo.status === 'completed' ? 'incomplete' : 'complete'}`}
      />
      <Body
        $status={todo.status}
        onClick={handleBodyClick}
        tabIndex={todo.status === 'completed' ? -1 : 0}
      >
        {todo.title}
      </Body>
      {menuPos && (
        <ContextMenu
          position={menuPos}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setMenuPos(null)}
        />
      )}
    </ItemContainer>
  )
}
