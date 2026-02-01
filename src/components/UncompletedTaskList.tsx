import styled from 'styled-components'
import { UncompletedTaskItem } from './UncompletedTaskItem'
import type { Task } from '../types'

export interface UncompletedTaskListProps {
  tasks: Task[]
  selectedIds: Set<string>
  onToggle: (taskId: string) => void
}

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const EmptyMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 24px;
`

const HelpText = styled.p`
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
`

export function UncompletedTaskList({
  tasks,
  selectedIds,
  onToggle,
}: UncompletedTaskListProps) {
  if (tasks.length === 0) {
    return <EmptyMessage>미완료 과업이 없습니다</EmptyMessage>
  }

  return (
    <>
      <HelpText>오늘 이어서 진행할 과업을 선택하세요</HelpText>
      <List>
        {tasks.map((task) => (
          <UncompletedTaskItem
            key={task.id}
            task={task}
            isSelected={selectedIds.has(task.id)}
            onToggle={onToggle}
          />
        ))}
      </List>
    </>
  )
}
