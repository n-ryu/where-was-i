import styled from 'styled-components'
import { LayoutGroup } from 'framer-motion'
import type { Task, TaskStatus, TaskEventType } from '../types'
import { TaskListItem } from './TaskListItem'

export interface TaskStatusChange {
  id: string
  status: TaskStatus
  eventType: TaskEventType
}

export interface TaskListProps {
  tasks: Task[]
  onBatchStatusChange: (changes: TaskStatusChange[]) => void
  onUpdate: (id: string, input: { title?: string }) => void
  onDelete: (id: string) => void
}

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const EmptyMessage = styled.div`
  text-align: center;
  color: #999;
  padding: 24px;
`

function getCompletedTime(task: Task): number {
  const completedEvent = [...task.events]
    .reverse()
    .find((e) => e.eventType === 'completed')
  return completedEvent ? completedEvent.timestamp.getTime() : 0
}

function sortTasks(tasks: Task[]): Task[] {
  // 정렬 순서: 진행중 → 대기중 → 완료
  const statusOrder: Record<TaskStatus, number> = {
    in_progress: 0,
    pending: 1,
    completed: 2,
    cancelled: 3,
  }

  return [...tasks].sort((a, b) => {
    // 먼저 상태별 정렬
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    // 완료된 항목은 최근 완료순
    if (a.status === 'completed') {
      return getCompletedTime(b) - getCompletedTime(a)
    }

    // 그 외는 생성순
    return a.createdAt.getTime() - b.createdAt.getTime()
  })
}

export function TaskList({
  tasks,
  onBatchStatusChange,
  onUpdate,
  onDelete,
}: TaskListProps) {
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const sortedTasks = sortTasks(tasks)

  const handleStatusChange = (
    taskId: string,
    newStatus: TaskStatus,
    eventType: TaskEventType
  ) => {
    const changes: TaskStatusChange[] = [
      { id: taskId, status: newStatus, eventType },
    ]

    // 대기중 Task가 진행중으로 전환되면 기존 진행중 Task를 대기중으로 변경
    if (newStatus === 'in_progress') {
      for (const inProgressTask of inProgressTasks) {
        changes.push({
          id: inProgressTask.id,
          status: 'pending',
          eventType: 'paused',
        })
      }
    }

    onBatchStatusChange(changes)
  }

  if (tasks.length === 0) {
    return <EmptyMessage>등록된 과업이 없습니다</EmptyMessage>
  }

  return (
    <LayoutGroup>
      <List>
        {sortedTasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </List>
    </LayoutGroup>
  )
}
