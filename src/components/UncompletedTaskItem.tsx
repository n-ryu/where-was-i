import type { KeyboardEvent } from 'react'
import styled from 'styled-components'
import type { Task } from '../types'

export interface UncompletedTaskItemProps {
  task: Task
  isSelected: boolean
  onToggle: (taskId: string) => void
}

const ListItem = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid ${(props) => (props.$selected ? '#1976d2' : '#e0e0e0')};
  border-radius: 8px;
  background: ${(props) => (props.$selected ? '#e3f2fd' : '#fff')};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;

  &:hover {
    border-color: #1976d2;
  }

  &:last-child {
    margin-bottom: 0;
  }
`

const Checkbox = styled.div<{ $checked: boolean }>`
  width: 24px;
  height: 24px;
  border: 2px solid ${(props) => (props.$checked ? '#1976d2' : '#bdbdbd')};
  border-radius: 4px;
  background: ${(props) => (props.$checked ? '#1976d2' : '#fff')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: '${(props) => (props.$checked ? '✓' : '')}';
    color: white;
    font-size: 14px;
    font-weight: bold;
  }
`

const TaskInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  word-break: break-word;
`

const DateTag = styled.div`
  font-size: 12px;
  color: #666;
`

export function UncompletedTaskItem({
  task,
  isSelected,
  onToggle,
}: UncompletedTaskItemProps) {
  const handleClick = () => {
    onToggle(task.id)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle(task.id)
    }
  }

  return (
    <ListItem
      $selected={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="checkbox"
      aria-checked={isSelected}
      aria-label={`${task.title} - ${isSelected ? '선택됨' : '선택되지 않음'}`}
    >
      <Checkbox $checked={isSelected} />
      <TaskInfo>
        <Title>{task.title}</Title>
        <DateTag>{task.date}</DateTag>
      </TaskInfo>
    </ListItem>
  )
}
