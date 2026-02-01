import styled from 'styled-components'
import { UncompletedTaskItem } from './UncompletedTaskItem'
import type { Task } from '../types'

export interface UncompletedTaskListProps {
  tasks: Task[]
  onIncludeToday: (taskId: string) => void
  onCancel: (taskId: string) => void
  onPostpone: (taskId: string) => void
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

export function UncompletedTaskList({
  tasks,
  onIncludeToday,
  onCancel,
  onPostpone,
}: UncompletedTaskListProps) {
  if (tasks.length === 0) {
    return <EmptyMessage>미완료 과업이 없습니다</EmptyMessage>
  }

  return (
    <List>
      {tasks.map((task) => (
        <UncompletedTaskItem
          key={task.id}
          task={task}
          onIncludeToday={onIncludeToday}
          onCancel={onCancel}
          onPostpone={onPostpone}
        />
      ))}
    </List>
  )
}
