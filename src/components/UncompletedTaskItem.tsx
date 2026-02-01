import styled from 'styled-components'
import type { Task, Goal } from '../types'

export interface UncompletedTaskItemProps {
  task: Task
  goal?: Goal
  onIncludeToday: (taskId: string) => void
  onCancel: (taskId: string) => void
  onPostpone: (taskId: string) => void
}

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #eee;
`

const TaskInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Title = styled.span`
  font-weight: 500;
  flex: 1;
`

const GoalTag = styled.span`
  font-size: 12px;
  color: #1976d2;
  background: #e3f2fd;
  padding: 2px 6px;
  border-radius: 4px;
`

const DateTag = styled.span`
  font-size: 12px;
  color: #666;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

const Button = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #f5f5f5;
  }
`

const IncludeButton = styled(Button)`
  background: #1976d2;
  color: white;
  border-color: #1976d2;

  &:hover {
    background: #1565c0;
  }
`

const CancelButton = styled(Button)`
  color: #d32f2f;
  border-color: #d32f2f;

  &:hover {
    background: #ffebee;
  }
`

export function UncompletedTaskItem({
  task,
  goal,
  onIncludeToday,
  onCancel,
  onPostpone,
}: UncompletedTaskItemProps) {
  return (
    <ListItem>
      <TaskInfo>
        <Title>{task.title}</Title>
        {goal && <GoalTag>{goal.title}</GoalTag>}
        <DateTag>{task.date}</DateTag>
      </TaskInfo>
      <Actions>
        <IncludeButton onClick={() => onIncludeToday(task.id)}>
          오늘 포함
        </IncludeButton>
        <CancelButton onClick={() => onCancel(task.id)}>취소</CancelButton>
        <Button onClick={() => onPostpone(task.id)}>내일로</Button>
      </Actions>
    </ListItem>
  )
}
